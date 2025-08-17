package tn.ooredoo.backendspringboot.call_transcript;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.audioprocessing.AudioAnalysisRepository;
import tn.ooredoo.backendspringboot.audioprocessing.AudioAnalysisResponse;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CallRecordServicesImpl implements CallRecordServices {

    private final CallRecordRepository callRecordRepository;

    private final UserRepository userRepository;
    private final AudioAnalysisRepository audioAnalysisRepository;


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

    @Override
    public void updateOutcomePostCall(Integer callId, Outcome outcome) {
        CallRecord callRecord = getCallRecordById(callId);
        callRecord.setCallOutcome(outcome);
        callRecordRepository.save(callRecord);

    }
    public Double getAverageCallDuration() {
        Long avg = callRecordRepository.getAverageCallDuration();
        return avg != null ? avg.doubleValue() : 0.0;
    }


}
