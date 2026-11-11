package com.rankgit.github.dto;

import java.time.LocalDate;
import java.util.Map;

public record CommitActivityResult(
        int totalCount,
        Map<LocalDate, Integer> dailyCounts,
        int currentStreak
) {}
