package tn.ooredoo.backendspringboot.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder // builder is a design pattern that allows for the construction of complex objects step by step
@AllArgsConstructor
@NoArgsConstructor
@Entity

public class Token {

    @Id
    @GeneratedValue
    private Integer id;
    private String token;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime validatedAt;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
