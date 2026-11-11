package com.rankgit.administration.dto;

import com.rankgit.user.Role;
import jakarta.validation.constraints.NotBlank;

public record AdminUserUpdateRequest(
        @NotBlank(message = "O nome de usuário é obrigatório")
        String username,

        String password,
        String name,
        String email,
        Role role,
        Boolean approved
) {}
