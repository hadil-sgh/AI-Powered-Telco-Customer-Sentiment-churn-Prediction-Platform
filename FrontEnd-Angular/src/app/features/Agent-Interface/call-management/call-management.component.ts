// call-management.component.ts
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AudioPipelineService,
  AudioProcessingResponse,
  CallSession
} from '../../../services/audio-pipeline.service';

import { Subscription } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-call-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './call-management.component.html',
  styleUrl: './call-management.component.css'
})
export class CallManagementComponent implements OnInit, OnDestroy {
  isRecording = false;
  status = 'disconnected';
  currentSession: CallSession | null = null;
  audioResults: AudioProcessingResponse[] = [];
  isProcessing = false;
  callTimer = '00:00:00';
  
  // Audio-related properties
  connectionStatus = 'Disconnected';
  microphonePermission = false;
  lastTranscriptionTime: string = '';
  totalTranscriptions = 0;
  audioLevel = 0;
  isAudioStreaming = false;

  // Audio capture properties
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  private subscriptions: Subscription[] = [];
  private timerInterval: any;
  private callStartTime: number = 0;
  private audioLevelInterval: any;

  constructor(
    private audioPipelineService: AudioPipelineService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscribeToAudioService();
    this.checkMicrophonePermission();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.cleanup();
  }

  private cleanup(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.audioLevelInterval) {
      clearInterval(this.audioLevelInterval);
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  private async checkMicrophonePermission(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.microphonePermission = true;
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
    } catch (error) {
      this.microphonePermission = false;
      console.warn('Microphone permission not granted');
    }
  }

  private subscribeToAudioService(): void {
    // Recording status
    this.subscriptions.push(
      this.audioPipelineService.isRecording$.subscribe(recording => {
        this.isRecording = recording;
        if (recording) {
          this.startTimer();
        } else {
          this.stopTimer();
        }
        this.cdr.detectChanges();
      })
    );

    // Connection status
    this.subscriptions.push(
      this.audioPipelineService.status$.subscribe(status => {
        this.status = status;
        this.connectionStatus = this.getConnectionStatusText(status);
        this.cdr.detectChanges();
      })
    );

    // Current session
    this.subscriptions.push(
      this.audioPipelineService.currentSession$.subscribe(session => {
        this.currentSession = session;
        if (session) {
          this.audioResults = session.transcriptions || [];
          this.totalTranscriptions = this.audioResults.length;
        } else {
          this.audioResults = [];
          this.totalTranscriptions = 0;
        }
        this.cdr.detectChanges();
      })
    );

    // Real-time audio data
    this.subscriptions.push(
      this.audioPipelineService.audioData$.subscribe(audioData => {
        console.log('New transcription received:', audioData);
        this.lastTranscriptionTime = audioData.timestamp;
        
        // Auto-scroll to latest transcription
        setTimeout(() => {
          this.scrollToLatestTranscription();
        }, 100);
        
        this.cdr.detectChanges();
      })
    );
  }

  private getConnectionStatusText(status: string): string {
    switch (status) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'recording': return 'Recording';
      case 'error': return 'Connection Error';
      default: return 'Unknown Status';
    }
  }

  async startCall(): Promise<void> {
    if (!this.microphonePermission) {
      alert('Microphone permission required for call recording');
      return;
    }

    this.isProcessing = true;
    this.callStartTime = Date.now();
    
    try {
      // Start audio capture
      await this.startAudioCapture();
      
      // Start the pipeline service
      this.audioPipelineService.startCall().subscribe({
        next: response => {
          console.log('Call started successfully:', response);
          this.isProcessing = false;
          this.isAudioStreaming = true;
          this.showNotification('Call started successfully', 'success');
        },
        error: err => {
          console.error('Error starting call:', err);
          this.isProcessing = false;
          this.stopAudioCapture();
          this.showNotification('Failed to start call: ' + err.message, 'error');
        }
      });
    } catch (error) {
      console.error('Error starting audio capture:', error);
      this.isProcessing = false;
      this.showNotification('Failed to access microphone', 'error');
    }
  }

  private async startAudioCapture(): Promise<void> {
    try {
      // Get audio stream
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      // Set up audio context for level monitoring
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.audioStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Start audio level monitoring
      this.startAudioLevelMonitoring();

      // Set up MediaRecorder for sending data
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.sendAudioData(event.data);
        }
      };

      // Start recording with time slices
      this.mediaRecorder.start(1000); // Send data every 1 second

    } catch (error) {
      console.error('Error starting audio capture:', error);
      throw error;
    }
  }

