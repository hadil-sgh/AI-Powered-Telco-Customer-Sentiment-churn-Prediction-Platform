package tn.ooredoo.backendspringboot.call_transcript;

import java.util.Date;

public interface CallRecordServices {
    String formatTranscriptForAnalysis(CallRecord callRecord);
    CallRecord saveCallRecord(CallRecord callRecord);
    CallRecord getCallRecordById(Integer id);
    void deleteCallRecordById(Integer id);
    CallRecord updateCallRecord(CallRecord callRecord);
    CallRecord getCallRecordByCallId(Integer callId);
    Integer getCallsPerDayForAgent(Long agentId, Date date);






}
