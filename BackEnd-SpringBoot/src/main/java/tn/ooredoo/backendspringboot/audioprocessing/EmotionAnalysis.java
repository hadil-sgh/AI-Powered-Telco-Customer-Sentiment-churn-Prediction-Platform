package tn.ooredoo.backendspringboot.audioprocessing;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity

public class EmotionAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private String primary_emotion;
    private Double confidence;
    private List<String> reasoning;
    private Double voice_intensity;
    private Double escalation_level;
}
