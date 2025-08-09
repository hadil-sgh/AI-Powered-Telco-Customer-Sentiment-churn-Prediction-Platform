package tn.ooredoo.backendspringboot.post_call_analysis.complaintscustomer;


import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;

import java.io.Serializable;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Complaint implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String complaintType;
    private String summary;
    @OneToOne
    private CallRecord callTranscripts;


}
