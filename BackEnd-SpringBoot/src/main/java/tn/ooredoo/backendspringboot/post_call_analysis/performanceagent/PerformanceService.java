package tn.ooredoo.backendspringboot.post_call_analysis.performanceagent;

import java.util.List;
import java.util.Optional;

public interface PerformanceService {
    Performance savePerformance(Performance performance);
    List<Performance> getAllPerformances();
    Optional<Performance> getPerformanceById(Long id);
    Performance updatePerformance( Performance performance);
    void deletePerformance(Long id);
}

