package tn.ooredoo.backendspringboot.team;

import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.user.User;

import java.util.List;
@Getter
@Setter
@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Enumerated(EnumType.STRING)
    private TeamType type;
    @OneToOne
    private User manager;
    @OneToMany
    private List<User> agents;
}
