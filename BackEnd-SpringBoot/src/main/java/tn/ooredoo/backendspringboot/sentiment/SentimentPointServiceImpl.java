package tn.ooredoo.backendspringboot.sentiment;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.audioprocessing.AudioAnalysisResponse;
import tn.ooredoo.backendspringboot.audioprocessing.EmotionAnalysis;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.call_transcript.CallRecordRepository;
import tn.ooredoo.backendspringboot.call_transcript.CallRecordServices;
import tn.ooredoo.backendspringboot.team.Team;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserRepository;
import tn.ooredoo.backendspringboot.user.UserService;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SentimentPointServiceImpl implements SentimentPointService {

    private final SentimentPointRepository sentimentPointRepository;
    private final UserService userService;
    private final CallRecordServices callRecordService;
    private final @Lazy UserRepository userRepository;
    private final @Lazy CallRecordRepository callRecordRepository;


    @Override
    public Double calculatingSentimentPointsForUserToday(String userEmail) {
        User user = userService.findByEmail(userEmail);
        return sentimentPointRepository.averageSentimentByUserIdToday(user.getId());
    }

    @Override
    @Transactional
    public Double getAverageSentimentPerCall(Integer callId) {
        CallRecord callRecord = callRecordService.getCallRecordById(callId);

        double totalSentiment = 0.0;
        int count = 0;

        for (AudioAnalysisResponse response : callRecord.getCallTranscripts()) {
            EmotionAnalysis analysis = response.getEmotionAnalysis();
            if (analysis != null) {
                double score = mapEmotionToScore(analysis.getPrimary_emotion());
                totalSentiment += score;
                count++;
            }
        }

        double averageScore = count > 0 ? totalSentiment / count : 0.0;

        // Save or update SentimentPoint for this call
        SentimentPoint sentimentPoint = callRecord.getSentimentPoint();
        if (sentimentPoint == null) {
            sentimentPoint = SentimentPoint.builder()
                    .call(callRecord)
                    .sentimentScore(averageScore)
                    .context("Call Sentiment Aggregation")
                    .build();
        } else {
            sentimentPoint.setSentimentScore(averageScore);
        }

        sentimentPointRepository.save(sentimentPoint);

        return averageScore;
    }

    @Override
    public Double getDailyAverageSentiment(LocalDate date) {
        Double avg = sentimentPointRepository.findAverageSentimentByDate(date);
        return avg != null ? avg : 0.0;
    }

    @Override
    public List<SentimentPoint> getSentimentPointsForAgent(String userEmail) {
        return sentimentPointRepository.findByAgentEmail(userEmail);
    }
    @Override
    public List<SentimentPoint> getSentimentByTeam(String userEmail) {
        User manager = userService.findByEmail(userEmail);
        if (manager == null || manager.getTeam() == null) {
            return List.of(); // return empty if no manager or team
        }

        Team team = manager.getTeam();
        List<User> teamMembers = userRepository.findByTeam(team);

        // Fetch all call records for team members
        List<CallRecord> teamCalls = callRecordRepository.findByAgentIn(teamMembers);

        // Collect all sentiment points from these calls
        return teamCalls.stream()
                .map(CallRecord::getSentimentPoint)
                .filter(sp -> sp != null)
                .toList();
    }



    private double mapEmotionToScore(String emotion) {
        if (emotion == null) return 50.0;

        switch (emotion.toUpperCase()) {
            case "ANGRY":
                return 10.0;
            case "FRUSTRATED":
            case "IRRITATED":
                return 30.0;
            case "DISAPPOINTED":
                return 40.0;
            case "NEUTRAL":
                return 50.0;
            case "SATISFIED":
                return 75.0;
            case "ENTHUSIASTIC":
                return 85.0;
            case "RESOLVED":
            case "VERY SATISFIED":
                return 95.0;
            default:
                return 50.0;
        }
    }

}
