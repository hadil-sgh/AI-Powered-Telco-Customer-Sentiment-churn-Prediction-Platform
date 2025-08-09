package tn.ooredoo.backendspringboot.audioprocessing;


import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity

public class EmotionAnalysis implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private String primary_emotion;
    private Double confidence;
    @ElementCollection
    private List<String> reasoning;
    private Double voice_intensity;
    private Double escalation_level;
}
