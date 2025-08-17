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
            @RequestParam Integer score) {
        CallRecord callRecord = callRecordServices.getCallRecordById(recordId.intValue());
        DailyStats updatedStats = dailyStatsService.updateDailyStatusPostCall(email, callRecord, score);
        return ResponseEntity.ok(updatedStats);
    }
}

