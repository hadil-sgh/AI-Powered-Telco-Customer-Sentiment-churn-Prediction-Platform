package tn.ooredoo.backendspringboot.post_call_analysis.performanceagent;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceServicesImpl implements PerformanceServices {

    private final PerformanceRepository performanceRepository;

    @Override
    public Performance addPerformence(Performance performence) {
        return performanceRepository.save(performence);
    }

    @Override
    public Performance updatePerformence(Performance performence) {
        return performanceRepository.save(performence);
    }

    @Override
    public Performance getOnePerformence(Integer idPerformence) {
        return performanceRepository.findById(idPerformence).orElse(null);
    }

    @Override
    public List<Performance> getAllPerformences() {
        return performanceRepository.findAll() ;
    }

    @Override
    public void deletePerformence(Integer idPerformence) {
        performanceRepository.deleteById(idPerformence);

    }
}
