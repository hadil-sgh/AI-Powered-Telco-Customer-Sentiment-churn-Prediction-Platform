package tn.ooredoo.backendspringboot.call_transcript;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface CallRecordRepository
        extends JpaRepository<CallRecord, Integer> {
    Integer countByUserIdAndCallDateTimeBetween(Long agentId, LocalDateTime start, LocalDateTime end);
}
