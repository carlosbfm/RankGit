package com.rankgit.ranking;

import java.time.LocalDate;

public record RankingCriteria(
        PeriodPreset preset,
        LocalDate customStart,
        LocalDate customEnd,
        RankingSort sort,
        String search,
        int page,
        int size
) {
    public RankingCriteria(PeriodPreset preset, LocalDate customStart, LocalDate customEnd, RankingSort sort, String search) {
        this(preset, customStart, customEnd, sort, search, 0, 10);
    }

    public DateRange resolveDateRange(LocalDate today) {
        if (customStart != null && customEnd != null) {
            return DateRange.of(customStart, customEnd);
        }
        return preset.resolve(today);
    }
}
