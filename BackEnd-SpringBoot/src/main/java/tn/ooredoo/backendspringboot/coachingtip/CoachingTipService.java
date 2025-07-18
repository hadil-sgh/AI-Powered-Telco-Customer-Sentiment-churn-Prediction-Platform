package tn.ooredoo.backendspringboot.coachingtip;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CoachingTipService {
    CoachingTip createCoachingTip(CoachingTip coachingTip);
    Optional<CoachingTip> getCoachingTipById(Long id);
    List<CoachingTip> getAllCoachingTips();
    List<CoachingTip> getCoachingTipsByUserId(Long userId);
    CoachingTip updateCoachingTip( CoachingTip coachingTip);
    void deleteCoachingTip(Long id);
    CoachingTip assignCoachingTipToUser(CoachingTip coachingTip, Long userId, Long managerId);

    CoachingTip createAndAssignCoachingTip(String title, String message, TipType type,
                                           Long userId, Long managerId);

    CoachingTip acknowledgeCoachingTip(Long tipId);

    CoachingTip markTipAsHelpful(Long tipId, boolean helpful);

    CoachingTip markTipAsShown(Long tipId);

    List<CoachingTip> getUnacknowledgedTipsByUserId(Long userId);

    List<CoachingTip> getRecentTipsByUserId(Long userId, int days);
    List<CoachingTip> getCoachingTipsByUserEmail(String email);

    List<CoachingTip> getUnacknowledgedTipsByUserEmail(String email);
    List<CoachingTip> getRecentTipsByUserEmail(String email, int days) ;

}

