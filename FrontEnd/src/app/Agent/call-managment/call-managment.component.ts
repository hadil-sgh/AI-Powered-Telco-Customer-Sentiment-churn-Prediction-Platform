import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AudioStreamService } from '../../services/audio-stream.service';
import {
  AudioAnalysisService,
  AudioAnalysisRequestDto,
} from '../../services/audio-analysis.service';
import { Customer } from '../../models/customer';
import { ChurnPredictionService } from '../../services/churn-prediction.service';
import { ChurnPrediction } from '../../models/churn-prediction';

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

  // Customer data - will be populated from Spring Boot via router navigation
  customerData: Customer | null = null;

  // Real churn prediction data from API
  churnData: ChurnPrediction | null = null;
  isLoadingChurn = false;
  churnError = '';

  // Notes data
  callNotes = '';
  savedNotes: Array<{ timestamp: string; content: string; agent: string }> = [];

  // Timer for session duration
  private sessionTimer: any;
  private startTime: Date | null = null;

  constructor(
    private audioStreamService: AudioStreamService,
    private audioAnalysisService: AudioAnalysisService,
    private churnService: ChurnPredictionService,
    private router: Router
  ) {
    this.currentSessionId = this.generateSessionId();
  }

  ngOnInit() {
    this.setupAudioStreamSubscriptions();
    this.checkBrowserSupport();
    this.loadSelectedCustomer();
  }

  loadSelectedCustomer() {
    // Check if customer data was passed via router state
    const currentNavigation = this.router.getCurrentNavigation();
    const routerState = window.history.state;

    if (routerState && routerState.selectedCustomer) {
      const selectedCustomer: Customer = routerState.selectedCustomer;
      this.updateCustomerData(selectedCustomer);
      console.log('Customer data received from dashboard:', selectedCustomer);
    } else if (
      currentNavigation?.extras?.state &&
      currentNavigation.extras.state['selectedCustomer']
    ) {
      const selectedCustomer: Customer =
        currentNavigation.extras.state['selectedCustomer'];
      this.updateCustomerData(selectedCustomer);
      console.log(
        'Customer data received from dashboard via navigation:',
        selectedCustomer
      );
    }
  }

  updateCustomerData(customer: Customer) {
    // Update the customerData object with real customer information from Spring Boot
    this.customerData = {
      customerID: customer.customerID,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      gender: customer.gender,
      SeniorCitizen: customer.SeniorCitizen,
      Partner: customer.Partner,
      Dependents: customer.Dependents,
      tenure: customer.tenure,
      PhoneService: customer.PhoneService,
      MultipleLines: customer.MultipleLines,
      InternetService: customer.InternetService,
      OnlineSecurity: customer.OnlineSecurity,
      OnlineBackup: customer.OnlineBackup,
      DeviceProtection: customer.DeviceProtection,
      TechSupport: customer.TechSupport,
      StreamingTV: customer.StreamingTV,
      StreamingMovies: customer.StreamingMovies,
      Contract: customer.Contract,
      PaperlessBilling: customer.PaperlessBilling,
      PaymentMethod: customer.PaymentMethod,
      MonthlyCharges: customer.MonthlyCharges,
      TotalCharges: customer.TotalCharges,
      // Removed churnPrediction - we only use API response now
    };

    console.log(
      '✅ Customer data updated from Spring Boot:',
      this.customerData
    );

    // Load real churn prediction for this customer from API
    this.loadChurnPrediction(customer.customerID?.toString() || '');
  }

  /**
   * Load real churn prediction from Spring Boot API
   */
  loadChurnPrediction(customerId: string) {
    if (!customerId) {
      console.warn('No customer ID provided for churn prediction');
      return;
    }

    this.isLoadingChurn = true;
    this.churnError = '';

    console.log(`🔍 Loading churn prediction for customer: ${customerId}`);

    this.churnService.getChurnPrediction(parseInt(customerId)).subscribe({
      next: (churnPrediction: ChurnPrediction) => {
        this.churnData = churnPrediction;
        this.isLoadingChurn = false;
        console.log('✅ Churn prediction loaded:', churnPrediction);
      },
      error: (error) => {
        console.error('❌ Error loading churn prediction:', error);
        this.churnError = 'Failed to load churn prediction from API';
        this.isLoadingChurn = false;
        this.churnData = null; // Don't show fallback data
      }
    });
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

  // Simplified methods to work directly with API response
  getChurnRiskColor(): string {
    if (!this.churnData) return 'text-gray-600';
    
    // Use the prediction directly from API
    if (this.churnData.Prediction === 'No') return 'text-success';
    if (this.churnData.Prediction === 'Yes') return 'text-danger';
    return 'text-warning';
  }

  getChurnRiskBg(): string {
    if (!this.churnData) return 'bg-light';
    
    // Use the prediction directly from API
    if (this.churnData.Prediction === 'No') return 'bg-label-success';
    if (this.churnData.Prediction === 'Yes') return 'bg-label-danger';
    return 'bg-label-warning';
  }

  getChurnPredictionText(): string {
    if (!this.churnData) return 'Loading...';
    
    // Use the prediction directly from API
    if (this.churnData.Prediction === 'No') return 'Not Likely to Churn';
    if (this.churnData.Prediction === 'Yes') return 'Likely to Churn';
    return 'Unknown';
  }

  getChurnScore(): number {
    if (!this.churnData || !this.churnData.ChurnScore) return 0;
    
    // Extract percentage from string like "25.00%"
    const scoreStr = this.churnData.ChurnScore.replace('%', '');
    return parseFloat(scoreStr) || 0;
  }

  getChurnRiskLevel(): string {
    if (!this.churnData) return 'Unknown';
    
    // Use the prediction directly from API
    if (this.churnData.Prediction === 'No') return 'Low';
    if (this.churnData.Prediction === 'Yes') return 'High';
    return 'Medium';
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
