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
  selector: 'app-call-managment',
  templateUrl: './call-managment.component.html',
  styleUrls: ['./call-managment.component.scss'],
})
export class CallManagmentComponent implements OnInit, OnDestroy {
  isRecording = false;
  isConnected = false;
  currentSessionId = '';
  analysisResults: AudioAnalysisResult[] = [];
  connectionStatus = 'Disconnected';

  // Audio visualization
  audioLevel = 0;

  // Active tab for middle component
  activeTab = 'call-analysis';

  // Sample customer data based on actual Customer entity
  customerData = {
    customerID: 12345,
    gender: 'Male',
    seniorCitizen: 0,
    partner: 'Yes',
    dependents: 'No',
    tenure: 24,
    phoneService: 'Yes',
    multipleLines: 'Yes',
    internetService: 'Fiber optic',
    onlineSecurity: 'Yes',
    onlineBackup: 'Yes',
    deviceProtection: 'Yes',
    techSupport: 'Yes',
    streamingTV: 'Yes',
    streamingMovies: 'Yes',
    contract: 'Month-to-month',
    paperlessBilling: 'Yes',
    paymentMethod: 'Electronic check',
    monthlyCharges: 89.5,
    totalCharges: 2148.5,
    // Display fields for UI
    name: 'Ahmed Ben Mohamed',
    phoneNumber: '+216 98 123 456',
    email: 'ahmed.benmohameed@email.com',
    status: 'Active',
  };

  // Sample churn prediction data based on actual ChurnPrediction entity
  churnData = {
    id: 1,
    prediction: 'No',
    predictionProbability: [0.77, 0.23],
    churnScore: 'Low',
    // Derived fields for UI
    score: 0.23,
    risk: 'Low',
    predictionText: 'Not Likely to Churn',
    factors: [
      { factor: 'Long tenure (24 months)', impact: 'Positive' },
      { factor: 'Multiple services', impact: 'Positive' },
      { factor: 'Regular payments', impact: 'Positive' },
    ],
  };

  // Notes data
  callNotes = '';
  savedNotes: Array<{ timestamp: string; content: string; agent: string }> = [];

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

  // New methods for the enhanced interface
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  saveNote() {
    if (this.callNotes.trim()) {
      this.savedNotes.unshift({
        timestamp: new Date().toLocaleString(),
        content: this.callNotes.trim(),
        agent: 'Current Agent', // Replace with actual agent name
      });
      this.callNotes = '';
    }
  }

  getChurnRiskColor(): string {
    if (this.churnData.score < 0.3) return 'text-green-600';
    if (this.churnData.score < 0.7) return 'text-yellow-600';
    return 'text-red-600';
  }

  getChurnRiskBg(): string {
    if (this.churnData.score < 0.3) return 'bg-green-100';
    if (this.churnData.score < 0.7) return 'bg-yellow-100';
    return 'bg-red-100';
  }

  getChurnPredictionText(): string {
    return this.churnData.prediction === 'No'
      ? 'Not Likely to Churn'
      : 'Likely to Churn';
  }

  getServiceStatus(service: string): string {
    return service === 'Yes'
      ? 'Active'
      : service === 'No'
      ? 'Inactive'
      : service;
  }
}
