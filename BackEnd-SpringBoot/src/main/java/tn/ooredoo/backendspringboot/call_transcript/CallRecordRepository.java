package tn.ooredoo.backendspringboot.call_transcript;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface CallRecordRepository
        extends JpaRepository<CallRecord, Integer> {
    Integer countByAgent_IdAndCallDateTimeBetween(Long agentId, LocalDateTime start, LocalDateTime end);
    @Query("SELECT AVG(c.callDuration) FROM CallRecord c")
    Long getAverageCallDuration();

}
