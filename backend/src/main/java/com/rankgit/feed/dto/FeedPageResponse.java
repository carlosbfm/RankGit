package com.rankgit.feed.dto;

import java.util.List;

public record FeedPageResponse(
        List<FeedPostDto> posts,
        int page,
        int size,
        long totalPosts,
        int totalPages,
        int totalTrackedDevelopers
) {}
