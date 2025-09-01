package tn.ooredoo.backendspringboot.dailystats;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeamStatsDTO {
    private double averageScore;
    private int totalCalls;
    private double averageSentiment;
}
