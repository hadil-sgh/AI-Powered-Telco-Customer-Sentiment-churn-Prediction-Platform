import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Performance } from '../../models/performance';
import { CallRecord } from '../../models/call-record';
import { AudioAnalysisResponse } from '../../models/audio-analysis-response';

interface OverallStats {
  averageScore: number;
  averageSentiment: number;
  totalCalls: number;
  callsGrowth: number;
  performanceTrend: number;
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
    performanceTrend: 0,
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

  constructor() {}

  ngOnInit(): void {
    this.initializeDateRange();
    this.loadMockData();
    this.calculateStatistics();
    this.generateCoachingTips();
    this.filterPerformanceRecords();
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

  private loadMockData(): void {
    // Mock data for demonstration - now using 0-5 scale for scores
    this.performanceRecords = [
      {
        id: 1,
        score: 3.8,
        feedback: 'Good call handling, needs improvement in closing techniques',
        callTranscripts: {
          id: 1001,
          callDateTime: '2024-01-15T10:30:00Z',
          callTranscripts: [
            {
              id: 1,
              sentiment: {
                id: 1,
                score: 0.65,
                text: 'Positive',
                voice: 'agent',
              },
              text: 'Thank you for calling',
              speaker: 'agent',
            },
          ],
          averageSentimentScore: 0.65,
          callDate: new Date('2024-01-15'),
        } as EnhancedCallRecord,
      },
      {
        id: 2,
        score: 4.8,
        feedback: 'Excellent customer service, very professional approach',
        callTranscripts: {
          id: 1002,
          callDateTime: '2024-01-14T14:20:00Z',
          callTranscripts: [
            {
              id: 2,
              sentiment: {
                id: 2,
                score: 0.78,
                text: 'Very Positive',
                voice: 'customer',
              },
              text: 'Great service',
              speaker: 'customer',
            },
          ],
          averageSentimentScore: 0.78,
          callDate: new Date('2024-01-14'),
        } as EnhancedCallRecord,
      },
      {
        id: 3,
        score: 2.8,
        feedback: 'Average performance, could improve active listening skills',
        callTranscripts: {
          id: 1003,
          callDateTime: '2024-01-13T09:15:00Z',
          callTranscripts: [
            {
              id: 3,
              sentiment: {
                id: 3,
                score: 0.45,
                text: 'Neutral',
                voice: 'customer',
              },
              text: 'Okay service',
              speaker: 'customer',
            },
          ],
          averageSentimentScore: 0.45,
          callDate: new Date('2024-01-13'),
        } as EnhancedCallRecord,
      },
      {
        id: 4,
        score: 4.2,
        feedback: 'Strong technical knowledge, good problem resolution',
        callTranscripts: {
          id: 1004,
          callDateTime: '2024-01-12T16:45:00Z',
          callTranscripts: [
            {
              id: 4,
              sentiment: {
                id: 4,
                score: 0.72,
                text: 'Positive',
                voice: 'customer',
              },
              text: 'Problem solved well',
              speaker: 'customer',
            },
          ],
          averageSentimentScore: 0.72,
          callDate: new Date('2024-01-12'),
        } as EnhancedCallRecord,
      },
      {
        id: 5,
        score: 4.9,
        feedback: 'Outstanding call, exceeded customer expectations',
        callTranscripts: {
          id: 1005,
          callDateTime: '2024-01-11T11:30:00Z',
          callTranscripts: [
            {
              id: 5,
              sentiment: {
                id: 5,
                score: 0.82,
                text: 'Very Positive',
                voice: 'customer',
              },
              text: 'Excellent experience',
              speaker: 'customer',
            },
          ],
          averageSentimentScore: 0.82,
          callDate: new Date('2024-01-11'),
        } as EnhancedCallRecord,
      },
    ];
  }

  getCallSentimentScore(callRecord: CallRecord | undefined): number {
    if (!callRecord) return 0;

    const enhancedRecord = callRecord as EnhancedCallRecord;
    if (enhancedRecord.averageSentimentScore !== undefined) {
      return enhancedRecord.averageSentimentScore;
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
    if (this.filteredPerformanceRecords.length === 0) {
      return;
    }

    // Calculate overall stats
    const totalScore = this.filteredPerformanceRecords.reduce(
      (sum, record) => sum + (record.score || 0),
      0
    );
    const totalSentiment = this.filteredPerformanceRecords.reduce(
      (sum, record) => sum + this.getCallSentimentScore(record.callTranscripts),
      0
    );

    this.overallStats = {
      averageScore: totalScore / this.filteredPerformanceRecords.length,
      averageSentiment: totalSentiment / this.filteredPerformanceRecords.length,
      totalCalls: this.filteredPerformanceRecords.length,
      callsGrowth: Math.random() * 10 + 5, // Mock growth data
      performanceTrend: (Math.random() - 0.5) * 10, // Mock trend data
    };

    // Calculate score distribution for 0-5 scale
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

    // Calculate sentiment stats
    const positive = this.filteredPerformanceRecords.filter(
      (r) => this.getCallSentimentScore(r.callTranscripts) >= 0.5
    ).length;
    const neutral = this.filteredPerformanceRecords.filter((r) => {
      const sentiment = this.getCallSentimentScore(r.callTranscripts);
      return sentiment >= 0 && sentiment < 0.5;
    }).length;
    const negative = this.filteredPerformanceRecords.filter(
      (r) => this.getCallSentimentScore(r.callTranscripts) < 0
    ).length;

    this.sentimentStats = {
      positive: (positive / total) * 100,
      neutral: (neutral / total) * 100,
      negative: (negative / total) * 100,
    };
  }

  private generateCoachingTips(): void {
    this.coachingTips = [
      {
        title: 'Active Listening',
        description:
          'Focus on understanding customer needs before providing solutions.',
        category: 'communication',
        priority: 'high',
      },
      {
        title: 'Closing Techniques',
        description:
          'Practice effective call closing to ensure customer satisfaction.',
        category: 'sales',
        priority: 'medium',
      },
      {
        title: 'Sentiment Management',
        description:
          'Use positive language to improve customer sentiment during calls.',
        category: 'emotion',
        priority: 'high',
      },
    ];
  }

  private initializeCharts(): void {
    console.log('Initializing charts...');

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
              data: Array(30).fill(this.overallStats.averageScore),
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
              text: 'Performance Trend Over Time',
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
              max: 5,
              title: {
                display: true,
                text: 'Performance Score (0-5)',
              },
              ticks: {
                stepSize: 1,
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
    const data = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate realistic sample data in 0-5 range
      const basePerformance = 3.5 + Math.random() * 1.5; // 3.5-5 range
      const trend = Math.sin(i * 0.1) * 0.3; // Small sine wave for trend
      const performance = Math.max(0, Math.min(5, basePerformance + trend));

      // Generate sentiment percentages that add up to 100
      const positive = 40 + Math.random() * 30; // 40-70%
      const negative = 10 + Math.random() * 20; // 10-30%
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
      this.performanceChartInstance.data.datasets[0].data = newData.map(
        (d) => d.performance
      );
      this.performanceChartInstance.data.datasets[1].data = Array(30).fill(
        this.overallStats.averageScore
      );
      this.performanceChartInstance.update();
    }

    if (this.sentimentChartInstance) {
      const newData = this.generateLast30DaysData();
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
        const sentiment = this.getCallSentimentScore(record.callTranscripts);
        switch (this.selectedSentimentRange) {
          case 'positive':
            return sentiment >= 0.5;
          case 'neutral':
            return sentiment >= 0 && sentiment < 0.5;
          case 'negative':
            return sentiment < 0;
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
            return score >= 90;
          case 'good':
            return score >= 75 && score < 90;
          case 'average':
            return score >= 60 && score < 75;
          case 'needs-improvement':
            return score < 60;
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
    this.loadMockData();
    this.calculateStatistics();
    this.filterPerformanceRecords();
    // Reinitialize charts
    this.initializeCharts();
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
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);

    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
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
    if (score >= 4.5) return 'text-success';
    if (score >= 3.5) return 'text-info';
    if (score >= 2.5) return 'text-warning';
    return 'text-danger';
  }

  getPerformanceProgressClass(score: number | undefined): string {
    if (score === undefined || score === null) return 'bg-secondary';
    if (score >= 4.5) return 'bg-success';
    if (score >= 3.5) return 'bg-info';
    if (score >= 2.5) return 'bg-warning';
    return 'bg-danger';
  }

  getPerformanceBadgeClass(score: number | undefined): string {
    if (score === undefined || score === null) return 'bg-label-secondary';
    if (score >= 4.5) return 'bg-label-success';
    if (score >= 3.5) return 'bg-label-info';
    if (score >= 2.5) return 'bg-label-warning';
    return 'bg-label-danger';
  }

  getPerformanceLabel(score: number | undefined): string {
    if (score === undefined || score === null) return 'N/A';
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Average';
    return 'Needs Improvement';
  }

  getSentimentScoreClass(sentiment: number | undefined): string {
    if (sentiment === undefined) return 'text-muted';
    if (sentiment >= 0.5) return 'text-success';
    if (sentiment >= 0) return 'text-warning';
    return 'text-danger';
  }

  getSentimentAvatarClass(sentiment: number | undefined): string {
    if (sentiment === undefined) return 'bg-label-secondary';
    if (sentiment >= 0.5) return 'bg-label-success';
    if (sentiment >= 0) return 'bg-label-warning';
    return 'bg-label-danger';
  }

  getSentimentProgressClass(sentiment: number | undefined): string {
    if (sentiment === undefined) return 'bg-secondary';
    if (sentiment >= 0.5) return 'bg-success';
    if (sentiment >= 0) return 'bg-warning';
    return 'bg-danger';
  }

  getSentimentProgressWidth(sentiment: number | undefined): number {
    if (sentiment === undefined) return 0;
    // Convert sentiment score (-1 to 1) to percentage (0 to 100)
    return ((sentiment + 1) / 2) * 100;
  }

  getSentimentIcon(sentiment: number | undefined): string {
    if (sentiment === undefined) return 'bx-meh';
    if (sentiment >= 0.5) return 'bx-happy';
    if (sentiment >= 0) return 'bx-meh';
    return 'bx-sad';
  }

  getTrendClass(trend: number | undefined): string {
    if (!trend) return 'text-muted';
    return trend > 0 ? 'text-success' : 'text-danger';
  }

  getTrendAvatarClass(trend: number | undefined): string {
    if (!trend) return 'bg-label-secondary';
    return trend > 0 ? 'bg-label-success' : 'bg-label-danger';
  }

  getTrendIcon(trend: number | undefined): string {
    if (!trend) return 'bx-minus';
    return trend > 0 ? 'bx-trending-up' : 'bx-trending-down';
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
