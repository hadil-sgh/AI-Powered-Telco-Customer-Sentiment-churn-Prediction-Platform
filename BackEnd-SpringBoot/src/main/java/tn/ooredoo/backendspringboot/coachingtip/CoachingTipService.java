package tn.ooredoo.backendspringboot.coachingtip;

import java.util.List;
import java.util.Optional;

public interface CoachingTipService {
    CoachingTip createCoachingTip(CoachingTip coachingTip);
    Optional<CoachingTip> getCoachingTipById(Long id);
    List<CoachingTip> getAllCoachingTips();
    CoachingTip updateCoachingTip( CoachingTip coachingTip);
    void deleteCoachingTip(Long id);
}

