package tn.ooredoo.backendspringboot.coachingtip;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.dailystats.DailyStatsService;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CoachingTipServiceImpl implements CoachingTipService {

    private final  CoachingTipRepository coachingTipRepository;
    private final  UserService userService;
    private final DailyStatsService dailyStatsService;

    @Override
    public CoachingTip createCoachingTip(CoachingTip coachingTip) {
        return coachingTipRepository.save(coachingTip);
    }

    @Override
    public Optional<CoachingTip> getCoachingTipById(Long id) {
        return coachingTipRepository.findById(id);
    }

    @Override
    public List<CoachingTip> getAllCoachingTips() {
        return coachingTipRepository.findAll();
    }

    @Override
    public List<CoachingTip> getCoachingTipsByUserId(Long userId) {
        User user = userService.findById(userId);
        if (user != null) {
            return coachingTipRepository.findByUser_Id(userId);
        }
        return List.of();
    }

    @Override
    public CoachingTip updateCoachingTip(CoachingTip coachingTip) {
        return coachingTipRepository.save(coachingTip);
    }

    @Override
    public void deleteCoachingTip(Long id) {
        coachingTipRepository.deleteById(id);
    }

    @Override
    public CoachingTip assignCoachingTipToUser(CoachingTip coachingTip, Long userId, Long managerId) {
        User agent = userService.findById(userId);
        User manager = userService.findById(managerId);

        if (agent == null) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }

        if (manager == null) {
            throw new IllegalArgumentException("Manager not found with ID: " + managerId);
        }

        coachingTip.setUser(agent);
        coachingTip.setManager(manager);

        return coachingTipRepository.save(coachingTip);
    }

    @Override
    public CoachingTip createAndAssignCoachingTip(String title, String message, TipType type,
                                                  Long userId, Long managerId) {
        User agent = userService.findById(userId);
        User manager = userService.findById(managerId);

        if (agent == null) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }

        if (manager == null) {
            throw new IllegalArgumentException("Manager not found with ID: " + managerId);
        }

        CoachingTip coachingTip = CoachingTip.builder()
                .title(title)
                .message(message)
                .type(type)
                .user(agent)
                .manager(manager)
                .build();

        return coachingTipRepository.save(coachingTip);
    }

    @Override
    public CoachingTip acknowledgeCoachingTip(Long tipId) {
        Optional<CoachingTip> tipOpt = coachingTipRepository.findById(tipId);
        if (tipOpt.isPresent()) {
            CoachingTip tip = tipOpt.get();
            tip.markAsAcknowledged();
            return coachingTipRepository.save(tip);
        }
        throw new IllegalArgumentException("Coaching tip not found with ID: " + tipId);
    }

    @Override
    public CoachingTip markTipAsHelpful(Long tipId, boolean helpful) {
        Optional<CoachingTip> tipOpt = coachingTipRepository.findById(tipId);
        if (tipOpt.isPresent()) {
            CoachingTip tip = tipOpt.get();
            tip.markAsHelpful(helpful);

            return coachingTipRepository.save(tip);
        }
        throw new IllegalArgumentException("Coaching tip not found with ID: " + tipId);
    }

    @Override
    public CoachingTip markTipAsShown(Long tipId) {
        Optional<CoachingTip> tipOpt = coachingTipRepository.findById(tipId);
        if (tipOpt.isPresent()) {
            CoachingTip tip = tipOpt.get();
            tip.markAsShown();
            return coachingTipRepository.save(tip);
        }
        throw new IllegalArgumentException("Coaching tip not found with ID: " + tipId);
    }

    @Override
    public List<CoachingTip> getUnacknowledgedTipsByUserId(Long userId) {
        return coachingTipRepository.findByUser_IdAndAcknowledgedFalse(userId);
    }

    @Override
    public List<CoachingTip> getRecentTipsByUserId(Long userId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return coachingTipRepository.findByUser_IdAndCreatedAtAfter(userId, since);
    }
    @Override
    public List<CoachingTip> getCoachingTipsByUserEmail(String email) {
        return coachingTipRepository.findByUserEmail(email);
    }
    @Override
    public List<CoachingTip> getUnacknowledgedTipsByUserEmail(String email) {
        return coachingTipRepository.findByUserEmailAndAcknowledgedFalse(email);
    }
    @Override
    public List<CoachingTip> getRecentTipsByUserEmail(String email, int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        return coachingTipRepository.findByUserEmailAndCreatedAtAfter(email, cutoffDate);
    }

}

