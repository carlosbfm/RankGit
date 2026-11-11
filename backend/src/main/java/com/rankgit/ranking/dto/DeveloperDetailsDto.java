package com.rankgit.ranking.dto;

import java.time.LocalDateTime;
import java.util.List;

public record DeveloperDetailsDto(
        // GitHub Profile
        String username,
        String name,
        String avatarUrl,
        String htmlUrl,
        String bio,
        String company,
        String location,
        String email,
        String blog,
        String twitterUsername,
        String createdAt,
        Integer publicRepos,
        Integer followers,
        Integer following,

        // RankGit Performance Stats
        Integer totalCommits,
        Integer yearCommits,
        Integer currentStreak,
        Integer score,
        String tier,
        Integer rankingPosition,
        List<String> badges,
        LocalDateTime lastSyncedAt,

        // Repositories & Recent Commits
        List<RepoSummaryDto> topRepositories,
        List<RecentCommitDto> recentCommits
) {
    public record RepoSummaryDto(
            String name,
            String htmlUrl,
            String description,
            String language,
            Integer stars,
            Integer forks,
            String updatedAt,
            Boolean isFork
    ) {}

    public record RecentCommitDto(
            String sha,
            String shortSha,
            String message,
            String date,
            String repoName,
            String repoUrl,
            String commitUrl
    ) {}
}
