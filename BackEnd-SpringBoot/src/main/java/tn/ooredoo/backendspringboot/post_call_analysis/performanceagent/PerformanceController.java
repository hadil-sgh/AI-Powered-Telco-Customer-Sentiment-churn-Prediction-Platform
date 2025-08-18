package tn.ooredoo.backendspringboot.post_call_analysis.performanceagent;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/performances")
@AllArgsConstructor
public class PerformanceController {


    private final PerformanceService performanceService;

    @PostMapping("/save")
    public ResponseEntity<Performance> savePerformanceWithPostCallResults(
            @RequestParam String complaintType,
            @RequestParam String feedback,
            @RequestParam Integer score,
            @RequestParam Integer callId,
            @RequestParam String summary) {

        Performance savedPerformance = performanceService.savePerformancePostCall(
                complaintType, feedback, score, callId, summary
        );

        return ResponseEntity.ok(savedPerformance);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Performance>> getAllPerformances() {
        return ResponseEntity.ok(performanceService.getAllPerformances());
    }
    @GetMapping("/getAllByAgent")
    public ResponseEntity<List<Performance>> getAllPerformancesByAgent(@RequestParam String email) {
        return ResponseEntity.ok(performanceService.getAllPerformancesByAgentEmail(email));
    }

    @GetMapping("/getOne/{id}")
    public ResponseEntity<Performance> getPerformanceById(@PathVariable Long id) {
        return performanceService.getPerformanceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update")
    public ResponseEntity<Performance> updatePerformance( @RequestBody Performance performance) {
        Performance updated = performanceService.updatePerformance( performance);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletePerformance(@PathVariable Long id) {
        performanceService.deletePerformance(id);
        return ResponseEntity.noContent().build();
    }
}

