package tn.ooredoo.backendspringboot.audioprocessing;


import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.socket.WebSocketSession;
import org.springframework.web.reactive.socket.client.ReactorNettyWebSocketClient;
import org.springframework.web.reactive.socket.client.WebSocketClient;

import java.net.URI;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.BiConsumer;

@Service
@Slf4j
public class AudioPipelineService {

    @Value("${audio.pipeline.url:http://localhost:8000}")
    private String audioPipelineUrl;

    private final WebSocketClient webSocketClient = new ReactorNettyWebSocketClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ConcurrentMap<String, BiConsumer<String, AudioAnalysisResponse>> subscribers = new ConcurrentHashMap<>();

    private WebSocketSession pipelineSession;
    private boolean isConnected = false;

    public void startPipeline() {
        if (!isConnected) {
            connectToPipeline();
        }

        // Send start command to pipeline
        sendHttpRequest("/api/start", "POST", null);
    }

    public void stopPipeline() {
        // Send stop command to pipeline
        sendHttpRequest("/api/stop", "POST", null);

        if (pipelineSession != null) {
            pipelineSession.close();
            isConnected = false;
        }
    }

    public void processAudioChunk(String base64AudioData, String sessionId) {
        if (pipelineSession != null && isConnected) {
            try {
                String audioMessage = String.format("{\"type\":\"audio_chunk\",\"data\":\"%s\",\"session_id\":\"%s\"}",
                        base64AudioData, sessionId);
                pipelineSession.send(
                        reactor.core.publisher.Mono.just(
                                pipelineSession.textMessage(audioMessage)
                        )
                ).subscribe();
            } catch (Exception e) {
                log.error("Error sending audio chunk to pipeline: {}", e.getMessage());
            }
        }
    }


    public void processAudioChunk(byte[] audioData, String sessionId) {
        String base64Data = Base64.getEncoder().encodeToString(audioData);
        processAudioChunk(base64Data, sessionId);
    }

    public void subscribeToResults(String sessionId, BiConsumer<String, AudioAnalysisResponse> callback) {
        subscribers.put(sessionId, callback);
    }

    public void unsubscribeFromResults(String sessionId) {
        subscribers.remove(sessionId);
    }

    private void connectToPipeline() {
        try {
            URI uri = URI.create(audioPipelineUrl.replace("http", "ws") + "/ws");

            webSocketClient.execute(uri, session -> {
                pipelineSession = session;
                isConnected = true;
                log.info("Connected to audio pipeline WebSocket");

                return session.receive()
                        .map(org.springframework.web.reactive.socket.WebSocketMessage::getPayloadAsText)
                        .doOnNext(this::handlePipelineMessage)
                        .doOnError(error -> {
                            log.error("WebSocket error: {}", error.getMessage());
                            isConnected = false;
                        })
                        .doOnComplete(() -> {
                            log.info("WebSocket connection completed");
                            isConnected = false;
                        })
                        .then();
            }).subscribe();

        } catch (Exception e) {
            log.error("Error connecting to audio pipeline: {}", e.getMessage());
        }
    }

    private void handlePipelineMessage(String message) {
        try {
            log.debug("Received from pipeline: {}", message);

            // Try to parse as AudioAnalysisRequest (from Python pipeline)
            AudioAnalysisRequest result = objectMapper.readValue(message, AudioAnalysisRequest.class);

            // Broadcast to all subscribers
            subscribers.forEach((sessionId, callback) -> {
                try {
                    // Convert to AudioAnalysisResponse for callback
                    AudioAnalysisResponse response = convertToResponse(result);
                    callback.accept(sessionId, response);
                } catch (Exception e) {
                    log.error("Error calling subscriber callback for session {}: {}", sessionId, e.getMessage());
                }
            });

        } catch (Exception e) {
            log.debug("Message is not a valid AudioAnalysisRequest, ignoring: {}", message);
        }
    }

    private AudioAnalysisResponse convertToResponse(AudioAnalysisRequest request) {
        // Create sentiment entity
        TranscriptSentiment sentiment = TranscriptSentiment.builder()
                .text(request.getSentiment().getText())
                .voice(request.getSentiment().getVoice())
                .score(request.getSentiment().getScore())
                .build();

        // Create voice features entity
        VoiceFeatures voiceFeatures = VoiceFeatures.builder()
                .pitch(request.getVoiceFeatures().getPitch())
                .energy(request.getVoiceFeatures().getEnergy())
                .rate(request.getVoiceFeatures().getRate())
                .build();

        // Create main analysis response
        return AudioAnalysisResponse.builder()
                .timestamp(request.getTimestamp())
                .speaker(request.getSpeaker())
                .text(request.getText())
                .sentiment(sentiment)
                .voiceFeatures(voiceFeatures)
                .sessionId(request.getSessionId())
                .analysisType(request.getAnalysisType())
                .build();
    }

    public PipelineStatus getStatus() {
        return PipelineStatus.builder()
                .status(isConnected ? "CONNECTED" : "DISCONNECTED")
                .isConnected(isConnected)
                .activeConnections(subscribers.size())
                .lastActivity(java.time.LocalDateTime.now().toString())
                .componentsReady(isConnected)
                .audioCaptureActive(isConnected)
                .build();
    }

    private void sendHttpRequest(String endpoint, String method, String body) {
        // Implementation for HTTP requests to pipeline API
        // This could use WebClient or RestTemplate
        try {
            // Using WebClient for reactive HTTP calls
            org.springframework.web.reactive.function.client.WebClient
                    .create(audioPipelineUrl)
                    .method(org.springframework.http.HttpMethod.valueOf(method))
                    .uri(endpoint)
                    .bodyValue(body != null ? body : "")
                    .retrieve()
                    .bodyToMono(String.class)
                    .subscribe(
                            response -> log.info("Pipeline API response: {}", response),
                            error -> log.error("Pipeline API error: {}", error.getMessage())
                    );
        } catch (Exception e) {
            log.error("Error sending request to pipeline API: {}", e.getMessage());
        }
    }
}