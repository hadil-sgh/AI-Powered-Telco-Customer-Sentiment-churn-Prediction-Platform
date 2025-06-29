package tn.ooredoo.backendspringboot.audioprocessing;

import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;


@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class AudioAnalysisResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private String timestamp;
    private String speaker;
    private String text;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "sentiment_id")
    private TranscriptSentiment sentiment;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "voicefeatures_id")
    private VoiceFeatures voiceFeatures;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "call_record_id")
    private CallRecord callRecord;
}
