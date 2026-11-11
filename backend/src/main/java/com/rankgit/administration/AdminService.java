package com.rankgit.administration;

import com.rankgit.administration.dto.SyncSummaryDto;
import com.rankgit.common.exception.BusinessException;
import com.rankgit.common.exception.ResourceNotFoundException;
import com.rankgit.gamification.GamificationService;
import com.rankgit.gamification.Tier;
import com.rankgit.github.GitHubApiClient;
import com.rankgit.github.dto.CommitActivityResult;
import com.rankgit.github.dto.GitHubUserResponse;
import com.rankgit.ranking.CommitRecord;
import com.rankgit.ranking.CommitRecordRepository;
import com.rankgit.ranking.TrackedDeveloper;
import com.rankgit.ranking.TrackedDeveloperRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final TrackedDeveloperRepository developerRepository;
    private final CommitRecordRepository commitRecordRepository;
    private final GitHubApiClient gitHubApiClient;
    private final GamificationService gamificationService;

    public AdminService(TrackedDeveloperRepository developerRepository,
                        CommitRecordRepository commitRecordRepository,
                        GitHubApiClient gitHubApiClient,
                        GamificationService gamificationService) {
        this.developerRepository = developerRepository;
        this.commitRecordRepository = commitRecordRepository;
        this.gitHubApiClient = gitHubApiClient;
        this.gamificationService = gamificationService;
    }

    @Transactional
    public TrackedDeveloper addDeveloperByLink(String githubInput, String adminUsername) {
        String username = gitHubApiClient.extractUsername(githubInput);

        if (developerRepository.existsByUsernameIgnoreCase(username)) {
            throw new BusinessException("O desenvolvedor @" + username + " já está cadastrado no ranking.");
        }

        GitHubUserResponse gitHubUser = gitHubApiClient.fetchUserDetails(username);
        TrackedDeveloper developer = createDeveloperEntity(gitHubUser, adminUsername);
        TrackedDeveloper saved = developerRepository.save(developer);

        syncDeveloperData(saved);
        return saved;
    }

    @Transactional
    public void syncDeveloperData(TrackedDeveloper developer) {
        LocalDate today = LocalDate.now();

        CommitActivityResult activity = gitHubApiClient.fetchCommitActivity(developer.getUsername());
        int totalCommits = activity.totalCount();

        if (totalCommits > 0) {
            developer.setTotalCommitsCached(totalCommits);
            Tier tier = gamificationService.calculateTier(totalCommits);
            developer.setTier(tier);
        }
        developer.setCurrentStreak(activity.currentStreak());

        // Salva todos os registros diários reais retornados da atividade de commits
        activity.dailyCounts().forEach((date, count) -> {
            upsertDailyCommit(developer, date, count);
        });

        // Calcula commits deste ano
        int yearCommits = activity.dailyCounts().entrySet().stream()
                .filter(e -> e.getKey().getYear() == today.getYear())
                .mapToInt(java.util.Map.Entry::getValue)
                .sum();

        if (totalCommits > 100) {
            int searchYearCount = gitHubApiClient.fetchCommitCount(
                    developer.getUsername(),
                    LocalDate.of(today.getYear(), 1, 1),
                    today
            );
            if (searchYearCount > 0) {
                yearCommits = searchYearCount;
            }
        }
        developer.setYearCommitsCached(yearCommits);

        // Garante que os últimos 14 dias existam na tabela (preenche dias sem commits com 0)
        for (int i = 0; i < 14; i++) {
            LocalDate day = today.minusDays(i);
            int count = activity.dailyCounts().getOrDefault(day, 0);
            upsertDailyCommit(developer, day, count);
        }

        developer.setLastSyncedAt(LocalDateTime.now());
        developerRepository.save(developer);
    }

    @Transactional
    public SyncSummaryDto syncAllDevelopers() {
        List<TrackedDeveloper> developers = developerRepository.findAllByActiveTrue();
        int success = 0;
        int failure = 0;

        for (TrackedDeveloper dev : developers) {
            try {
                syncDeveloperData(dev);
                success++;
            } catch (Exception e) {
                log.error("Falha ao sincronizar desenvolvedor {}: {}", dev.getUsername(), e.getMessage());
                failure++;
            }
        }

        return new SyncSummaryDto(
                developers.size(),
                success,
                failure,
                LocalDateTime.now(),
                "Sincronização concluída com sucesso."
        );
    }

    @Transactional
    public void syncDeveloperByUsername(String username) {
        TrackedDeveloper dev = developerRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Desenvolvedor não encontrado: " + username));
        syncDeveloperData(dev);
    }

    @Scheduled(fixedDelay = 180000, initialDelay = 30000) // Sincronização automática a cada 3 minutos
    public void scheduledSync() {
        log.info("Iniciando sincronização periódica de commits do GitHub...");
        syncAllDevelopers();
    }

    @Transactional
    public void deleteDeveloper(Long id) {
        TrackedDeveloper developer = developerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Desenvolvedor não encontrado com id: " + id));
        developerRepository.delete(developer);
    }

    private TrackedDeveloper createDeveloperEntity(GitHubUserResponse user, String addedBy) {
        TrackedDeveloper dev = new TrackedDeveloper(
                user.login(),
                user.name() != null ? user.name() : user.login(),
                user.avatarUrl(),
                user.htmlUrl(),
                user.bio(),
                addedBy
        );
        dev.setGithubId(user.id());
        dev.setPublicRepos(user.publicRepos());
        dev.setFollowers(user.followers());
        return dev;
    }

    private void upsertDailyCommit(TrackedDeveloper dev, LocalDate day, int count) {
        CommitRecord record = commitRecordRepository
                .findByDeveloperIdAndRecordDate(dev.getId(), day)
                .orElseGet(() -> new CommitRecord(dev, day, count));
        record.setCommitCount(count);
        commitRecordRepository.save(record);
    }
}
