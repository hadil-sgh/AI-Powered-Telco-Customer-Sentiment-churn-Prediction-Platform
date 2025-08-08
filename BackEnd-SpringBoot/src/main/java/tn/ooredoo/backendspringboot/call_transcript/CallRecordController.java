package tn.ooredoo.backendspringboot.call_transcript;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.customer.CustomerServices;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserService;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/callrecord")
@RequiredArgsConstructor
public class CallRecordController {

    private final CallRecordRepository callRecordRepository;
    private final CallRecordServices callRecordServices;
    private final UserService userService;
    private final CustomerServices customerServices;

    @GetMapping("/formatTranscript/{id}")
    public String getFormattedTranscript(@PathVariable Integer id) {
        CallRecord callRecord = callRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("CallRecord not found with ID: " + id));

        return callRecordServices.formatTranscriptForAnalysis(callRecord);
    }

    @GetMapping("/Transcript/{id}")
    public String getdTranscript(@PathVariable Integer id) {

        return callRecordServices.getTranscriptForAnalysis(id);
    }


    @GetMapping("/callsPerDay/{agentId}")
    public Integer getCallsPerDayForAgent(@PathVariable Long agentId, @RequestParam(defaultValue = "today") Date date) {
        return callRecordServices.getCallsPerDayForAgent(agentId, date);
    }

    @PostMapping("/save")
    public CallRecord saveCallRecord(
            @RequestParam String email,
            @RequestParam Integer customerId,
            @RequestParam String sessionId,
            @RequestParam Long duration
    ) {
        User agent = userService.findByEmail(email);
        Customer customer = customerServices.getCustomerById(customerId);
        return callRecordServices.saveCallRecord(agent, customer, sessionId, duration);
    }

    @GetMapping("/{id}")
    public CallRecord getCallRecordById(@PathVariable Integer id) {
        return callRecordServices.getCallRecordById(id);
    }

    @GetMapping("getbysession/{email}")
    public List<CallRecord> getCallRecordBySession(@PathVariable String email) {
        return callRecordServices.getCallRecordByAgentId(email);
    }

    @PutMapping("/{id}")
    public CallRecord updateCallRecord(@PathVariable Integer id, @RequestBody CallRecord callRecord) {
        callRecord.setId(id);
        return callRecordServices.updateCallRecord(callRecord);
    }

    @DeleteMapping("/{id}")
    public void deleteCallRecord(@PathVariable Integer id) {
        callRecordServices.deleteCallRecordById(id);
    }

    @GetMapping("/byCallId/{callId}")
    public CallRecord getCallRecordByCallId(@PathVariable Integer callId) {
        return callRecordServices.getCallRecordByCallId(callId);
    }
}
