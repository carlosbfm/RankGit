package com.rankgit.feed;

import com.rankgit.feed.dto.FeedPageResponse;
import com.rankgit.feed.dto.FeedPostDto;
import com.rankgit.gamification.GamificationService;
import com.rankgit.gamification.Tier;
import com.rankgit.github.GitHubApiClient;
import com.rankgit.ranking.TrackedDeveloper;
import com.rankgit.ranking.TrackedDeveloperRepository;
import com.rankgit.ranking.dto.DeveloperDetailsDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FeedService {

    private static final Logger log = LoggerFactory.getLogger(FeedService.class);

    private final FeedCommitRepository feedCommitRepository;
    private final FeedReactionRepository feedReactionRepository;
    private final TrackedDeveloperRepository trackedDeveloperRepository;
    private final GitHubApiClient gitHubApiClient;
    private final GamificationService gamificationService;

    public FeedService(FeedCommitRepository feedCommitRepository,
                       FeedReactionRepository feedReactionRepository,
                       TrackedDeveloperRepository trackedDeveloperRepository,
                       GitHubApiClient gitHubApiClient,
                       GamificationService gamificationService) {
        this.feedCommitRepository = feedCommitRepository;
        this.feedReactionRepository = feedReactionRepository;
        this.trackedDeveloperRepository = trackedDeveloperRepository;
        this.gitHubApiClient = gitHubApiClient;
        this.gamificationService = gamificationService;
    }

    /**
     * Sincroniza os commits recentes de todos os desenvolvedores monitorados para alimentar o feed social.
     */
    @Transactional
    public int syncCommitsFromTrackedDevelopers() {
        List<TrackedDeveloper> devs = trackedDeveloperRepository.findAllByActiveTrue();
        int newCommitsCount = 0;

        for (TrackedDeveloper dev : devs) {
            try {
                List<DeveloperDetailsDto.RecentCommitDto> recentCommits =
                        gitHubApiClient.fetchRecentCommits(dev.getUsername());

                for (DeveloperDetailsDto.RecentCommitDto c : recentCommits) {
                    if (c.sha() == null || c.sha().trim().isEmpty()) continue;

                    if (!feedCommitRepository.existsBySha(c.sha())) {
                        LocalDateTime committedAt = parseDate(c.date());

                        FeedCommit commit = new FeedCommit(
                                c.sha(),
                                dev.getUsername(),
                                dev.getName() != null ? dev.getName() : dev.getUsername(),
                                dev.getAvatarUrl(),
                                c.repoName(),
                                c.repoUrl(),
                                c.message(),
                                c.commitUrl(),
                                committedAt
                        );

                        feedCommitRepository.save(commit);
                        newCommitsCount++;
                    }
                }
            } catch (Exception e) {
                log.warn("Erro ao sincronizar commits para feed do desenvolvedor {}: {}", dev.getUsername(), e.getMessage());
            }
        }

        return newCommitsCount;
    }

    /**
     * Retorna a página do feed social com posts enriquecidos (dados do autor, reações e tempo relativo).
     */
    @Transactional(readOnly = true)
    public FeedPageResponse getFeed(int page, int size, String developerFilter, String currentUsername) {
        int validPage = Math.max(0, page);
        int validSize = Math.max(1, Math.min(50, size));
        Pageable pageable = PageRequest.of(validPage, validSize);

        Page<FeedCommit> commitPage;
        if (developerFilter != null && !developerFilter.trim().isEmpty() && !developerFilter.equalsIgnoreCase("all")) {
            commitPage = feedCommitRepository.findByDeveloperUsernameIgnoreCaseOrderByCommittedAtDesc(
                    developerFilter.trim(), pageable
            );
        } else {
            commitPage = feedCommitRepository.findAllByOrderByCommittedAtDesc(pageable);
        }

        // Cache de métricas dos autores para enriquecer o feed
        Map<String, TrackedDeveloper> devMap = trackedDeveloperRepository.findAllByActiveTrue().stream()
                .collect(Collectors.toMap(d -> d.getUsername().toLowerCase(), d -> d, (a, b) -> a));

        List<FeedPostDto> posts = commitPage.getContent().stream()
                .map(c -> toFeedPostDto(c, devMap.get(c.getDeveloperUsername().toLowerCase()), currentUsername))
                .toList();

        return new FeedPageResponse(
                posts,
                commitPage.getNumber(),
                commitPage.getSize(),
                commitPage.getTotalElements(),
                commitPage.getTotalPages(),
                devMap.size()
        );
    }

    /**
     * Alterna reação do usuário ao commit (curtir/descurtir: LIKE, FIRE, ROCKET, CLAP).
     */
    @Transactional
    public void toggleReaction(String commitSha, String reactionType, String username) {
        String cleanType = reactionType != null ? reactionType.trim().toUpperCase() : "LIKE";
        String cleanUser = username != null ? username.trim() : "anonymous";

        feedReactionRepository.findByCommitShaAndUsernameAndReactionType(commitSha, cleanUser, cleanType)
                .ifPresentOrElse(
                        feedReactionRepository::delete,
                        () -> feedReactionRepository.save(new FeedReaction(commitSha, cleanUser, cleanType))
                );
    }

    private FeedPostDto toFeedPostDto(FeedCommit commit, TrackedDeveloper dev, String currentUsername) {
        int totalCommits = dev != null && dev.getTotalCommitsCached() != null ? dev.getTotalCommitsCached() : 0;
        int streak = dev != null && dev.getCurrentStreak() != null ? dev.getCurrentStreak() : 0;
        int score = (totalCommits * 10) + (streak * 25);
        Tier tier = gamificationService.calculateTier(totalCommits);

        FeedPostDto.DeveloperAuthorDto author = new FeedPostDto.DeveloperAuthorDto(
                commit.getDeveloperUsername(),
                commit.getDeveloperName() != null ? commit.getDeveloperName() : commit.getDeveloperUsername(),
                commit.getDeveloperAvatarUrl() != null ? commit.getDeveloperAvatarUrl() :
                        (dev != null ? dev.getAvatarUrl() : "https://github.com/" + commit.getDeveloperUsername() + ".png"),
                tier.name(),
                streak,
                score,
                totalCommits
        );

        String sha = commit.getSha();
        String shortSha = sha != null && sha.length() >= 7 ? sha.substring(0, 7) : sha;

        FeedPostDto.CommitContentDto commitContent = new FeedPostDto.CommitContentDto(
                commit.getCommitMessage(),
                commit.getRepoName(),
                commit.getRepoUrl(),
                commit.getCommitUrl(),
                commit.getCommittedAt()
        );

        // Agrupamento de reações
        List<FeedReaction> allReactions = feedReactionRepository.findAllByCommitSha(commit.getSha());
        Map<String, Long> reactionsCount = allReactions.stream()
                .collect(Collectors.groupingBy(FeedReaction::getReactionType, Collectors.counting()));

        Set<String> currentUserReactions = allReactions.stream()
                .filter(r -> currentUsername != null && r.getUsername().equalsIgnoreCase(currentUsername))
                .map(FeedReaction::getReactionType)
                .collect(Collectors.toSet());

        String timeAgo = formatTimeAgo(commit.getCommittedAt());

        return new FeedPostDto(
                commit.getId(),
                commit.getSha(),
                shortSha,
                author,
                commitContent,
                reactionsCount,
                currentUserReactions,
                timeAgo
        );
    }

    private LocalDateTime parseDate(String raw) {
        if (raw == null || raw.trim().isEmpty()) return LocalDateTime.now();
        try {
            return OffsetDateTime.parse(raw).toLocalDateTime();
        } catch (Exception e1) {
            try {
                return Instant.parse(raw).atZone(ZoneId.systemDefault()).toLocalDateTime();
            } catch (Exception e2) {
                try {
                    return LocalDateTime.parse(raw.substring(0, 19));
                } catch (Exception e3) {
                    return LocalDateTime.now();
                }
            }
        }
    }

    private String formatTimeAgo(LocalDateTime dt) {
        if (dt == null) return "agora";
        Duration d = Duration.between(dt, LocalDateTime.now());
        long minutes = Math.max(0, d.toMinutes());
        if (minutes < 1) return "agora mesmo";
        if (minutes < 60) return "há " + minutes + " " + (minutes == 1 ? "minuto" : "minutos");
        long hours = d.toHours();
        if (hours < 24) return "há " + hours + " " + (hours == 1 ? "hora" : "horas");
        long days = d.toDays();
        if (days < 30) return "há " + days + " " + (days == 1 ? "dia" : "dias");
        long months = days / 30;
        if (months < 12) return "há " + months + " " + (months == 1 ? "mês" : "meses");
        long years = days / 365;
        return "há " + years + " " + (years == 1 ? "ano" : "anos");
    }
}
