import { Component, OnInit, OnDestroy } from '@angular/core';
import { AudioStreamService } from '../../services/audio-stream.service';
import {
  AudioAnalysisService,
  AudioAnalysisRequestDto,
} from '../../services/audio-analysis.service';

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

@Component({
  selector: 'app-call-managment',
  templateUrl: './call-managment.component.html',
  styleUrls: ['./call-managment.component.scss'],
})
export class CallManagmentComponent implements OnInit, OnDestroy {
  isAnalyzing = false;
  isConnected = false;
  currentSessionId = '';
  analysisResults: AudioAnalysisResult[] = [];
  connectionStatus = 'Disconnected';
  lastError = '';

  // Enhanced audio visualization
  audioLevel = 0;
  audioQuality = 'Unknown';

  // Enhanced statistics
  sessionStats = {
    duration: 0,
    chunksProcessed: 0,
    speechDetected: 0,
    avgVolume: 0,
    peakVolume: 0,
  };

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

  // Timer for session duration
  private sessionTimer: any;
  private startTime: Date | null = null;

  constructor(
    private audioStreamService: AudioStreamService,
    private audioAnalysisService: AudioAnalysisService
  ) {
    this.currentSessionId = this.generateSessionId();
  }

  ngOnInit() {
    this.setupAudioStreamSubscriptions();
    this.checkBrowserSupport();
  }

  ngOnDestroy() {
    this.stopAnalysis();
    this.audioStreamService.disconnect();
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
  }

  private checkBrowserSupport() {
    if (!AudioStreamService.isSupported()) {
      this.lastError =
        'Your browser does not support the required audio features';
      this.connectionStatus = 'Unsupported Browser';
    }
  }

  private setupAudioStreamSubscriptions() {
    // Subscribe to connection status
    this.audioStreamService.connectionStatus$.subscribe((status) => {
      this.connectionStatus = status;
      this.isConnected = status === 'Connected' || status === 'Recording';

      if (status === 'Recording' && !this.sessionTimer) {
        this.startSessionTimer();
      } else if (status !== 'Recording' && this.sessionTimer) {
        this.stopSessionTimer();
      }
    });

    // Subscribe to analysis results
    this.audioStreamService.analysisResults$.subscribe((result) => {
      if (result) {
        this.processAnalysisResult(result);
      }
    });

    // Subscribe to audio level for visualization
    this.audioStreamService.audioLevel$.subscribe((level) => {
      this.audioLevel = level;
      this.updateAudioQuality(level);
    });

    // Subscribe to errors
    this.audioStreamService.error$.subscribe((error) => {
      this.lastError = error;
      console.error('Audio service error:', error);
    });
  }

  private processAnalysisResult(result: AudioAnalysisResult) {
    // Skip empty or very short text
    if (!result.text || result.text.trim().length < 3) {
      console.log('Skipping result with short/empty text:', result.text);
      return;
    }

    // Deduplication: Check if this text is too similar to recent results
    const recentTexts = this.analysisResults
      .slice(0, 5)
      .map((r) => r.text.toLowerCase().trim());
    const currentText = result.text.toLowerCase().trim();

    // Skip if this text is a substring of a recent result or vice versa
    const isDuplicate = recentTexts.some((recentText) => {
      return (
        currentText.includes(recentText) || recentText.includes(currentText)
      );
    });

    if (isDuplicate) {
      console.log('Skipping duplicate/overlapping result:', result.text);
      return;
    }

    console.log('✅ Processing unique analysis result:', result.text);

    // 🔄 NEW: Save to Spring Boot backend
    this.saveToSpringBoot(result);

    // Add to beginning of array for newest first
    this.analysisResults.unshift(result);

    // Keep only last 50 results for performance (reduced from 100)
    if (this.analysisResults.length > 50) {
      this.analysisResults = this.analysisResults.slice(0, 50);
    }

    // Update session statistics
    if (result.audioStats) {
      this.sessionStats = {
        duration: this.getSessionDuration(),
        chunksProcessed: result.audioStats.chunks_processed,
        speechDetected: result.audioStats.chunks_with_speech,
        avgVolume: result.audioStats.avg_volume,
        peakVolume: result.audioStats.peak_volume,
      };
    }

    // Update churn prediction if needed (simulate dynamic update)
    this.updateChurnPrediction(result);
  }

