package com.rankgit.gamification;

public record DeveloperMetrics(
        int totalCommits,
        int periodCommits,
        int weeklyCommits,
        int dailyCommits,
        int currentStreak,
        int publicRepos,
        int followers,
        boolean isTopThree
) {}
