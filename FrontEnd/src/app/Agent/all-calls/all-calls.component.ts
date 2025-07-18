import { Component, OnInit, OnDestroy } from '@angular/core';
import { AudioStreamService } from '../../services/audio-stream.service';

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

@Component({
  selector: 'app-all-calls',
  templateUrl: './all-calls.component.html',
  styleUrls: ['./all-calls.component.scss'],
})
export class AllCallsComponent implements OnInit, OnDestroy {
  isRecording = false;
  isConnected = false;
  currentSessionId = '';
  analysisResults: AudioAnalysisResult[] = [];
  connectionStatus = 'Disconnected';

  // Audio visualization
  audioLevel = 0;

  constructor(private audioStreamService: AudioStreamService) {
    this.currentSessionId = this.generateSessionId();
  }

  ngOnInit() {
    this.setupAudioStreamSubscriptions();
  }

  ngOnDestroy() {
    this.stopRecording();
    this.audioStreamService.disconnect();
  }

  private setupAudioStreamSubscriptions() {
    // Subscribe to connection status
    this.audioStreamService.connectionStatus$.subscribe((status) => {
      this.connectionStatus = status;
      this.isConnected = status === 'Connected';
    });

    // Subscribe to analysis results
    this.audioStreamService.analysisResults$.subscribe((result) => {
      if (result) {
        this.analysisResults.unshift(result); // Add to beginning of array
        // Keep only last 50 results for performance
        if (this.analysisResults.length > 50) {
          this.analysisResults = this.analysisResults.slice(0, 50);
        }
      }
    });

    // Subscribe to audio level for visualization
    this.audioStreamService.audioLevel$.subscribe((level) => {
      this.audioLevel = level;
    });
  }

  async startRecording() {
    try {
      this.connectionStatus = 'Connecting...';

      // Connect to WebSocket
      await this.audioStreamService.connect();

      // Start audio streaming
      await this.audioStreamService.startRecording(this.currentSessionId);

      this.isRecording = true;
      this.connectionStatus = 'Recording...';
    } catch (error) {
      console.error('Error starting recording:', error);
      this.connectionStatus = 'Error: ' + error;
    }
  }

  stopRecording() {
    if (this.isRecording) {
      this.audioStreamService.stopRecording();
      this.isRecording = false;
      this.connectionStatus = 'Connected';
    }
  }

  clearResults() {
    this.analysisResults = [];
  }

  getSentimentClass(sentiment: string): string {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'angry':
        return 'text-red-800';
      case 'frustrated':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  }

  getSentimentIcon(sentiment: string): string {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😞';
      case 'angry':
        return '😡';
      case 'frustrated':
        return '😤';
      case 'neutral':
        return '😐';
      default:
        return '🤔';
    }
  }

  getAudioLevelClass(): string {
    if (this.audioLevel > 0.7) return 'bg-red-500';
    if (this.audioLevel > 0.4) return 'bg-yellow-500';
    if (this.audioLevel > 0.1) return 'bg-green-500';
    return 'bg-gray-300';
  }

  private generateSessionId(): string {
    return (
      'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  downloadResults() {
    const dataStr = JSON.stringify(this.analysisResults, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `audio_analysis_${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  trackByTimestamp(index: number, result: AudioAnalysisResult): string {
    return result.timestamp + result.speaker;
  }

  getsentimentCount(sentiment: string): number {
    return this.analysisResults.filter(
      (result) =>
        result.sentiment.text.toLowerCase() === sentiment.toLowerCase()
    ).length;
  }
}
