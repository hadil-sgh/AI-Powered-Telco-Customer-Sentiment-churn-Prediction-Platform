package tn.ooredoo.backendspringboot.sentiment;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;

import java.time.LocalDateTime;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SentimentPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "callId")
    private CallRecord call;

    private LocalDateTime timestamp;
    private Double sentimentScore;
    private String context;
}