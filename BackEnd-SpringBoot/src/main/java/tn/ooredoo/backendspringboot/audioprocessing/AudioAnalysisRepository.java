package tn.ooredoo.backendspringboot.audioprocessing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AudioAnalysisRepository extends JpaRepository<AudioAnalysisResponse, Integer> {
    
    List<AudioAnalysisResponse> findBySessionIdOrderByTimestampDesc(String sessionId);
    
    @Query(value = "SELECT * FROM audio_analysis_response ORDER BY timestamp DESC LIMIT :limit", nativeQuery = true)
    List<AudioAnalysisResponse> findTopByOrderByTimestampDesc(@Param("limit") int limit);
    
    List<AudioAnalysisResponse> findBySpeakerOrderByTimestampDesc(String speaker);
    
    @Query("SELECT a FROM AudioAnalysisResponse a WHERE a.sentiment.text = :sentimentType ORDER BY a.timestamp DESC")
    List<AudioAnalysisResponse> findBySentimentType(@Param("sentimentType") String sentimentType);
}
