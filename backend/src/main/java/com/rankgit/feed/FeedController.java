package com.rankgit.feed;

import com.rankgit.administration.AdminService;
import com.rankgit.feed.dto.FeedPageResponse;
import com.rankgit.feed.dto.ReactionRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feed")
public class FeedController {

    private final FeedService feedService;
    private final AdminService adminService;

    public FeedController(FeedService feedService, AdminService adminService) {
        this.feedService = feedService;
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<FeedPageResponse> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String developer,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String currentUsername = userDetails != null ? userDetails.getUsername() : null;
        FeedPageResponse response = feedService.getFeed(page, size, developer, currentUsername);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncFeed() {
        try {
            adminService.syncAllDevelopers();
        } catch (Exception ignored) {}

        int newCommits = feedService.syncCommitsFromTrackedDevelopers();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "newCommits", newCommits,
                "message", newCommits > 0
                        ? newCommits + " novos commits foram incorporados ao feed e ranking atualizado!"
                        : "O feed e o ranking já estão sincronizados com os commits mais recentes do GitHub."
        ));
    }

    @PostMapping("/{sha}/reaction")
    public ResponseEntity<Map<String, Object>> toggleReaction(
            @PathVariable String sha,
            @Valid @RequestBody ReactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        feedService.toggleReaction(sha, request.reactionType(), username);
        return ResponseEntity.ok(Map.of("success", true, "sha", sha, "reactionType", request.reactionType()));
    }
}
