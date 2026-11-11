package com.rankgit.feed.dto;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

public record FeedPostDto(
        Long id,
        String sha,
        String shortSha,
        DeveloperAuthorDto author,
        CommitContentDto commit,
        Map<String, Long> reactionsCount,
        Set<String> currentUserReactions,
        String timeAgo
) {
    public record DeveloperAuthorDto(
            String username,
            String name,
            String avatarUrl,
            String tier,
            Integer currentStreak,
            Integer score,
            Integer totalCommits
    ) {}

    public record CommitContentDto(
            String message,
            String repoName,
            String repoUrl,
            String commitUrl,
            LocalDateTime committedAt
    ) {}
}
