package com.rankgit.feed;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedReactionRepository extends JpaRepository<FeedReaction, Long> {
    List<FeedReaction> findAllByCommitSha(String commitSha);
    Optional<FeedReaction> findByCommitShaAndUsernameAndReactionType(String commitSha, String username, String reactionType);
    void deleteByCommitShaAndUsernameAndReactionType(String commitSha, String username, String reactionType);
}
