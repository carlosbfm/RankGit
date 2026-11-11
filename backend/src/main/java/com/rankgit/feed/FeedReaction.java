package com.rankgit.feed;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feed_reactions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_commit_user_reaction", columnNames = {"commit_sha", "username", "reaction_type"})
}, indexes = {
        @Index(name = "idx_reaction_sha", columnList = "commit_sha")
})
public class FeedReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "commit_sha", nullable = false, length = 64)
    private String commitSha;

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "reaction_type", nullable = false, length = 20)
    private String reactionType; // LIKE, FIRE, ROCKET, CLAP

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public FeedReaction() {
    }

    public FeedReaction(String commitSha, String username, String reactionType) {
        this.commitSha = commitSha;
        this.username = username;
        this.reactionType = reactionType;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getCommitSha() {
        return commitSha;
    }

    public String getUsername() {
        return username;
    }

    public String getReactionType() {
        return reactionType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
