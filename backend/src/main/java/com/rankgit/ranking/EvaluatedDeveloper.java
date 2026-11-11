package com.rankgit.ranking;

import com.rankgit.ranking.dto.DailyActivityDto;

import java.util.List;

public record EvaluatedDeveloper(
        TrackedDeveloper developer,
        int periodCommits,
        long score,
        List<DailyActivityDto> recentActivity
) {}
