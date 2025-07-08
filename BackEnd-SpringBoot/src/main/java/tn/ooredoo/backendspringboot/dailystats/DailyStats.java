package tn.ooredoo.backendspringboot.dailystats;

import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.user.User;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private User user;

    private LocalDateTime date;
    private Integer callsCompleted;
    private Integer callsTarget;
    private Double averageSentiment;
    private Integer escalations;
    private Integer coachingTipsUsed;
    private Integer helpfulTips;
    private Integer totalScore;
}