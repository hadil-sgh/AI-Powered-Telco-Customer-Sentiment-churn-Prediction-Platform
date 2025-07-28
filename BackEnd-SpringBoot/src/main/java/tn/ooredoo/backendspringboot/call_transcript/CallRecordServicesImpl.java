package tn.ooredoo.backendspringboot.call_transcript;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.audioprocessing.AudioAnalysisResponse;
import tn.ooredoo.backendspringboot.dailystats.DailyStatsService;
import tn.ooredoo.backendspringboot.user.UserRepository;
import tn.ooredoo.backendspringboot.user.User;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CallRecordServicesImpl implements CallRecordServices {

    final CallRecordRepository callRecordRepository;
    final DailyStatsService dailyStatsService;
    final UserRepository userRepository;

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
    public CallRecord saveCallRecord(CallRecord callRecord) {
        return null;
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
        return null;
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




    }
