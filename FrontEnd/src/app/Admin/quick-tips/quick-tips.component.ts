import { Component, OnInit } from '@angular/core';
import { CoachingTipsService } from '../../services/coaching-tips.service';
import { UserService } from '../../services/user.service';
import { CoachingTip, TipType } from '../../models/coaching-tip';
import { User } from '../../models/user';

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

  // Form properties
  showCreateForm = false;
  showAssignForm = false;
  isEditing = false;
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
  error = '';
  success = '';

  // Enum for template
  tipTypes = Object.values(TipType);

  // Math for template
  Math = Math;

  constructor(
    private coachingTipsService: CoachingTipsService,
    private userService: UserService
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
  openCreateForm(): void {
    this.showCreateForm = true;
    this.showAssignForm = false;
    this.isEditing = false;
    this.currentTip = this.getEmptyTip();
    this.clearMessages();
  }

  openAssignForm(): void {
    this.showAssignForm = true;
    this.showCreateForm = false;
    this.isEditing = false;
    this.currentTip = this.getEmptyTip();
    this.selectedUserId = null;
    this.clearMessages();
  }

  editTip(tip: CoachingTip): void {
    this.isEditing = true;
    this.showCreateForm = true;
    this.showAssignForm = false;
    this.currentTip = { ...tip };
    this.clearMessages();
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.showAssignForm = false;
    this.isEditing = false;
    this.currentTip = this.getEmptyTip();
    this.selectedUserId = null;
    this.clearMessages();
  }

  // CRUD operations
  submitTipForm(): void {
    if (!this.validateTip()) return;

    this.loading = true;
    const operation = this.isEditing
      ? this.coachingTipsService.updateCoachingTip(this.currentTip)
      : this.coachingTipsService.createCoachingTip(this.currentTip);

    operation.subscribe({
      next: (tip: CoachingTip) => {
        this.success = this.isEditing
          ? 'Tip updated successfully!'
          : 'Tip created successfully!';
        this.loadCoachingTips();
        this.cancelForm();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to save tip';
        this.loading = false;
        console.error(err);
      },
    });
  }

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
}
