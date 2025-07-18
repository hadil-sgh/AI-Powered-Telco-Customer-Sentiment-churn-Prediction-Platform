package tn.ooredoo.backendspringboot.coachingtip;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CoachingTipRepository extends JpaRepository<CoachingTip, Long> {
    List<CoachingTip> findByUser_Id(Long userId);




    List<CoachingTip> findByUser_IdAndAcknowledgedFalse(Long userId);

    List<CoachingTip> findByUser_IdAndCreatedAtAfter(Long userId, LocalDateTime since);
    List<CoachingTip> findByUserEmail(String email);

    List<CoachingTip> findByUserEmailAndAcknowledgedFalse(String email);

    List<CoachingTip> findByUserEmailAndCreatedAtAfter(String email, LocalDateTime date);



}

