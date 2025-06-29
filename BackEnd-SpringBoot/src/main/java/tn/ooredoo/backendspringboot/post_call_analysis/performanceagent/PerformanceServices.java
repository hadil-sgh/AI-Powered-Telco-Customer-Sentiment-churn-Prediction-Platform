package tn.ooredoo.backendspringboot.post_call_analysis.performanceagent;


import java.util.List;

public interface PerformanceServices  {
    Performance addPerformence(Performance performence);
    Performance updatePerformence(Performance performence);
    Performance getOnePerformence(Integer idPerformence);
    List<Performance> getAllPerformences();
    void deletePerformence(Integer idPerformence);
}
