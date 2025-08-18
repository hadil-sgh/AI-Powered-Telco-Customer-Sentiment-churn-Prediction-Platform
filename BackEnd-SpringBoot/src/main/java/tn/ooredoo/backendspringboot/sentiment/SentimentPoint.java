package tn.ooredoo.backendspringboot.sentiment;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;

import java.io.Serializable;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SentimentPoint implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(mappedBy = "sentimentPoint")
    @JoinColumn(name = "callId")
    @JsonIgnore
    private CallRecord call;

    private Double sentimentScore;
    private String context;
}