  /**
   * 💾 Save analysis result to Spring Boot backend
   * Flow: Python API ➝ Angular ➝ Spring Boot (this method)
   */
  private saveToSpringBoot(result: AudioAnalysisResult) {
    try {
      // Convert AudioAnalysisResult to AudioAnalysisRequestDto
      const requestDto: AudioAnalysisRequestDto = {
        timestamp: result.timestamp,
        speaker: result.speaker,
        text: result.text,
        sessionId: result.sessionId,
        analysisType: result.analysisType,
        sentiment: result.sentiment,
        voiceFeatures: result.voiceFeatures,
        emotionAnalysis: result.emotionAnalysis,
        audioStats: result.audioStats,
        // You can add callRecordId if you have one
        // callRecordId: this.currentCallRecordId
      };

      console.log(
        '💾 Saving to Spring Boot:',
        result.text.substring(0, 50) + '...'
      );

      // Save asynchronously - don't block UI if backend is slow
      this.audioAnalysisService.saveAnalysisResult(requestDto).subscribe({
        next: (savedResult) => {
          console.log(
            '✅ Saved to Spring Boot successfully, ID:',
            savedResult.id
          );
        },
        error: (error) => {
          console.error('❌ Error saving to Spring Boot:', error);
          // Don't show error to user - this shouldn't interrupt real-time flow
          // Just log it for debugging
        },
      });
    } catch (error) {
      console.error('❌ Error preparing data for Spring Boot:', error);
    }
  }

  private updateChurnPrediction(result: AudioAnalysisResult) {
    // Simulate dynamic churn prediction update based on sentiment
    if (result.emotionAnalysis) {
      const emotion = result.emotionAnalysis.primary_emotion;
      const confidence = result.emotionAnalysis.confidence;

      if (
        (emotion === 'ANGRY' || emotion === 'FRUSTRATED') &&
        confidence > 0.7
      ) {
        // Increase churn risk
        this.churnData.score = Math.min(this.churnData.score + 0.05, 0.95);
        if (this.churnData.score > 0.7) {
          this.churnData.risk = 'High';
          this.churnData.churnScore = 'High';
          this.churnData.predictionText = 'Likely to Churn';
        } else if (this.churnData.score > 0.4) {
          this.churnData.risk = 'Medium';
          this.churnData.churnScore = 'Medium';
          this.churnData.predictionText = 'Moderate Risk';
        }
      } else if (
        (emotion === 'SATISFIED' || emotion === 'ENTHUSIASTIC') &&
        confidence > 0.6
      ) {
        // Decrease churn risk
        this.churnData.score = Math.max(this.churnData.score - 0.02, 0.05);
        if (this.churnData.score < 0.3) {
          this.churnData.risk = 'Low';
          this.churnData.churnScore = 'Low';
          this.churnData.predictionText = 'Not Likely to Churn';
        }
      }
    }
  }

  private updateAudioQuality(level: number) {
    if (level < 0.1) {
      this.audioQuality = 'Very Low';
    } else if (level < 0.3) {
      this.audioQuality = 'Low';
    } else if (level < 0.6) {
      this.audioQuality = 'Good';
    } else if (level < 0.8) {
      this.audioQuality = 'High';
    } else {
      this.audioQuality = 'Excellent';
    }
  }

  private startSessionTimer() {
    this.startTime = new Date();
    this.sessionTimer = setInterval(() => {
      this.sessionStats.duration = this.getSessionDuration();
    }, 1000);
  }

