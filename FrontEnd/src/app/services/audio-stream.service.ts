import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface AudioAnalysisResult {
  timestamp: string;
  speaker: string;
  text: string;
  sentiment: {
    text: string;
    voice: string;
    score: number;
  };
  voiceFeatures: {
    pitch: number;
    energy: number;
    rate: number;
  };
  sessionId: string;
  analysisType: string;
}

@Injectable({
  providedIn: 'root',
})
export class AudioStreamService {
  private websocket: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;

  // Observables for component communication
  private connectionStatusSubject = new BehaviorSubject<string>('Disconnected');
  private analysisResultsSubject = new Subject<AudioAnalysisResult>();
  private audioLevelSubject = new BehaviorSubject<number>(0);

  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public analysisResults$ = this.analysisResultsSubject.asObservable();
  public audioLevel$ = this.audioLevelSubject.asObservable();

  private isRecording = false;
  private currentSessionId = '';

  // WebSocket URL - adjust as needed
  private readonly WS_URL = 'ws://localhost:8000/ws';

  constructor() {}

  private async startPipeline(): Promise<void> {
    try {
      const response = await fetch('http://localhost:8000/api/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Pipeline started:', result);
      } else {
        console.warn('Failed to start pipeline:', response.status);
      }
    } catch (error) {
      console.error('Error starting pipeline:', error);
    }
  }

  async connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Start the pipeline first
        await this.startPipeline();

        this.websocket = new WebSocket(this.WS_URL);

        this.websocket.onopen = () => {
          console.log('WebSocket connected');
          this.connectionStatusSubject.next('Connected');
          resolve();
        };

        this.websocket.onmessage = (event) => {
          this.handleWebSocketMessage(event.data);
        };

        this.websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.connectionStatusSubject.next('Error');
          reject(error);
        };

        this.websocket.onclose = () => {
          console.log('WebSocket disconnected');
          this.connectionStatusSubject.next('Disconnected');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleWebSocketMessage(data: string): void {
    try {
      // First check if it's valid JSON
      if (!data.trim().startsWith('{') && !data.trim().startsWith('[')) {
        console.log('Non-JSON WebSocket message:', data);
        return;
      }

      const message = JSON.parse(data);

      if (message.type === 'session_started') {
        console.log('Session started:', message.sessionId);
      } else if (message.type === 'session_stopped') {
        console.log('Session stopped:', message.sessionId);
      } else if (message.type === 'test_response') {
        console.log('Test response:', message);
      } else if (message.timestamp && message.speaker && message.text) {
        // This is an analysis result
        console.log('Received analysis result:', message);
        this.analysisResultsSubject.next(message as AudioAnalysisResult);
      } else {
        console.log('Unknown message type:', message);
      }
    } catch (error) {
      // Only log error if it looks like it should have been JSON
      if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
        console.error('Error parsing WebSocket message:', error);
        console.error('Message data:', data);
      } else {
        console.log('Non-JSON WebSocket message:', data);
      }
    }
  }

  async startRecording(sessionId: string): Promise<void> {
    if (this.isRecording) {
      console.warn('Already recording');
      return;
    }

    this.currentSessionId = sessionId;

    try {
      // Get user media (microphone access)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Setup audio context for level monitoring
      this.setupAudioAnalysis(stream);

      // Setup media recorder for audio streaming
      this.setupMediaRecorder(stream);

      // Send session start message
      this.sendMessage({
        type: 'start_session',
        sessionId: sessionId,
      });

      this.isRecording = true;
      this.connectionStatusSubject.next('Recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  private setupAudioAnalysis(stream: MediaStream): void {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.microphone = this.audioContext.createMediaStreamSource(stream);

    this.analyser.fftSize = 256;
    this.microphone.connect(this.analyser);

    // Start audio level monitoring
    this.monitorAudioLevel();
  }

  private monitorAudioLevel(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevel = () => {
      if (!this.analyser || !this.isRecording) return;

      this.analyser.getByteFrequencyData(dataArray);

      // Calculate RMS level
      const sum = dataArray.reduce((acc, val) => acc + val * val, 0);
      const rms = Math.sqrt(sum / bufferLength);
      const level = rms / 255; // Normalize to 0-1

      this.audioLevelSubject.next(level);

      requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }

  private setupMediaRecorder(stream: MediaStream): void {
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus',
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.sendAudioChunk(event.data);
      }
    };

    // Start recording in chunks
    this.mediaRecorder.start(1000); // 1 second chunks
  }

  private async sendAudioChunk(blob: Blob): Promise<void> {
    try {
      // Convert blob to base64
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = this.arrayBufferToBase64(arrayBuffer);

      this.sendMessage({
        type: 'audio_chunk',
        data: base64,
        sessionId: this.currentSessionId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending audio chunk:', error);
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  stopRecording(): void {
    if (!this.isRecording) return;

    this.isRecording = false;

    // Stop media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    // Stop audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    // Send session stop message
    this.sendMessage({
      type: 'stop_session',
      sessionId: this.currentSessionId,
    });

    this.connectionStatusSubject.next('Connected');
    this.audioLevelSubject.next(0);
  }

  disconnect(): void {
    this.stopRecording();

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  private sendMessage(message: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Utility method to check if browser supports required APIs
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      window.MediaRecorder &&
      window.WebSocket
    );
  }
}
