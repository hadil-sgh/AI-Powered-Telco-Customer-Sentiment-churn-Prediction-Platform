package tn.ooredoo.backendspringboot.dailystats;

import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.user.User;

public interface DailyStatsService {
    void updateCallsCompletedForToday(User user, int callsCompleted);
    DailyStats updateDailyStatusPostCall(String email,CallRecord callRecord,Integer score);


}

