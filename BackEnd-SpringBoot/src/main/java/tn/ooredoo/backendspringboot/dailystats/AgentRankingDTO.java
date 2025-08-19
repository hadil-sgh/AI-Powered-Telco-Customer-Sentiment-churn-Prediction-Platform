package tn.ooredoo.backendspringboot.dailystats;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AgentRankingDTO {
    private String agentName;
    private Integer totalScore;
    private Integer callsCompleted;
    private Double averageSentiment;
    private Integer rank;
}
