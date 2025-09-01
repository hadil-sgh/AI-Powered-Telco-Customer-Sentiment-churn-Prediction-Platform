package tn.ooredoo.backendspringboot.dailystats;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WeeklyTeamStatsDTO {
    private LocalDate date;
    private String dayOfWeek;
    private double averageScore;
    private int totalCalls;
    private double averageSentiment;
}
