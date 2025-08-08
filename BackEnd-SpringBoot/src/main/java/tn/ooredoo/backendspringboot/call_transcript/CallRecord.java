package tn.ooredoo.backendspringboot.call_transcript;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.audioprocessing.AudioAnalysisResponse;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.sentiment.SentimentPoint;
import tn.ooredoo.backendspringboot.user.User;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "call_records")

public class CallRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne
    @JoinColumn(name = "agent_id")
    private User agent;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;


    @OneToMany(mappedBy = "callRecord")
    private List<AudioAnalysisResponse> callTranscripts;

    @JsonIgnore
    private Long callDuration;

    @JsonIgnore
    @OneToOne
    private SentimentPoint sentimentPoint;

    @JsonIgnore
    @Enumerated(EnumType.STRING)
    private Outcome callOutcome;
    private LocalDateTime callDateTime;

}
