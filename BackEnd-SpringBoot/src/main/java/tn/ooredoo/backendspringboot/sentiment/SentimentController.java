package tn.ooredoo.backendspringboot.sentiment;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/Sentiment")
@RequiredArgsConstructor
@Tag(name = "Sentiment scores Management")
public class SentimentController {

    private final SentimentPointService sentimentPointService;

    @GetMapping("/getSentimentPointsForUserToday")
    public Double getSentimentPointsForUserToday(String userEmail) {
        return sentimentPointService.calculatingSentimentPointsForUserToday(userEmail);
    }
}
