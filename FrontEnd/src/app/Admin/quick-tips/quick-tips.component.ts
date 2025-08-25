import { Component, OnInit } from '@angular/core';
import { CoachingTipsService } from '../../services/coaching-tips.service';
import { UserService } from '../../services/user.service';
import { DailyStatsService } from '../../services/daily-stats.service';
import { CoachingTip, TipType } from '../../models/coaching-tip';
import { User } from '../../models/user';
import { DailyStats } from '../../models/daily-stats';

@Component({
  selector: 'app-quick-tips',
  templateUrl: './quick-tips.component.html',
  styleUrls: ['./quick-tips.component.scss'],
})
export class QuickTipsComponent implements OnInit {
  // Data properties
  coachingTips: CoachingTip[] = [];
  users: User[] = [];
  filteredTips: CoachingTip[] = [];
  selectedAgentStats: DailyStats | null = null;

  // Form properties
  showAssignForm = false;
  currentTip: CoachingTip = this.getEmptyTip();
  selectedUserId: number | null = null;
  currentManagerId: number | null = null;

  // Filter properties
  searchTerm = '';
  selectedTipType: TipType | '' = '';
  selectedStatus = '';
  currentPage = 1;
  itemsPerPage = 10;

  // UI properties
  loading = false;
  loadingAgentStats = false;
  error = '';
  success = '';

  // Enum for template
  tipTypes = Object.values(TipType);

  // Math for template
  Math = Math;

  constructor(
    private coachingTipsService: CoachingTipsService,
    private userService: UserService,
    private dailyStatsService: DailyStatsService
  ) {}

  ngOnInit(): void {
    this.loadCoachingTips();
    this.loadUsers();
  }

