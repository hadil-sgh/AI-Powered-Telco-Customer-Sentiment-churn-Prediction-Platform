import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';

import { CallRecord } from '../../models/call-record';
import { AudioAnalysisResponse } from '../../models/audio-analysis-response';

import { TokenService } from '../../services/token.service';
import { forkJoin, Subscription } from 'rxjs';

import { DailyStats } from 'src/app/models/daily-stats';
import { SentimentPoint } from 'src/app/models/SentimentPoint';
import { Performance } from '../../models/performance';
import { PerformancesService } from 'src/app/services/perfomances.service';
import { DailyStatsService } from 'src/app/services/daily-stats.service';
import { SentimentPointService } from 'src/app/services/sentiment-point.service';

interface OverallStats {
  averageScore: number;
  averageSentiment: number;
  totalCalls: number;
  callsGrowth: number;
}

interface ScoreDistribution {
  excellent: number;
  good: number;
  average: number;
  needsImprovement: number;
}

interface SentimentStats {
  positive: number;
  neutral: number;
  negative: number;
}

interface CoachingTip {
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface DateRange {
  from: string;
  to: string;
}

interface EnhancedCallRecord extends CallRecord {
  averageSentimentScore?: number;
  callDate?: Date;
}

@Component({
  selector: 'app-agent-performance',
  templateUrl: './agent-performance.component.html',
  styleUrls: ['./agent-performance.component.scss'],
})
export class AgentPerformanceComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('performanceChart', { static: false })
  performanceChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sentimentChart', { static: false })
  sentimentChart!: ElementRef<HTMLCanvasElement>;

  // Filter properties
  selectedTimePeriod: string = 'month';
  selectedSentimentRange: string = 'all';
  selectedPerformanceRange: string = 'all';
  dateRange: DateRange = {
    from: '',
    to: '',
  };

  // Data properties
  performanceRecords: Performance[] = [];
  filteredPerformanceRecords: Performance[] = [];
  paginatedPerformanceRecords: Performance[] = [];

  // Statistics
  overallStats: OverallStats = {
    averageScore: 0,
    averageSentiment: 0,
    totalCalls: 0,
    callsGrowth: 0,
  };

  scoreDistribution: ScoreDistribution = {
    excellent: 0,
    good: 0,
    average: 0,
    needsImprovement: 0,
  };

  sentimentStats: SentimentStats = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  coachingTips: CoachingTip[] = [];

  // UI properties
  viewMode: 'table' | 'cards' = 'table';
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  chartsLoading: boolean = true;

  // Chart instances
  private performanceChartInstance: any;
  private sentimentChartInstance: any;

  // Modal data properties
  selectedCallRecord: EnhancedCallRecord | null = null;
  selectedPerformanceRecord: Performance | null = null;

  // Real data properties
  dailyStats: DailyStats[] = [];
  sentimentPoints: SentimentPoint[] = [];
  userEmail: string = '';
  private subscription = new Subscription();

  // Math reference for template
  Math = Math;

