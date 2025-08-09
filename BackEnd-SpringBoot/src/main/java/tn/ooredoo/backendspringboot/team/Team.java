package tn.ooredoo.backendspringboot.team;

import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.user.User;

import java.io.Serializable;
import java.util.List;
@Getter
@Setter
@Builder
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Team implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    private TeamType type;
    @OneToOne
    private User manager;
    @OneToMany
    private List<User> agents;
}
