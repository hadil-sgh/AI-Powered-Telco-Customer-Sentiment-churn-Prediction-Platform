package tn.ooredoo.backendspringboot.call_transcript;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.audioprocessing.AudioAnalysisRepository;
import tn.ooredoo.backendspringboot.audioprocessing.AudioAnalysisResponse;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.dailystats.DailyStatsService;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CallRecordServicesImpl implements CallRecordServices {

    final CallRecordRepository callRecordRepository;
    final DailyStatsService dailyStatsService;
    final UserRepository userRepository;
    final AudioAnalysisRepository audioAnalysisRepository;

    @Override
    public String formatTranscriptForAnalysis(CallRecord callRecord) {
        if (callRecord == null || callRecord.getCallTranscripts() == null || callRecord.getCallTranscripts().isEmpty()) {
            throw new IllegalArgumentException("CallRecord or transcripts cannot be null or empty");
        }

        StringBuilder transcript = new StringBuilder();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

        List<AudioAnalysisResponse> sortedTranscripts = callRecord.getCallTranscripts()
                .stream()
                .sorted((t1, t2) -> {
                    LocalDateTime time1 = LocalDateTime.parse(t1.getTimestamp(), formatter);
                    LocalDateTime time2 = LocalDateTime.parse(t2.getTimestamp(), formatter);
                    return time1.compareTo(time2);
                })
                .collect(Collectors.toList());

        for (AudioAnalysisResponse response : sortedTranscripts) {
            if (response.getText() != null && !response.getText().trim().isEmpty()) {
                transcript.append(response.getSpeaker() != null ? response.getSpeaker() : "Unknown Speaker")
                        .append(": ")
                        .append(response.getText().trim())
                        .append("\n\n");
            }
        }

        return transcript.toString().trim();
    }

    @Override
    public CallRecord saveCallRecord(User agent, Customer customer, String sessionId, Long duration) {
        List<AudioAnalysisResponse> transcripts = audioAnalysisRepository.findBySessionId(sessionId);

        CallRecord callRecord = new CallRecord();
        callRecord.setAgent(agent);
        callRecord.setCustomer(customer);
        callRecord.setCallDuration(duration);

        callRecord = callRecordRepository.save(callRecord);

        for (AudioAnalysisResponse transcript : transcripts) {
            transcript.setCallRecord(callRecord);
        }

        audioAnalysisRepository.saveAll(transcripts);

        callRecord.setCallTranscripts(transcripts);

        return callRecord;
    }


    @Override
    public CallRecord getCallRecordById(Integer id) {
        return callRecordRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteCallRecordById(Integer id) {
        callRecordRepository.deleteById(id);

    }

    @Override
    public CallRecord updateCallRecord(CallRecord callRecord) {
        return callRecordRepository.save(callRecord);
    }

    @Override
    public CallRecord getCallRecordByCallId(Integer id) {
        return callRecordRepository.findById(id).orElse(null);
    }

    @Override

    public Integer getCallsPerDayForAgent(Long agentId, Date date) {
        String dateString = date.toString();
        if (agentId == null) {
            throw new IllegalArgumentException("Agent does not exist in the DB");
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay;
        LocalDateTime endOfDay;
        if ("today".equalsIgnoreCase(dateString)) {
            startOfDay = now.toLocalDate().atStartOfDay();
            endOfDay = now.toLocalDate().atTime(23, 59, 59);
        } else if ("yesterday".equalsIgnoreCase(dateString)) {
            startOfDay = now.toLocalDate().minusDays(1).atStartOfDay();
            endOfDay = now.toLocalDate().minusDays(1).atTime(23, 59, 59);
        } else {
            throw new IllegalArgumentException("Date parameter must be 'today' or 'yesterday'");
        }
        Integer count = callRecordRepository.countByAgent_IdAndCallDateTimeBetween(agentId, startOfDay, endOfDay);
        if ("today".equalsIgnoreCase(dateString)) {
            User user = userRepository.findById(agentId).orElse(null);
            if (user != null) {
                dailyStatsService.updateCallsCompletedForToday(user, count);
            }
        }
        return count;
    }

    @Override
    public List<CallRecord> getCallRecordByAgentId(String email) {
        User agent = userRepository.findByEmail(email).orElse(null);
        List<CallRecord> callsBySession = new ArrayList<>();

        if (agent != null) {
            try {
                for (CallRecord callRecord : callRecordRepository.findAll()) {
                    if (callRecord.getAgent() != null && callRecord.getAgent().getId().equals(agent.getId())) {
                        callsBySession.add(callRecord);
                    }
                }
            } catch (Exception e) {
                //TODO: handle this exception in a more defined manner
                throw new RuntimeException("Error retrieving calls for agent: " + email, e);
            }
        }

        return callsBySession;
    }
    @Override
    public String getTranscriptForAnalysis(Integer callId) {
        CallRecord callRecord = getCallRecordById(callId); // Ensure this fetches transcripts
        List<AudioAnalysisResponse> callTranscripts = callRecord.getCallTranscripts();

        StringBuilder transcript = new StringBuilder();
        for (AudioAnalysisResponse response : callTranscripts) {
            if (response.getText() != null && !response.getText().trim().isEmpty()) {
                transcript.append(response.getText().trim()).append(" ");
            }
        }
        return transcript.toString().trim();
    }



}
