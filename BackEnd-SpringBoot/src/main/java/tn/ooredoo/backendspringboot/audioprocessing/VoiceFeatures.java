package tn.ooredoo.backendspringboot.audioprocessing;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class VoiceFeatures {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private double pitch;
    private double energy;
    private double rate;
}
