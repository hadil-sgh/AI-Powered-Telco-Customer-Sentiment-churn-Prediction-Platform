package tn.ooredoo.backendspringboot.audioprocessing;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/audio")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AudioPipelineController {

    private final AudioPipelineService audioPipelineService;
    private final AudioAnalysisRepository audioAnalysisRepository;

    @PostMapping("/start")
    public ResponseEntity<String> startPipeline() {
        try {
            audioPipelineService.startPipeline();
            return ResponseEntity.ok("Audio pipeline started successfully");
        } catch (Exception e) {
            log.error("Error starting pipeline: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to start pipeline: " + e.getMessage());
        }
    }

    @PostMapping("/stop")
    public ResponseEntity<String> stopPipeline() {
        try {
            audioPipelineService.stopPipeline();
            return ResponseEntity.ok("Audio pipeline stopped successfully");
        } catch (Exception e) {
            log.error("Error stopping pipeline: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to stop pipeline: " + e.getMessage());
        }
    }

    @PostMapping("/process-base64")
    public ResponseEntity<String> processAudioBase64(
            @RequestParam String base64Data,
            @RequestParam String sessionId) {
        try {
            audioPipelineService.processAudioChunk(base64Data, sessionId);
            return ResponseEntity.ok("Base64 audio chunk processed successfully");
        } catch (Exception e) {
            log.error("Error processing base64 audio: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to process audio: " + e.getMessage());
        }
    }

    @PostMapping("/process-file")
    public ResponseEntity<String> processAudioFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam String sessionId) throws IOException {
        try {
            byte[] audioBytes = file.getBytes();
            audioPipelineService.processAudioChunk(audioBytes, sessionId);
            return ResponseEntity.ok("Audio file processed successfully");
        } catch (Exception e) {
            log.error("Error processing audio file: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to process audio file: " + e.getMessage());
        }
    }

    @PostMapping("/analysis/save")
    public ResponseEntity<AudioAnalysisResponse> saveAnalysisResult(@RequestBody AudioAnalysisRequest request) {
        try {
            log.info("Received analysis result for session: {}", request.getSessionId());
            
            // Convert request to entity
            AudioAnalysisResponse response = convertToEntity(request);
            
            // Save to database
            AudioAnalysisResponse saved = audioAnalysisRepository.save(response);
            
            log.debug("Saved analysis result with ID: {}", saved.getId());
            return ResponseEntity.ok(saved);
            
        } catch (Exception e) {
            log.error("Error saving analysis result: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/analysis/session/{sessionId}")
    public ResponseEntity<List<AudioAnalysisResponse>> getAnalysisBySession(@PathVariable String sessionId) {
        try {
            List<AudioAnalysisResponse> results = audioAnalysisRepository.findBySessionIdOrderByTimestampDesc(sessionId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error retrieving analysis results: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/analysis/recent")
    public ResponseEntity<List<AudioAnalysisResponse>> getRecentAnalysis(
            @RequestParam(defaultValue = "50") int limit) {
        try {
            List<AudioAnalysisResponse> results = audioAnalysisRepository.findTopByOrderByTimestampDesc(limit);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error retrieving recent analysis: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/status")
    public ResponseEntity<PipelineStatus> getPipelineStatus() {
        try {
            PipelineStatus status = audioPipelineService.getStatus();
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Error getting pipeline status: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    private AudioAnalysisResponse convertToEntity(AudioAnalysisRequest request) {
        // Create sentiment entity
        TranscriptSentiment sentiment = TranscriptSentiment.builder()
                .text(request.getSentiment().getText())
                .voice(request.getSentiment().getVoice())
                .score(request.getSentiment().getScore())
                .build();

        // Create voice features entity
        VoiceFeatures voiceFeatures = VoiceFeatures.builder()
                .pitch(request.getVoiceFeatures().getPitch())
                .energy(request.getVoiceFeatures().getEnergy())
                .rate(request.getVoiceFeatures().getRate())
                .build();

        // Create main analysis response
        return AudioAnalysisResponse.builder()
                .timestamp(request.getTimestamp())
                .speaker(request.getSpeaker())
                .text(request.getText())
                .sentiment(sentiment)
                .voiceFeatures(voiceFeatures)
                .sessionId(request.getSessionId())
                .analysisType(request.getAnalysisType())
                .build();
    }
}
