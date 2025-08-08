package tn.ooredoo.backendspringboot.call_transcript;

import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.user.User;

import java.util.Date;
import java.util.List;

public interface CallRecordServices {
    CallRecord saveCallRecord(User agent, Customer customer, String sessionId,Long duration);
    CallRecord getCallRecordById(Integer id);
    void deleteCallRecordById(Integer id);
    CallRecord updateCallRecord(CallRecord callRecord);
    CallRecord getCallRecordByCallId(Integer callId);
    Integer getCallsPerDayForAgent(Long agentId, Date date);
    List<CallRecord> getCallRecordByAgentId(String email);
    String getTranscriptForAnalysis(Integer callId);






}
