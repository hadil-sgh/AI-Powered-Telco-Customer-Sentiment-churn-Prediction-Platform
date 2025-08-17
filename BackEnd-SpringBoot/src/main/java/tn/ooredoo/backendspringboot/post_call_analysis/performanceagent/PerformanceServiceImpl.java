package tn.ooredoo.backendspringboot.post_call_analysis.performanceagent;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.call_transcript.CallRecordServices;
import tn.ooredoo.backendspringboot.post_call_analysis.complaintscustomer.Complaint;
import tn.ooredoo.backendspringboot.post_call_analysis.complaintscustomer.ComplaintRepository;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class PerformanceServiceImpl implements PerformanceService {


     private final  PerformanceRepository performanceRepository;
     private final  ComplaintRepository complaintRepository;
     private final CallRecordServices callRecordServices;


    @Override
    public Performance savePerformancePostCall(String complaintType, String feedback, Integer score, Integer callId, String summary) {
        CallRecord callRecord = callRecordServices.getCallRecordByCallId(callId);
        Performance performance = new Performance();
        Complaint complaint = new Complaint();
        complaint.setComplaintType(complaintType);
        complaint.setCallTranscripts(callRecord);
        complaint.setSummary(summary);
        performance.setFeedback(feedback);
        performance.setCallTranscripts(callRecord);
        performance.setScore(score);
        performance = performanceRepository.save(performance);
        complaintRepository.save(complaint);

        return performance;
    }

    @Override
    public List<Performance> getAllPerformances() {
        return performanceRepository.findAll();
    }

    @Override
    public Optional<Performance> getPerformanceById(Long id) {
        return performanceRepository.findById(id);
    }

    @Override
    public Performance updatePerformance( Performance performance) {

            return performanceRepository.save(performance);


    }

    @Override
    public void deletePerformance(Long id) {
        performanceRepository.deleteById(id);
    }

}

