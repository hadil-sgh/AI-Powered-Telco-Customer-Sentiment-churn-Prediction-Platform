package tn.ooredoo.backendspringboot.dailystats;

import tn.ooredoo.backendspringboot.user.User;

public interface DailyStatsService {
    void updateCallsCompletedForToday(User user, int callsCompleted);
    
}

