package com.rankgit.ranking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommitRecordRepository extends JpaRepository<CommitRecord, Long> {

    Optional<CommitRecord> findByDeveloperIdAndRecordDate(Long developerId, LocalDate recordDate);

    @Query("SELECT COALESCE(SUM(c.commitCount), 0) FROM CommitRecord c " +
           "WHERE c.developer.id = :developerId AND c.recordDate BETWEEN :startDate AND :endDate")
    Integer sumCommitsBetweenDates(@Param("developerId") Long developerId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);

    @Query("SELECT c FROM CommitRecord c " +
           "WHERE c.developer.id = :developerId AND c.recordDate >= :sinceDate " +
           "ORDER BY c.recordDate ASC")
    List<CommitRecord> findRecentActivity(@Param("developerId") Long developerId,
                                          @Param("sinceDate") LocalDate sinceDate);
}
