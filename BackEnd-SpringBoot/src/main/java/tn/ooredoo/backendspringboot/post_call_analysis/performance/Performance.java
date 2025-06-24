package tn.ooredoo.backendspringboot.post_call_analysis.performance;


import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Performance {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private Integer score;
    private String feedback;
    @OneToOne
    private CallRecord callTranscripts;


}
