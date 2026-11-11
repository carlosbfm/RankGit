package com.rankgit.administration.dto;

import java.time.LocalDateTime;

public record SyncSummaryDto(
        int totalProcessed,
        int successCount,
        int failureCount,
        LocalDateTime finishedAt,
        String message
) {}
