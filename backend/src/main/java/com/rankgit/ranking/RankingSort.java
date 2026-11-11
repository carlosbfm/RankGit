package com.rankgit.ranking;

import java.util.Arrays;
import java.util.Comparator;

public enum RankingSort {
    COMMITS(Comparator.comparingInt(EvaluatedDeveloper::periodCommits).reversed()),
    SCORE(Comparator.comparingLong(EvaluatedDeveloper::score).reversed()),
    STREAK(Comparator.comparingInt((EvaluatedDeveloper e) -> e.developer().getCurrentStreak()).reversed()),
    REPOS(Comparator.comparingInt((EvaluatedDeveloper e) -> e.developer().getPublicRepos()).reversed()),
    FOLLOWERS(Comparator.comparingInt((EvaluatedDeveloper e) -> e.developer().getFollowers()).reversed());

    private final Comparator<EvaluatedDeveloper> comparator;

    RankingSort(Comparator<EvaluatedDeveloper> comparator) {
        this.comparator = comparator;
    }

    public Comparator<EvaluatedDeveloper> getComparator() {
        return comparator;
    }

    public static RankingSort fromString(String value) {
        if (value == null || value.isBlank()) {
            return COMMITS;
        }
        return Arrays.stream(values())
                .filter(s -> s.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElse(COMMITS);
    }
}
