package tn.ooredoo.backendspringboot.sentiment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SentimentPointRepository extends JpaRepository<SentimentPoint, Long> {
}
