package com.rankgit.administration.dto;

import com.rankgit.user.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminUserCreateRequest(
        @NotBlank(message = "O nome de usuário é obrigatório")
        String username,

        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 4, message = "A senha deve ter no mínimo 4 caracteres")
        String password,

        String name,
        String email,
        Role role
) {}
