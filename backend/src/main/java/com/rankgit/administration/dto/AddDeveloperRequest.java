package com.rankgit.administration.dto;

import jakarta.validation.constraints.NotBlank;

public record AddDeveloperRequest(
        @NotBlank(message = "O link do GitHub ou username é obrigatório")
        String githubInput
) {}
