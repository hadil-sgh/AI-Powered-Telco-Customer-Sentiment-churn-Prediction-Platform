package tn.ooredoo.backendspringboot.call_transcript;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CallTranscriptsRepository
        extends JpaRepository<CallRecord, Integer> {
}
