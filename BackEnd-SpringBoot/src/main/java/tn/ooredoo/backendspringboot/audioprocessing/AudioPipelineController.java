package tn.ooredoo.backendspringboot.audioprocessing;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/audio")
@RequiredArgsConstructor
public class AudioPipelineController {

    private final AudioPipelineService audioPipelineService;

    @PostMapping("/start")
    public ResponseEntity<String> startPipeline() {
        audioPipelineService.startPipeline();
        return ResponseEntity.ok("Audio pipeline started");
    }

    @PostMapping("/stop")
    public ResponseEntity<String> stopPipeline() {
        audioPipelineService.stopPipeline();
        return ResponseEntity.ok("Audio pipeline stopped");
    }

    @PostMapping("/process-base64")
    public ResponseEntity<String> processAudioBase64(
            @RequestParam String base64Data,
            @RequestParam String sessionId) {
        audioPipelineService.processAudioChunk(base64Data, sessionId);
        return ResponseEntity.ok("Base64 audio chunk processed");
    }

    @PostMapping("/process-file")
    public ResponseEntity<String> processAudioFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam String sessionId) throws IOException {
        byte[] audioBytes = file.getBytes();
        audioPipelineService.processAudioChunk(audioBytes, sessionId);
        return ResponseEntity.ok("Audio file processed");
    }
}
