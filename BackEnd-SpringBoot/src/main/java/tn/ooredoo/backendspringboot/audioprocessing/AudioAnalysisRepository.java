package tn.ooredoo.backendspringboot.audioprocessing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;

import java.util.List;

@Repository
public interface AudioAnalysisRepository extends JpaRepository<AudioAnalysisResponse, Integer> {


    List<AudioAnalysisResponse> findBySessionIdOrderByTimestampDesc(String sessionId);


    List<AudioAnalysisResponse> findByCallRecordOrderByTimestampDesc(CallRecord callRecord);


    long countBySessionId(String sessionId);


    List<AudioAnalysisResponse> findBySessionId(String sessionId);
}

