package tn.ooredoo.backendspringboot.dailystats;

import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.user.User;

import java.util.List;

public interface DailyStatsService {
    void updateCallsCompletedForToday(User user, int callsCompleted);
    DailyStats updateDailyStatusPostCall(String email,CallRecord callRecord,Integer score);
    List<DailyStats> getDailyStatsByAgent(String agent);
    DailyStats getDailyStatsForToday(String email);
    List<AgentRankingDTO> getTeamRankingOverall(String email);


}

