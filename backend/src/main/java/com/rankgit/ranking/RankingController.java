package com.rankgit.ranking;

import com.rankgit.administration.AdminService;
import com.rankgit.feed.FeedService;
import com.rankgit.ranking.dto.DeveloperDetailsDto;
import com.rankgit.ranking.dto.LeaderboardResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/rankings")
public class RankingController {

    private final RankingService rankingService;
    private final AdminService adminService;
    private final FeedService feedService;

    public RankingController(RankingService rankingService,
                             AdminService adminService,
                             FeedService feedService) {
        this.rankingService = rankingService;
        this.adminService = adminService;
        this.feedService = feedService;
    }

    @GetMapping
    public ResponseEntity<LeaderboardResponse> getLeaderboard(
            @RequestParam(required = false, defaultValue = "all_time") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "commits") String sortBy,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        RankingCriteria criteria = new RankingCriteria(
                PeriodPreset.fromString(period),
                startDate,
                endDate,
                RankingSort.fromString(sortBy),
                search,
                page,
                size
        );

        LeaderboardResponse response = rankingService.getLeaderboard(criteria);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/developer/{username}")
    public ResponseEntity<DeveloperDetailsDto> getDeveloperDetails(@PathVariable String username) {
        DeveloperDetailsDto details = rankingService.getDeveloperDetails(username);
        return ResponseEntity.ok(details);
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncAll() {
        adminService.syncAllDevelopers();
        int newFeedCommits = feedService.syncCommitsFromTrackedDevelopers();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Sincronização de todos os desenvolvedores realizada com sucesso.",
                "newFeedCommits", newFeedCommits
        ));
    }

    @PostMapping("/sync/{username}")
    public ResponseEntity<DeveloperDetailsDto> syncDeveloper(@PathVariable String username) {
        adminService.syncDeveloperByUsername(username);
        feedService.syncCommitsFromTrackedDevelopers();
        DeveloperDetailsDto details = rankingService.getDeveloperDetails(username);
        return ResponseEntity.ok(details);
    }
}
