package tn.ooredoo.backendspringboot.sentiment;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserService;

@Service
@RequiredArgsConstructor
public class SentimentPointServiceImpl implements SentimentPointService {

    private final SentimentPointRepository sentimentPointRepository;
    private final UserService userService;


    @Override
    public Double calculatingSentimentPointsForUserToday(String userEmail) {
       User user = userService.findByEmail(userEmail);
        return sentimentPointRepository.sumSentimentByUserIdToday(user.getId());
    }
}
