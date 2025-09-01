package tn.ooredoo.backendspringboot.post_call_analysis.performanceagent;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.call_transcript.CallRecordRepository;
import tn.ooredoo.backendspringboot.call_transcript.CallRecordServices;
import tn.ooredoo.backendspringboot.post_call_analysis.complaintscustomer.Complaint;
import tn.ooredoo.backendspringboot.post_call_analysis.complaintscustomer.ComplaintRepository;
import tn.ooredoo.backendspringboot.team.Team;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserRepository;
import tn.ooredoo.backendspringboot.user.UserService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class PerformanceServiceImpl implements PerformanceService {


     private final  PerformanceRepository performanceRepository;
     private final  ComplaintRepository complaintRepository;
     private final CallRecordServices callRecordServices;
     private final UserService userService;
    private final @Lazy UserRepository userRepository;
    private final @Lazy CallRecordRepository callRecordRepository;


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
    public List<Performance> getAllPerformancesByAgentEmail(String email) {
        User agent = userService.findByEmail(email);
        List<Performance> performances = getAllPerformances();
        List<Performance> agentPerformances = new ArrayList<>(); // New list for results

        for (Performance performance : performances) {
            if (performance.getCallTranscripts().getAgent().equals(agent)) {
                agentPerformances.add(performance); // Add to the new list
            }
        }
        return agentPerformances;
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
    @Override
    public List<Performance> getPerformanceByTeam(String managerEmail) {
        // 1. Find the manager
        User manager = userRepository.findByEmail(managerEmail).orElse(null);
        if (manager == null || manager.getTeam() == null) {
            return List.of(); // return empty if no manager or team
        }

        // 2. Get all users in the manager's team
        Team team = manager.getTeam();
        List<User> teamMembers = userRepository.findByTeam(team);

        // 3. Get all call records for team members
        List<CallRecord> teamCalls = callRecordRepository.findByAgentIn(teamMembers);

        // 4. Get all performances for these call records
        return performanceRepository.findByCallTranscriptsIn(teamCalls);
    }

}

