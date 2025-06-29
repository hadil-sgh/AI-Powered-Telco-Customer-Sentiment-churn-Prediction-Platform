package tn.ooredoo.backendspringboot.post_call_analysis;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.call_transcript.CallRecordServices;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostCallAnalysisServices {
    private final CallRecordServices callRecordServices;
    private final WebClient webClient;

    @Value("${flask.api.base-url:http://localhost:5001}")

    private String flaskApiBaseUrl;

    public Map<String, Object> analyzeTranscriptScore(CallRecord callRecord) {
        try {
            String transcriptContent = callRecordServices.formatTranscriptForAnalysis(callRecord);

            Map<String, String> payload = new HashMap<>();
            payload.put("transcript_content", transcriptContent);

            Map<String, Object> response = webClient.post()
                    .uri(flaskApiBaseUrl + "/api/score")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(); // Convert to synchronous call

            return response != null ? response : new HashMap<>();

        } catch (Exception e) {
            // Log the error
            System.err.println("Error analyzing transcript score: " + e.getMessage());

            // Return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to analyze transcript: " + e.getMessage());
            return errorResponse;
        }
    }

    public Map<String, Object> generateTranscriptReport(CallRecord callRecord) {
        try {
            String transcriptContent = callRecordServices.formatTranscriptForAnalysis(callRecord);

            Map<String, String> payload = new HashMap<>();
            payload.put("transcript_content", transcriptContent);

            Map<String, Object> response = webClient.post()
                    .uri(flaskApiBaseUrl + "/api/report")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(); // Convert to synchronous call

            return response != null ? response : new HashMap<>();

        } catch (Exception e) {
            // Log the error
            System.err.println("Error generating transcript report: " + e.getMessage());

            // Return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to generate report: " + e.getMessage());
            return errorResponse;
        }
    }

    public Map<String, Object> getCompleteAnalysis(CallRecord callRecord) {
        Map<String, Object> completeAnalysis = new HashMap<>();

        // Get both score and report
        Map<String, Object> scoreResult = analyzeTranscriptScore(callRecord);
        Map<String, Object> reportResult = generateTranscriptReport(callRecord);

        completeAnalysis.put("score_analysis", scoreResult);
        completeAnalysis.put("detailed_report", reportResult);
        completeAnalysis.put("call_record_id", callRecord.getId());

        return completeAnalysis;
    }

}

