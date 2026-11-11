package com.rankgit.feed;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feed_commits", indexes = {
        @Index(name = "idx_feed_committed_at", columnList = "committed_at"),
        @Index(name = "idx_feed_dev_username", columnList = "developer_username")
})
public class FeedCommit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sha", nullable = false, unique = true, length = 64)
    private String sha;

    @Column(name = "developer_username", nullable = false, length = 100)
    private String developerUsername;

    @Column(name = "developer_name", length = 200)
    private String developerName;

    @Column(name = "developer_avatar_url", length = 500)
    private String developerAvatarUrl;

    @Column(name = "repo_name", length = 200)
    private String repoName;

    @Column(name = "repo_url", length = 500)
    private String repoUrl;

    @Column(name = "commit_message", length = 2000)
    private String commitMessage;

    @Column(name = "commit_url", length = 500)
    private String commitUrl;

    @Column(name = "committed_at")
    private LocalDateTime committedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public FeedCommit() {
    }

    public FeedCommit(String sha, String developerUsername, String developerName, String developerAvatarUrl,
                      String repoName, String repoUrl, String commitMessage, String commitUrl,
                      LocalDateTime committedAt) {
        this.sha = sha;
        this.developerUsername = developerUsername;
        this.developerName = developerName;
        this.developerAvatarUrl = developerAvatarUrl;
        this.repoName = repoName;
        this.repoUrl = repoUrl;
        this.commitMessage = commitMessage;
        this.commitUrl = commitUrl;
        this.committedAt = committedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.committedAt == null) {
            this.committedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSha() {
        return sha;
    }

    public void setSha(String sha) {
        this.sha = sha;
    }

    public String getDeveloperUsername() {
        return developerUsername;
    }

    public void setDeveloperUsername(String developerUsername) {
        this.developerUsername = developerUsername;
    }

    public String getDeveloperName() {
        return developerName;
    }

    public void setDeveloperName(String developerName) {
        this.developerName = developerName;
    }

    public String getDeveloperAvatarUrl() {
        return developerAvatarUrl;
    }

    public void setDeveloperAvatarUrl(String developerAvatarUrl) {
        this.developerAvatarUrl = developerAvatarUrl;
    }

    public String getRepoName() {
        return repoName;
    }

    public void setRepoName(String repoName) {
        this.repoName = repoName;
    }

    public String getRepoUrl() {
        return repoUrl;
    }

    public void setRepoUrl(String repoUrl) {
        this.repoUrl = repoUrl;
    }

    public String getCommitMessage() {
        return commitMessage;
    }

    public void setCommitMessage(String commitMessage) {
        this.commitMessage = commitMessage;
    }

    public String getCommitUrl() {
        return commitUrl;
    }

    public void setCommitUrl(String commitUrl) {
        this.commitUrl = commitUrl;
    }

    public LocalDateTime getCommittedAt() {
        return committedAt;
    }

    public void setCommittedAt(LocalDateTime committedAt) {
        this.committedAt = committedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
