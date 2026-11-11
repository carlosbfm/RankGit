package com.rankgit.auth.dto;

import com.rankgit.user.Role;
import com.rankgit.user.User;

public record UserProfileDto(
        Long id,
        String githubId,
        String username,
        String name,
        String email,
        String avatarUrl,
        Role role,
        boolean approved
) {
    public static UserProfileDto fromEntity(User user) {
        return new UserProfileDto(
                user.getId(),
                user.getGithubId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getRole(),
                user.isApproved()
        );
    }
}