private startAudioLevelMonitoring(): void {
  this.audioLevelInterval = setInterval(() => {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i];
      }
      const average = sum / this.dataArray.length;
      this.audioLevel = Math.round((average / 255) * 100);

      this.cdr.detectChanges();
    }
  }, 100);
}


  private sendAudioData(audioBlob: Blob): void {
    // Convert blob to base64 and send to backend
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      // You can send this to your backend via WebSocket or HTTP
      console.log('Audio data ready to send:', base64Audio.substring(0, 100) + '...');
      
      // Example: Send to your audio pipeline service
      // this.audioPipelineService.sendAudioData(base64Audio);
    };
    reader.readAsDataURL(audioBlob);
  }

  stopCall(): void {
    this.isProcessing = true;
    this.stopAudioCapture();
    
    this.audioPipelineService.endCall().subscribe({
      next: response => {
        console.log('Call ended successfully:', response);
        this.isProcessing = false;
        this.isAudioStreaming = false;
        this.audioLevel = 0;
        this.showNotification('Call stopped successfully', 'success');
      },
      error: err => {
        console.error('Error stopping call:', err);
        this.isProcessing = false;
        this.showNotification('Failed to stop call: ' + err.message, 'error');
      }
    });
  }

  private stopAudioCapture(): void {
    if (this.audioLevelInterval) {
      clearInterval(this.audioLevelInterval);
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.dataArray = null;
    this.mediaRecorder = null;
  }

  endCall(): void {
    this.isProcessing = true;
    this.stopAudioCapture();
    
    this.audioPipelineService.endCall().subscribe({
      next: response => {
        console.log('Call ended successfully:', response);
        this.isProcessing = false;
        this.callStartTime = 0;
        this.isAudioStreaming = false;
        this.audioLevel = 0;
        this.showNotification('Call ended successfully', 'success');
      },
      error: err => {
        console.error('Error ending call:', err);
        this.isProcessing = false;
        this.showNotification('Failed to end call: ' + err.message, 'error');
      }
    });
  }

  pauseCall(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
    this.audioPipelineService.pauseCall();
    this.showNotification('Call paused', 'info');
  }

  resumeCall(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
    this.audioPipelineService.resumeCall();
    this.showNotification('Call resumed', 'info');
  }

  checkStatus(): void {
    this.audioPipelineService.getStatus().subscribe({
      next: response => {
        console.log('Status check result:', response);
        this.showNotification('Status check completed', 'info');
      },
      error: err => {
        console.error('Error getting status:', err);
        this.showNotification('Status check failed', 'error');
      }
    });
  }

  getSpeakerClass(speaker: string): string {
    if (speaker?.includes('AGENT') || speaker?.includes('00')) return 'speaker-agent';
    if (speaker?.includes('CUSTOMER') || speaker?.includes('01')) return 'speaker-customer';
    return 'speaker-unknown';
  }

  getSpeakerDisplayName(speaker: string): string {
    if (speaker?.includes('AGENT') || speaker?.includes('00')) return 'Agent';
    if (speaker?.includes('CUSTOMER') || speaker?.includes('01')) return 'Customer';
    return speaker || 'Unknown';
  }

  getSentimentClass(sentiment: string): string {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'sentiment-positive';
      case 'negative':
        return 'sentiment-negative';
      case 'neutral':
      case 'natural':
        return 'sentiment-neutral';
      default:
        return 'sentiment-unknown';
    }
  }

  getSentimentDisplayText(sentimentObj: any): string {
    if (typeof sentimentObj === 'string') {
      return sentimentObj;
    }
    return sentimentObj?.text || sentimentObj?.voice || 'Unknown';
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private startTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const startTime = this.callStartTime || Date.now();
    
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      this.callTimer = this.formatDuration(elapsed);
      this.cdr.detectChanges();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private scrollToLatestTranscription(): void {
    const transcriptionList = document.querySelector('.transcription-list');
    if (transcriptionList) {
      transcriptionList.scrollTop = transcriptionList.scrollHeight;
    }
  }

  trackByTimestamp(index: number, item: AudioProcessingResponse): string {
    return item.timestamp + '_' + index;
  }

  clearAudioResults(): void {
    this.audioResults = [];
    this.totalTranscriptions = 0;
    
    // Also clear from current session
    if (this.currentSession) {
      this.currentSession.transcriptions = [];
    }
    
    this.showNotification('Transcriptions cleared', 'info');
  }

  exportTranscriptions(): void {
    if (this.audioResults.length === 0) {
      this.showNotification('No transcriptions to export', 'warning');
      return;
    }

    const transcriptionsText = this.audioResults.map(result => {
      const speaker = this.getSpeakerDisplayName(result.speaker);
      const sentiment = this.getSentimentDisplayText(result.sentiment);
      const score = result.sentiment?.score?.toFixed(2) || 'N/A';
      
      return `[${result.timestamp}] ${speaker}: ${result.text}
Sentiment: ${sentiment} (${score})
Voice Features: Pitch: ${result.voice_features?.pitch?.toFixed(2)}, Energy: ${result.voice_features?.energy?.toFixed(2)}, Rate: ${result.voice_features?.rate?.toFixed(2)}
---`;
    }).join('\n');

    const blob = new Blob([transcriptionsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `call_transcription_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.showNotification('Transcriptions exported successfully', 'success');
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    // Simple notification - you can replace this with a proper notification service
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // You could also implement a toast notification here
    // For now, we'll just update a property that could be shown in the template
  }

  // Utility methods for template
  getCallDurationInSeconds(): number {
    if (!this.callStartTime) return 0;
    return Math.floor((Date.now() - this.callStartTime) / 1000);
  }

  getAverageWordsPerMinute(): number {
    if (!this.currentSession || this.audioResults.length === 0) return 0;
    
    const totalWords = this.audioResults.reduce((sum, result) => {
      return sum + (result.text?.split(' ').length || 0);
    }, 0);
    
    const durationMinutes = this.getCallDurationInSeconds() / 60;
    return durationMinutes > 0 ? Math.round(totalWords / durationMinutes) : 0;
  }

  getRecentTranscriptions(count: number = 5): AudioProcessingResponse[] {
    return this.audioResults.slice(-count);
  }
}