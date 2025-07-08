package tn.ooredoo.backendspringboot.call_transcript;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/callrecord")
@RequiredArgsConstructor
public class CallRecordController {

    private final CallRecordRepository callRecordRepository;
    private final CallRecordServices callRecordServices;

    @GetMapping("/formatTranscript/{id}")
    public String getFormattedTranscript(@PathVariable Integer id) {
        CallRecord callRecord = callRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("CallRecord not found with ID: " + id));

        return callRecordServices.formatTranscriptForAnalysis(callRecord);
    }


    @GetMapping("/callsPerDay/{agentId}")
    public Integer getCallsPerDayForAgent(@PathVariable Long agentId, @RequestParam(defaultValue = "today") String date) {
        return callRecordServices.getCallsPerDayForAgent(agentId, date);
    }

    @PostMapping
    public CallRecord createCallRecord(@RequestBody CallRecord callRecord) {
        return callRecordServices.saveCallRecord(callRecord);
    }

    @GetMapping("/{id}")
    public CallRecord getCallRecordById(@PathVariable Integer id) {
        return callRecordServices.getCallRecordById(id);
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
