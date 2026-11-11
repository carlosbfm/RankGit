package com.rankgit.gamification;

import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.Set;

@Service
public class GamificationService {

    public Tier calculateTier(int totalCommits) {
        return Tier.fromCommitCount(totalCommits);
    }

    public long calculateScore(DeveloperMetrics metrics) {
        return (long) metrics.totalCommits()
                + (long) metrics.periodCommits() * 3L
                + (long) metrics.weeklyCommits() * 6L
                + (long) metrics.dailyCommits() * 12L
                + (long) metrics.currentStreak() * 20L
                + (long) metrics.publicRepos() * 2L
                + (long) metrics.followers() * 2L;
    }

    public Set<BadgeType> evaluateBadges(DeveloperMetrics metrics) {
        Set<BadgeType> badges = EnumSet.noneOf(BadgeType.class);

        addIf(badges, BadgeType.COMMIT_MACHINE, metrics.totalCommits() >= 1000);
        addIf(badges, BadgeType.STREAK_MASTER, metrics.currentStreak() >= 7);
        addIf(badges, BadgeType.OCTOCAT_VETERAN, metrics.publicRepos() >= 30);
        addIf(badges, BadgeType.WEEKLY_SPRINTER, metrics.weeklyCommits() >= 25);
        addIf(badges, BadgeType.COMMUNITY_STAR, metrics.followers() >= 50);
        addIf(badges, BadgeType.PODIUM_CHAMPION, metrics.isTopThree());

        return badges;
    }

    private void addIf(Set<BadgeType> badges, BadgeType badge, boolean condition) {
        if (condition) {
            badges.add(badge);
        }
    }
}
