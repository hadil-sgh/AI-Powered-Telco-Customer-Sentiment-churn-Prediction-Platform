package tn.ooredoo.backendspringboot.coachingtip;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;

import java.time.LocalDateTime;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoachingTip {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "callId")
    private CallRecord call;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private TipType type;

    @Builder.Default
    private Boolean acknowledged = false;

    @Builder.Default
    private Boolean helpful = false;

    private LocalDateTime shownAt;


}
