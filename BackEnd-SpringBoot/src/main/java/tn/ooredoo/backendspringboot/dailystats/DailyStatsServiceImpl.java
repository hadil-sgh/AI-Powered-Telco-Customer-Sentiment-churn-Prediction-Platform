package tn.ooredoo.backendspringboot.dailystats;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.user.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DailyStatsServiceImpl implements DailyStatsService {
    private final DailyStatsRepository dailyStatsRepository;


    @Override
    public void updateCallsCompletedForToday(User user, int callsCompleted) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        // Find today's stats for the user
        Optional<DailyStats> statsOpt = dailyStatsRepository.findByUserAndDate(user, startOfDay);
        DailyStats stats;
        if (statsOpt.isPresent()) {
            stats = statsOpt.get();
            stats.setCallsCompleted(callsCompleted);
        } else {
            stats = DailyStats.builder()
                    .user(user)
                    .date(startOfDay)
                    .callsCompleted(callsCompleted)
                    .build();
        }
        dailyStatsRepository.save(stats);
    }

    @Override
    public Double getDailyAverageSentiment(String email) {
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
//        LocalDate today = LocalDate.now();
//        List<CallRecord> callRecords = callRecordServices.getCallsPerDayForAgent(user.getId(), today);
//        if (callRecords.isEmpty()) {
//            return 0.0;
//        }else {
//
//
//
//        }

        return 0.0;
    }

    @Override
    public Integer getAgentRanking(String email) {

        return 0;
    }
}

