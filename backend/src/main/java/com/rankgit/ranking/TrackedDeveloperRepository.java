package com.rankgit.ranking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrackedDeveloperRepository extends JpaRepository<TrackedDeveloper, Long> {
    Optional<TrackedDeveloper> findByUsernameIgnoreCase(String username);
    boolean existsByUsernameIgnoreCase(String username);
    List<TrackedDeveloper> findAllByActiveTrue();
}
