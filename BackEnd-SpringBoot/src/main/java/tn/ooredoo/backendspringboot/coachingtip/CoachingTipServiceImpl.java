package tn.ooredoo.backendspringboot.coachingtip;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CoachingTipServiceImpl implements CoachingTipService {

    final private CoachingTipRepository coachingTipRepository;

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
    public CoachingTip updateCoachingTip(CoachingTip coachingTip) {
        return coachingTipRepository.save(coachingTip);
    }

    @Override
    public void deleteCoachingTip(Long id) {
        coachingTipRepository.deleteById(id);
    }
}

