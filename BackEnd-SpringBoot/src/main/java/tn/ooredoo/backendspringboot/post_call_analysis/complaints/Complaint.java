package tn.ooredoo.backendspringboot.post_call_analysis.complaints;


import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private String complaintType;
    private String summary;
    @OneToOne
    private CallRecord callTranscripts;


}
