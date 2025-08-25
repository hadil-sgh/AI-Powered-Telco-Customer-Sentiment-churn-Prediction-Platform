package tn.ooredoo.backendspringboot.dailystats;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.sentiment.SentimentPointService;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserRepository;
import tn.ooredoo.backendspringboot.user.UserService;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DailyStatsServiceImpl implements DailyStatsService {
    private final DailyStatsRepository dailyStatsRepository;
    private final UserService userService;
    private final UserRepository userRepository;
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
    public DailyStats updateDailyStatusPostCall(String email, CallRecord callRecord, Double score, Double newSentimentPoint) {
        User currentUser = userService.findByEmail(email);

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay().minusNanos(1);

        DailyStats dailyStats = dailyStatsRepository.findByUserAndDateBetween(currentUser, startOfDay, endOfDay)
                .orElseGet(() -> DailyStats.builder()
                        .user(currentUser)
                        .date(startOfDay)
                        .callsCompleted(0)
                        .totalScore(0.0)
                        .averageSentiment(0.0)
                        .build());

        // Increment calls completed
        int completed = dailyStats.getCallsCompleted() + 1;
        dailyStats.setCallsCompleted(completed);

        // Convert new sentiment point to 0–1 scale
        double sentimentPointsNormalized = newSentimentPoint / 100.0;

        // Recalculate average sentiment
        double oldAvg = dailyStats.getAverageSentiment();
        double newAvg = ((oldAvg * (completed - 1)) + sentimentPointsNormalized) / completed;
        dailyStats.setAverageSentiment(newAvg);

        // Update total score
        Double newTotalScore = dailyStats.getTotalScore() + score;
        dailyStats.setTotalScore(newTotalScore);

        // Optionally calculate average score for logging
        Double averageScore = newTotalScore / completed;
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

    @Override
    public List<DailyStats> getDailyStatsByAgentForTheCurrentWeek(String email) {
        User agent = userService.findByEmail(email);

        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);

        LocalDateTime startDateTime = startOfWeek.atStartOfDay();
        LocalDateTime endDateTime = endOfWeek.atTime(LocalTime.MAX);

        return dailyStatsRepository.findAllByUserAndDateBetween(agent, startDateTime, endDateTime);
    }


    @Override
    public DailyStats getDailyStatsForToday(String email) {
        User user = userService.findByEmail(email);
        LocalDate today = LocalDate.now();

        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        return dailyStatsRepository.findByUserAndDateBetween(user, startOfDay, endOfDay)
                .orElse(null);
    }

    @Override
    public List<AgentRankingDTO> getTeamRankingOverall(String email) {
        User currentUser = userService.findByEmail(email);
        if (currentUser.getTeam() == null) {
            return new ArrayList<>();
        }

        List<User> teammates = userRepository.findByTeam(currentUser.getTeam());
        List<AgentRankingDTO> ranking = new ArrayList<>();

        for (User teammate : teammates) {
            List<DailyStats> allStats = dailyStatsRepository.findAllByUser(teammate);

            if (!allStats.isEmpty()) {
                int totalCalls = allStats.stream()
                        .mapToInt(ds -> ds.getCallsCompleted() == null ? 0 : ds.getCallsCompleted())
                        .sum();

                double totalScore = allStats.stream()
                        .mapToDouble(ds -> ds.getTotalScore() == null ? 0.0 : ds.getTotalScore())
                        .sum();

                double avgSentiment = allStats.stream()
                        .filter(ds -> ds.getAverageSentiment() != null)
                        .mapToDouble(DailyStats::getAverageSentiment)
                        .average()
                        .orElse(0.0);

                ranking.add(new AgentRankingDTO(
                        teammate.getFullName(),
                        totalScore,     // now Double
                        totalCalls,
                        avgSentiment,
                        0               // placeholder for rank
                ));
            }
        }

        // Sort: score DESC → calls DESC → sentiment DESC
        ranking.sort(Comparator
                .comparing(AgentRankingDTO::getTotalScore, Comparator.reverseOrder())
                .thenComparing(AgentRankingDTO::getCallsCompleted, Comparator.reverseOrder())
                .thenComparing(AgentRankingDTO::getAverageSentiment, Comparator.reverseOrder()));

        // Assign rank
        for (int i = 0; i < ranking.size(); i++) {
            ranking.get(i).setRank(i + 1); // 1-based ranking
        }

        return ranking;
    }

    @Override
    public DailyStats getDailyStatsForYesterday(String email) {
        User user = userService.findByEmail(email);

        LocalDate yesterday = LocalDate.now().minusDays(1);
        return dailyStatsRepository.findByUserAndYesterday(user, yesterday)
                .orElse(null);
    }
}






