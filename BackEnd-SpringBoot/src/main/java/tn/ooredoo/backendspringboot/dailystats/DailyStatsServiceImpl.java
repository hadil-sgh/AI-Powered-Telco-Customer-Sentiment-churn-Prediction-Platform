package tn.ooredoo.backendspringboot.dailystats;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.sentiment.SentimentPointService;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DailyStatsServiceImpl implements DailyStatsService {
    private final DailyStatsRepository dailyStatsRepository;
    private final UserService userService;
    private final SentimentPointService sentimentPointService;


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
    public DailyStats updateDailyStatusPostCall(String email, CallRecord callRecord, Integer score) {
        LocalDate today = LocalDate.now();
        User currentUser = userService.findByEmail(email);

        DailyStats dailyStats = dailyStatsRepository.findByUserAndDate(currentUser, today.atStartOfDay())
                .orElseGet(() -> DailyStats.builder()
                        .user(currentUser)
                        .date(today.atStartOfDay())
                        .callsCompleted(0)
                        .totalScore(0)
                        .averageSentiment(0.0)
                        .build());


        dailyStats.setCallsCompleted(dailyStats.getCallsCompleted() + 1);


        Double sentimentPoints = sentimentPointService.getAverageSentimentPerCall(callRecord.getId());
        dailyStats.setAverageSentiment(sentimentPoints);


        int newTotalScore = dailyStats.getTotalScore() + score;
        dailyStats.setTotalScore(newTotalScore);

        double averageScore = (double) newTotalScore / dailyStats.getCallsCompleted();

        System.out.println("New average score: " + averageScore);

        return dailyStatsRepository.save(dailyStats);
    }

    @Override
    public List<DailyStats> getDailyStatsByAgent(String email) {
        User agent = userService.findByEmail(email);
        List<DailyStats> allDailyStats = dailyStatsRepository.findAll();
        List<DailyStats> result = new ArrayList<>();

        for (DailyStats dailyStats : allDailyStats) {
            if (dailyStats.getUser().equals(agent)) {
                result.add(dailyStats);
            }
        }

        return result;
    }



}

