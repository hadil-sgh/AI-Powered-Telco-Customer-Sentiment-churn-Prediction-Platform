package tn.ooredoo.backendspringboot.sentiment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SentimentPointRepository extends JpaRepository<SentimentPoint, Long> {


        @Query("SELECT AVG(s.sentimentScore) " +
                "FROM SentimentPoint s " +
                "WHERE s.call.agent.id = :userId " +
                "AND CAST(s.timestamp AS date) = CURRENT_DATE")
        Double averageSentimentByUserIdToday(@Param("userId") Long userId);
    }





