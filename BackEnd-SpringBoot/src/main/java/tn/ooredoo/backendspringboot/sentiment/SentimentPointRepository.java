package tn.ooredoo.backendspringboot.sentiment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface SentimentPointRepository extends JpaRepository<SentimentPoint, Long> {


        @Query("SELECT AVG(s.sentimentScore) " +
                "FROM SentimentPoint s " +
                "WHERE s.call.agent.id = :userId " +
                "AND CAST(s.call.callDateTime AS date) = CURRENT_DATE")
        Double averageSentimentByUserIdToday(@Param("userId") Long userId);

    @Query("SELECT AVG(s.sentimentScore) FROM SentimentPoint s " +
            "WHERE DATE(s.call.callDateTime) = :date")
    Double findAverageSentimentByDate(@Param("date") LocalDate date);

}





