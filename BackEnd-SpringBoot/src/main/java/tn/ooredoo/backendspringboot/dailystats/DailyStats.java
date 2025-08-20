package tn.ooredoo.backendspringboot.dailystats;

import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.user.User;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStats implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private User user;

    private LocalDateTime date;
    private Integer callsCompleted;
    @Builder.Default
    private Integer callsTarget=12;
    private Double averageSentiment;
    private Integer escalations;
    private Integer coachingTipsUsed;
    private Integer helpfulTips;
    private Double totalScore;
}