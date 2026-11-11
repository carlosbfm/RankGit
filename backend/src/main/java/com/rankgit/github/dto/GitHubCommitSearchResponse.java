package com.rankgit.github.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GitHubCommitSearchResponse(
        @JsonProperty("total_count") Integer totalCount,
        @JsonProperty("incomplete_results") Boolean incompleteResults,
        @JsonProperty("items") List<CommitItem> items
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CommitItem(
            @JsonProperty("sha") String sha,
            @JsonProperty("html_url") String htmlUrl,
            @JsonProperty("commit") CommitDetail commit,
            @JsonProperty("repository") RepoDetail repository
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RepoDetail(
            @JsonProperty("name") String name,
            @JsonProperty("full_name") String fullName,
            @JsonProperty("html_url") String htmlUrl
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CommitDetail(
            @JsonProperty("author") GitAuthor author,
            @JsonProperty("committer") GitAuthor committer,
            @JsonProperty("message") String message
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GitAuthor(
            @JsonProperty("name") String name,
            @JsonProperty("email") String email,
            @JsonProperty("date") String date
    ) {}
}
