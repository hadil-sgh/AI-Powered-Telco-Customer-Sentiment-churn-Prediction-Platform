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
  emotionAnalysis?: {
    primary_emotion: string;
    confidence: number;
    reasoning: string[];
    voice_intensity: number;
    escalation_level: number;
  };
  audioStats?: {
    chunks_processed: number;
    chunks_with_speech: number;
    total_audio_duration: number;
    speech_duration: number;
    avg_volume: number;
    peak_volume: number;
  };
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
  private processorNode: ScriptProcessorNode | null = null;
  private gainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private stream: MediaStream | null = null; // Store the media stream for proper cleanup

  // Audio buffering for better speech recognition
  private audioBuffer: Int16Array = new Int16Array(0);
  private readonly TARGET_BUFFER_SIZE = 32768; // ~2 seconds at 16kHz (32768 samples)
  private bufferSendCounter = 0;

  // Observables for component communication
  private connectionStatusSubject = new BehaviorSubject<string>('Disconnected');
  private analysisResultsSubject = new Subject<AudioAnalysisResult>();
  private audioLevelSubject = new BehaviorSubject<number>(0);
  private errorSubject = new Subject<string>();

  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public analysisResults$ = this.analysisResultsSubject.asObservable();
  public audioLevel$ = this.audioLevelSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  private isRecording = false;
  private currentSessionId = '';

  // Enhanced WebSocket URL
  private readonly WS_URL = 'ws://localhost:8000/ws';

  // Audio configuration EXACTLY matching audio_capture.py
  private readonly AUDIO_CONFIG = {
    sampleRate: 16000, // EXACT match to audio_capture.py default
    channelCount: 1,
    echoCancellation: false, // DISABLE - causes noise artifacts
    noiseSuppression: false, // DISABLE - causes noise artifacts
    autoGainControl: false, // DISABLE - we handle gain like audio_capture.py
    // Matching audio_capture.py settings EXACTLY
    bufferSize: 2048, // Closest power of 2 to audio_capture.py chunk_size (2084)
    chunkInterval: 130, // ~2084/16000 * 1000ms
    targetRMS: 0.05, // EXACT match to audio_capture.py target_rms
    gain: 1.0, // Match audio_capture.py default gain
  };

  constructor() {}

  async connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.connectionStatusSubject.next('Connecting...');

        this.websocket = new WebSocket(this.WS_URL);

        this.websocket.onopen = () => {
          console.log('Enhanced WebSocket connected');
          this.connectionStatusSubject.next('Connected');
          resolve();
        };

        this.websocket.onmessage = (event) => {
          this.handleWebSocketMessage(event.data);
        };

        this.websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.connectionStatusSubject.next('Error');
          this.errorSubject.next('WebSocket connection error');
          reject(error);
        };

        this.websocket.onclose = (event) => {
          console.log('WebSocket disconnected', event.code, event.reason);
          this.connectionStatusSubject.next('Disconnected');

          // Auto-reconnect logic for production use
          if (!event.wasClean && this.isRecording) {
            setTimeout(() => {
              console.log('Attempting to reconnect...');
              this.connect().catch((err) =>
                console.error('Reconnection failed:', err)
              );
            }, 3000);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleWebSocketMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'session_started':
          console.log('Session started:', message.sessionId);
          break;

        case 'session_stopped':
          console.log('Session stopped:', message.sessionId);
          if (message.stats) {
            console.log('Session stats:', message.stats);
          }
          break;

        case 'session_response':
          console.log('Session response:', message);
          break;

        case 'test_response':
          console.log('Test response:', message);
          break;

        case 'error':
          console.error('Pipeline error:', message.message);
          this.errorSubject.next(message.message);
          break;

        default:
          // Check if it's an analysis result
          if (message.timestamp && message.speaker && message.text) {
            console.log('Received enhanced analysis result:', message);
            this.analysisResultsSubject.next(message as AudioAnalysisResult);
          } else {
            console.log('Unknown message type:', message);
          }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      console.error('Message data:', data);
    }
  }

  async startRecording(sessionId: string): Promise<void> {
    if (this.isRecording) {
      console.warn('Already recording');
      return;
    }

    this.currentSessionId = sessionId;

    try {
      console.log('🎤 Starting ULTRA-SIMPLE audio recording - raw PCM only');

      // Get audio stream with MINIMAL constraints to avoid static
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true, // Use browser defaults - no constraints that cause static
      });

      console.log(
        '✅ Got media stream, tracks:',
        stream.getAudioTracks().length
      );

      // Store the stream for cleanup
      this.stream = stream;

      // Setup BASIC AudioContext for raw PCM extraction (no complex processing)
      await this.setupBasicPCMCapture(stream);

      // Connect to WebSocket if not already connected
      if (!this.websocket) {
        await this.connect();
      }

      // Start session on server
      this.sendMessage({
        type: 'start_session',
        sessionId: sessionId,
      });

      this.isRecording = true;
      this.connectionStatusSubject.next('Recording');

      console.log('✅ ULTRA-SIMPLE recording started - raw PCM, no processing');
    } catch (error) {
      console.error('❌ Error starting basic recording:', error);
      this.errorSubject.next('Failed to start recording: ' + error);
      throw error;
    }
  }

  // ULTRA-SIMPLE: Just extract raw PCM data, no processing at all
  private async setupBasicPCMCapture(stream: MediaStream): Promise<void> {
    console.log('🔧 Setting up BASIC PCM capture');

    // Create AudioContext with 16kHz to match pipeline
    this.audioContext = new AudioContext({
      sampleRate: 16000,
    });
    console.log('AudioContext sample rate:', this.audioContext.sampleRate);

    // Create source from microphone
    this.microphone = this.audioContext.createMediaStreamSource(stream);

    // Create analyser for level monitoring only
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    // Create ScriptProcessor for raw audio extraction - use larger buffer for fewer interruptions
    this.processorNode = this.audioContext.createScriptProcessor(8192, 1, 1); // Increased from 4096

    // Connect: microphone -> analyser (for monitoring)
    //          microphone -> processor (for data extraction)
    //          processor -> destination (REQUIRED for ScriptProcessor to work!)
    this.microphone.connect(this.analyser);
    this.microphone.connect(this.processorNode);
    this.processorNode.connect(this.audioContext.destination); // This connection is REQUIRED

    console.log(
      '🔗 Audio graph connected: mic -> analyser, mic -> processor -> destination'
    );

    // Reset audio buffer
    this.audioBuffer = new Int16Array(0);
    this.bufferSendCounter = 0;

    // Extract raw audio data and accumulate into larger buffers
    this.processorNode.onaudioprocess = (event) => {
      if (!this.isRecording) return;

      this.bufferSendCounter++;
      if (this.bufferSendCounter % 4 === 0) {
        // Log every 4th chunk to reduce spam
        console.log('🎵 Processing audio chunk...', this.bufferSendCounter);
      }

      const inputBuffer = event.inputBuffer;
      const inputData = inputBuffer.getChannelData(0);

      // Convert Float32 to Int16 (standard PCM format)
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        // Simple conversion: clamp to [-1,1] and convert to 16-bit
        const sample = Math.max(-1, Math.min(1, inputData[i]));
        pcmData[i] = sample * 32767;
      }

      // Accumulate audio data into larger buffer
      const newBuffer = new Int16Array(
        this.audioBuffer.length + pcmData.length
      );
      newBuffer.set(this.audioBuffer, 0);
      newBuffer.set(pcmData, this.audioBuffer.length);
      this.audioBuffer = newBuffer;

      // Send buffer when we have enough data (~2 seconds)
      if (this.audioBuffer.length >= this.TARGET_BUFFER_SIZE) {
        console.log(
          `📦 Sending accumulated PCM buffer: ${
            this.audioBuffer.length
          } samples (~${(this.audioBuffer.length / 16000).toFixed(2)}s)`
        );

        // Send the accumulated buffer
        const bufferToSend = this.audioBuffer.buffer as ArrayBuffer;
        this.sendAudioChunk(bufferToSend);

        // Reset buffer for next accumulation
        this.audioBuffer = new Int16Array(0);
      }
    };

    // Start audio level monitoring
    this.monitorAudioLevel();

    console.log(
      '✅ Basic PCM capture setup complete - ScriptProcessor should fire onaudioprocess events'
    );
  }

  // NEW: Simple MediaRecorder approach for clean audio
  private async setupMediaRecorderCapture(stream: MediaStream): Promise<void> {
    // Create simple MediaRecorder - let it handle audio encoding cleanly
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus', // Use Opus codec for clean compression
      audioBitsPerSecond: 128000, // Sufficient quality for speech
    });

    // Collect audio chunks
    const audioChunks: Blob[] = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
        console.log(`📦 Received audio chunk: ${event.data.size} bytes`);

        // Convert blob to ArrayBuffer and send
        event.data.arrayBuffer().then((buffer) => {
          this.sendAudioChunk(buffer);
        });
      }
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('❌ MediaRecorder error:', event);
      this.errorSubject.next('Recording error: ' + event);
    };

    // Start recording with small intervals for real-time processing
    this.mediaRecorder.start(250); // 250ms chunks for real-time feel

    console.log('✅ MediaRecorder started with clean audio capture');
  }

  // MINIMAL processing - no digital effects that add noise
  private processExactlyLikeAudioCapture(
    audioData: Float32Array
  ): Float32Array {
    // MediaRecorder handles encoding - no processing needed
    return new Float32Array(audioData);
  }

  // Remove complex audio processing - MediaRecorder approach doesn't need it
  private async setupEnhancedAudioProcessing(
    stream: MediaStream
  ): Promise<void> {
    // This method is no longer used with MediaRecorder approach
    console.log('Using MediaRecorder - no complex audio processing needed');
  }

  private async setupFallbackAudioProcessing(
    stream: MediaStream
  ): Promise<void> {
    // This method is no longer used with MediaRecorder approach
    console.log('Using MediaRecorder - no fallback processing needed');
  }

  private monitorAudioLevel(): void {
    if (!this.isRecording) return;

    // Use analyser if available for real-time level monitoring
    if (this.analyser) {
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);

      // Calculate basic level
      const average =
        dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const level = average / 255; // Normalize to 0-1
      this.audioLevelSubject.next(level);

      requestAnimationFrame(() => this.monitorAudioLevel());
    } else {
      // Fallback: show a pulsing level indicator
      const now = Date.now();
      const level = (Math.sin(now / 200) + 1) / 2; // Oscillating 0-1
      this.audioLevelSubject.next(level * 0.3); // Reduced amplitude

      requestAnimationFrame(() => this.monitorAudioLevel());
    }
  }

  private async sendAudioChunk(audioBuffer: ArrayBuffer): Promise<void> {
    try {
      const estimatedDuration = (audioBuffer.byteLength / 2 / 16000).toFixed(2);
      console.log(
        `🚀 Sending buffered audio chunk: ${audioBuffer.byteLength} bytes (~${estimatedDuration}s)`
      );

      // Convert ArrayBuffer to base64 with better compression
      const base64 = this.arrayBufferToBase64(audioBuffer);

      const message = {
        type: 'audio_chunk',
        data: base64,
        sessionId: this.currentSessionId,
        timestamp: new Date().toISOString(),
        sampleRate: 16000, // Fixed sample rate
        channels: 1, // Fixed mono
      };

      console.log(
        `📡 WebSocket sending buffered chunk: ${base64.length} base64 chars (~${estimatedDuration}s audio)`
      );

      this.sendMessage(message);
    } catch (error) {
      console.error('❌ Error sending audio chunk:', error);
      this.errorSubject.next('Error sending audio data');
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 8192;

    // Process in chunks to avoid call stack size exceeded
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }

    return btoa(binary);
  }

  stopRecording(): void {
    if (!this.isRecording) return;

    this.isRecording = false;

    // Send any remaining audio in buffer before stopping
    if (this.audioBuffer && this.audioBuffer.length > 0) {
      console.log(
        `📦 Sending final audio buffer: ${this.audioBuffer.length} samples before stopping`
      );
      const bufferToSend = this.audioBuffer.buffer as ArrayBuffer;
      this.sendAudioChunk(bufferToSend);
      this.audioBuffer = new Int16Array(0); // Clear buffer
    }

    // Stop all media stream tracks to completely stop microphone access
    if (this.stream) {
      this.stream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
        console.log('🛑 Stopped media track:', track.kind);
      });
      this.stream = null;
    }

    // Disconnect and cleanup all audio processing nodes to prevent echo
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode.onaudioprocess = null; // Remove event handler
      this.processorNode = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.compressorNode) {
      this.compressorNode.disconnect();
      this.compressorNode = null;
    }

    if (this.filterNode) {
      this.filterNode.disconnect();
      this.filterNode = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    // Close audio context to completely free audio resources and prevent echo
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Stop session on server
    this.sendMessage({
      type: 'stop_session',
      sessionId: this.currentSessionId,
    });

    this.connectionStatusSubject.next('Connected');
    this.audioLevelSubject.next(0);

    console.log('Enhanced recording stopped - audio_capture.py style');
  }

  disconnect(): void {
    this.stopRecording();

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  sendTestMessage(message: string): void {
    this.sendMessage({
      type: 'test',
      message: message,
      timestamp: new Date().toISOString(),
    });
  }

  private sendMessage(message: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
      this.errorSubject.next('WebSocket not connected');
    }
  }

  // Enhanced utility methods
  getConnectionInfo(): any {
    return {
      connected: this.websocket?.readyState === WebSocket.OPEN,
      recording: this.isRecording,
      sessionId: this.currentSessionId,
      audioConfig: this.AUDIO_CONFIG,
    };
  }

  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      window.AudioContext &&
      window.WebSocket
    );
  }

  static getAudioDevices(): Promise<MediaDeviceInfo[]> {
    return navigator.mediaDevices
      .enumerateDevices()
      .then((devices) =>
        devices.filter((device) => device.kind === 'audioinput')
      );
  }
}