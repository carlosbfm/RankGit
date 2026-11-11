package com.rankgit.ranking.dto;

import java.time.LocalDate;

public record DailyActivityDto(
        LocalDate date,
        int commitCount
) {}
