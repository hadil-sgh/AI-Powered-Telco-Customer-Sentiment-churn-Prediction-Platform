package tn.ooredoo.backendspringboot.call_transcript;


import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.audioprocessing.AudioAnalysisResponse;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.user.User;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class CallRecord{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    @OneToOne
    private Customer customer;
    @OneToOne
    private User agent;
    List <AudioAnalysisResponse> callTranscripts;

}
