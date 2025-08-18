package tn.ooredoo.backendspringboot.sentiment;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/Sentiment")
@RequiredArgsConstructor
@Tag(name = "Sentiment scores Management")
public class SentimentController {

    private final SentimentPointService sentimentPointService;

    @GetMapping("/getSentimentPointsForUserToday")
    public Double getSentimentPointsForUserToday(@RequestParam String userEmail) {
        return sentimentPointService.calculatingSentimentPointsForUserToday(userEmail);
    }

    @GetMapping("/getSentimentPointsByUser")
    public List<SentimentPoint> getSentimentPointsByUser(@RequestParam String userEmail) {
        return sentimentPointService.getSentimentPointsForAgent(userEmail);
    }

    @GetMapping("/callSentiment/{callId}")
    public Double getAverageSentimentPerCallPostCallResults(@PathVariable Integer callId) {
        return sentimentPointService.getAverageSentimentPerCall(callId);
    }

    @GetMapping("/daily")
    public Double getDailyAverageSentiment(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return sentimentPointService.getDailyAverageSentiment(date);
    }
}
