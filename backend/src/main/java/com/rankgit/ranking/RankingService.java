package com.rankgit.ranking;

import com.rankgit.common.exception.ResourceNotFoundException;
import com.rankgit.gamification.BadgeType;
import com.rankgit.gamification.DeveloperMetrics;
import com.rankgit.gamification.GamificationService;
import com.rankgit.gamification.Tier;
import com.rankgit.github.GitHubApiClient;
import com.rankgit.github.dto.GitHubRepoResponse;
import com.rankgit.github.dto.GitHubUserResponse;
import com.rankgit.ranking.dto.DailyActivityDto;
import com.rankgit.ranking.dto.DeveloperDetailsDto;
import com.rankgit.ranking.dto.LeaderboardResponse;
import com.rankgit.ranking.dto.RankingItemDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class RankingService {

    private final TrackedDeveloperRepository developerRepository;
    private final CommitRecordRepository commitRecordRepository;
    private final GamificationService gamificationService;
    private final GitHubApiClient gitHubApiClient;

    public RankingService(TrackedDeveloperRepository developerRepository,
                          CommitRecordRepository commitRecordRepository,
                          GamificationService gamificationService,
                          GitHubApiClient gitHubApiClient) {
        this.developerRepository = developerRepository;
        this.commitRecordRepository = commitRecordRepository;
        this.gamificationService = gamificationService;
        this.gitHubApiClient = gitHubApiClient;
    }

    @Transactional(readOnly = true)
    public DeveloperDetailsDto getDeveloperDetails(String username) {
        String cleanUsername = gitHubApiClient.extractUsername(username);

        TrackedDeveloper dev = developerRepository.findByUsernameIgnoreCase(cleanUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Desenvolvedor '" + cleanUsername + "' não encontrado no ranking."));

        // Calcular métricas RankGit e posição no ranking
        List<TrackedDeveloper> allDevs = developerRepository.findAllByActiveTrue();
        allDevs.sort(Comparator.comparingInt(TrackedDeveloper::getTotalCommitsCached).reversed());

        int rankPosition = 1;
        for (int i = 0; i < allDevs.size(); i++) {
            if (allDevs.get(i).getUsername().equalsIgnoreCase(dev.getUsername())) {
                rankPosition = i + 1;
                break;
            }
        }

        int totalCommits = dev.getTotalCommitsCached() != null ? dev.getTotalCommitsCached() : 0;
        int streak = dev.getCurrentStreak() != null ? dev.getCurrentStreak() : 0;
        int score = (totalCommits * 10) + (streak * 25);
        Tier tier = gamificationService.calculateTier(totalCommits);

        DeveloperMetrics metrics = new DeveloperMetrics(
                totalCommits,
                totalCommits,
                0,
                0,
                streak,
                dev.getPublicRepos(),
                dev.getFollowers(),
                rankPosition <= 3
        );
        Set<BadgeType> badges = gamificationService.evaluateBadges(metrics);
        List<String> badgeNames = badges.stream().map(Enum::name).toList();

        // Buscar dados públicos e atualizados do GitHub
        GitHubUserResponse ghUser = null;
        try {
            ghUser = gitHubApiClient.fetchUserDetails(cleanUsername);
        } catch (Exception e) {
            // Continua com fallback dos dados cacheados do banco
        }

        List<GitHubRepoResponse> ghRepos = gitHubApiClient.fetchUserRepos(cleanUsername);
        List<DeveloperDetailsDto.RepoSummaryDto> topRepos = ghRepos.stream()
                .map(r -> new DeveloperDetailsDto.RepoSummaryDto(
                        r.name(),
                        r.htmlUrl(),
                        r.description(),
                        r.language(),
                        r.stargazersCount() != null ? r.stargazersCount() : 0,
                        r.forksCount() != null ? r.forksCount() : 0,
                        r.updatedAt(),
                        Boolean.TRUE.equals(r.fork())
                ))
                .toList();

        List<DeveloperDetailsDto.RecentCommitDto> recentCommits = gitHubApiClient.fetchRecentCommits(cleanUsername);

        String name = ghUser != null && ghUser.name() != null ? ghUser.name() : (dev.getName() != null ? dev.getName() : dev.getUsername());
        String avatarUrl = ghUser != null && ghUser.avatarUrl() != null ? ghUser.avatarUrl() : dev.getAvatarUrl();
        String htmlUrl = ghUser != null && ghUser.htmlUrl() != null ? ghUser.htmlUrl() : dev.getHtmlUrl();
        String bio = ghUser != null && ghUser.bio() != null ? ghUser.bio() : dev.getBio();
        String company = ghUser != null ? ghUser.company() : null;
        String location = ghUser != null ? ghUser.location() : null;
        String email = ghUser != null ? ghUser.email() : null;
        String blog = ghUser != null ? ghUser.blog() : null;
        String twitterUsername = ghUser != null ? ghUser.twitterUsername() : null;
        String createdAt = ghUser != null ? ghUser.createdAt() : null;
        Integer publicRepos = ghUser != null && ghUser.publicRepos() != null ? ghUser.publicRepos() : dev.getPublicRepos();
        Integer followers = ghUser != null && ghUser.followers() != null ? ghUser.followers() : dev.getFollowers();
        Integer following = ghUser != null && ghUser.following() != null ? ghUser.following() : 0;

        return new DeveloperDetailsDto(
                dev.getUsername(),
                name,
                avatarUrl,
                htmlUrl,
                bio,
                company,
                location,
                email,
                blog,
                twitterUsername,
                createdAt,
                publicRepos,
                followers,
                following,
                totalCommits,
                dev.getYearCommitsCached(),
                streak,
                score,
                tier.name(),
                rankPosition,
                badgeNames,
                dev.getLastSyncedAt(),
                topRepos,
                recentCommits
        );
    }

    @Transactional(readOnly = true)
    public LeaderboardResponse getLeaderboard(RankingCriteria criteria) {
        LocalDate today = LocalDate.now();
        DateRange dateRange = criteria.resolveDateRange(today);

        List<TrackedDeveloper> developers = fetchFilteredDevelopers(criteria.search());

        List<EvaluatedDeveloper> evaluatedList = developers.stream()
                .map(dev -> evaluateDeveloper(dev, dateRange, today, criteria.preset()))
                .sorted(criteria.sort().getComparator())
                .toList();

        List<RankingItemDto> allItems = buildLeaderboardItems(evaluatedList);
        List<RankingItemDto> topThree = allItems.size() > 0
                ? allItems.subList(0, Math.min(3, allItems.size()))
                : Collections.emptyList();

        int totalDevelopers = allItems.size();
        int safePage = Math.max(0, criteria.page());
        int safeSize = criteria.size() > 0 ? criteria.size() : 10;
        int totalPages = (int) Math.ceil((double) totalDevelopers / safeSize);
        if (totalPages == 0) totalPages = 1;

        int fromIndex = Math.min(safePage * safeSize, totalDevelopers);
        int toIndex = Math.min(fromIndex + safeSize, totalDevelopers);
        List<RankingItemDto> paginatedLeaderboard = allItems.subList(fromIndex, toIndex);

        return new LeaderboardResponse(
                criteria.preset().name().toLowerCase(),
                dateRange.start(),
                dateRange.end(),
                criteria.sort().name().toLowerCase(),
                totalDevelopers,
                paginatedLeaderboard,
                topThree,
                safePage,
                safeSize,
                totalPages
        );
    }

    private List<TrackedDeveloper> fetchFilteredDevelopers(String search) {
        List<TrackedDeveloper> allActive = developerRepository.findAllByActiveTrue();
        if (search == null || search.isBlank()) {
            return allActive;
        }

        String query = search.trim().toLowerCase();
        return allActive.stream()
                .filter(d -> matchesSearch(d, query))
                .toList();
    }

    private boolean matchesSearch(TrackedDeveloper dev, String query) {
        boolean usernameMatches = dev.getUsername().toLowerCase().contains(query);
        boolean nameMatches = dev.getName() != null && dev.getName().toLowerCase().contains(query);
        return usernameMatches || nameMatches;
    }

    private EvaluatedDeveloper evaluateDeveloper(TrackedDeveloper dev, DateRange dateRange, LocalDate today, PeriodPreset preset) {
        int periodCommits = calculatePeriodCommits(dev, dateRange, preset);
        List<DailyActivityDto> recentActivity = fetchRecentActivity(dev.getId(), today);

        int dailyCommits = extractDailyCommits(recentActivity, today);
        int weeklyCommits = recentActivity.stream().mapToInt(DailyActivityDto::commitCount).sum();

        DeveloperMetrics metrics = new DeveloperMetrics(
                dev.getTotalCommitsCached(),
                periodCommits,
                weeklyCommits,
                dailyCommits,
                dev.getCurrentStreak(),
                dev.getPublicRepos(),
                dev.getFollowers(),
                false
        );

        long score = gamificationService.calculateScore(metrics);
        return new EvaluatedDeveloper(dev, periodCommits, score, recentActivity);
    }

    private int calculatePeriodCommits(TrackedDeveloper dev, DateRange range, PeriodPreset preset) {
        if (preset == PeriodPreset.ALL_TIME) {
            return dev.getTotalCommitsCached();
        }
        Integer sum = commitRecordRepository.sumCommitsBetweenDates(dev.getId(), range.start(), range.end());
        int dbSum = sum != null ? sum : 0;
        if (preset == PeriodPreset.THIS_YEAR) {
            int yearCached = dev.getYearCommitsCached() != null ? dev.getYearCommitsCached() : 0;
            return Math.max(yearCached, dbSum);
        }
        return dbSum;
    }

    private List<DailyActivityDto> fetchRecentActivity(Long developerId, LocalDate today) {
        LocalDate sevenDaysAgo = today.minusDays(6);
        List<CommitRecord> records = commitRecordRepository.findRecentActivity(developerId, sevenDaysAgo);

        Map<LocalDate, Integer> countByDate = new HashMap<>();
        for (CommitRecord r : records) {
            countByDate.put(r.getRecordDate(), r.getCommitCount());
        }

        List<DailyActivityDto> activity = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            activity.add(new DailyActivityDto(date, countByDate.getOrDefault(date, 0)));
        }
        return activity;
    }

    private int extractDailyCommits(List<DailyActivityDto> activity, LocalDate today) {
        return activity.stream()
                .filter(a -> a.date().equals(today))
                .findFirst()
                .map(DailyActivityDto::commitCount)
                .orElse(0);
    }

    private List<RankingItemDto> buildLeaderboardItems(List<EvaluatedDeveloper> evaluatedList) {
        List<RankingItemDto> items = new ArrayList<>();
        int rank = 1;

        for (EvaluatedDeveloper item : evaluatedList) {
            TrackedDeveloper dev = item.developer();
            boolean isTopThree = rank <= 3;

            DeveloperMetrics metrics = new DeveloperMetrics(
                    dev.getTotalCommitsCached(),
                    item.periodCommits(),
                    item.recentActivity().stream().mapToInt(DailyActivityDto::commitCount).sum(),
                    extractDailyCommits(item.recentActivity(), LocalDate.now()),
                    dev.getCurrentStreak(),
                    dev.getPublicRepos(),
                    dev.getFollowers(),
                    isTopThree
            );

            Tier tier = gamificationService.calculateTier(dev.getTotalCommitsCached());
            Set<BadgeType> badges = gamificationService.evaluateBadges(metrics);

            items.add(new RankingItemDto(
                    dev.getId(),
                    rank++,
                    dev.getUsername(),
                    dev.getName(),
                    dev.getAvatarUrl(),
                    dev.getHtmlUrl(),
                    dev.getBio(),
                    item.periodCommits(),
                    dev.getTotalCommitsCached(),
                    item.score(),
                    dev.getCurrentStreak(),
                    dev.getPublicRepos(),
                    dev.getFollowers(),
                    tier,
                    badges,
                    item.recentActivity(),
                    dev.getLastSyncedAt()
            ));
        }
        return items;
    }
}
