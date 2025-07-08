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
}
