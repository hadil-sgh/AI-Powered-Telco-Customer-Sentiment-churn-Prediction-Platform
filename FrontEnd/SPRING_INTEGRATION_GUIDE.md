# Audio Processing Integration Guide

## Architecture Overview

This document explains the audio processing flow: **Python API ➝ Angular ➝ Spring Boot**

```
┌─────────────────┐    WebSocket    ┌─────────────────┐    HTTP POST    ┌─────────────────┐
│                 │ ◄──────────────► │                 │ ───────────────► │                 │
│   Python API    │                 │   Angular App   │                 │  Spring Boot    │
│ (Audio Pipeline)│                 │                 │                 │   (Storage)     │
│                 │                 │                 │                 │                 │
└─────────────────┘                 └─────────────────┘                 └─────────────────┘
   localhost:8000                      localhost:4200                     localhost:8080
```

## Why This Architecture?

### ❌ Previous Issue: WebSocket Conflicts

- Python API WebSocket: `ws://localhost:8000/ws`
- Spring Boot WebSocket: `ws://localhost:8080/ws/audio`
- **Problem**: Both endpoints competed for the same connection, causing conflicts

### ✅ New Solution: Hybrid Approach

- **Real-time processing**: Python API ↔ Angular (WebSocket)
- **Data persistence**: Angular → Spring Boot (HTTP)
- **No conflicts**: Each service handles its specific responsibility

## Components

### 1. Python Audio Pipeline (`localhost:8000`)

- **File**: `main.py`, `enhanced_web_realtime_pipeline.py`
- **Purpose**: Real-time audio processing, transcription, sentiment analysis
- **Protocol**: WebSocket (`ws://localhost:8000/ws`)
- **Output**: JSON analysis results to Angular

### 2. Angular Frontend (`localhost:4200`)

- **Services**:
  - `AudioStreamService`: Handles WebSocket connection to Python API
  - `AudioAnalysisService`: Handles HTTP requests to Spring Boot
- **Component**: `CallManagementComponent`
- **Flow**:
  1. Receives real-time data from Python API via WebSocket
  2. Displays data in UI
  3. Saves data to Spring Boot via HTTP POST

### 3. Spring Boot Backend (`localhost:8080`)

- **Controller**: `AudioPipelineController`
- **Service**: `AudioPipelineService`
- **Entity**: `AudioAnalysisResponse`
- **Purpose**: Data persistence and retrieval
- **Protocol**: HTTP REST API

## Data Flow

### 1. Real-time Processing

```typescript
// Angular: AudioStreamService
websocket.connect("ws://localhost:8000/ws");
websocket.onMessage((analysisResult) => {
  // Display in UI
  this.processAnalysisResult(analysisResult);

  // Save to Spring Boot
  this.saveToSpringBoot(analysisResult);
});
```

### 2. Data Storage

```typescript
// Angular: CallManagementComponent
private saveToSpringBoot(result: AudioAnalysisResult) {
  const requestDto: AudioAnalysisRequestDto = {
    timestamp: result.timestamp,
    speaker: result.speaker,
    text: result.text,
    // ... other fields
  };

  this.audioAnalysisService.saveAnalysisResult(requestDto).subscribe({
    next: (saved) => console.log('Saved:', saved.id),
    error: (err) => console.error('Save error:', err)
  });
}
```

### 3. Data Persistence

```java
// Spring Boot: AudioPipelineController
@PostMapping("/api/audio-analysis/save")
public ResponseEntity<AudioAnalysisResponse> saveAnalysisResult(
    @RequestBody AudioAnalysisRequestDto request) {

    AudioAnalysisResponse saved = audioPipelineService.saveAnalysisResult(request);
    return ResponseEntity.ok(saved);
}
```

## Configuration Changes

### 1. Disabled Spring Boot WebSocket

