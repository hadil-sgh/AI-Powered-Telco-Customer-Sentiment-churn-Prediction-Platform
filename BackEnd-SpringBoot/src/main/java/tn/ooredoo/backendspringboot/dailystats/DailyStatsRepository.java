package tn.ooredoo.backendspringboot.dailystats;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.ooredoo.backendspringboot.user.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyStatsRepository extends JpaRepository<DailyStats, Long> {
    Optional<DailyStats> findByUserAndDate(User user, LocalDateTime date);
    Optional<DailyStats> findByUserAndDateBetween(User user, LocalDateTime start, LocalDateTime end);
    List<DailyStats> findAllByUser(User user);
    List<DailyStats> findAllByUserAndDateBetween(User user, LocalDateTime start, LocalDateTime end);
    @Query("SELECT d FROM DailyStats d WHERE d.user = :user AND DATE(d.date) = :yesterday")
    Optional<DailyStats> findByUserAndYesterday(@Param("user") User user, @Param("yesterday") LocalDate yesterday);


}

