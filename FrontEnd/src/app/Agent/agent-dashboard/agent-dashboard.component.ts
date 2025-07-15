import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartOptions,
  registerables
} from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.scss'],
})
export class AgentDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('performanceChart', { static: false })
  performanceChart!: ElementRef;
  
  private chart: Chart | undefined;

  // Agent data
  agentData = {
    name: 'Sarah',
    id: 'A001',
    todayTarget: 12,
    completedCalls: 5,
    sentimentTarget: 80,
    currentSentiment: 86,
  };

  // Performance data for the week
  weeklyPerformance = {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    calls: [10, 12, 8, 14, 5],
    sentimentScores: [85, 89, 78, 92, 86],
  };

  // Incoming calls data
  incomingCalls = [
    {
      customerName: 'Ali Hassan',
      phone: '+216 98 123 456',
      type: 'Billing',
      waitTime: '2:35',
      priority: 'Medium',
    },
    {
      customerName: 'Maryam Ben Ali',
      phone: '+216 97 234 567',
      type: 'Support',
      waitTime: '1:22',
      priority: 'High',
    },
    {
      customerName: 'Karim Mejri',
      phone: '+216 99 345 678',
      type: 'Sales',
      waitTime: '0:45',
      priority: 'Low',
    },
  ];

  // Team leaderboard
  teamLeaderboard = [
    { rank: 1, name: 'Ahmed M.', score: 94 },
    { rank: 2, name: 'Fatima K.', score: 91 },
    { rank: 3, name: 'Sarah (You)', score: 89 },
    { rank: 4, name: 'Omar S.', score: 85 },
  ];

  constructor() {
    // Chart.js will be initialized after view init
  }

  ngOnInit(): void {
    // Initialize component data
    this.updateDashboardData();
  }

  ngAfterViewInit(): void {
    // Initialize the Chart.js chart after view is ready
    this.initializeChart();
  }

  private initializeChart(): void {
    if (!this.performanceChart) return;

    const ctx = this.performanceChart.nativeElement.getContext('2d');
    
    const chartData: ChartData = {
      labels: this.weeklyPerformance.days,
      datasets: [
        {
          type: 'bar',
          label: 'Call Volume',
          data: this.weeklyPerformance.calls,
          backgroundColor: 'rgba(255, 99, 132, 0.3)',
          borderColor: 'rgba(255, 99, 132, 0.8)',
          borderWidth: 2,
          yAxisID: 'y1',
          order: 2
        },
        {
          type: 'line',
          label: 'Sentiment Score (%)',
          data: this.weeklyPerformance.sentimentScores,
          backgroundColor: 'rgba(113, 221, 55, 0.1)',
          borderColor: 'rgba(113, 221, 55, 0.9)',
          borderWidth: 4,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(113, 221, 55, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 3,
          pointRadius: 7,
          pointHoverRadius: 10,
          yAxisID: 'y',
          order: 1
        }
      ]
    };

    const chartOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            color: '#697a8d',
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        },
        title: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#566a7f',
          bodyColor: '#697a8d',
          borderColor: 'rgba(165, 163, 174, 0.2)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              if (label.includes('Sentiment')) {
                return `${label}: ${value}%`;
              }
              return `${label}: ${value} calls`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#697a8d',
            font: {
              size: 11,
              weight: 'normal'
            }
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          min: 70,
          max: 100,
          grid: {
            color: 'rgba(165, 163, 174, 0.1)'
          },
          ticks: {
            color: '#697a8d',
            font: {
              size: 11
            },
            callback: function(value) {
              return value + '%';
            }
          },
          title: {
            display: true,
            text: 'Sentiment Score (%)',
            color: 'rgba(113, 221, 55, 0.9)',
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          min: 0,
          max: 16,
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#697a8d',
            font: {
              size: 11
            }
          },
          title: {
            display: true,
            text: 'Call Volume',
            color: 'rgba(255, 99, 132, 0.8)',
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        }
      }
    };

    const config: ChartConfiguration = {
      type: 'bar',
      data: chartData,
      options: chartOptions
    };

    this.chart = new Chart(ctx, config);
  }

  updateDashboardData(): void {
    // Simulate real-time data updates
    setInterval(() => {
      // Update current time and refresh data periodically
      this.agentData.currentSentiment = Math.floor(Math.random() * 10) + 82; // Random sentiment between 82-91%
    }, 30000); // Update every 30 seconds
  }

  takeCall(customerName: string): void {
    // Handle taking a call
    console.log(`Taking call from ${customerName}`);

    // Remove the call from the queue
    this.incomingCalls = this.incomingCalls.filter(
      (call) => call.customerName !== customerName
    );

    // Increment completed calls
    this.agentData.completedCalls++;

    // Show notification or redirect to call interface
    // You can add notification service here
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  getSentimentColor(score: number): string {
    if (score >= 85) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  }

  getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  }

  getTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'billing':
        return 'info';
      case 'support':
        return 'success';
      case 'sales':
        return 'primary';
      default:
        return 'secondary';
    }
  }

  // Performance calculation methods
  getCallCompletionPercentage(): number {
    return Math.round(
      (this.agentData.completedCalls / this.agentData.todayTarget) * 100
    );
  }

  getWeeklyAverage(): number {
    return Math.round(
      this.weeklyPerformance.sentimentScores.reduce((a, b) => a + b, 0) /
        this.weeklyPerformance.sentimentScores.length
    );
  }

  getTotalWeeklyCalls(): number {
    return this.weeklyPerformance.calls.reduce((a, b) => a + b, 0);
  }

  // Action methods
  startBreak(): void {
    console.log('Starting break time');
    // Implement break logic
  }

  getSupport(): void {
    console.log('Requesting support');
    // Implement support request logic
  }

  openKnowledgeBase(): void {
    console.log('Opening knowledge base');
    // Implement knowledge base navigation
  }

  manualDial(): void {
    console.log('Starting manual dial');
    // Implement manual dial functionality
  }

  viewCoachingTips(): void {
    console.log('Viewing coaching tips');
    // Implement coaching tips view
  }

  refreshQueue(): void {
    console.log('Refreshing call queue');
    // Implement queue refresh logic
    // You can add API call here to refresh the incoming calls
  }

  updateChartData(): void {
    if (!this.chart) return;
    
    this.chart.data.datasets[0].data = this.weeklyPerformance.calls;
    this.chart.data.datasets[1].data = this.weeklyPerformance.sentimentScores;
    this.chart.update('resize');
  }

  exportLeaderboard(): void {
    console.log('Exporting leaderboard data');
    // Implement export functionality
  }
}
