package tn.ooredoo.backendspringboot.audioprocessing;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AudioAnalysisRequest {
    private String timestamp;
    private String speaker;
    private String text;
    private SentimentData sentiment;
    private VoiceFeaturesData voiceFeatures;
    private String sessionId;
    private String analysisType;

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SentimentData {
        private String text;
        private String voice;
        private Double score;
    }

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VoiceFeaturesData {
        private Double pitch;
        private Double energy;
        private Double rate;
    }
}
