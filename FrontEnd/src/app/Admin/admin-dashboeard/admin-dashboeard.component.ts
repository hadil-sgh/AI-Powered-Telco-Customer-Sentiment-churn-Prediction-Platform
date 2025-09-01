import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { TokenService } from '../../services/token.service';
import { UserService } from '../../services/user.service';
import { DailyStatsService } from '../../services/daily-stats.service';
import { CoachingTipsService } from '../../services/coaching-tips.service';
import { TeamService } from '../../services/team.service';
import { User } from '../../models/user';
import { AgentRankingDTO } from '../../models/agent-ranking-dto';
import { CoachingTip } from '../../models/coaching-tip';
import { Team } from '../../models/team';
import { TeamStatsDTO } from 'src/app/models/TeamStatsDTO';
import { WeeklyTeamStatsDTO } from '../../models/WeeklyTeamStatsDTO';

// Register Chart.js components
Chart.register(...registerables);

interface Agent {
  id: string;
  name: string;
  status: 'on-call' | 'break' | 'alert' | 'offline';
  sentiment?: number;
  breakTimeLeft?: number;
  alertType?: string;
  lastSeen?: string;
}

interface CoachingSession {
  id: string;
  agentName: string;
  topic: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  scheduledTime: string;
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

interface PerformanceMetric {
  label: string;
  value: number;
  colorClass: string;
}

interface QueueItem {
  type: string;
  count: number;
  avgWaitTime: string;
  icon: string;
  colorClass: string;
}

interface QAStats {
  reviewedToday: number;
  targetReviews: number;
  pendingReviews: number;
}

@Component({
  selector: 'app-admin-dashboeard',
  templateUrl: './admin-dashboeard.component.html',
  styleUrls: ['./admin-dashboeard.component.scss'],
})
export class AdminDashboeardComponent implements OnInit, AfterViewInit {
  @ViewChild('performanceChart')
  performanceChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('queueChart') queueChart!: ElementRef<HTMLCanvasElement>;

  // Dashboard Data
  totalAgents = 12;
  agentsOnBreak = 2;
  alertsCount = 1;
  onlineAgentsCount = 0; // Real count from service
  onlineAgentsList: User[] = []; // Real list of online agents
  alertAgents = 1;
  teamAvgSentiment = 78;
  activeCalls = 15;
  totalCallsInQueue = 23;

  // Team ranking data
  teamLeaderboard: AgentRankingDTO[] = [];

  // Agent feedback data
  agentFeedbackList: CoachingTip[] = [];
  acknowledgedTipsToday: CoachingTip[] = [];
  helpfulTipsToday: CoachingTip[] = [];
  totalFeedbackToday = 0;
  totalAcknowledgedToday = 0;
  totalHelpfulToday = 0;

  // Team stats data
  currentTeamStats: TeamStatsDTO | null = null;
  currentTeam: Team | null = null;
  weeklyTeamStats: WeeklyTeamStatsDTO[] = [];

  // Agent Grid Data
  agentGrid: Agent[] = [
    { id: '1', name: 'Sarah J.', status: 'on-call', sentiment: 0.8 },
    { id: '2', name: 'Mike T.', status: 'break', breakTimeLeft: 5 },
    {
      id: '3',
      name: 'Lisa K.',
      status: 'alert',
      alertType: 'Escalation Needed',
      sentiment: 0.1,
    },
    { id: '4', name: 'David R.', status: 'on-call', sentiment: 0.9 },
    { id: '5', name: 'Anna B.', status: 'on-call', sentiment: 0.7 },
    { id: '6', name: 'John D.', status: 'break', breakTimeLeft: 12 },
    { id: '7', name: 'Emma W.', status: 'on-call', sentiment: 0.85 },
    { id: '8', name: 'Chris M.', status: 'on-call', sentiment: 0.6 },
    { id: '9', name: 'Sophie L.', status: 'on-call', sentiment: 0.9 },
    { id: '10', name: 'Mark H.', status: 'offline', lastSeen: '10:30 AM' },
    { id: '11', name: 'Kate P.', status: 'on-call', sentiment: 0.75 },
    { id: '12', name: 'Tom R.', status: 'on-call', sentiment: 0.8 },
  ];

  // Performance Metrics
  performanceMetrics: PerformanceMetric[] = [
    { label: 'Average Team Score', value: 85, colorClass: 'bg-primary' },
    { label: 'Customer Sentiment', value: 62, colorClass: 'bg-success' },
    { label: 'Daily Call Volume', value: 75, colorClass: 'bg-info' },
    { label: 'Performance Trend', value: 78, colorClass: 'bg-warning' },
  ];

