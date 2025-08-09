package tn.ooredoo.backendspringboot.churn_prediction;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class ChurnPrediction implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonProperty("Prediction")
    private String prediction;

    @JsonProperty("PredictionProbability")
    private List<Double> predictionProbability;

    @JsonProperty("ChurnScore")
    private String churnScore;

}
