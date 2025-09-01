package tn.ooredoo.backendspringboot.post_call_analysis.performanceagent;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;

import java.util.List;

public interface PerformanceRepository extends JpaRepository<Performance, Long> {

    List<Performance> findByCallTranscripts_Id(Integer callTranscriptsId);
    List<Performance> findByCallTranscriptsIn(List<CallRecord> callRecords);

}


