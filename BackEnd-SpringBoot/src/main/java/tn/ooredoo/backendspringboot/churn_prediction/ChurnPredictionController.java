package tn.ooredoo.backendspringboot.churn_prediction;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/churn")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChurnPredictionController {


    private final ChurnPredictionService churnPredictionService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "churn-prediction-springboot"
        ));
    }

    @PostMapping("/predict/{customerId}")
    public Mono<ResponseEntity<ChurnPrediction>> predict(@PathVariable Integer customerId) {
        return churnPredictionService.predictChurn(customerId)
                .map(ResponseEntity::ok)
                .doOnError(error -> {
                    System.err.println("Prediction error: " + error.getMessage());
                    error.printStackTrace();
                })
                .onErrorReturn(ResponseEntity.badRequest().build());
    }


    // TODO: Integrate batch prediction
//     Additional endpoint for batch predictions
//    @PostMapping("/predict/batch")
//    public Mono<ResponseEntity<Object>> predictBatch(@RequestBody CustomerData[] customers) {
//       Implementation for batch processing
//        return Mono.just(ResponseEntity.ok(Map.of("message", "Batch prediction endpoint - implement as needed")));
//    }
}