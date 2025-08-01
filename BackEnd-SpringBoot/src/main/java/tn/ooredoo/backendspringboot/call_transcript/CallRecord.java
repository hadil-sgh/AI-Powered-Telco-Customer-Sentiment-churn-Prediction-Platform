package tn.ooredoo.backendspringboot.call_transcript;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.audioprocessing.AudioAnalysisResponse;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.sentiment.SentimentPoint;
import tn.ooredoo.backendspringboot.user.User;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "CallRecords")

public class CallRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @OneToOne
    private Customer customer;

    @OneToOne
    private User agent;

    @OneToMany(mappedBy = "callRecord", cascade = CascadeType.ALL)
    private List<AudioAnalysisResponse> callTranscripts;

    private Duration callDuration;

    @JsonIgnore
    @OneToOne
    private SentimentPoint sentimentPoint;

    @Enumerated(EnumType.STRING)
    private Outcome callOutcome;
    private LocalDateTime callDateTime;

}
