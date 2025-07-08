package tn.ooredoo.backendspringboot.dailystats;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.ooredoo.backendspringboot.user.User;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface DailyStatsRepository extends JpaRepository<DailyStats, Long> {
    Optional<DailyStats> findByUserAndDate(User user, LocalDateTime date);
}

