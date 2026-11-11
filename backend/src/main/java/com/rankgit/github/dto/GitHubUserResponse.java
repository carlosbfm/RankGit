package com.rankgit.github.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GitHubUserResponse(
        Long id,
        String login,
        String name,
        @JsonProperty("avatar_url") String avatarUrl,
        @JsonProperty("html_url") String htmlUrl,
        String bio,
        @JsonProperty("public_repos") Integer publicRepos,
        Integer followers,
        Integer following,
        String company,
        String location,
        String email,
        String blog,
        @JsonProperty("twitter_username") String twitterUsername,
        @JsonProperty("created_at") String createdAt
) {}
