package com.rankgit.ranking;

import com.rankgit.ranking.dto.DeveloperDetailsDto;
import com.rankgit.ranking.dto.LeaderboardResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/rankings")
public class RankingController {

    private final RankingService rankingService;

    public RankingController(RankingService rankingService) {
        this.rankingService = rankingService;
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
}
