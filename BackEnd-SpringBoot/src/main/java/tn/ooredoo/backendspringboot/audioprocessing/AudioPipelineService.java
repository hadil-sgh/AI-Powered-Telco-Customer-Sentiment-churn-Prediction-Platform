package tn.ooredoo.backendspringboot.audioprocessing;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.call_transcript.CallRecordRepository;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AudioPipelineService {

    private final AudioAnalysisRepository audioAnalysisRepository;
    private final CallRecordRepository callRecordRepository;

    /**
     * Save audio analysis result from Angular frontend
     * Flow: Python API ➝ Angular ➝ Spring Boot (this method)
     */
    public AudioAnalysisResponse saveAnalysisResult(AudioAnalysisRequestDto request) {
        try {
            log.info("💾 Converting and saving analysis result - SessionId: {}, Speaker: {}",
                    request.getSessionId(), request.getSpeaker());

            // Map DTO to Entity
            AudioAnalysisResponse entity = mapDtoToEntity(request);

            // Save to database
            AudioAnalysisResponse saved = audioAnalysisRepository.save(entity);

            log.info("✅ Analysis result saved successfully - ID: {}, SessionId: {}, Text length: {}",
                    saved.getId(), saved.getSessionId(), saved.getText().length());

            return saved;

        } catch (Exception e) {
            log.error("❌ Error saving analysis result for session {}: ", request.getSessionId(), e);
            throw new RuntimeException("Failed to save analysis result", e);
        }
    }

    /**
     * Map AudioAnalysisRequestDto to AudioAnalysisResponse Entity
     */
    private AudioAnalysisResponse mapDtoToEntity(AudioAnalysisRequestDto dto) {
        // Map sentiment
        TranscriptSentiment sentiment = null;
        if (dto.getSentiment() != null) {
            sentiment = TranscriptSentiment.builder()
                    .text(dto.getSentiment().getText())
                    .voice(dto.getSentiment().getVoice())
                    .score(dto.getSentiment().getScore())
                    .build();
        }

        // Map voice features
        VoiceFeatures voiceFeatures = null;
        if (dto.getVoiceFeatures() != null) {
            voiceFeatures = VoiceFeatures.builder()
                    .pitch(dto.getVoiceFeatures().getPitch())
                    .energy(dto.getVoiceFeatures().getEnergy())
                    .rate(dto.getVoiceFeatures().getRate())
                    .build();
        }

        // Map emotion analysis
        EmotionAnalysis emotionAnalysis = null;
        if (dto.getEmotionAnalysis() != null) {
            emotionAnalysis = EmotionAnalysis.builder()
                    .primary_emotion(dto.getEmotionAnalysis().getPrimary_emotion())
                    .confidence(dto.getEmotionAnalysis().getConfidence())
                    .reasoning(dto.getEmotionAnalysis().getReasoning() != null ? 
                              Arrays.asList(dto.getEmotionAnalysis().getReasoning()) : null)
                    .voice_intensity(dto.getEmotionAnalysis().getVoice_intensity())
                    .escalation_level(dto.getEmotionAnalysis().getEscalation_level())
                    .build();
        }

        // Get call record if ID provided
        CallRecord callRecord = null;
        if (dto.getCallRecordId() != null) {
            Optional<CallRecord> callRecordOpt = callRecordRepository.findById(dto.getCallRecordId());
            if (callRecordOpt.isPresent()) {
                callRecord = callRecordOpt.get();
                log.debug("Linked analysis to call record: {}", dto.getCallRecordId());
            } else {
                log.warn("Call record not found with ID: {}", dto.getCallRecordId());
            }
        }

        // Build and return entity
        return AudioAnalysisResponse.builder()
                .timestamp(dto.getTimestamp())
                .speaker(dto.getSpeaker())
                .text(dto.getText())
                .sessionId(dto.getSessionId())
                .analysisType(dto.getAnalysisType())
                .sentiment(sentiment)
                .voiceFeatures(voiceFeatures)
                .emotionAnalysis(emotionAnalysis)
                .callRecord(callRecord)
                .build();
    }

    /**
     * Get all analysis results for a specific session
     */
    public List<AudioAnalysisResponse> getTranscriptsBySession(String sessionId) {
        try {
            log.info("📖 Retrieving analysis results for session: {}", sessionId);
            List<AudioAnalysisResponse> results = audioAnalysisRepository.findBySessionIdOrderByTimestampDesc(sessionId);
            log.info("✅ Found {} results for session: {}", results.size(), sessionId);
            return results;
        } catch (Exception e) {
            log.error("❌ Error retrieving results for session {}: ", sessionId, e);
            throw e;
        }
    }

    /**
     * Get all analysis results for a specific call record
     */
    public List<AudioAnalysisResponse> getTranscriptsByCallRecord(Integer callRecordId) {
        try {
            log.info("📖 Retrieving analysis results for call record: {}", callRecordId);

            Optional<CallRecord> callRecordOpt = callRecordRepository.findById(callRecordId);
            if (!callRecordOpt.isPresent()) {
                log.warn("Call record not found with ID: {}", callRecordId);
                return List.of(); // Return empty list
            }

            CallRecord callRecord = callRecordOpt.get();
            List<AudioAnalysisResponse> results = audioAnalysisRepository.findByCallRecordOrderByTimestampDesc(callRecord);

            log.info("✅ Found {} results for call record: {}", results.size(), callRecordId);
            return results;
        } catch (Exception e) {
            log.error("❌ Error retrieving results for call record {}: ", callRecordId, e);
            throw e;
        }
    }

    /**
     * Get analysis result by ID
     */
    public AudioAnalysisResponse getAnalysisResultById(Integer id) {
        try {
            Optional<AudioAnalysisResponse> result = audioAnalysisRepository.findById(id);
            if (result.isPresent()) {
                return result.get();
            } else {
                throw new RuntimeException("Analysis result not found with ID: " + id);
            }
        } catch (Exception e) {
            log.error("❌ Error retrieving analysis result {}: ", id, e);
            throw e;
        }
    }

    /**
     * Delete analysis result
     */
    public void deleteAnalysisResult(Integer id) {
        try {
            log.info("🗑️ Deleting analysis result: {}", id);
            audioAnalysisRepository.deleteById(id);
            log.info("✅ Analysis result deleted successfully: {}", id);
        } catch (Exception e) {
            log.error("❌ Error deleting analysis result {}: ", id, e);
            throw e;
        }
    }

    /**
     * Get session statistics
     */
    public Map<String, Object> getSessionStatistics(String sessionId) {
        try {
            log.info("📊 Calculating statistics for session: {}", sessionId);
            
            List<AudioAnalysisResponse> results = audioAnalysisRepository.findBySessionIdOrderByTimestampDesc(sessionId);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalResults", results.size());
            stats.put("speakers", results.stream().map(AudioAnalysisResponse::getSpeaker).distinct().count());
            
            // Sentiment distribution
            Map<String, Long> sentimentCounts = new HashMap<>();
            results.forEach(result -> {
                if (result.getSentiment() != null && result.getSentiment().getText() != null) {
                    String sentiment = result.getSentiment().getText();
                    sentimentCounts.put(sentiment, sentimentCounts.getOrDefault(sentiment, 0L) + 1);
                }
            });
            stats.put("sentimentDistribution", sentimentCounts);
            
            // Emotion distribution  
            Map<String, Long> emotionCounts = new HashMap<>();
            results.forEach(result -> {
                if (result.getEmotionAnalysis() != null && result.getEmotionAnalysis().getPrimary_emotion() != null) {
                    String emotion = result.getEmotionAnalysis().getPrimary_emotion();
                    emotionCounts.put(emotion, emotionCounts.getOrDefault(emotion, 0L) + 1);
                }
            });
            stats.put("emotionDistribution", emotionCounts);
            
            log.info("✅ Session statistics calculated for {}: {} total results", sessionId, results.size());
            return stats;
            
        } catch (Exception e) {
            log.error("❌ Error calculating session statistics {}: ", sessionId, e);
            throw e;
        }
    }

    /**
     * Legacy method for backward compatibility - now just calls the new method
     */
    @Deprecated
    public void saveTranscriptAsync(AudioAnalysisResponse analysisResult, Integer callRecordId) {
        log.warn("⚠️ Using deprecated saveTranscriptAsync method. Please use saveAnalysisResult instead.");
        
        // Convert entity back to DTO format (not ideal, but maintains compatibility)
        AudioAnalysisRequestDto dto = AudioAnalysisRequestDto.builder()
                .timestamp(analysisResult.getTimestamp())
                .speaker(analysisResult.getSpeaker())
                .text(analysisResult.getText())
                .sessionId(analysisResult.getSessionId())
                .analysisType(analysisResult.getAnalysisType())
                .callRecordId(callRecordId)
                .build();
                
        saveAnalysisResult(dto);
    }
}