```java
// WebSocketConfig.java - DISABLED to prevent conflicts
// @Configuration
// @EnableWebSocketMessageBroker
public class WebSocketConfig {
    // Commented out to prevent interference with Python API WebSocket
}
```

### 2. Updated Controller Endpoints

```java
@RestController
@RequestMapping("/api/audio-analysis")  // Updated path
@CrossOrigin(origins = "*")
public class AudioPipelineController {
    // HTTP-only endpoints, no WebSocket
}
```

### 3. Enhanced Angular Services

```typescript
// New service for Spring Boot communication
@Injectable({ providedIn: "root" })
export class AudioAnalysisService {
  private readonly baseUrl = "http://localhost:8080/api/audio-analysis";
  // HTTP methods for CRUD operations
}
```

## API Endpoints

### Spring Boot REST API

| Method | Endpoint                                         | Description          |
| ------ | ------------------------------------------------ | -------------------- |
| POST   | `/api/audio-analysis/save`                       | Save analysis result |
| GET    | `/api/audio-analysis/session/{sessionId}`        | Get session results  |
| GET    | `/api/audio-analysis/call-record/{callRecordId}` | Get call results     |
| GET    | `/api/audio-analysis/{id}`                       | Get specific result  |
| DELETE | `/api/audio-analysis/{id}`                       | Delete result        |
| GET    | `/api/audio-analysis/health`                     | Health check         |

### Python WebSocket API

| Message Type    | Description                    |
| --------------- | ------------------------------ |
| `start_session` | Start audio processing session |
| `stop_session`  | Stop current session           |
| `audio_chunk`   | Send audio data for processing |
| `test`          | Test connection                |

## Running the System

### 1. Start Python API

```bash
cd AudioPipelineTreatment
python main.py
# Runs on http://localhost:8000
```

### 2. Start Spring Boot

```bash
cd BackEnd-SpringBoot
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### 3. Start Angular

```bash
cd FrontEnd
npm start
# Runs on http://localhost:4200
```

## Testing the Integration

### 1. Test WebSocket Connection

```typescript
// In Angular component
this.audioStreamService.testConnection();
// Should connect to Python API without Spring Boot interference
```

### 2. Test Data Flow

1. Start audio analysis in Angular
2. Speak into microphone
3. Check browser console for:
   - ✅ WebSocket messages from Python API
   - ✅ HTTP save requests to Spring Boot
4. Check Spring Boot logs for database saves

### 3. Verify Data Persistence

```typescript
// Get saved data
this.audioAnalysisService.getSessionResults(sessionId).subscribe((results) => {
  console.log("Saved results:", results);
});
```

## Troubleshooting

### WebSocket Still Not Working?

1. **Check Python API**: Ensure `main.py` is running on port 8000
2. **Verify Spring Boot**: Ensure WebSocketConfig is disabled
3. **Browser Console**: Look for connection errors
4. **Firewall**: Ensure ports 8000, 8080, 4200 are open

### Data Not Saving?

1. **Check HTTP requests**: Browser Network tab should show POST to `/api/audio-analysis/save`
2. **Spring Boot logs**: Look for save success/error messages
3. **Database**: Verify AudioAnalysisResponse entities are created
4. **CORS**: Ensure `@CrossOrigin(origins = "*")` is present

### Performance Issues?

1. **Async saving**: HTTP saves don't block real-time processing
2. **Error handling**: Save errors don't affect WebSocket flow
3. **UI updates**: Local array updates happen immediately
4. **Backend failures**: Won't interrupt real-time analysis

## Benefits of This Architecture

1. **Separation of Concerns**: Real-time processing vs. data persistence
2. **No WebSocket Conflicts**: Each service uses appropriate protocol
3. **Fault Tolerance**: Backend save failures don't affect real-time UI
4. **Scalability**: Can add multiple Angular clients or Spring Boot instances
5. **Maintainability**: Clear boundaries between components
6. **Performance**: Non-blocking architecture for optimal user experience
