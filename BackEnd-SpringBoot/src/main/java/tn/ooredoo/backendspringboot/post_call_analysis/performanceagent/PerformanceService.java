package tn.ooredoo.backendspringboot.post_call_analysis.performanceagent;

import java.util.List;
import java.util.Optional;

public interface PerformanceService {
    Performance savePerformancePostCall(String complaintType,String feedback,Integer score, Integer callId , String summary);
    List<Performance> getAllPerformances();
    List<Performance> getAllPerformancesByAgentEmail(String email);
    Optional<Performance> getPerformanceById(Long id);
    Performance updatePerformance( Performance performance);
    void deletePerformance(Long id);
    public List<Performance> getPerformanceByTeam(String managerEmail);


}