  // Coaching Queue
  coachingQueue: CoachingSession[] = [
    {
      id: '1',
      agentName: 'Lisa K.',
      topic: 'Escalation Handling',
      type: 'Urgent',
      priority: 'high',
      scheduledTime: 'Today 2:00 PM',
    },
    {
      id: '2',
      agentName: 'Mark H.',
      topic: 'Sentiment Improvement',
      type: 'Regular',
      priority: 'medium',
      scheduledTime: 'Thu 10:00 AM',
    },
    {
      id: '3',
      agentName: 'Sarah J.',
      topic: 'Leadership Development',
      type: 'Development',
      priority: 'low',
      scheduledTime: 'Fri 3:00 PM',
    },
  ];

  // System Alerts
  systemAlerts: SystemAlert[] = [
    {
      id: '1',
      type: 'error',
      title: 'High Call Volume',
      message: 'Queue exceeding normal capacity',
      timestamp: '2 min ago',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Agent Availability',
      message: '2 agents on unexpected break',
      timestamp: '5 min ago',
    },
  ];

  // Call Queue Breakdown
  callQueueBreakdown: QueueItem[] = [
    {
      type: 'New Customers',
      count: 8,
      avgWaitTime: '3:45',
      icon: 'bx bx-user-plus',
      colorClass: 'bg-label-success',
    },
    {
      type: 'Technical Support',
      count: 12,
      avgWaitTime: '5:20',
      icon: 'bx bx-wrench',
      colorClass: 'bg-label-info',
    },
    {
      type: 'Billing Inquiries',
      count: 3,
      avgWaitTime: '2:15',
      icon: 'bx bx-credit-card',
      colorClass: 'bg-label-warning',
    },
  ];

  // QA Stats
  qaStats: QAStats = {
    reviewedToday: 8,
    targetReviews: 15,
    pendingReviews: 12,
  };

  // Modal States
  showCoachingModal = false;
  selectedAgent: Agent | null = null;
  coachingMessage = '';

  // Quick Coaching Tips
  quickCoachingTips = [
    'Try offering account review + discount',
    'Use empathetic language',
    'Listen actively to customer concerns',
    'Offer alternative solutions',
    'Escalate if needed',
  ];

  // Chart instances
  private performanceChartInstance?: Chart;
  private queueChartInstance?: Chart;

  // User data
  currentUser: User | null = null;
  currentUserEmail: string = '';
  adminData = {
    name: '',
    id: '',
    role: 'Admin',
  };

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private dailyStatsService: DailyStatsService,
    private coachingTipsService: CoachingTipsService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    // Get current user email from token
    const userEmailFromToken = this.tokenService.getEmailFromToken();
    const userFullName = this.tokenService.getFullNameFromToken();

    if (userEmailFromToken) {
      this.currentUserEmail = userEmailFromToken;
      console.log('Current user email from token:', this.currentUserEmail);

      // Load user data
      this.loadUserData();

      // Load team data and stats
      this.loadTeamData();

      // Load online agents data first
      this.loadOnlineAgents();

      // Load team ranking data (will use agent email if admin has no team)
      this.loadTeamRanking();

      // Load agent feedback data
      this.loadAgentFeedback();
    } else {
      console.error('No user email found in token');
      // Handle case where no token or invalid token
    }

    // Initialize component
    this.initializeRealTimeUpdates();
  }

  ngAfterViewInit(): void {
    this.initializeCharts();
  }

  loadUserData(): void {
    // Load current user data
    this.userService.getUserByEmail(this.currentUserEmail).subscribe({
      next: (user) => {
        this.currentUser = user;
        console.log('Current admin user loaded:', user);
        console.log('Admin user roles:', user.roles);
        console.log('Admin user team:', user.team);

        // Update admin data with real user information
        this.adminData.name =
          user.firstname || user.fullName?.split(' ')[0] || 'Admin';
        this.adminData.id =
          `M${user.id?.toString().padStart(3, '0')}` || 'M001';
        this.adminData.role =
          user.roles && user.roles.length > 0
            ? user.roles[0].name || 'Admin'
            : 'Admin';
      },
      error: (error) => {
        console.error('Error loading admin user data:', error);
      },
    });
  }

