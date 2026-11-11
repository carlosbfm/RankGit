package com.rankgit.ranking.dto;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

public record LeaderboardResponse(
        String preset,
        LocalDate startDate,
        LocalDate endDate,
        String sortBy,
        int totalDevelopers,
        List<RankingItemDto> leaderboard,
        List<RankingItemDto> topThree,
        int page,
        int size,
        int totalPages
) {
    public LeaderboardResponse(String preset, LocalDate startDate, LocalDate endDate, String sortBy, int totalDevelopers, List<RankingItemDto> leaderboard) {
        this(preset, startDate, endDate, sortBy, totalDevelopers, leaderboard,
                (leaderboard != null && !leaderboard.isEmpty()) ? leaderboard.subList(0, Math.min(3, leaderboard.size())) : Collections.emptyList(),
                0, (leaderboard != null && !leaderboard.isEmpty()) ? leaderboard.size() : 10, 1);
    }
}
