package tn.ooredoo.backendspringboot.post_call_analysis.performanceagent;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class PerformanceServiceImpl implements PerformanceService {


     final private PerformanceRepository performanceRepository;

    @Override
    public Performance savePerformance(Performance performance) {
        return performanceRepository.save(performance);
    }

    @Override
    public List<Performance> getAllPerformances() {
        return performanceRepository.findAll();
    }

    @Override
    public Optional<Performance> getPerformanceById(Long id) {
        return performanceRepository.findById(id);
    }

    @Override
    public Performance updatePerformance( Performance performance) {

            return performanceRepository.save(performance);


    }

    @Override
    public void deletePerformance(Long id) {
        performanceRepository.deleteById(id);
    }

}

