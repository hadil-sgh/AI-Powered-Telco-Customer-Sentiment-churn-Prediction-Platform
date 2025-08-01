package tn.ooredoo.backendspringboot.post_call_analysis.performanceagent;


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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Integer score;
    private String feedback;
    @OneToOne
    private CallRecord callTranscripts;


}
