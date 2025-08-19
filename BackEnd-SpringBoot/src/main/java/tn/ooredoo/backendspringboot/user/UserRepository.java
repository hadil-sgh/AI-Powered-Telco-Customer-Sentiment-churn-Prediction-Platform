package tn.ooredoo.backendspringboot.user;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.ooredoo.backendspringboot.team.Team;

import java.util.List;
import java.util.Optional;

public interface UserRepository  extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByOnlineTrue();

    List<User> findByTeam(Team team);
}
