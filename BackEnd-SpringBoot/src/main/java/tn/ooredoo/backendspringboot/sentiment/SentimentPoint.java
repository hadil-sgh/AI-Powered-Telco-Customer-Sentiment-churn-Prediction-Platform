package tn.ooredoo.backendspringboot.sentiment;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    @OneToOne(mappedBy = "sentimentPoint", fetch = FetchType.EAGER)
    @JsonIgnore // ignore the full object to prevent JSON loop
    private CallRecord call;

    private Double sentimentScore;
    private String context;

    @JsonProperty("callId")
    public Integer getCallId() {
        return call != null ? call.getId() : null;
    }

}
