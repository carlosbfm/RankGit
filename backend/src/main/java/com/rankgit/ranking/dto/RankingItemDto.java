package com.rankgit.ranking.dto;

import com.rankgit.gamification.BadgeType;
import com.rankgit.gamification.Tier;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public record RankingItemDto(
        Long id,
        int position,
        String username,
        String name,
        String avatarUrl,
        String htmlUrl,
        String bio,
        int commitsInPeriod,
        int totalCommits,
        long score,
        int currentStreak,
        int publicRepos,
        int followers,
        Tier tier,
        Set<BadgeType> badges,
        List<DailyActivityDto> recentActivity,
        LocalDateTime lastSyncedAt
) {}
