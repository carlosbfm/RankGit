package com.rankgit.github.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GitHubRepoResponse(
        String name,
        @JsonProperty("html_url") String htmlUrl,
        String description,
        String language,
        @JsonProperty("stargazers_count") Integer stargazersCount,
        @JsonProperty("forks_count") Integer forksCount,
        @JsonProperty("updated_at") String updatedAt,
        @JsonProperty("pushed_at") String pushedAt,
        Boolean fork
) {}
