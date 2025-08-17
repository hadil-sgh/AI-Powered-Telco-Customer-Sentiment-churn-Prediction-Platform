package tn.ooredoo.backendspringboot.audioprocessing;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/audio-analysis")  // Updated to match Angular service

@RequiredArgsConstructor
@Slf4j
public class AudioPipelineController {

    private final AudioPipelineService audioPipelineService;

    /**
     * Save audio analysis result received from Angular frontend
     * Flow: Python API ➝ Angular ➝ Spring Boot (this endpoint)
     */
    @PostMapping("/save")
    public ResponseEntity<AudioAnalysisResponse> saveAnalysisResult(@RequestBody AudioAnalysisRequestDto request) {
        try {
            log.info("💾 Received analysis result from Angular - SessionId: {}, Speaker: {}, Text: {}",
                    request.getSessionId(),
                    request.getSpeaker(),
                    request.getText().substring(0, Math.min(request.getText().length(), 50)) + "...");

            // Save and return the saved entity
            AudioAnalysisResponse saved = audioPipelineService.saveAnalysisResult(request);
            
            log.info("✅ Analysis result saved successfully - ID: {}", saved.getId());
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            log.error("❌ Error saving analysis result: ", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get all analysis results for a specific session
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<AudioAnalysisResponse>> getSessionResults(
            @PathVariable String sessionId) {
        try {
            log.info("📖 Retrieving analysis results for session: {}", sessionId);
            List<AudioAnalysisResponse> results = audioPipelineService.getTranscriptsBySession(sessionId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("❌ Error retrieving results for session {}: ", sessionId, e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get all analysis results for a specific call record
     */
    @GetMapping("/call-record/{callRecordId}")
    public ResponseEntity<List<AudioAnalysisResponse>> getCallRecordResults(
            @PathVariable Integer callRecordId) {
        try {
            log.info("📖 Retrieving analysis results for call record: {}", callRecordId);
            List<AudioAnalysisResponse> results = audioPipelineService.getTranscriptsByCallRecord(callRecordId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("❌ Error retrieving results for call record {}: ", callRecordId, e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get session statistics
     */
    @GetMapping("/session/{sessionId}/statistics")
    public ResponseEntity<Map<String, Object>> getSessionStatistics(@PathVariable String sessionId) {
        try {
            var stats = audioPipelineService.getSessionStatistics(sessionId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("❌ Error retrieving session statistics: ", e);
            return ResponseEntity.status(500).build();
        }
    }


    /**
     * Get analysis result by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AudioAnalysisResponse> getAnalysisResult(@PathVariable Integer id) {
        try {
            AudioAnalysisResponse result = audioPipelineService.getAnalysisResultById(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("❌ Error retrieving analysis result {}: ", id, e);
            return ResponseEntity.status(404).build();
        }
    }

    /**
     * Delete analysis result
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnalysisResult(@PathVariable Integer id) {
        try {
            audioPipelineService.deleteAnalysisResult(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ Error deleting analysis result {}: ", id, e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Audio Analysis service is running - HTTP only (no WebSocket conflicts)");
    }
}
