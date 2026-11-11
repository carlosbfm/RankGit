package com.rankgit.ranking;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Arrays;
import java.util.function.Function;

public enum PeriodPreset {
    TODAY(today -> DateRange.of(today, today)),
    THIS_WEEK(today -> DateRange.of(today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)), today)),
    THIS_MONTH(today -> DateRange.of(today.with(TemporalAdjusters.firstDayOfMonth()), today)),
    THIS_YEAR(today -> DateRange.of(today.with(TemporalAdjusters.firstDayOfYear()), today)),
    LAST_30_DAYS(today -> DateRange.of(today.minusDays(30), today)),
    ALL_TIME(today -> DateRange.of(LocalDate.of(2008, 1, 1), today));

    private final Function<LocalDate, DateRange> resolver;

    PeriodPreset(Function<LocalDate, DateRange> resolver) {
        this.resolver = resolver;
    }

    public DateRange resolve(LocalDate referenceDate) {
        return resolver.apply(referenceDate);
    }

    public static PeriodPreset fromString(String value) {
        if (value == null || value.isBlank()) {
            return ALL_TIME;
        }
        return Arrays.stream(values())
                .filter(p -> p.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElse(ALL_TIME);
    }
}
