package com.rankgit.ranking;

import java.time.LocalDate;

public record DateRange(LocalDate start, LocalDate end) {
    public static DateRange of(LocalDate start, LocalDate end) {
        return new DateRange(start, end);
    }
}
