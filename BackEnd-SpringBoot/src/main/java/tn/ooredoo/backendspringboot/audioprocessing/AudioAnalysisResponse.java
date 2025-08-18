package tn.ooredoo.backendspringboot.audioprocessing;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;

import java.io.Serializable;


@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class AudioAnalysisResponse implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String timestamp;
    private String speaker;

    @Column(length = 10000)
    private String text;

    // CASCADE ALL - when AudioAnalysisResponse is deleted, its related entities are deleted
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "sentiment_id")
    private TranscriptSentiment sentiment;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "voicefeatures_id")
    private VoiceFeatures voiceFeatures;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "emotion_analysis_id")
    private EmotionAnalysis emotionAnalysis;

    // NO cascade here - this is the child side of the relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "call_record_id")
    @JsonBackReference
    private CallRecord callRecord;

    private String sessionId;
    private String analysisType;
}