  // Data loading methods
  loadCoachingTips(): void {
    this.loading = true;
    this.coachingTipsService.getAllCoachingTips().subscribe({
      next: (tips: CoachingTip[]) => {
        this.coachingTips = tips;
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load coaching tips';
        this.loading = false;
        console.error(err);
      },
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
      },
      error: (err: any) => {
        console.error('Failed to load users:', err);
      },
    });
  }

  // Filter and search methods
  applyFilters(): void {
    this.filteredTips = this.coachingTips.filter((tip) => {
      const matchesSearch =
        !this.searchTerm ||
        tip.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tip.message.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tip.user?.firstname
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        tip.user?.lastname
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchesType =
        !this.selectedTipType || tip.type === this.selectedTipType;

      const matchesStatus =
        !this.selectedStatus ||
        (this.selectedStatus === 'acknowledged' && tip.acknowledged) ||
        (this.selectedStatus === 'unacknowledged' && !tip.acknowledged) ||
        (this.selectedStatus === 'helpful' && tip.helpful);

      return matchesSearch && matchesType && matchesStatus;
    });
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  // Pagination methods
  get paginatedTips(): CoachingTip[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTips.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTips.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Form methods
  openAssignForm(): void {
    this.showAssignForm = true;
    this.currentTip = this.getEmptyTip();
    this.selectedUserId = null;
    this.selectedAgentStats = null;
    this.clearMessages();
  }

  cancelForm(): void {
    this.showAssignForm = false;
    this.currentTip = this.getEmptyTip();
    this.selectedUserId = null;
    this.selectedAgentStats = null;
    this.clearMessages();
  }

  onUserSelectionChange(): void {
    this.selectedAgentStats = null;
    if (this.selectedUserId) {
      this.loadAgentYesterdayStats();
    }
  }

  loadAgentYesterdayStats(): void {
    if (!this.selectedUserId) return;

    // Convert selectedUserId to number for comparison since HTML select returns string
    const userIdNumber = Number(this.selectedUserId);
    const selectedUser = this.users.find((user) => user.id === userIdNumber);

    if (!selectedUser || !selectedUser.email) {
      return;
    }

    this.loadingAgentStats = true;
    this.dailyStatsService.getYesterdayStats(selectedUser.email).subscribe({
      next: (stats: DailyStats) => {
        this.selectedAgentStats = stats;
        this.loadingAgentStats = false;
      },
      error: (err: any) => {
        console.error('Failed to load agent stats:', err);
        this.selectedAgentStats = null;
        this.loadingAgentStats = false;
      },
    });
  }

  // CRUD operations
  submitAssignForm(): void {
    if (!this.validateAssignment()) return;

    this.loading = true;
    this.currentManagerId = this.getCurrentUserId(); // Get current logged-in user ID

    this.coachingTipsService
      .createAndAssignTip(
        this.currentTip.title,
        this.currentTip.message,
        this.currentTip.type,
        this.selectedUserId!,
        this.currentManagerId!
      )
      .subscribe({
        next: (tip: CoachingTip) => {
          this.success = 'Tip created and assigned successfully!';
          this.loadCoachingTips();
          this.cancelForm();
          this.loading = false;
        },
        error: (err: any) => {
          this.error = 'Failed to create and assign tip';
          this.loading = false;
          console.error(err);
        },
      });
  }

  deleteTip(tipId: number): void {
    if (!confirm('Are you sure you want to delete this tip?')) return;

    this.loading = true;
    this.coachingTipsService.deleteCoachingTip(tipId).subscribe({
      next: () => {
        this.success = 'Tip deleted successfully!';
        this.loadCoachingTips();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to delete tip';
        this.loading = false;
        console.error(err);
      },
    });
  }

  // Validation methods
  validateTip(): boolean {
    if (!this.currentTip.title.trim()) {
      this.error = 'Title is required';
      return false;
    }
    if (!this.currentTip.message.trim()) {
      this.error = 'Message is required';
      return false;
    }
    if (!this.currentTip.type) {
      this.error = 'Type is required';
      return false;
    }
    return true;
  }

  validateAssignment(): boolean {
    if (!this.validateTip()) return false;
    if (!this.selectedUserId) {
      this.error = 'Please select a user to assign the tip to';
      return false;
    }
    return true;
  }

  // Utility methods
  getEmptyTip(): CoachingTip {
    return {
      title: '',
      message: '',
      type: TipType.TECHNIQUE_SUGGESTION,
      acknowledged: false,
      helpful: false,
    };
  }

  getCurrentUserId(): number {
    // This should be implemented based on your auth system
    // For now, returning a default value
    return 1;
  }

  getUserFullName(user: User | undefined): string {
    if (!user) return 'N/A';
    return (
      `${user.firstname || ''} ${user.lastname || ''}`.trim() ||
      user.email ||
      'Unknown'
    );
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getTipTypeColor(type: TipType): string {
    switch (type) {
      case TipType.SENTIMENT_ALERT:
        return 'warning';
      case TipType.COMPETITOR_MENTION:
        return 'danger';
      case TipType.ESCALATION_RISK:
        return 'danger';
      case TipType.TECHNIQUE_SUGGESTION:
        return 'success';
      default:
        return 'primary';
    }
  }

  getTipTypeIcon(type: TipType): string {
    switch (type) {
      case TipType.SENTIMENT_ALERT:
        return 'bx-heart';
      case TipType.COMPETITOR_MENTION:
        return 'bx-shield-alt-2';
      case TipType.ESCALATION_RISK:
        return 'bx-error-circle';
      case TipType.TECHNIQUE_SUGGESTION:
        return 'bx-bulb';
      default:
        return 'bx-info-circle';
    }
  }

  getTipTypeLabel(type: TipType): string {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }

  // Agent Stats Display Methods
  getCallsCompletionPercentage(): number {
    if (
      !this.selectedAgentStats?.callsTarget ||
      this.selectedAgentStats.callsTarget === 0
    ) {
      return 0;
    }
    return Math.round(
      ((this.selectedAgentStats.callsCompleted || 0) /
        this.selectedAgentStats.callsTarget) *
        100
    );
  }

  getCallsCompletionColor(): string {
    const percentage = this.getCallsCompletionPercentage();
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'danger';
  }

  getSentimentColor(sentiment: number | undefined): string {
    if (!sentiment) return '#6c757d';
    if (sentiment >= 0.7) return '#28a745';
    if (sentiment >= 0.4) return '#ffc107';
    return '#dc3545';
  }

  getSentimentLabel(sentiment: number | undefined): string {
    if (!sentiment) return 'Unknown';
    if (sentiment >= 0.7) return 'Positive';
    if (sentiment >= 0.4) return 'Neutral';
    return 'Negative';
  }

  getStarArray(score: number | undefined): boolean[] {
    const normalizedScore = Math.min(Math.max((score || 0) / 20, 0), 5); // Assuming score is out of 100, normalize to 5
    const stars: boolean[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= normalizedScore);
    }
    return stars;
  }
}
