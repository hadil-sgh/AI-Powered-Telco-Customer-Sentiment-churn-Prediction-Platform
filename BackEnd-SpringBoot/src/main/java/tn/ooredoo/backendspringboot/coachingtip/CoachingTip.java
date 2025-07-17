package tn.ooredoo.backendspringboot.coachingtip;

import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.user.User;

import java.time.LocalDateTime;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CoachingTip {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;


    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private TipType type;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private User manager;

    @Builder.Default
    private Boolean acknowledged = false;

    @Builder.Default
    private Boolean helpful = false;

    private LocalDateTime shownAt;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper method to mark as acknowledged
    public void markAsAcknowledged() {
        this.acknowledged = true;
        this.acknowledgedAt = LocalDateTime.now();
    }

    // Helper method to mark as helpful
    public void markAsHelpful(boolean helpful) {
        this.helpful = helpful;
    }

    // Helper method to mark as shown
    public void markAsShown() {
        this.shownAt = LocalDateTime.now();
    }

}
