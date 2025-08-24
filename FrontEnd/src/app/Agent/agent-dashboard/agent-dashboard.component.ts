import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartOptions,
  registerables,
} from 'chart.js';
import { TipsService } from '../../services/tips.service';
import { TokenService } from '../../services/token.service';
import { CoachingTip } from '../../models/coaching-tip';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer';
import { UserService } from '../../services/user.service';
import { DailyStatsService } from '../../services/daily-stats.service';
import { MockCallsService } from '../../services/mock-calls.service';
import { User } from '../../models/user';
import { DailyStats } from '../../models/daily-stats';
import { MockCall } from '../../models/mock-call';
import { AgentRankingDTO } from '../../models/agent-ranking-dto';
import { KnowledgeBaseService } from '../../services/knowledge-base.service';
import {
  KnowledgeBase,
  KnowledgeBaseFilter,
  KnowledgeStatus,
  Priority,
  PageResponse,
} from '../../models/knowledge-base';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.scss'],
})
export class AgentDashboardComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('performanceChart', { static: false })
  performanceChart!: ElementRef;

  private chart: Chart | undefined;

  // Coaching tips data
  coachingTips: CoachingTip[] = [];
  unacknowledgedTips: CoachingTip[] = [];
  recentTips: CoachingTip[] = [];
  currentUserId!: number;
  currentUserEmail: string = '';
  showAllTips: boolean = false;

  // Modal control for customer selection
  showCustomerModal: boolean = false;
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  customerSearchText: string = '';
  isLoadingCustomers: boolean = false;

  // Agent data - will be populated from API
  agentData = {
    name: '',
    id: '',
    todayTarget: 0,
    completedCalls: 0,
    sentimentTarget: 80,
    currentSentiment: 0,
  };

  // Performance data for the week - will be populated from API
  weeklyPerformance = {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    calls: [0, 0, 0, 0, 0],
    sentimentScores: [0, 0, 0, 0, 0],
  };

  // Incoming calls data - will be populated from API
  incomingCalls: MockCall[] = [];
  callWaitTimes: Map<number, string> = new Map(); // Store wait times by call ID
  callDisplayData: Map<
    number,
    {
      customerName: string;
      phone: string;
      type: string;
      priority: string;
    }
  > = new Map(); // Cache display data

  // Knowledge Base properties
  showKnowledgeBaseModal = false;
  showArticleModal = false;
  knowledgeBases: KnowledgeBase[] = [];
  filteredKnowledgeBases: KnowledgeBase[] = [];
  kbCategories: string[] = [];
  selectedArticle: KnowledgeBase | null = null;
  kbLoading = false;
  kbSearchTerm = '';
  selectedCategory = '';
  selectedPriority = '';
  kbCurrentPage = 0;
  kbPageSize = 9; // 3x3 grid
  kbTotalPages = 0;
  kbTotalElements = 0;

  // Team leaderboard - will be populated from API
  teamLeaderboard: AgentRankingDTO[] = [];

  // Real user data
  currentUser: User | null = null;
  weeklyStats: DailyStats[] = [];
  onlineAgents: User[] = [];
  onlineAgentsCount: number = 0;
  currentUserRank: number = 0;

  constructor(
    private tipsService: TipsService,
    private tokenService: TokenService,
    private route: Router,
    private customerService: CustomerService,
    private userService: UserService,
    private dailyStatsService: DailyStatsService,
    private mockCallsService: MockCallsService,
    private knowledgeBaseService: KnowledgeBaseService
  ) {
    // Chart.js will be initialized after view init
  }

  ngOnInit(): void {
    // Get current user email from token
    const userEmailFromToken = this.tokenService.getEmailFromToken();
    const userFullName = this.tokenService.getFullNameFromToken();

    if (userEmailFromToken) {
      this.currentUserEmail = userEmailFromToken;
      console.log('Current user email from token:', this.currentUserEmail);

      // Load user data and mark as online
      this.loadUserData();

      // Load coaching tips using email
      this.loadCoachingTips();

      // Load performance data
      this.loadWeeklyPerformanceData();

      // Load team ranking
      this.loadTeamRanking();

      // Load incoming calls
      this.loadIncomingCalls();

      // Load online agents count
      this.loadOnlineAgents();
    } else {
      console.error('No user email found in token');
      // Handle case where no token or invalid token
      // You might want to redirect to login page
    }

    // Initialize component data
    this.updateDashboardData();
  }

  ngAfterViewInit(): void {
    // Initialize the Chart.js chart after view is ready
    this.initializeChart();
  }

  ngOnDestroy(): void {
    // Mark agent as offline when component is destroyed
    if (this.currentUserEmail) {
      this.userService.agentIsOffline(this.currentUserEmail).subscribe({
        next: () => console.log('Agent marked as offline'),
        error: (error) =>
          console.error('Error marking agent as offline:', error),
      });
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: any) {
    // Mark agent as offline when browser is closed or refreshed
    if (this.currentUserEmail) {
      this.userService.agentIsOffline(this.currentUserEmail).subscribe();
    }
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
          order: 2,
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
          order: 1,
        },
      ],
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
              weight: 'bold',
            },
          },
        },
        title: {
          display: false,
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
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#697a8d',
            font: {
              size: 11,
              weight: 'normal',
            },
          },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          min: 0,
          max: 100,
          grid: {
            color: 'rgba(165, 163, 174, 0.1)',
          },
          ticks: {
            color: '#697a8d',
            font: {
              size: 11,
            },
            callback: function (value) {
              return value + '%';
            },
          },
          title: {
            display: true,
            text: 'Sentiment Score (%)',
            color: 'rgba(113, 221, 55, 0.9)',
            font: {
              size: 12,
              weight: 'bold',
            },
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          min: 0,
          max: 16,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: '#697a8d',
            font: {
              size: 11,
            },
          },
          title: {
            display: true,
            text: 'Call Volume',
            color: 'rgba(255, 99, 132, 0.8)',
            font: {
              size: 12,
              weight: 'bold',
            },
          },
        },
      },
    };

    const config: ChartConfiguration = {
      type: 'bar',
      data: chartData,
      options: chartOptions,
    };

    this.chart = new Chart(ctx, config);
  }

  updateDashboardData(): void {
    // Update current time and refresh data periodically
    setInterval(() => {
      // Refresh real-time data every 30 seconds
      this.loadIncomingCalls();
      this.loadOnlineAgents();
    }, 30000); // Update every 30 seconds
  }

  startDay(): void {
    console.log('Starting day for agent');
    if (this.currentUserEmail) {
      this.userService.agentIsOnline(this.currentUserEmail).subscribe({
        next: () => {
          console.log('Agent marked as online for day start');
          this.loadOnlineAgents(); // Refresh online agents count
        },
        error: (error) =>
          console.error('Error marking agent as online:', error),
      });
    }
  }

  loadUserData(): void {
    // Load current user data
    this.userService.getUserByEmail(this.currentUserEmail).subscribe({
      next: (user) => {
        this.currentUser = user;
        console.log('Current user loaded:', user);

        // Update agent data with real user information
        this.agentData.name =
          user.firstname || user.fullName?.split(' ')[0] || 'Agent';
        this.agentData.id =
          `A${user.id?.toString().padStart(3, '0')}` || 'A001';

        // Mark agent as online
        this.userService.agentIsOnline(this.currentUserEmail).subscribe({
          next: () => console.log('Agent marked as online'),
          error: (error) =>
            console.error('Error marking agent as online:', error),
        });
      },
      error: (error) => {
        console.error('Error loading user data:', error);
      },
    });
  }

  loadWeeklyPerformanceData(): void {
    this.dailyStatsService
      .getWeeklyStatsByAgent(this.currentUserEmail)
      .subscribe({
        next: (stats) => {
          this.weeklyStats = stats;
          console.log('Weekly stats loaded:', stats);

          // Process the stats to update the charts
          this.processWeeklyStats(stats);
        },
        error: (error) => {
          console.error('Error loading weekly performance data:', error);

          // For testing: create mock data if no data is available
          const mockStats: DailyStats[] = [
            {
              date: '2025-08-19',
              averageSentiment: 0.8,
              callsCompleted: 2,
              callsTarget: 12,
            },
            {
              date: '2025-08-20',
              averageSentiment: 0.85,
              callsCompleted: 3,
              callsTarget: 12,
            },
            {
              date: '2025-08-21',
              averageSentiment: 0.4,
              callsCompleted: 1,
              callsTarget: 12,
            },
            {
              date: '2025-08-22',
              averageSentiment: 0.6,
              callsCompleted: 2,
              callsTarget: 12,
            },
            {
              date: '2025-08-23',
              averageSentiment: 0.9,
              callsCompleted: 3,
              callsTarget: 12,
            },
          ];
          this.processWeeklyStats(mockStats);
        },
      });
  }

  processWeeklyStats(stats: DailyStats[]): void {
    // Reset arrays
    this.weeklyPerformance.calls = [0, 0, 0, 0, 0];
    this.weeklyPerformance.sentimentScores = [0, 0, 0, 0, 0];

    // Map stats to days (assuming Monday = 0, Friday = 4)
    stats.forEach((stat) => {
      if (stat.date) {
        const date = new Date(stat.date);
        const dayOfWeek = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

        if (dayOfWeek < 5) {
          // Only weekdays
          this.weeklyPerformance.calls[dayOfWeek] = stat.callsCompleted || 0;
          // Convert decimal sentiment to percentage (0.8 -> 80)
          this.weeklyPerformance.sentimentScores[dayOfWeek] = Math.round(
            (stat.averageSentiment || 0) * 100
          );
        }
      }
    });

    // Update current stats from today's data
    const todayStats = stats.find((stat) => {
      if (stat.date) {
        const statDate = new Date(stat.date);
        const today = new Date();
        return statDate.toDateString() === today.toDateString();
      }
      return false;
    });

    if (todayStats) {
      this.agentData.completedCalls = todayStats.callsCompleted || 0;
      this.agentData.todayTarget = todayStats.callsTarget || 12;
      // Convert decimal sentiment to percentage for display (0.8 -> 80)
      this.agentData.currentSentiment = Math.round(
        (todayStats.averageSentiment || 0) * 100
      );
    } else {
      // If no data for today, set default values
      this.agentData.completedCalls = 0;
      this.agentData.todayTarget = 12;
      this.agentData.currentSentiment = 0;
    }

    // Update chart if it exists
    this.updateChartData();
  }

  loadTeamRanking(): void {
    this.dailyStatsService.getTeamRanking(this.currentUserEmail).subscribe({
      next: (ranking) => {
        this.teamLeaderboard = ranking;
        console.log('Team ranking loaded:', ranking);

        // Find current user's rank
        const currentUserRanking = ranking.find(
          (r) => r.userEmail === this.currentUserEmail
        );
        this.currentUserRank = currentUserRanking ? currentUserRanking.rank : 0;
      },
      error: (error) => {
        console.error('Error loading team ranking:', error);
      },
    });
  }

  getCurrentUserScore(): number {
    const currentUserRanking = this.teamLeaderboard.find(
      (r) => r.userEmail === this.currentUserEmail
    );
    return currentUserRanking ? currentUserRanking.score : 0;
  }

  loadOnlineAgents(): void {
    this.userService.getOnlineAgents().subscribe({
      next: (agents) => {
        this.onlineAgents = agents;
        this.onlineAgentsCount = agents.length;
        console.log('Online agents loaded:', agents);
      },
      error: (error) => {
        console.error('Error loading online agents:', error);
      },
    });
  }

  loadIncomingCalls(): void {
    this.mockCallsService.getMockCalls().subscribe({
      next: (calls) => {
        this.incomingCalls = calls;

        // Generate wait times and cache display data for new calls only
        calls.forEach((call) => {
          if (call.id && !this.callWaitTimes.has(call.id)) {
            // Generate wait time
            const minutes = Math.floor(Math.random() * 5);
            const seconds = Math.floor(Math.random() * 60);
            this.callWaitTimes.set(
              call.id,
              `${minutes}:${seconds.toString().padStart(2, '0')}`
            );

            // Cache display data
            const customerName = call.customer
              ? `${call.customer.firstName || ''} ${
                  call.customer.lastName || ''
                }`.trim() || `Customer #${call.customer.customerID}`
              : 'Unknown Customer';

            const phone = call.customer?.phone || 'No phone';

            // Derive type from customer service information
            let type = 'Billing';
            if (
              call.customer?.PhoneService === 'Yes' &&
              call.customer?.InternetService !== 'No'
            ) {
              type = 'Support';
            } else if (call.customer?.PhoneService === 'No') {
              type = 'Sales';
            }

            // Derive priority from customer data
            let priority = 'Low';
            if (
              call.customer?.MonthlyCharges &&
              call.customer.MonthlyCharges > 80
            ) {
              priority = 'High';
            } else if (
              call.customer?.MonthlyCharges &&
              call.customer.MonthlyCharges > 50
            ) {
              priority = 'Medium';
            }

            this.callDisplayData.set(call.id, {
              customerName,
              phone,
              type,
              priority,
            });
          }
        });

        console.log('Incoming calls loaded:', calls);
      },
      error: (error) => {
        console.error('Error loading incoming calls:', error);
      },
    });
  }

  loadCoachingTips(): void {
    if (!this.currentUserEmail) {
      console.error('Invalid user email:', this.currentUserEmail);
      return;
    }

    console.log('Loading coaching tips for user email:', this.currentUserEmail);

    // Load all tips for the user using email
    this.tipsService.getTipsByUserEmail(this.currentUserEmail).subscribe({
      next: (tips) => {
        this.coachingTips = tips;
        console.log('Coaching tips loaded:', tips);
      },
      error: (error) => {
        console.error('Error loading coaching tips:', error);
      },
    });

    // Load unacknowledged tips using email
    this.tipsService
      .getUnacknowledgedByUserEmail(this.currentUserEmail)
      .subscribe({
        next: (tips) => {
          this.unacknowledgedTips = tips;
          console.log('Unacknowledged tips loaded:', tips);
        },
        error: (error) => {
          console.error('Error loading unacknowledged tips:', error);
        },
      });

    // Load recent tips (last 7 days) using email
    this.tipsService.getRecentByUserEmail(this.currentUserEmail, 7).subscribe({
      next: (tips) => {
        this.recentTips = tips;
        console.log('Recent tips loaded:', tips);
      },
      error: (error) => {
        console.error('Error loading recent tips:', error);
      },
    });
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
    if (!priority) return 'secondary';

    switch (priority.toLowerCase()) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'warning'; // Default to medium/warning
    }
  }

  getTypeColor(type: string): string {
    if (!type) return 'secondary';

    switch (type.toLowerCase()) {
      case 'billing':
        return 'info';
      case 'support':
        return 'success';
      case 'sales':
        return 'primary';
      case 'default':
      case 'general':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  // Performance calculation methods
  getCallCompletionPercentage(): number {
    if (this.agentData.todayTarget === 0) return 0;
    return Math.round(
      (this.agentData.completedCalls / this.agentData.todayTarget) * 100
    );
  }

  getWeeklyAverage(): number {
    // Calculate average from actual weekly stats data
    if (!this.weeklyStats || this.weeklyStats.length === 0) return 0;

    const validStats = this.weeklyStats.filter(
      (stat) => stat.averageSentiment && stat.averageSentiment > 0
    );
    if (validStats.length === 0) return 0;

    const totalSentiment = validStats.reduce(
      (sum, stat) => sum + (stat.averageSentiment || 0),
      0
    );
    // Convert decimal to percentage (0.58 -> 58%)
    return Math.round((totalSentiment / validStats.length) * 100);
  }

  getTotalWeeklyCalls(): number {
    // Calculate total from actual weekly stats data
    if (!this.weeklyStats || this.weeklyStats.length === 0) return 0;

    return this.weeklyStats.reduce(
      (total, stat) => total + (stat.callsCompleted || 0),
      0
    );
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
    console.log('Opening customer selection modal');
    this.showCustomerModal = true;
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoadingCustomers = true;
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.filteredCustomers = customers;
        this.isLoadingCustomers = false;
        console.log('Customers loaded:', customers);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.isLoadingCustomers = false;
      },
    });
  }

  selectCustomer(customer: Customer): void {
    console.log('Customer selected:', customer);
    this.closeCustomerModal();
    // Navigate to call page with customer data
    this.route.navigate(['/Agent/call'], {
      state: { selectedCustomer: customer },
    });
  }

  closeCustomerModal(): void {
    this.showCustomerModal = false;
    this.customerSearchText = '';
    this.filteredCustomers = this.customers;
  }

  getCustomerDisplayName(customer: Customer): string {
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    }
    if (customer.firstName) {
      return customer.firstName;
    }
    return `Customer #${customer.customerID}`;
  }

  filterCustomers(): void {
    if (!this.customerSearchText.trim()) {
      this.filteredCustomers = this.customers;
      return;
    }

    const searchTerm = this.customerSearchText.toLowerCase();
    this.filteredCustomers = this.customers.filter(
      (customer) =>
        customer.customerID?.toString().includes(searchTerm) ||
        customer.firstName?.toLowerCase().includes(searchTerm) ||
        customer.lastName?.toLowerCase().includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm) ||
        customer.phone?.toLowerCase().includes(searchTerm) ||
        customer.gender?.toLowerCase().includes(searchTerm) ||
        customer.PhoneService?.toLowerCase().includes(searchTerm) ||
        customer.InternetService?.toLowerCase().includes(searchTerm) ||
        customer.PaymentMethod?.toLowerCase().includes(searchTerm)
    );
  }

  viewCoachingTips(): void {
    this.showAllTips = !this.showAllTips;
    console.log('Toggling tips view, showing all tips:', this.showAllTips);
  }

  getDisplayedTips(): CoachingTip[] {
    return this.showAllTips
      ? this.unacknowledgedTips
      : this.unacknowledgedTips.slice(0, 2);
  }

  getViewMoreButtonText(): string {
    if (this.showAllTips) {
      return 'Show less';
    } else {
      const remainingTips = this.unacknowledgedTips.length - 2;
      return `View ${remainingTips} more tips`;
    }
  }

  acknowledgeCoachingTip(tipId: number): void {
    this.tipsService.markAsAcknowledged(tipId).subscribe({
      next: (updatedTip) => {
        console.log('Tip acknowledged:', updatedTip);
        // Update the local tip in the arrays
        this.updateLocalTip(updatedTip);
        // Reload tips to get updated data
        this.loadCoachingTips();
      },
      error: (error) => {
        console.error('Error acknowledging tip:', error);
      },
    });
  }

  markTipAsHelpful(tipId: number, helpful: boolean): void {
    this.tipsService.markAsHelpful(tipId, helpful).subscribe({
      next: (updatedTip) => {
        console.log('Tip marked as helpful:', updatedTip);
        this.updateLocalTip(updatedTip);
      },
      error: (error) => {
        console.error('Error marking tip as helpful:', error);
      },
    });
  }

  markTipAsShown(tipId: number): void {
    this.tipsService.markAsShown(tipId).subscribe({
      next: (updatedTip) => {
        console.log('Tip marked as shown:', updatedTip);
        this.updateLocalTip(updatedTip);
      },
      error: (error) => {
        console.error('Error marking tip as shown:', error);
      },
    });
  }

  private updateLocalTip(updatedTip: CoachingTip): void {
    // Update the tip in all relevant arrays
    const updateTipInArray = (tips: CoachingTip[]) => {
      const index = tips.findIndex((tip) => tip.id === updatedTip.id);
      if (index !== -1) {
        tips[index] = updatedTip;
      }
    };

    updateTipInArray(this.coachingTips);
    updateTipInArray(this.unacknowledgedTips);
    updateTipInArray(this.recentTips);
  }

  getTipTypeDisplayName(tipType: string): string {
    switch (tipType) {
      case 'SENTIMENT_ALERT':
        return 'Sentiment Alert';
      case 'COMPETITOR_MENTION':
        return 'Competitor Mention';
      case 'ESCALATION_RISK':
        return 'Escalation Risk';
      case 'TECHNIQUE_SUGGESTION':
        return 'Technique Suggestion';
      default:
        return tipType;
    }
  }

  getTipTypeIcon(tipType: string): string {
    switch (tipType) {
      case 'SENTIMENT_ALERT':
        return 'bx-heart';
      case 'COMPETITOR_MENTION':
        return 'bx-shield-alt-2';
      case 'ESCALATION_RISK':
        return 'bx-error-circle';
      case 'TECHNIQUE_SUGGESTION':
        return 'bx-bulb';
      default:
        return 'bx-info-circle';
    }
  }

  getTipTypeColor(tipType: string): string {
    switch (tipType) {
      case 'SENTIMENT_ALERT':
        return 'warning';
      case 'COMPETITOR_MENTION':
        return 'info';
      case 'ESCALATION_RISK':
        return 'danger';
      case 'TECHNIQUE_SUGGESTION':
        return 'primary';
      default:
        return 'secondary';
    }
  }

  // Helper methods for MockCall display
  getCallCustomerName(call: MockCall): string {
    if (call.id && this.callDisplayData.has(call.id)) {
      return this.callDisplayData.get(call.id)!.customerName;
    }
    return 'Unknown Customer';
  }

  getCallPhone(call: MockCall): string {
    if (call.id && this.callDisplayData.has(call.id)) {
      return this.callDisplayData.get(call.id)!.phone;
    }
    return 'No phone';
  }

  getCallType(call: MockCall): string {
    if (call.id && this.callDisplayData.has(call.id)) {
      return this.callDisplayData.get(call.id)!.type;
    }
    return 'General';
  }

  getCallPriority(call: MockCall): string {
    if (call.id && this.callDisplayData.has(call.id)) {
      return this.callDisplayData.get(call.id)!.priority;
    }
    return 'Medium';
  }

  getCallWaitTime(call: MockCall): string {
    // Return stored wait time or default
    if (call.id && this.callWaitTimes.has(call.id)) {
      return this.callWaitTimes.get(call.id)!;
    }
    return '0:00';
  }

  refreshQueue(): void {
    console.log('Refreshing call queue');
    this.loadIncomingCalls();
  }

  takeCall(call: MockCall): void {
    const customerName = this.getCallCustomerName(call);
    console.log(`Taking call from ${customerName}`);

    // Remove the call from the queue
    this.incomingCalls = this.incomingCalls.filter((c) => c.id !== call.id);

    // Clean up cached data
    if (call.id) {
      this.callWaitTimes.delete(call.id);
      this.callDisplayData.delete(call.id);
    }

    // Increment completed calls
    this.agentData.completedCalls++;

    // Show notification or redirect to call interface
    // You can add notification service here
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

  // Knowledge Base Methods
  openKnowledgeBaseModal(): void {
    this.showKnowledgeBaseModal = true;
    this.loadKnowledgeBase();
    this.loadKnowledgeBaseCategories();
  }

  closeKnowledgeBaseModal(): void {
    this.showKnowledgeBaseModal = false;
    this.resetKnowledgeBaseFilters();
  }

  loadKnowledgeBase(): void {
    this.kbLoading = true;
    const filter = {
      category: this.selectedCategory || undefined,
      priority: (this.selectedPriority as Priority) || undefined,
      search: this.kbSearchTerm || undefined,
    };

    this.knowledgeBaseService
      .getAllKnowledgeBases(
        filter,
        this.kbCurrentPage,
        this.kbPageSize,
        'createdAt',
        'desc'
      )
      .subscribe({
        next: (response: PageResponse<KnowledgeBase>) => {
          this.knowledgeBases = response.content;
          this.filteredKnowledgeBases = response.content;
          this.kbTotalElements = response.totalElements;
          this.kbTotalPages = response.totalPages;
          this.kbLoading = false;
        },
        error: (error) => {
          console.error('Error loading knowledge base:', error);
          this.kbLoading = false;
        },
      });
  }

  loadKnowledgeBaseCategories(): void {
    this.knowledgeBaseService.getAllCategories().subscribe({
      next: (categories) => {
        this.kbCategories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  searchKnowledgeBase(): void {
    this.kbCurrentPage = 0;
    this.loadKnowledgeBase();
  }

  filterByCategory(): void {
    this.kbCurrentPage = 0;
    this.loadKnowledgeBase();
  }

  filterByPriority(): void {
    this.kbCurrentPage = 0;
    this.loadKnowledgeBase();
  }

  changeKbPage(page: number): void {
    if (page >= 0 && page < this.kbTotalPages) {
      this.kbCurrentPage = page;
      this.loadKnowledgeBase();
    }
  }

  getKbPages(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(0, this.kbCurrentPage - 2);
    const endPage = Math.min(this.kbTotalPages - 1, this.kbCurrentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  viewKnowledgeBaseArticle(article: KnowledgeBase): void {
    this.selectedArticle = article;
    this.showArticleModal = true;
    // Increment view count
    this.knowledgeBaseService.getKnowledgeBaseById(article.id).subscribe();
  }

  closeArticleModal(): void {
    this.showArticleModal = false;
    this.selectedArticle = null;
  }

  markAsHelpful(): void {
    console.log('Article marked as helpful');
    // Implement helpful marking functionality
  }

  resetKnowledgeBaseFilters(): void {
    this.kbSearchTerm = '';
    this.selectedCategory = '';
    this.selectedPriority = '';
    this.kbCurrentPage = 0;
  }

  getKbCategoryClass(category: string): string {
    // Generate consistent colors based on category name
    const categoryColors: { [key: string]: string } = {
      'Customer Service': 'bg-label-primary',
      Billing: 'bg-label-success',
      Technical: 'bg-label-warning',
      Sales: 'bg-label-info',
      Support: 'bg-label-secondary',
      Policy: 'bg-label-danger',
    };

    if (categoryColors[category]) {
      return categoryColors[category];
    }

    // Generate color based on string hash for consistent coloring
    const hash = this.hashString(category);
    const colors = [
      'bg-label-primary',
      'bg-label-success',
      'bg-label-warning',
      'bg-label-info',
      'bg-label-secondary',
      'bg-label-danger',
    ];

    return colors[hash % colors.length];
  }

  getKbPriorityClass(priority: Priority): string {
    switch (priority) {
      case Priority.LOW:
        return 'bg-label-success';
      case Priority.MEDIUM:
        return 'bg-label-primary';
      case Priority.HIGH:
        return 'bg-label-warning';
      case Priority.URGENT:
        return 'bg-label-danger';
      default:
        return 'bg-label-secondary';
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
