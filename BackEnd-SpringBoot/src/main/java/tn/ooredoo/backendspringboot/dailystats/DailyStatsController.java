package tn.ooredoo.backendspringboot.dailystats;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.call_transcript.CallRecordServices;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/dailystats")
@RequiredArgsConstructor
public class DailyStatsController {
    private final DailyStatsRepository dailyStatsRepository;
    private final DailyStatsService dailyStatsService;
    private final UserRepository userRepository;
    private final CallRecordServices callRecordServices;

    @GetMapping("/forAgent/{agentId}")
    public DailyStats getDailyStatsForAgent(@PathVariable Long agentId, @RequestParam(defaultValue = "today") String date) {
        User user = userRepository.findById(agentId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        LocalDate targetDate = "yesterday".equalsIgnoreCase(date) ? LocalDate.now().minusDays(1) : LocalDate.now();
        LocalDateTime startOfDay = targetDate.atStartOfDay();
        return dailyStatsRepository.findByUserAndDate(user, startOfDay).orElse(null);
    }

    @PostMapping("/update/{recordId}")
    public ResponseEntity<DailyStats> updateDailyStatsPerAgentCall(
            @RequestParam String email,
            @PathVariable Long recordId,
            @RequestParam Double score,
            @RequestParam Double averageSentiment ) {
        CallRecord callRecord = callRecordServices.getCallRecordById(recordId.intValue());
        DailyStats updatedStats = dailyStatsService.updateDailyStatusPostCall(email, callRecord, score,averageSentiment);
        return ResponseEntity.ok(updatedStats);
    }

    @GetMapping("/getDailyStatusByAgent")
    public List<DailyStats> getDailyStatusByAgent(@RequestParam String userEmail) {
        return dailyStatsService.getDailyStatsByAgent(userEmail);
    }

    @GetMapping("/getTeamRanking")
    public List<AgentRankingDTO> getTeamRanking(@RequestParam String userEmail) {
        return dailyStatsService.getTeamRankingOverall(userEmail);
    }

    @GetMapping("/today/{email}")
    public ResponseEntity<DailyStats> getTodayStats(@PathVariable String email) {
        DailyStats stats = dailyStatsService.getDailyStatsForToday(email);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }
    @GetMapping("/week/{email}")
    public ResponseEntity<List<DailyStats>> getWeeklyStatsByAgent(@PathVariable String email) {
        List<DailyStats> stats = dailyStatsService.getDailyStatsByAgentForTheCurrentWeek(email);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/yesterday/{email}")
    public ResponseEntity<DailyStats> getYesterdayStats(@PathVariable String email) {
        DailyStats stats = dailyStatsService.getDailyStatsForYesterday(email);
        if (stats == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(stats);
    }


}

