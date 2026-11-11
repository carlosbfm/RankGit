package com.rankgit.ranking;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "developer_commit_records",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_dev_record_date", columnNames = {"developer_id", "record_date"})
        },
        indexes = {
                @Index(name = "idx_commit_record_date", columnList = "record_date"),
                @Index(name = "idx_commit_dev_date", columnList = "developer_id, record_date")
        }
)
public class CommitRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "developer_id", nullable = false)
    private TrackedDeveloper developer;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "commit_count", nullable = false)
    private Integer commitCount = 0;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    public CommitRecord() {
    }

    public CommitRecord(TrackedDeveloper developer, LocalDate recordDate, Integer commitCount) {
        this.developer = developer;
        this.recordDate = recordDate;
        this.commitCount = commitCount;
    }

    @PrePersist
    @PreUpdate
    protected void onRecord() {
        this.recordedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TrackedDeveloper getDeveloper() {
        return developer;
    }

    public void setDeveloper(TrackedDeveloper developer) {
        this.developer = developer;
    }

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDate recordDate) {
        this.recordDate = recordDate;
    }

    public Integer getCommitCount() {
        return commitCount != null ? commitCount : 0;
    }

    public void setCommitCount(Integer commitCount) {
        this.commitCount = commitCount;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }
}
