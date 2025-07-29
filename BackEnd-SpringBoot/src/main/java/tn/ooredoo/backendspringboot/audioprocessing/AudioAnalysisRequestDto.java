package tn.ooredoo.backendspringboot.audioprocessing;

import lombok.*;

/**
 * DTO for receiving audio analysis data from Angular frontend
 * Matches the structure of data received from Python audio pipeline
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AudioAnalysisRequestDto {
    
    private String timestamp;
    private String speaker;
    private String text;
    private String sessionId;
    private String analysisType;
    
    // Sentiment analysis data
    private SentimentDto sentiment;
    
    // Voice features data  
    private VoiceFeaturesDto voiceFeatures;
    
    // Enhanced emotion analysis (optional)
    private EmotionAnalysisDto emotionAnalysis;
    
    // Audio statistics (optional)
    private AudioStatsDto audioStats;
    
    // Optional call record ID for linking
    private Integer callRecordId;

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SentimentDto {
        private String text;
        private String voice; 
        private Double score;
    }

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VoiceFeaturesDto {
        private Double pitch;
        private Double energy;
        private Double rate;
    }

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmotionAnalysisDto {
        private String primary_emotion;
        private Double confidence;
        private String[] reasoning;
        private Double voice_intensity;
        private Double escalation_level;
    }

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AudioStatsDto {
        private Integer chunks_processed;
        private Integer chunks_with_speech;
        private Double total_audio_duration;
        private Double speech_duration;
        private Double avg_volume;
        private Double peak_volume;
    }
}