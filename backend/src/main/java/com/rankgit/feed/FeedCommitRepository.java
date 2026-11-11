package com.rankgit.feed;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedCommitRepository extends JpaRepository<FeedCommit, Long> {
    Optional<FeedCommit> findBySha(String sha);
    boolean existsBySha(String sha);
    Page<FeedCommit> findAllByOrderByCommittedAtDesc(Pageable pageable);
    Page<FeedCommit> findByDeveloperUsernameIgnoreCaseOrderByCommittedAtDesc(String username, Pageable pageable);
    long countByDeveloperUsernameIgnoreCase(String username);
}
