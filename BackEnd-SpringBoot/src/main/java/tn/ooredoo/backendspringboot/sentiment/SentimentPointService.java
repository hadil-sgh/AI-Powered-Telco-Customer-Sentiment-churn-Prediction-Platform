package tn.ooredoo.backendspringboot.sentiment;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public interface SentimentPointService {
    Double calculatingSentimentPointsForUserToday(String userEmail);
    Double getAverageSentimentPerCall(Integer callId);
    Double getDailyAverageSentiment(LocalDate date);
    List<SentimentPoint> getSentimentPointsForAgent(String userEmail);
}
