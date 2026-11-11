package com.rankgit.administration.dto;

import com.rankgit.auth.dto.UserProfileDto;
import java.util.List;

public record AdminUsersPageResponse(
        List<UserProfileDto> users,
        int page,
        int size,
        long totalUsers,
        int totalPages
) {}
