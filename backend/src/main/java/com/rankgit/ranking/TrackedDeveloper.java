package com.rankgit.ranking;

import com.rankgit.gamification.Tier;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tracked_developers", indexes = {
        @Index(name = "idx_dev_username", columnList = "username", unique = true)
})
public class TrackedDeveloper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "github_id")
    private Long githubId;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "name")
    private String name;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "html_url")
    private String htmlUrl;

    @Column(name = "bio", length = 1000)
    private String bio;

    @Column(name = "public_repos")
    private Integer publicRepos = 0;

    @Column(name = "followers")
    private Integer followers = 0;

    @Column(name = "total_commits_cached")
    private Integer totalCommitsCached = 0;

    @Column(name = "year_commits_cached")
    private Integer yearCommitsCached = 0;

    @Column(name = "current_streak")
    private Integer currentStreak = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "tier", nullable = false)
    private Tier tier = Tier.BRONZE;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "added_by")
    private String addedBy;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    public TrackedDeveloper() {
    }

    public TrackedDeveloper(String username, String name, String avatarUrl, String htmlUrl, String bio, String addedBy) {
        this.username = username;
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.htmlUrl = htmlUrl;
        this.bio = bio;
        this.addedBy = addedBy;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getGithubId() {
        return githubId;
    }

    public void setGithubId(Long githubId) {
        this.githubId = githubId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getHtmlUrl() {
        return htmlUrl;
    }

    public void setHtmlUrl(String htmlUrl) {
        this.htmlUrl = htmlUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Integer getPublicRepos() {
        return publicRepos != null ? publicRepos : 0;
    }

    public void setPublicRepos(Integer publicRepos) {
        this.publicRepos = publicRepos;
    }

    public Integer getFollowers() {
        return followers != null ? followers : 0;
    }

    public void setFollowers(Integer followers) {
        this.followers = followers;
    }

    public Integer getTotalCommitsCached() {
        return totalCommitsCached != null ? totalCommitsCached : 0;
    }

    public void setTotalCommitsCached(Integer totalCommitsCached) {
        this.totalCommitsCached = totalCommitsCached;
    }

    public Integer getYearCommitsCached() {
        return yearCommitsCached != null ? yearCommitsCached : 0;
    }

    public void setYearCommitsCached(Integer yearCommitsCached) {
        this.yearCommitsCached = yearCommitsCached;
    }

    public Integer getCurrentStreak() {
        return currentStreak != null ? currentStreak : 0;
    }

    public void setCurrentStreak(Integer currentStreak) {
        this.currentStreak = currentStreak;
    }

    public Tier getTier() {
        return tier;
    }

    public void setTier(Tier tier) {
        this.tier = tier;
    }

    public LocalDateTime getLastSyncedAt() {
        return lastSyncedAt;
    }

    public void setLastSyncedAt(LocalDateTime lastSyncedAt) {
        this.lastSyncedAt = lastSyncedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getAddedBy() {
        return addedBy;
    }

    public void setAddedBy(String addedBy) {
        this.addedBy = addedBy;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