  constructor(
    private dailyStatsService: DailyStatsService,
    private performancesService: PerformancesService,
    private sentimentPointService: SentimentPointService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.initializeDateRange();
    this.userEmail = this.tokenService.getEmailFromToken();
    console.log('=== COMPONENT INITIALIZATION ===');
    console.log('User email from token:', this.userEmail);
    console.log('Token exists:', !!localStorage.getItem('token'));
    console.log('================================');
    this.loadRealData();
    this.generateCoachingTips();
    // Set charts as not loading initially
    this.chartsLoading = false;
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready with more delay to ensure DOM is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 1000);
  }

  ngOnDestroy(): void {
    // Clean up chart instances to prevent memory leaks
    if (this.performanceChartInstance) {
      this.performanceChartInstance.destroy();
    }
    if (this.sentimentChartInstance) {
      this.sentimentChartInstance.destroy();
    }
    // Clean up subscriptions
    this.subscription.unsubscribe();
  }

  private initializeDateRange(): void {
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    this.dateRange.from = oneMonthAgo.toISOString().split('T')[0];
    this.dateRange.to = now.toISOString().split('T')[0];
  }

  private loadRealData(): void {
    if (!this.userEmail) {
      console.error('User email not found');
      return;
    }

    console.log('Loading data for user email:', this.userEmail);

    // Show loading state
    this.chartsLoading = true;

    // Load all data in parallel
    const dataSubscription = forkJoin({
      dailyStats: this.dailyStatsService.getDailyStatsByAgent(this.userEmail),
      performances: this.performancesService.getAllPerformancesByAgent(
        this.userEmail
      ),
      sentimentPoints: this.sentimentPointService.getSentimentPointsByUser(
        this.userEmail
      ),
    }).subscribe({
      next: (data) => {
        console.log('=== SERVICE RESULTS ===');
        console.log('Daily Stats:', data.dailyStats);
        console.log('Daily Stats sample:', data.dailyStats?.[0]);
        console.log('Performance Records:', data.performances);
        console.log('Performance Records sample:', data.performances?.[0]);
        console.log('Sentiment Points:', data.sentimentPoints);
        console.log('Sentiment Points sample:', data.sentimentPoints?.[0]);

        // Debug: Check data relationships
        if (data.performances?.[0] && data.sentimentPoints?.[0]) {
          console.log(
            'First performance call ID:',
            data.performances[0].callTranscripts?.id
          );
          console.log(
            'First sentiment point call ID:',
            data.sentimentPoints[0].call?.id
          );
        }
        console.log('=======================');

        this.dailyStats = data.dailyStats;
        this.performanceRecords = data.performances;
        this.sentimentPoints = data.sentimentPoints;

        // Process and calculate statistics
        this.calculateStatistics();
        this.filterPerformanceRecords();
        this.chartsLoading = false;

        // Initialize charts with real data only once
        if (!this.performanceChartInstance && !this.sentimentChartInstance) {
          setTimeout(() => {
            this.initializeCharts();
          }, 500);
        }
      },
      error: (error) => {
        console.error('=== ERROR LOADING DATA ===');
        console.error('Error details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('==========================');
        this.chartsLoading = false;
        // Keep data arrays empty - no fallback data
        // The UI should handle empty state gracefully
      },
    });

    this.subscription.add(dataSubscription);
  }

  getSentimentScoreForPerformance(performanceRecord: Performance): number {
    if (!performanceRecord) {
      console.log('No performance record provided');
      return 0;
    }

    // First try to find sentiment point by call ID from performance record
    if (performanceRecord.callTranscripts?.id) {
      const sentimentPoint = this.sentimentPoints.find(
        (sp) => sp.call?.id === performanceRecord.callTranscripts?.id
      );

      if (sentimentPoint?.sentimentScore !== undefined) {
        console.log(
          `Found sentiment point for call ID ${performanceRecord.callTranscripts.id}:`,
          sentimentPoint.sentimentScore
        );
        return sentimentPoint.sentimentScore;
      }
    }

    // Fallback: try to find by performance record ID if available
    const sentimentPointByPerformance = this.sentimentPoints.find(
      (sp) => sp.id === performanceRecord.id
    );

    if (sentimentPointByPerformance?.sentimentScore !== undefined) {
      console.log(
        `Found sentiment point by performance ID ${performanceRecord.id}:`,
        sentimentPointByPerformance.sentimentScore
      );
      return sentimentPointByPerformance.sentimentScore;
    }

    // Fallback: calculate from call transcripts if available
    if (performanceRecord.callTranscripts?.callTranscripts) {
      const callTranscripts = performanceRecord.callTranscripts.callTranscripts;
      const validSentiments = callTranscripts
        .filter((transcript) => transcript.sentiment?.score !== undefined)
        .map((transcript) => transcript.sentiment!.score!);

      if (validSentiments.length > 0) {
        const avgSentiment =
          validSentiments.reduce((sum, score) => sum + score, 0) /
          validSentiments.length;
        console.log(
          `Calculated sentiment from transcripts for performance ${performanceRecord.id}:`,
          avgSentiment
        );
        return avgSentiment;
      }
    }

    console.log(
      `No sentiment data found for performance record ${performanceRecord.id}`
    );
    return 0;
  }

  getCallSentimentScore(callRecord: CallRecord | undefined): number {
    if (!callRecord) return 0;

    // First check if the call has a direct sentimentPoint property
    if (callRecord.sentimentPoint?.sentimentScore !== undefined) {
      return callRecord.sentimentPoint.sentimentScore;
    }

    const enhancedRecord = callRecord as EnhancedCallRecord;
    if (enhancedRecord.averageSentimentScore !== undefined) {
      return enhancedRecord.averageSentimentScore;
    }

    // Find sentiment from sentiment points
    const sentimentPoint = this.sentimentPoints.find(
      (sp) => sp.call?.id === callRecord.id
    );

    if (sentimentPoint?.sentimentScore !== undefined) {
      return sentimentPoint.sentimentScore;
    }

    // Calculate average sentiment from call transcripts
    if (callRecord.callTranscripts && callRecord.callTranscripts.length > 0) {
      const sentimentScores = callRecord.callTranscripts
        .map((transcript) => transcript.sentiment?.score || 0)
        .filter((score) => score !== 0);

      if (sentimentScores.length > 0) {
        return (
          sentimentScores.reduce((sum, score) => sum + score, 0) /
          sentimentScores.length
        );
      }
    }

    return 0;
  }

  getCallDate(callRecord: CallRecord | undefined): Date | null {
    if (!callRecord) return null;

    const enhancedRecord = callRecord as EnhancedCallRecord;
    if (enhancedRecord.callDate) {
      return enhancedRecord.callDate;
    }

    if (callRecord.callDateTime) {
      return new Date(callRecord.callDateTime);
    }

    return null;
  }

  private calculateStatistics(): void {
    console.log('=== CALCULATING STATISTICS ===');
    console.log(
      'Performance Records for calculation:',
      this.filteredPerformanceRecords
    );
    console.log('Sentiment Points for calculation:', this.sentimentPoints);

    // Calculate Overall Performance Score (average from performance records)
    let averageScore = 0;
    if (this.filteredPerformanceRecords.length > 0) {
      const totalScore = this.filteredPerformanceRecords.reduce(
        (sum, record) => sum + (record.score || 0),
        0
      );
      averageScore = totalScore / this.filteredPerformanceRecords.length;
    }

    // Calculate Average Sentiment Score (average from sentiment points)
    let averageSentiment = 0;
    if (this.sentimentPoints.length > 0) {
      const totalSentiment = this.sentimentPoints.reduce(
        (sum, sp) => sum + (sp.sentimentScore || 0),
        0
      );
      averageSentiment = totalSentiment / this.sentimentPoints.length;
    }

    // Total Calls = number of sentiment points (each represents a call)
    const totalCalls = this.sentimentPoints.length;

    // Calculate growth and trend (using daily stats if available)
    let callsGrowth = 0;

    if (this.dailyStats.length > 1) {
      // Calculate growth (compare first vs last)
      const firstDayCalls = this.dailyStats[0].callsCompleted || 0;
      const lastDayCalls =
        this.dailyStats[this.dailyStats.length - 1].callsCompleted || 0;
      if (firstDayCalls > 0) {
        callsGrowth = ((lastDayCalls - firstDayCalls) / firstDayCalls) * 100;
      }
    }

    this.overallStats = {
      averageScore: averageScore,
      averageSentiment: averageSentiment,
      totalCalls: totalCalls,
      callsGrowth: callsGrowth,
    };

    console.log('Calculated Overall Stats:', this.overallStats);

    // Calculate score distribution from performance records (1-5 scale)
    if (this.filteredPerformanceRecords.length > 0) {
      const total = this.filteredPerformanceRecords.length;
      const excellent = this.filteredPerformanceRecords.filter(
        (r) => (r.score || 0) >= 4.5
      ).length;
      const good = this.filteredPerformanceRecords.filter(
        (r) => (r.score || 0) >= 3.5 && (r.score || 0) < 4.5
      ).length;
      const average = this.filteredPerformanceRecords.filter(
        (r) => (r.score || 0) >= 2.5 && (r.score || 0) < 3.5
      ).length;
      const needsImprovement = this.filteredPerformanceRecords.filter(
        (r) => (r.score || 0) < 2.5
      ).length;

      this.scoreDistribution = {
        excellent: (excellent / total) * 100,
        good: (good / total) * 100,
        average: (average / total) * 100,
        needsImprovement: (needsImprovement / total) * 100,
      };
    } else {
      this.scoreDistribution = {
        excellent: 0,
        good: 0,
        average: 0,
        needsImprovement: 0,
      };
    }

    // Calculate sentiment stats from sentiment points (0-1 scale)
    if (this.sentimentPoints.length > 0) {
      const total = this.sentimentPoints.length;
      const positive = this.sentimentPoints.filter(
        (sp) => (sp.sentimentScore || 0) >= 0.6
      ).length;
      const neutral = this.sentimentPoints.filter((sp) => {
        const sentiment = sp.sentimentScore || 0;
        return sentiment >= 0.4 && sentiment < 0.6;
      }).length;
      const negative = this.sentimentPoints.filter(
        (sp) => (sp.sentimentScore || 0) < 0.4
      ).length;

      this.sentimentStats = {
        positive: (positive / total) * 100,
        neutral: (neutral / total) * 100,
        negative: (negative / total) * 100,
      };
    } else {
      this.sentimentStats = {
        positive: 0,
        neutral: 0,
        negative: 0,
      };
    }

    console.log('Score Distribution:', this.scoreDistribution);
    console.log('Sentiment Stats:', this.sentimentStats);
    console.log('=== STATISTICS CALCULATION COMPLETE ===');
  }

  private generateCoachingTips(): void {
    // Remove static mock tips - these should come from a service or be generated based on performance data
    this.coachingTips = [];
  }

  private initializeCharts(): void {
    console.log('Initializing charts...');

    // Prevent multiple initializations
    if (this.performanceChartInstance || this.sentimentChartInstance) {
      console.log('Charts already initialized, skipping...');
      return;
    }

    if (typeof window !== 'undefined') {
      // Import Chart.js dynamically
      import('chart.js')
        .then((Chart) => {
          console.log('Chart.js loaded successfully');
          Chart.Chart.register(...Chart.registerables);

          // Check if canvas elements are available using both ViewChild and DOM query
          const performanceCanvas =
            this.performanceChart?.nativeElement ||
            (document.querySelector(
              'canvas[data-chart="performance"]'
            ) as HTMLCanvasElement);
          const sentimentCanvas =
            this.sentimentChart?.nativeElement ||
            (document.querySelector(
              'canvas[data-chart="sentiment"]'
            ) as HTMLCanvasElement);

          if (performanceCanvas) {
            console.log('Creating performance chart...');
            this.createPerformanceChart(Chart.Chart, performanceCanvas);
          } else {
            console.warn('Performance chart canvas not found');
          }

          if (sentimentCanvas) {
            console.log('Creating sentiment chart...');
            this.createSentimentChart(Chart.Chart, sentimentCanvas);
          } else {
            console.warn('Sentiment chart canvas not found');
          }

          console.log('Charts initialization completed');
        })
        .catch((error) => {
          console.error('Failed to load Chart.js:', error);
        });
    } else {
      console.warn('Window object not available');
    }
  }

  private createPerformanceChart(Chart: any, canvas?: HTMLCanvasElement): void {
    const canvasElement = canvas || this.performanceChart?.nativeElement;

    if (!canvasElement) {
      console.error('Performance chart canvas element not found');
      return;
    }

    try {
      const ctx = canvasElement.getContext('2d');
      if (!ctx) {
        console.error('Could not get 2D context from performance chart canvas');
        return;
      }

      // Generate sample data for the last 30 days
      const last30Days = this.generateLast30DaysData();
      console.log('Generated performance chart data:', last30Days.slice(0, 3)); // Log first 3 entries

      // Destroy existing chart if it exists
      if (this.performanceChartInstance) {
        this.performanceChartInstance.destroy();
      }

      this.performanceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: last30Days.map((d) => d.date),
          datasets: [
            {
              label: 'Performance Score',
              data: last30Days.map((d) => d.performance),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.1)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Average Score',
              data: Array(last30Days.length).fill(
                this.overallStats.averageScore
              ),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'transparent',
              borderDash: [5, 5],
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Performance Over Time',
            },
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function (context: any) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  if (label.includes('Score')) {
                    return `${label}: ${value.toFixed(2)} / 5`;
                  }
                  return `${label}: ${value}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              min: 0,
              max: 5,
              title: {
                display: true,
                text: 'Performance Score (1-5)',
              },
              ticks: {
                stepSize: 0.5,
                callback: function (value: number) {
                  return value.toFixed(1);
                },
              },
            },
            x: {
              title: {
                display: true,
                text: 'Date',
              },
            },
          },
          interaction: {
            intersect: false,
            mode: 'index',
          },
        },
      });

      console.log('Performance chart created successfully');
    } catch (error) {
      console.error('Error creating performance chart:', error);
    }
  }

  private createSentimentChart(Chart: any, canvas?: HTMLCanvasElement): void {
    const canvasElement = canvas || this.sentimentChart?.nativeElement;

    if (!canvasElement) {
      console.error('Sentiment chart canvas element not found');
      return;
    }

    try {
      const ctx = canvasElement.getContext('2d');
      if (!ctx) {
        console.error('Could not get 2D context from sentiment chart canvas');
        return;
      }

      // Generate sample sentiment data for the last 30 days
      const last30Days = this.generateLast30DaysData();
      console.log('Generated sentiment chart data:', last30Days.slice(0, 3)); // Log first 3 entries

      // Destroy existing chart if it exists
      if (this.sentimentChartInstance) {
        this.sentimentChartInstance.destroy();
      }

      this.sentimentChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: last30Days.map((d) => d.date),
          datasets: [
            {
              label: 'Positive Sentiment',
              data: last30Days.map((d) => d.positive),
              backgroundColor: 'rgba(40, 167, 69, 0.8)',
              borderColor: 'rgb(40, 167, 69)',
              borderWidth: 1,
            },
            {
              label: 'Neutral Sentiment',
              data: last30Days.map((d) => d.neutral),
              backgroundColor: 'rgba(255, 193, 7, 0.8)',
              borderColor: 'rgb(255, 193, 7)',
              borderWidth: 1,
            },
            {
              label: 'Negative Sentiment',
              data: last30Days.map((d) => d.negative),
              backgroundColor: 'rgba(220, 53, 69, 0.8)',
              borderColor: 'rgb(220, 53, 69)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Sentiment Distribution Over Time',
            },
            legend: {
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Percentage (%)',
              },
              stacked: true,
            },
            x: {
              title: {
                display: true,
                text: 'Date',
              },
              stacked: true,
            },
          },
          interaction: {
            intersect: false,
            mode: 'index',
          },
        },
      });

      console.log('Sentiment chart created successfully');
    } catch (error) {
      console.error('Error creating sentiment chart:', error);
    }
  }

  private generateLast30DaysData(): any[] {
    const data: any[] = [];
    console.log('Generating chart data from dailyStats:', this.dailyStats);

    if (this.dailyStats.length > 0) {
      // Use real daily stats data
      this.dailyStats.forEach((stat) => {
        if (stat.date) {
          const date = new Date(stat.date);
          // Fix: Use totalScore directly as it should already be in 1-5 scale
          // If totalScore represents sum of all scores, we need to average it
          const performance = stat.totalScore || 0; // Assuming totalScore is already averaged
          const sentiment = stat.averageSentiment || 0;

          console.log(
            `Date: ${date.toDateString()}, Performance: ${performance}, Sentiment: ${sentiment}`
          );

          // Convert sentiment score to percentages (assuming sentiment is 0-1 scale)
          const positive =
            sentiment >= 0.6 ? 60 + (sentiment - 0.6) * 100 : sentiment * 100;
          const negative = sentiment <= 0.4 ? (0.4 - sentiment) * 50 : 0;
          const neutral = 100 - positive - negative;

          data.push({
            date: date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            performance: Math.round(performance * 100) / 100,
            positive: Math.round(positive * 10) / 10,
            neutral: Math.round(neutral * 10) / 10,
            negative: Math.round(negative * 10) / 10,
          });
        }
      });
    } else {
      // No data available - return empty array instead of mock data
      console.log('No daily stats available, returning empty data');
    }

    console.log('Generated chart data:', data);
    return data;
  }

  // Filter and search methods
  onFilterChange(): void {
    this.filterPerformanceRecords();
    this.calculateStatistics();
    this.updateChartsData();
  }

  private updateChartsData(): void {
    // Update charts with new filtered data
    if (this.performanceChartInstance) {
      const newData = this.generateLast30DaysData();
      this.performanceChartInstance.data.labels = newData.map((d) => d.date);
      this.performanceChartInstance.data.datasets[0].data = newData.map(
        (d) => d.performance
      );
      this.performanceChartInstance.data.datasets[1].data = Array(
        newData.length
      ).fill(this.overallStats.averageScore);
      this.performanceChartInstance.update();
    }

    if (this.sentimentChartInstance) {
      const newData = this.generateLast30DaysData();
      this.sentimentChartInstance.data.labels = newData.map((d) => d.date);
      this.sentimentChartInstance.data.datasets[0].data = newData.map(
        (d) => d.positive
      );
      this.sentimentChartInstance.data.datasets[1].data = newData.map(
        (d) => d.neutral
      );
      this.sentimentChartInstance.data.datasets[2].data = newData.map(
        (d) => d.negative
      );
      this.sentimentChartInstance.update();
    }
  }

  filterPerformanceRecords(): void {
    let filtered = [...this.performanceRecords];

    // Apply sentiment filter
    if (this.selectedSentimentRange !== 'all') {
      filtered = filtered.filter((record) => {
        const sentiment = this.getSentimentScoreForPerformance(record);
        switch (this.selectedSentimentRange) {
          case 'positive':
            return sentiment >= 0.6; // Positive sentiment threshold
          case 'neutral':
            return sentiment >= 0.4 && sentiment < 0.6; // Neutral range
          case 'negative':
            return sentiment < 0.4; // Negative sentiment threshold
          default:
            return true;
        }
      });
    }

    // Apply performance filter
    if (this.selectedPerformanceRange !== 'all') {
      filtered = filtered.filter((record) => {
        const score = record.score || 0;
        switch (this.selectedPerformanceRange) {
          case 'excellent':
            return score >= 4.5; // 4.5-5 range
          case 'good':
            return score >= 3.5 && score < 4.5; // 3.5-4.49 range
          case 'average':
            return score >= 2.5 && score < 3.5; // 2.5-3.49 range
          case 'needs-improvement':
            return score < 2.5; // < 2.5 range
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.feedback?.toLowerCase().includes(term) ||
          record.callTranscripts?.id?.toString().includes(term)
      );
    }

    this.filteredPerformanceRecords = filtered;
    this.updatePagination();
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(
      this.filteredPerformanceRecords.length / this.pageSize
    );
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.updatePaginatedRecords();
  }

  private updatePaginatedRecords(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedPerformanceRecords = this.filteredPerformanceRecords.slice(
      startIndex,
      endIndex
    );
  }

  // UI interaction methods
  refreshData(): void {
    console.log('Manual refresh data triggered');
    this.loadRealData();
  }

  refreshCharts(): void {
    console.log('Manual chart refresh triggered');
    this.initializeCharts();
  }

  exportChart(): void {
    if (this.performanceChartInstance) {
      const link = document.createElement('a');
      link.download = `performance-chart-${
        new Date().toISOString().split('T')[0]
      }.png`;
      link.href = this.performanceChartInstance.toBase64Image();
      link.click();
    }
  }

  toggleChartType(): void {
    if (this.performanceChartInstance) {
      const currentType = this.performanceChartInstance.config.type;
      const newType = currentType === 'line' ? 'bar' : 'line';

      this.performanceChartInstance.config.type = newType;
      this.performanceChartInstance.update();
    }
  }

  exportPerformanceData(): void {
    // Convert performance records to CSV format
    const headers = [
      'Date',
      'Call ID',
      'Performance Score',
      'Sentiment Score',
      'Feedback',
    ];
    const csvData = this.filteredPerformanceRecords.map((record) => [
      this.getCallDate(record.callTranscripts)?.toLocaleDateString() || 'N/A',
      record.callTranscripts?.id || 'N/A',
      record.score || 'N/A',
      this.getCallSentimentScore(record.callTranscripts),
      `"${record.feedback?.replace(/"/g, '""') || 'N/A'}"`, // Escape quotes in CSV
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `agent-performance-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  changeView(view: 'table' | 'cards'): void {
    this.viewMode = view;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedRecords();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxPagesToShow / 2)
    );
    const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  viewCallDetails(callId: number | undefined): void {
    if (callId) {
      console.log('Viewing call details for call:', callId);
      // Find the call record by ID
      const record = this.performanceRecords.find(
        (p) => p.callTranscripts?.id === callId
      );
      if (record && record.callTranscripts) {
        this.selectedCallRecord = record.callTranscripts as EnhancedCallRecord;
        // Open modal using Bootstrap modal
        const modalElement = document.getElementById('callDetailsModal');
        if (modalElement) {
          const modal = new (window as any).bootstrap.Modal(modalElement);
          modal.show();
        }
      }
    }
  }

  viewFeedbackDetails(record: Performance): void {
    console.log('Viewing feedback details:', record);
    this.selectedPerformanceRecord = record;
    // Open modal using Bootstrap modal
    const modalElement = document.getElementById('feedbackDetailsModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Helper method to format duration if needed
  formatDuration(duration: any): string {
    if (!duration) return 'N/A';

    // Handle different duration formats
    if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Handle duration object with seconds property
    if (typeof duration === 'object' && duration.seconds !== undefined) {
      const totalSeconds = duration.seconds;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return 'N/A';
  }

  // Helper method to get customer name safely
  getCustomerName(customer: any): string {
    if (!customer) return 'N/A';
    return (
      customer.name || customer.customerName || customer.firstName || 'N/A'
    );
  }

  // Helper method to get customer phone safely
  getCustomerPhone(customer: any): string {
    if (!customer) return 'N/A';
    return (
      customer.phoneNumber || customer.phone || customer.contactNumber || 'N/A'
    );
  }

  // Helper method to get customer email safely
  getCustomerEmail(customer: any): string {
    if (!customer) return 'N/A';
    return customer.email || customer.emailAddress || 'N/A';
  }

  // Helper method to check call outcome safely
  isCallOutcome(outcome: any, target: string): boolean {
    if (!outcome) return false;
    const outcomeStr = outcome.toString().toUpperCase();
    const targetStr = target.toUpperCase();

    // Map different outcome variations
    switch (targetStr) {
      case 'PENDING':
        return (
          outcomeStr === 'PENDING' ||
          outcomeStr === 'IN_PROGRESS' ||
          outcomeStr === 'ONGOING'
        );
      case 'FAILED':
        return (
          outcomeStr === 'FAILED' ||
          outcomeStr === 'NO_ANSWER' ||
          outcomeStr === 'DROPPED'
        );
      case 'ESCALATED':
        return outcomeStr === 'ESCALATED' || outcomeStr === 'TRANSFERRED';
      case 'SUCCESSFUL':
        return (
          outcomeStr === 'SUCCESSFUL' ||
          outcomeStr === 'RESOLVED' ||
          outcomeStr === 'COMPLETED'
        );
      default:
        return outcomeStr === targetStr;
    }
  }

  // Styling helper methods
  getPerformanceScoreClass(score: number | undefined): string {
    if (score === undefined || score === null) return 'text-muted';
    if (score >= 4) return 'text-success';
    if (score >= 3) return 'text-info';
    if (score >= 2) return 'text-warning';
    return 'text-danger';
  }

  getPerformanceProgressClass(score: number | undefined): string {
    if (score === undefined || score === null) return 'bg-secondary';
    if (score >= 4) return 'bg-success';
    if (score >= 3) return 'bg-info';
    if (score >= 2) return 'bg-warning';
    return 'bg-danger';
  }

  getPerformanceBadgeClass(score: number | undefined): string {
    if (score === undefined || score === null) return 'bg-label-secondary';
    if (score >= 4) return 'bg-label-success';
    if (score >= 3) return 'bg-label-info';
    if (score >= 2) return 'bg-label-warning';
    return 'bg-label-danger';
  }

  getPerformanceLabel(score: number | undefined): string {
    if (score === undefined || score === null) return 'N/A';
    if (score >= 4) return 'Excellent';
    if (score >= 3) return 'Good';
    if (score >= 2) return 'Average';
    return 'Needs Improvement';
  }

  getSentimentScoreClass(sentiment: number | undefined): string {
    if (sentiment === undefined || sentiment === 0) return 'text-muted';
    if (sentiment >= 0.85) return 'text-success fw-bold'; // Excellent
    if (sentiment >= 0.7) return 'text-success'; // Positive
    if (sentiment >= 0.5) return 'text-info'; // Good
    if (sentiment >= 0.3) return 'text-warning'; // Average
    return 'text-danger'; // Negative
  }

  getSentimentAvatarClass(sentiment: number | undefined): string {
    if (sentiment === undefined || sentiment === 0) return 'bg-label-secondary';
    if (sentiment >= 0.85) return 'bg-label-success'; // Excellent
    if (sentiment >= 0.7) return 'bg-success'; // Positive
    if (sentiment >= 0.5) return 'bg-label-info'; // Good
    if (sentiment >= 0.3) return 'bg-label-warning'; // Average
    return 'bg-label-danger'; // Negative
  }

  getSentimentProgressClass(sentiment: number | undefined): string {
    if (sentiment === undefined || sentiment === 0) return 'bg-secondary';
    if (sentiment >= 0.85) return 'bg-success'; // Excellent
    if (sentiment >= 0.7) return 'bg-primary'; // Positive
    if (sentiment >= 0.5) return 'bg-info'; // Good
    if (sentiment >= 0.3) return 'bg-warning'; // Average
    return 'bg-danger'; // Negative
  }

  getSentimentProgressWidth(sentiment: number | undefined): number {
    if (sentiment === undefined || sentiment === 0) return 0;
    // Convert sentiment score (0 to 1) to percentage (0 to 100)
    return Math.min(sentiment * 100, 100);
  }

  getSentimentIcon(sentiment: number | undefined): string {
    if (sentiment === undefined || sentiment === 0) return 'bx-meh';
    if (sentiment >= 0.85) return 'bx-smile'; // Excellent
    if (sentiment >= 0.7) return 'bx-happy'; // Positive
    if (sentiment >= 0.5) return 'bx-meh-alt'; // Good
    if (sentiment >= 0.3) return 'bx-meh'; // Average
    return 'bx-sad'; // Negative
  }

  getSentimentLabel(sentiment: number | undefined): string {
    if (sentiment === undefined || sentiment === 0) return 'N/A';
    if (sentiment >= 0.85) return 'Excellent';
    if (sentiment >= 0.7) return 'Positive';
    if (sentiment >= 0.5) return 'Good';
    if (sentiment >= 0.3) return 'Average';
    return 'Negative';
  }

  // Star rating methods for performance scores
  getStarArray(score: number | undefined): number[] {
    if (score === undefined || score === null) return [0, 0, 0, 0, 0];
    // Convert score from 0-5 scale to star array
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(1); // full star
      } else if (i === fullStars && hasHalfStar) {
        stars.push(0.5); // half star
      } else {
        stars.push(0); // empty star
      }
    }
    return stars;
  }

  getStarClass(starValue: number): string {
    if (starValue === 1) return 'bx-star'; // full star
    if (starValue === 0.5) return 'bx-star-half'; // half star
    return 'bx-star'; // empty star (will be styled differently)
  }

  getStarColor(starValue: number): string {
    if (starValue >= 0.5) return 'text-warning'; // filled/half stars are yellow
    return 'text-muted'; // empty stars are muted
  }

  getTipAlertClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'alert-danger';
      case 'medium':
        return 'alert-warning';
      case 'low':
        return 'alert-info';
      default:
        return 'alert-secondary';
    }
  }

  getTipIcon(category: string): string {
    switch (category) {
      case 'communication':
        return 'bx-chat';
      case 'sales':
        return 'bx-money';
      case 'emotion':
        return 'bx-heart';
      default:
        return 'bx-info-circle';
    }
  }
}
