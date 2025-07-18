package tn.ooredoo.backendspringboot.sentiment;

import org.springframework.stereotype.Service;

@Service
public interface SentimentPointService {
    Double calculatingSentimentPointsForUserToday(String userEmail);
}
