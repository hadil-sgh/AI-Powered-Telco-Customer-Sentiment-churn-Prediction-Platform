package tn.ooredoo.backendspringboot.call_transcript;

import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.audioprocessing.AudioAnalysisResponse;
import tn.ooredoo.backendspringboot.customer.Customer;
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
public class CallRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    @OneToOne
    private Customer customer;

    @OneToOne
    private User agent;

    @OneToMany(mappedBy = "callRecord", cascade = CascadeType.ALL)
    private List<AudioAnalysisResponse> callTranscripts;

    private Duration callDuration;

    @Enumerated(EnumType.STRING)
    private Outcome callOutcome;
    private LocalDateTime callDateTime;

}
