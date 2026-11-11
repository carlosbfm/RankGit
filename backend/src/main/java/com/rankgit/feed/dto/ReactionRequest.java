package com.rankgit.feed.dto;

import jakarta.validation.constraints.NotBlank;

public record ReactionRequest(
        @NotBlank(message = "O tipo de reação é obrigatório.")
        String reactionType // LIKE, FIRE, ROCKET, CLAP
) {}
