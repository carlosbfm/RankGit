package com.rankgit.auth.dto;

public record AuthResponse(
        String token,
        String tokenType,
        UserProfileDto user,
        String message
) {
    public static AuthResponse bearer(String token, UserProfileDto user) {
        return new AuthResponse(token, "Bearer", user, null);
    }

    public static AuthResponse pendingApproval(UserProfileDto user) {
        return new AuthResponse(
                null,
                null,
                user,
                "Cadastro realizado com sucesso! Sua conta está aguardando aprovação de um administrador para liberar seu acesso."
        );
    }
}
