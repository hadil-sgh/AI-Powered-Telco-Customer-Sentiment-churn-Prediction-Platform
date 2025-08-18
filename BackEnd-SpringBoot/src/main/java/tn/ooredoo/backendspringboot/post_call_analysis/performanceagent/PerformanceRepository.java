package tn.ooredoo.backendspringboot.post_call_analysis.performanceagent;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PerformanceRepository extends JpaRepository<Performance, Long> {

    List<Performance> findByCallTranscripts_Id(Integer callTranscriptsId);
}

