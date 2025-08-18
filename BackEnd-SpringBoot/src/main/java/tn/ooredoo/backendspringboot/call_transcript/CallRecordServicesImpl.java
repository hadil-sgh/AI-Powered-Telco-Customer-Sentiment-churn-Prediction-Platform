package tn.ooredoo.backendspringboot.call_transcript;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.audioprocessing.AudioAnalysisRepository;
import tn.ooredoo.backendspringboot.audioprocessing.AudioAnalysisResponse;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.note.Note;
import tn.ooredoo.backendspringboot.note.NoteRepository;
import tn.ooredoo.backendspringboot.post_call_analysis.complaintscustomer.Complaint;
import tn.ooredoo.backendspringboot.post_call_analysis.complaintscustomer.ComplaintRepository;
import tn.ooredoo.backendspringboot.post_call_analysis.performanceagent.Performance;
import tn.ooredoo.backendspringboot.post_call_analysis.performanceagent.PerformanceRepository;
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
    private final @Lazy ComplaintRepository complaintRepository;
    private final @Lazy PerformanceRepository performanceRepository;
    private final @Lazy NoteRepository noteRepository;


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
        CallRecord callRecord = callRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CallRecord not found with id: " + id));

        // Delete complaints
        List<Complaint> complaints = complaintRepository.findByCallTranscripts_Id(id);
        if (!complaints.isEmpty()) {
            complaintRepository.deleteAll(complaints);
        }

        // Delete performance records
        List<Performance> performances = performanceRepository.findByCallTranscripts_Id(id);
        if (!performances.isEmpty()) {
            performanceRepository.deleteAll(performances);
        }

        // Delete notes
        List<Note> notes = noteRepository.findByCall_Id(id);
        if (!notes.isEmpty()) {
            noteRepository.deleteAll(notes);
        }

        // Finally delete the call record itself
        callRecordRepository.delete(callRecord);
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