  loadTeamData(): void {
    // Load all teams to find the admin's team
    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        console.log('All teams loaded:', teams);
        
        // Find the team where the current user is the manager
        const adminTeam = teams.find(team => 
          team.manager?.email === this.currentUserEmail
        );
        
        if (adminTeam) {
          this.currentTeam = adminTeam;
          console.log('Admin team found:', adminTeam);
          
          // Load team stats for today
          if (adminTeam.id) {
            this.loadTeamStatsForToday(adminTeam.id);
          }
        } else {
          console.log('No team found for admin user, using first available team');
          // Fallback: use the first team available
          if (teams.length > 0 && teams[0].id) {
            this.currentTeam = teams[0];
            this.loadTeamStatsForToday(teams[0].id);
          }
        }
      },
      error: (error) => {
        console.error('Error loading teams:', error);
      }
    });
  }

  loadTeamStatsForToday(teamId: number): void {
    // Load today's stats
    this.dailyStatsService.getTeamStatsForToday(teamId).subscribe({
      next: (stats) => {
        this.currentTeamStats = stats;
        console.log('Team stats loaded:', stats);
        
        // Update the team average sentiment
        if (stats.averageSentiment !== undefined) {
          this.teamAvgSentiment = Math.round(stats.averageSentiment * 100);
        }
        
        // Update active calls
        if (stats.totalCalls !== undefined) {
          this.activeCalls = stats.totalCalls;
        }
      },
      error: (error) => {
        console.error('Error loading team stats:', error);
      }
    });

    // Load weekly stats for charts
    this.loadTeamWeeklyStats(teamId);
  }

  loadTeamWeeklyStats(teamId: number): void {
    this.dailyStatsService.getTeamWeeklyStats(teamId).subscribe({
      next: (weeklyStats) => {
        this.weeklyTeamStats = weeklyStats;
        console.log('Weekly team stats loaded:', weeklyStats);
        
        // Update charts and metrics with new data
        this.updatePerformanceChart();
        this.updatePerformanceMetrics();
      },
      error: (error) => {
        console.error('Error loading weekly team stats:', error);
      }
    });
  }

  loadTeamRanking(): void {
    // For admin dashboard, we need to get team ranking differently
    // Since admin might not have team data, let's try a few approaches:

    // Approach 1: Try using admin's email first
    this.dailyStatsService.getTeamRanking(this.currentUserEmail).subscribe({
      next: (ranking) => {
        this.teamLeaderboard = ranking;
        console.log(
          'Team ranking loaded for admin dashboard (using admin email):',
          ranking
        );

        // Debug: Log the structure of each member
        ranking.forEach((member, index) => {
          console.log(`Member ${index}:`, {
            agentName: member.agentName,
            rank: member.rank,
            score: member.score,
            totalScore: member.totalScore,
            callsCompleted: member.callsCompleted,
            averageSentiment: member.averageSentiment,
            userEmail: member.userEmail,
          });
        });
      },
      error: (error) => {
        console.error('Error loading team ranking with admin email:', error);
        // Fallback: try using an agent's email
        this.loadTeamRankingViaAgent();
      },
    });
  }

  private loadTeamRankingViaAgent(): void {
    // Get team ranking using an online agent's email as a workaround
    if (this.onlineAgentsList && this.onlineAgentsList.length > 0) {
      const firstAgentEmail = this.onlineAgentsList[0].email;
      if (firstAgentEmail) {
        console.log(
          'Trying to get team ranking using agent email:',
          firstAgentEmail
        );
        this.dailyStatsService.getTeamRanking(firstAgentEmail).subscribe({
          next: (ranking) => {
            this.teamLeaderboard = ranking;
            console.log(
              'Team ranking loaded for admin dashboard (using agent email):',
              ranking
            );
          },
          error: (error) => {
            console.error(
              'Error loading team ranking with agent email:',
              error
            );
          },
        });
      }
    } else {
      // If no online agents, try to get all users and use the first agent
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          const firstAgent = users.find((user) =>
            user.roles?.some((role) => role.name === 'AGENT')
          );
          if (firstAgent && firstAgent.email) {
            console.log(
              'Trying to get team ranking using first available agent:',
              firstAgent.email
            );
            this.dailyStatsService.getTeamRanking(firstAgent.email).subscribe({
              next: (ranking) => {
                this.teamLeaderboard = ranking;
                console.log(
                  'Team ranking loaded for admin dashboard (using first agent):',
                  ranking
                );
              },
              error: (error) => {
                console.error(
                  'Error loading team ranking with first agent:',
                  error
                );
              },
            });
          }
        },
        error: (error) => {
          console.error('Error loading all users for team ranking:', error);
        },
      });
    }
  }

  loadOnlineAgents(): void {
    this.userService.getOnlineAgents().subscribe({
      next: (agents) => {
        this.onlineAgentsList = agents;
        this.onlineAgentsCount = agents.length;
        console.log('Online agents loaded for admin dashboard:', agents);

        // Update the totalAgents count with real data
        this.totalAgents = agents.length + this.agentsOnBreak; // Simple calculation

        // If team leaderboard is empty and we now have agents, try to load ranking
        if (this.teamLeaderboard.length === 0 && agents.length > 0) {
          this.loadTeamRankingViaAgent();
        }
      },
      error: (error) => {
        console.error('Error loading online agents:', error);
      },
    });
  }

  loadAgentFeedback(): void {
    // Reset feedback arrays
    this.agentFeedbackList = [];
    this.acknowledgedTipsToday = [];
    this.helpfulTipsToday = [];
    this.totalFeedbackToday = 0;
    this.totalAcknowledgedToday = 0;
    this.totalHelpfulToday = 0;

    console.log('Starting to load agent feedback with new API...');
    console.log('Current user email from token:', this.currentUserEmail);
    console.log('Online agents list:', this.onlineAgentsList);

    // Test: Try getting feedback for the current admin user first
    console.log('Testing new feedback API with admin email:', this.currentUserEmail);
    this.coachingTipsService
      .getAckAndHelpfulTipsToday(this.currentUserEmail)
      .subscribe({
        next: (response) => {
          console.log('Admin user feedback response (new API):', response);
          if (response.acknowledged) {
            this.acknowledgedTipsToday.push(...response.acknowledged);
            this.totalAcknowledgedToday += response.acknowledged.length;
          }
          if (response.helpful) {
            this.helpfulTipsToday.push(...response.helpful);
            this.totalHelpfulToday += response.helpful.length;
          }
          // Combine both for backward compatibility
          this.agentFeedbackList.push(...(response.acknowledged || []), ...(response.helpful || []));
          this.totalFeedbackToday = this.totalAcknowledgedToday + this.totalHelpfulToday;
        },
        error: (error) => {
          console.error('Error loading admin feedback (new API):', error);
        },
      });

    // Get feedback from online agents
    if (this.onlineAgentsList && this.onlineAgentsList.length > 0) {
      console.log(`Loading feedback for ${this.onlineAgentsList.length} online agents`);
      
      this.onlineAgentsList.forEach((agent) => {
        if (agent.email) {
          console.log(`Calling new feedback API for agent: ${agent.email}`);
          this.coachingTipsService
            .getAckAndHelpfulTipsToday(agent.email)
            .subscribe({
              next: (response) => {
                console.log(`Feedback response for agent ${agent.email} (new API):`, response);
                
                if (response.acknowledged) {
                  this.acknowledgedTipsToday.push(...response.acknowledged);
                  this.totalAcknowledgedToday += response.acknowledged.length;
                }
                if (response.helpful) {
                  this.helpfulTipsToday.push(...response.helpful);
                  this.totalHelpfulToday += response.helpful.length;
                }
                
                // Combine both for backward compatibility
                this.agentFeedbackList.push(...(response.acknowledged || []), ...(response.helpful || []));
                this.totalFeedbackToday = this.totalAcknowledgedToday + this.totalHelpfulToday;
                
                console.log(`Total acknowledged: ${this.totalAcknowledgedToday}, Total helpful: ${this.totalHelpfulToday}`);
              },
              error: (error) => {
                console.error(
                  `Error loading feedback for agent ${agent.email} (new API):`,
                  error
                );
              },
            });
        }
      });
    } else {
      console.log('No online agents available, trying to get feedback from all agents');
      // If no online agents available, try to get feedback from all agents
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          const agents = users.filter((user) =>
            user.roles?.some((role) => role.name === 'AGENT')
          );
          
          console.log(`Found ${agents.length} total agents`);

          agents.forEach((agent) => {
            if (agent.email) {
              console.log(`Calling new feedback API for agent: ${agent.email}`);
              this.coachingTipsService
                .getAckAndHelpfulTipsToday(agent.email)
                .subscribe({
                  next: (response) => {
                    console.log(`Feedback response for agent ${agent.email} (new API):`, response);
                    
                    if (response.acknowledged) {
                      this.acknowledgedTipsToday.push(...response.acknowledged);
                      this.totalAcknowledgedToday += response.acknowledged.length;
                    }
                    if (response.helpful) {
                      this.helpfulTipsToday.push(...response.helpful);
                      this.totalHelpfulToday += response.helpful.length;
                    }
                    
                    // Combine both for backward compatibility
                    this.agentFeedbackList.push(...(response.acknowledged || []), ...(response.helpful || []));
                    this.totalFeedbackToday = this.totalAcknowledgedToday + this.totalHelpfulToday;
                    
                    console.log(`Total acknowledged: ${this.totalAcknowledgedToday}, Total helpful: ${this.totalHelpfulToday}`);
                  },
                  error: (error) => {
                    console.error(
                      `Error loading feedback for agent ${agent.email} (new API):`,
                      error
                    );
                  },
                });
            }
          });
        },
        error: (error) => {
          console.error('Error loading users for feedback collection:', error);
        },
      });
    }
  }

  initializeRealTimeUpdates(): void {
    // Update real-time data every 30 seconds
    setInterval(() => {
      this.loadOnlineAgents();
      this.loadAgentFeedback(); // Also update feedback data
      
      // Update team stats if we have a current team
      if (this.currentTeam && this.currentTeam.id) {
        this.loadTeamStatsForToday(this.currentTeam.id);
      }
      // You can add other real-time updates here
    }, 30000);
  }

  getTeamAverageSentiment(): number {
    // Use real team stats if available
    if (this.currentTeamStats && this.currentTeamStats.averageSentiment !== undefined) {
      return Math.round(this.currentTeamStats.averageSentiment * 100);
    }
    
    // Calculate real team average from leaderboard data as fallback
    if (this.teamLeaderboard && this.teamLeaderboard.length > 0) {
      // Use the effective score method for consistency
      const scores = this.teamLeaderboard.map((member) =>
        this.getEffectiveScore(member)
      );
      const validScores = scores.filter((score: number) => score > 0);
      
      if (validScores.length > 0) {
        return Math.round(validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length);
      }
    }
    
    // Fallback to stored value
    return this.teamAvgSentiment;
  }

  getActiveCalls(): number {
    // Use real team stats if available
    if (this.currentTeamStats && this.currentTeamStats.totalCalls !== undefined) {
      return this.currentTeamStats.totalCalls;
    }
    // Fallback to stored value
    return this.activeCalls;
  }

  getAverageScore(): number {
    // Use real team stats if available
    if (this.currentTeamStats && this.currentTeamStats.averageScore !== undefined) {
      return Math.round(this.currentTeamStats.averageScore);
    }
    // Calculate from leaderboard as fallback
    if (this.teamLeaderboard && this.teamLeaderboard.length > 0) {
      const scores = this.teamLeaderboard.map((member) =>
        this.getEffectiveScore(member)
      );
      const validScores = scores.filter((score: number) => score > 0);
      if (validScores.length > 0) {
        return Math.round(validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length);
      }
    }
    return 0;
  }

  // Team Leaderboard Helper Methods
  getAgentDisplayName(member: AgentRankingDTO): string {
    if (member.agentName && member.agentName.trim() !== '') {
      return member.agentName;
    }
    if (member.userEmail) {
      return member.userEmail.split('@')[0];
    }
    return 'Unknown Agent';
  }

  getRankBadgeClass(rank: number): string {
    switch (rank) {
      case 1:
        return 'bg-success';
      case 2:
        return 'bg-warning';
      case 3:
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getRankIcon(rank: number): string {
    switch (rank) {
      case 1:
        return 'bx-trophy';
      case 2:
        return 'bx-medal';
      case 3:
        return 'bx-award';
      default:
        return 'bx-user';
    }
  }

  getSentimentPercentage(sentiment: number): number {
    return Math.round(sentiment * 100);
  }

  getSentimentClass(sentiment: number): string {
    const percentage = this.getSentimentPercentage(sentiment);
    if (percentage >= 70) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-danger';
  }

  getScoreClass(score: number): string {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  }

  // Get effective score from available data
  getEffectiveScore(member: AgentRankingDTO): number {
    // Use averageSentiment as the primary score (convert to percentage)
    if (
      member.averageSentiment !== undefined &&
      member.averageSentiment !== null
    ) {
      return Math.round(member.averageSentiment * 100);
    }
    // Fallback to score property if it exists
    if (member.score !== undefined && member.score !== null) {
      return member.score;
    }
    return 0;
  }

  // Feedback helper methods
  getFeedbackByType(type: string): CoachingTip[] {
    return this.agentFeedbackList.filter((tip) => tip.type === type);
  }

  getFeedbackCountByType(type: string): number {
    return this.getFeedbackByType(type).length;
  }

  // New methods for acknowledged and helpful tips
  getAcknowledgedTipsCount(): number {
    return this.totalAcknowledgedToday;
  }

  getHelpfulTipsCount(): number {
    return this.totalHelpfulToday;
  }

  getAcknowledgedTipsByType(type: string): CoachingTip[] {
    return this.acknowledgedTipsToday.filter((tip) => tip.type === type);
  }

  getHelpfulTipsByType(type: string): CoachingTip[] {
    return this.helpfulTipsToday.filter((tip) => tip.type === type);
  }

  getRecentFeedback(limit: number = 5): CoachingTip[] {
    return this.agentFeedbackList
      .sort(
        (a, b) =>
          new Date(b.acknowledgedAt || b.createdAt || '').getTime() -
          new Date(a.acknowledgedAt || a.createdAt || '').getTime()
      )
      .slice(0, limit);
  }

  getFeedbackByAgent(agentEmail: string): CoachingTip[] {
    return this.agentFeedbackList.filter(
      (tip) => tip.user?.email === agentEmail
    );
  }

  getMostActiveFeedbackAgent(): string {
    if (this.agentFeedbackList.length === 0) return 'No feedback available';

    const agentCounts = this.agentFeedbackList.reduce((acc, tip) => {
      const email = tip.user?.email || 'Unknown';
      acc[email] = (acc[email] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topAgent = Object.entries(agentCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    return topAgent ? topAgent[0].split('@')[0] : 'Unknown';
  }

  getTopScore(): number {
    if (!this.teamLeaderboard || this.teamLeaderboard.length === 0) {
      return 0;
    }

    // Use the effective score method for consistency
    const scores = this.teamLeaderboard.map((member) =>
      this.getEffectiveScore(member)
    );
    return Math.max(...scores);
  }

  // Interaction Methods
  viewLeaderboardAgentDetails(member: AgentRankingDTO): void {
    console.log('Viewing leaderboard details for agent:', member);
    // TODO: Implement agent details modal or navigation
    // This could show detailed performance metrics, call history, etc.
  }

  exportTeamRanking(): void {
    console.log('Exporting team ranking data:', this.teamLeaderboard);
    // TODO: Implement export functionality (CSV, PDF, etc.)
  }

  // Utility Methods
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Agent Grid Methods
  getAgentCardClass(status: string): string {
    switch (status) {
      case 'alert':
        return 'border-danger';
      case 'on-call':
        return 'border-success';
      case 'break':
        return 'border-warning';
      default:
        return 'border-secondary';
    }
  }

  getAgentAvatarClass(status: string): string {
    switch (status) {
      case 'alert':
        return 'bg-label-danger';
      case 'on-call':
        return 'bg-label-success';
      case 'break':
        return 'bg-label-warning';
      default:
        return 'bg-label-secondary';
    }
  }

  getAgentStatusBadge(status: string): string {
    switch (status) {
      case 'alert':
        return 'bg-danger';
      case 'on-call':
        return 'bg-success';
      case 'break':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }

  getAgentStatusText(status: string): string {
    switch (status) {
      case 'alert':
        return 'Alert';
      case 'on-call':
        return 'On Call';
      case 'break':
        return 'Break';
      default:
        return 'Offline';
    }
  }

  getSentimentProgressClass(sentiment: number): string {
    if (sentiment >= 0.8) return 'bg-success';
    if (sentiment >= 0.6) return 'bg-warning';
    return 'bg-danger';
  }

  getSentimentTextClass(sentiment: number): string {
    if (sentiment >= 0.8) return 'text-success';
    if (sentiment >= 0.6) return 'text-warning';
    return 'text-danger';
  }

  // Performance Methods
  getOverallTeamScore(): number {
    // Use real team leaderboard data if available
    if (this.teamLeaderboard && this.teamLeaderboard.length > 0) {
      const scores = this.teamLeaderboard.map((agent) =>
        this.getEffectiveScore(agent)
      );
      const validScores = scores.filter((score) => score > 0);

      if (validScores.length > 0) {
        return Math.round(
          validScores.reduce((sum, score) => sum + score, 0) /
            validScores.length
        );
      }
    }

    // Fallback to calculated from performance metrics
    const total = this.performanceMetrics.reduce(
      (sum, metric) => sum + metric.value,
      0
    );
    return Math.round(total / this.performanceMetrics.length);
  }

  // Coaching Methods
  getTopCoachingSessions(): CoachingSession[] {
    return this.coachingQueue.slice(0, 3);
  }

  getCoachingPriorityClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-label-danger';
      case 'medium':
        return 'bg-label-warning';
      default:
        return 'bg-label-info';
    }
  }

  getCoachingTypeBadge(type: string): string {
    switch (type) {
      case 'Urgent':
        return 'bg-danger';
      case 'Development':
        return 'bg-info';
      default:
        return 'bg-primary';
    }
  }

  // Alert Methods
  getAlertTypeClass(type: string): string {
    switch (type) {
      case 'error':
        return 'bg-label-danger';
      case 'warning':
        return 'bg-label-warning';
      default:
        return 'bg-label-info';
    }
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'error':
        return 'bx bx-error-circle';
      case 'warning':
        return 'bx bx-error';
      default:
        return 'bx bx-info-circle';
    }
  }

  // QA Methods
  getQAProgress(): number {
    return Math.round(
      (this.qaStats.reviewedToday / this.qaStats.targetReviews) * 100
    );
  }

  // Chart Initialization
  initializeCharts(): void {
    this.initPerformanceChart();
    this.initQueueChart();
    
    // Update charts if we already have data
    setTimeout(() => {
      if (this.weeklyTeamStats.length > 0) {
        this.updatePerformanceChart();
      }
    }, 100);
  }

  initPerformanceChart(): void {
    if (this.performanceChart?.nativeElement) {
      const ctx = this.performanceChart.nativeElement.getContext('2d');
      if (ctx) {
        this.performanceChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              {
                label: 'Team Performance Score',
                data: [2, 2, 2, 1.67, 2, 2, 2],
                borderColor: '#696cff',
                backgroundColor: 'rgba(105, 108, 255, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y',
              },
              {
                label: 'Customer Sentiment (%)',
                data: [55, 70, 40, 80, 60, 30, 75],
                borderColor: '#71dd37',
                backgroundColor: 'rgba(113, 221, 55, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y1',
              },
              {
                label: 'Total Calls',
                data: [2, 2, 1, 3, 2, 1, 2],
                borderColor: '#ff3e1d',
                backgroundColor: 'rgba(255, 62, 29, 0.1)',
                tension: 0.4,
                fill: false,
                yAxisID: 'y',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Team Performance Analytics - Weekly Overview'
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Day of Week'
                }
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                max: 12,
                title: {
                  display: true,
                  text: 'Score / Calls Count'
                },
                grid: {
                  drawOnChartArea: true,
                },
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: 'Customer Sentiment (%)'
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
            },
          },
        });
      }
    }
  }

  initQueueChart(): void {
    if (this.queueChart?.nativeElement) {
      const ctx = this.queueChart.nativeElement.getContext('2d');
      if (ctx) {
        this.queueChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['New Customers', 'Technical', 'Billing'],
            datasets: [
              {
                data: [8, 12, 3],
                backgroundColor: ['#71dd37', '#696cff', '#ffab00'],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        });
      }
    }
  }

  updatePerformanceChart(): void {
    if (this.performanceChartInstance && this.weeklyTeamStats.length > 0) {
      // Extract data from weekly stats
      const labels = this.weeklyTeamStats.map(stat => 
        stat.dayOfWeek.substring(0, 3).charAt(0).toUpperCase() + 
        stat.dayOfWeek.substring(1, 3).toLowerCase()
      );
      const teamPerformanceData = this.weeklyTeamStats.map(stat => stat.averageScore);
      const customerSentimentData = this.weeklyTeamStats.map(stat => stat.averageSentiment * 100); // Convert to percentage
      const totalCallsData = this.weeklyTeamStats.map(stat => stat.totalCalls);

      // Update chart data
      this.performanceChartInstance.data.labels = labels;
      
      // Update Team Performance Score (y-axis)
      this.performanceChartInstance.data.datasets[0].data = teamPerformanceData;
      this.performanceChartInstance.data.datasets[0].label = 'Team Performance Score';
      
      // Update Customer Sentiment (y1-axis - percentage)
      this.performanceChartInstance.data.datasets[1].data = customerSentimentData;
      this.performanceChartInstance.data.datasets[1].label = 'Customer Sentiment (%)';
      
      // Update Total Calls (y-axis)
      this.performanceChartInstance.data.datasets[2].data = totalCallsData;
      this.performanceChartInstance.data.datasets[2].label = 'Total Calls';

      // Update the chart
      this.performanceChartInstance.update();
      console.log('Performance chart updated with weekly data:', {
        labels,
        teamPerformance: teamPerformanceData,
        customerSentiment: customerSentimentData,
        totalCalls: totalCallsData
      });
    }
  }

  updatePerformanceMetrics(): void {
    if (this.weeklyTeamStats.length > 0) {
      // Calculate metrics from weekly stats
      const avgTeamScore = this.weeklyTeamStats.reduce((sum, stat) => sum + stat.averageScore, 0) / this.weeklyTeamStats.length;
      const avgCustomerSentiment = this.weeklyTeamStats.reduce((sum, stat) => sum + stat.averageSentiment, 0) / this.weeklyTeamStats.length;
      const totalCalls = this.weeklyTeamStats.reduce((sum, stat) => sum + stat.totalCalls, 0);
      const maxCalls = Math.max(...this.weeklyTeamStats.map(stat => stat.totalCalls));

      // Update performance metrics with real data
      this.performanceMetrics = [
        { 
          label: 'Average Team Score', 
          value: Math.round((avgTeamScore / 12) * 100), // Convert 0-12 scale to percentage
          colorClass: 'bg-primary' 
        },
        { 
          label: 'Customer Sentiment', 
          value: Math.round(avgCustomerSentiment * 100), // Convert to percentage
          colorClass: 'bg-success' 
        },
        { 
          label: 'Call Volume Efficiency', 
          value: Math.round((totalCalls / (this.weeklyTeamStats.length * maxCalls)) * 100), // Percentage of max capacity
          colorClass: 'bg-info' 
        },
        { 
          label: 'Weekly Performance', 
          value: Math.round(((avgTeamScore / 12) + avgCustomerSentiment) * 50), // Combined score
          colorClass: 'bg-warning' 
        },
      ];

      console.log('Performance metrics updated:', this.performanceMetrics);
    }
  }

  // Action Methods
  refreshAgentGrid(): void {
    console.log('Refreshing agent grid...');
    // Add refresh logic here
  }

  viewAgentDetails(agent: Agent): void {
    console.log('Viewing agent details:', agent);
    // Add agent details logic here
  }

  listenIn(agent: Agent): void {
    console.log('Listening in to agent:', agent);
    // Add listen in logic here
  }

  sendCoachingMessage(agent?: Agent): void {
    if (agent) {
      this.selectedAgent = agent;
      this.showCoachingModal = true;
    } else if (this.selectedAgent && this.coachingMessage) {
      console.log(
        'Sending coaching message:',
        this.coachingMessage,
        'to:',
        this.selectedAgent
      );
      this.closeCoachingModal();
    }
  }

  escalateCall(agent: Agent): void {
    console.log('Escalating call for agent:', agent);
    // Add escalation logic here
  }

  startCoaching(session: CoachingSession): void {
    console.log('Starting coaching session:', session);
    // Add coaching start logic here
  }

  // Modal Methods
  closeCoachingModal(): void {
    this.showCoachingModal = false;
    this.selectedAgent = null;
    this.coachingMessage = '';
  }

  selectQuickTip(tip: string): void {
    this.coachingMessage = tip;
  }

  // Navigation Methods
  viewTeamPerformance(): void {
    console.log('Navigating to team performance...');
  }

  viewCoachingQueue(): void {
    console.log('Navigating to coaching queue...');
  }

  viewLiveMonitoring(): void {
    console.log('Navigating to live monitoring...');
  }

  // Management Action Methods
  teamMeeting(): void {
    console.log('Scheduling team meeting...');
  }

  bulkCoaching(): void {
    console.log('Setting up bulk coaching...');
  }

  scheduleBreaks(): void {
    console.log('Managing break schedules...');
  }

  agentTraining(): void {
    console.log('Managing agent training...');
  }

  sendTeamMessage(): void {
    console.log('Sending team message...');
  }

  emergencyProtocol(): void {
    console.log('Activating emergency protocol...');
  }

  // QA Methods
  startQAReview(): void {
    console.log('Starting QA review...');
  }

  viewQAQueue(): void {
    console.log('Viewing QA queue...');
  }

  qaSettings(): void {
    console.log('Opening QA settings...');
  }

  // Report Methods
  generateDailyReport(): void {
    console.log('Generating daily report...');
  }

  generateWeeklyReport(): void {
    console.log('Generating weekly report...');
  }

  exportTeamData(): void {
    if (!this.teamLeaderboard || this.teamLeaderboard.length === 0) {
      console.log('No team data to export');
      return;
    }

    console.log('Exporting team data...');

    // Prepare data for export
    const exportData = this.teamLeaderboard.map((member) => ({
      rank: member.rank,
      name: member.agentName,
      score: this.getEffectiveScore(member),
      calls: member.callsCompleted || 0,
      sentiment: member.averageSentiment
        ? (member.averageSentiment * 100).toFixed(1) + '%'
        : 'N/A',
      email: member.userEmail,
      totalScore: member.totalScore || 0,
    }));

    // Create CSV content
    const headers = [
      'Rank',
      'Agent Name',
      'Score (%)',
      'Calls Completed',
      'Avg Sentiment',
      'Email',
      'Total Score',
    ];
    const csvContent = [
      headers.join(','),
      ...exportData.map((row) =>
        [
          row.rank,
          `"${row.name}"`,
          row.score,
          row.calls,
          row.sentiment,
          `"${row.email}"`,
          row.totalScore,
        ].join(',')
      ),
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `team_leaderboard_${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  viewTrends(): void {
    console.log('Viewing performance trends...');
  }

  // Queue Management Methods
  manageQueue(): void {
    console.log('Managing call queue...');
  }

  redistributeCalls(): void {
    console.log('Redistributing calls...');
  }

  viewQueueHistory(): void {
    console.log('Viewing queue history...');
  }

  // Coaching Management Methods
  scheduleCoaching(): void {
    console.log('Scheduling new coaching session...');
  }

  viewAllCoaching(): void {
    console.log('Viewing all coaching sessions...');
  }

  exportCoaching(): void {
    console.log('Exporting coaching data...');
  }

  // Additional feedback methods
  exportFeedbackData(): void {
    if (!this.agentFeedbackList || this.agentFeedbackList.length === 0) {
      console.log('No feedback data to export');
      return;
    }

    console.log('Exporting feedback data...');

    // Prepare data for export
    const exportData = this.agentFeedbackList.map((feedback) => ({
      agentName: feedback.user?.email?.split('@')[0] || 'Unknown',
      agentEmail: feedback.user?.email || 'Unknown',
      title: feedback.title,
      message: feedback.message,
      type: feedback.type,
      helpful: feedback.helpful,
      acknowledgedAt: feedback.acknowledgedAt,
      createdAt: feedback.createdAt,
    }));

    // Create CSV content
    const headers = [
      'Agent Name',
      'Agent Email',
      'Title',
      'Message',
      'Type',
      'Helpful',
      'Acknowledged At',
      'Created At',
    ];
    const csvContent = [
      headers.join(','),
      ...exportData.map((row) =>
        [
          `"${row.agentName}"`,
          `"${row.agentEmail}"`,
          `"${row.title}"`,
          `"${row.message}"`,
          row.type,
          row.helpful,
          row.acknowledgedAt || '',
          row.createdAt || '',
        ].join(',')
      ),
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `agent_feedback_${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  trackByFeedbackId(index: number, feedback: CoachingTip): any {
    return feedback.id || index;
  }

  getTimeAgo(dateString?: string): string {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  getAgentNameFromFeedback(feedback: CoachingTip): string {
    return feedback.user?.email?.split('@')[0] || 'Unknown Agent';
  }
}