  private stopSessionTimer() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  private getSessionDuration(): number {
    if (!this.startTime) return 0;
    return Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000);
  }

  async startAnalysis() {
    try {
      this.connectionStatus = 'Connecting...';
      this.lastError = '';

      // Connect to WebSocket
      await this.audioStreamService.connect();

      // Start audio streaming
      await this.audioStreamService.startRecording(this.currentSessionId);

      this.isAnalyzing = true;
      this.connectionStatus = 'Analyzing...';

      console.log('Enhanced analysis started');
    } catch (error) {
      console.error('Error starting analysis:', error);
      this.connectionStatus = 'Error: ' + error;
      this.lastError = 'Failed to start analysis: ' + error;
    }
  }

  stopAnalysis() {
    if (this.isAnalyzing) {
      this.audioStreamService.stopRecording();
      this.isAnalyzing = false;
      this.connectionStatus = 'Connected';
      console.log('Enhanced analysis stopped');
    }
  }

  clearResults() {
    this.analysisResults = [];
    this.sessionStats = {
      duration: 0,
      chunksProcessed: 0,
      speechDetected: 0,
      avgVolume: 0,
      peakVolume: 0,
    };
  }

  testAudioQuality() {
    if (this.isAnalyzing) {
      console.log('⚠️ Already analyzing, cannot test audio quality');
      return;
    }

    console.log('🎤 Testing audio quality for 3 seconds...');

    // Start a 3-second test analysis
    this.startAnalysis();

    setTimeout(() => {
      this.stopAnalysis();
      console.log(
        '✅ Audio quality test completed - check console and server logs for quality metrics'
      );
    }, 3000);
  }

  testConnection() {
    this.audioStreamService.sendTestMessage(
      'Enhanced pipeline test from frontend'
    );
  }

  // Enhanced sentiment analysis methods
  getSentimentClass(sentiment: string): string {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'satisfied':
      case 'enthusiastic':
        return 'text-green-600';
      case 'negative':
      case 'disappointed':
        return 'text-red-600';
      case 'angry':
      case 'furious':
        return 'text-red-800';
      case 'frustrated':
      case 'irritated':
        return 'text-orange-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }

  getSentimentBadgeClass(sentiment: string): string {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'satisfied':
      case 'enthusiastic':
        return 'bg-success';
      case 'negative':
      case 'disappointed':
      case 'angry':
      case 'furious':
      case 'frustrated':
      case 'irritated':
        return 'bg-danger';
      case 'neutral':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  getSentimentIcon(sentiment: string): string {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'satisfied':
        return '😊';
      case 'enthusiastic':
        return '🎉';
      case 'negative':
      case 'disappointed':
        return '😞';
      case 'angry':
      case 'furious':
        return '😡';
      case 'frustrated':
        return '😤';
      case 'irritated':
        return '😠';
      case 'neutral':
        return '😐';
      default:
        return '🤔';
    }
  }

  getAudioLevelClass(): string {
    if (this.audioLevel > 0.8) return 'bg-red-500';
    if (this.audioLevel > 0.6) return 'bg-orange-500';
    if (this.audioLevel > 0.3) return 'bg-yellow-500';
    if (this.audioLevel > 0.1) return 'bg-green-500';
    return 'bg-gray-300';
  }

  getAudioQualityClass(): string {
    switch (this.audioQuality) {
      case 'Excellent':
      case 'High':
        return 'text-green-600';
      case 'Good':
        return 'text-blue-600';
      case 'Low':
        return 'text-orange-600';
      case 'Very Low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  private generateSessionId(): string {
    return (
      'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  downloadResults() {
    const enhancedData = {
      session: {
        id: this.currentSessionId,
        duration: this.sessionStats.duration,
        timestamp: new Date().toISOString(),
      },
      statistics: this.sessionStats,
      results: this.analysisResults,
      customer: this.customerData,
      churnPrediction: this.churnData,
    };

    const dataStr = JSON.stringify(enhancedData, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `enhanced_audio_analysis_${new Date().toISOString()}.json`;

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
        result.sentiment.text.toLowerCase() === sentiment.toLowerCase() ||
        result.sentiment.voice.toLowerCase() === sentiment.toLowerCase()
    ).length;
  }

  getEmotionCount(emotion: string): number {
    return this.analysisResults.filter(
      (result) =>
        result.emotionAnalysis?.primary_emotion.toLowerCase() ===
        emotion.toLowerCase()
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
    return this.churnData.predictionText;
  }

  getServiceStatus(service: string): string {
    return service === 'Yes'
      ? 'Active'
      : service === 'No'
      ? 'Inactive'
      : service;
  }

  // Enhanced emotion analysis display
  getEmotionDetails(result: AudioAnalysisResult): string {
    if (!result.emotionAnalysis) return '';

    const details = [
      `Confidence: ${(result.emotionAnalysis.confidence * 100).toFixed(1)}%`,
      `Voice Intensity: ${(
        result.emotionAnalysis.voice_intensity * 100
      ).toFixed(1)}%`,
    ];

    if (result.emotionAnalysis.escalation_level > 0) {
      details.push(
        `Escalation: ${(result.emotionAnalysis.escalation_level * 100).toFixed(
          1
        )}%`
      );
    }

    return details.join(' | ');
  }

  getEmotionReasoning(result: AudioAnalysisResult): string {
    if (!result.emotionAnalysis?.reasoning) return '';
    return result.emotionAnalysis.reasoning.join('; ');
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getConnectionInfo(): any {
    return this.audioStreamService.getConnectionInfo();
  }
}
