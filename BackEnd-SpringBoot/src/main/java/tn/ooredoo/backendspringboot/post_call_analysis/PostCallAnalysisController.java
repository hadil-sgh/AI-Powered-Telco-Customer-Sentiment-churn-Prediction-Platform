package tn.ooredoo.backendspringboot.post_call_analysis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.call_transcript.CallRecordServices;

import java.util.Map;

@RestController
@RequestMapping("/postCall")
@RequiredArgsConstructor
@Slf4j
public class PostCallAnalysisController {

    private final PostCallAnalysisServices postCallAnalysisServices;
    private final CallRecordServices callRecordServices;

    @GetMapping("/score/{callRecordId}")
    public ResponseEntity<Map<String, Object>> analyzeTranscriptScore(@PathVariable Integer callRecordId) {
        log.debug("Received request to analyze score for CallRecord ID: {}", callRecordId);

        try {
            CallRecord callRecord = callRecordServices.getCallRecordById(callRecordId);
            if (callRecord == null) {
                log.warn("CallRecord not found for ID: {}", callRecordId);
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> result = postCallAnalysisServices.analyzeTranscriptScore(callRecordId);
            log.debug("Analysis result for ID {}: {}", callRecordId, result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error during transcript analysis for ID {}: {}", callRecordId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/report/{callRecordId}")
    public ResponseEntity<Map<String, Object>> generateTranscriptReport(@PathVariable Integer callRecordId) {
        log.debug("Received request to generate report for CallRecord ID: {}", callRecordId);

        CallRecord callRecord = callRecordServices.getCallRecordById(callRecordId);
        if (callRecord == null) {
            log.warn("CallRecord not found for ID: {}", callRecordId);
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> result = postCallAnalysisServices.generateTranscriptReport(callRecordId);
        log.debug("Generated report for ID {}: {}", callRecordId, result);
        return ResponseEntity.ok(result);
    }


}
