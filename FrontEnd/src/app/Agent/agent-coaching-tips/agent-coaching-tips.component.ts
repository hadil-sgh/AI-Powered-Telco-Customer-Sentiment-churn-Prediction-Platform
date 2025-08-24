import { Component, OnInit } from '@angular/core';
import { CoachingTipsService } from '../../services/coaching-tips.service';
import { AuthService } from '../../services/auth.service';
import { CoachingTip, TipType } from '../../models/coaching-tip';

@Component({
  selector: 'app-agent-coaching-tips',
  templateUrl: './agent-coaching-tips.component.html',
  styleUrls: ['./agent-coaching-tips.component.scss'],
})
export class AgentCoachingTipsComponent implements OnInit {
  // Data properties
  coachingTips: CoachingTip[] = [];
  unacknowledgedTips: CoachingTip[] = [];
  recentTips: CoachingTip[] = [];

  // UI properties
  loading = false;
  error = '';
  activeTab = 'unacknowledged';

  constructor(
    private coachingTipsService: CoachingTipsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserTips();
  }

  // Load tips for current user
  loadUserTips(): void {
    this.loading = true;
    const userEmail = this.getCurrentUserEmail();

    if (!userEmail) {
      this.error = 'User not logged in';
      this.loading = false;
      return;
    }

    // Load unacknowledged tips
    this.coachingTipsService
      .getUnacknowledgedTipsByUserEmail(userEmail)
      .subscribe({
        next: (tips: CoachingTip[]) => {
          this.unacknowledgedTips = tips;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = 'Failed to load tips';
          this.loading = false;
          console.error(err);
        },
      });

    // Load recent tips
    this.coachingTipsService.getRecentTipsByUserEmail(userEmail, 30).subscribe({
      next: (tips: CoachingTip[]) => {
        this.recentTips = tips;
      },
      error: (err: any) => {
        console.error('Failed to load recent tips:', err);
      },
    });
  }

  // Acknowledge a tip
  acknowledgeTip(tipId: number): void {
    this.coachingTipsService.acknowledgeTip(tipId).subscribe({
      next: (tip: CoachingTip) => {
        // Remove from unacknowledged list
        this.unacknowledgedTips = this.unacknowledgedTips.filter(
          (t) => t.id !== tipId
        );
        // Update in recent tips if present
        const recentIndex = this.recentTips.findIndex((t) => t.id === tipId);
        if (recentIndex !== -1) {
          this.recentTips[recentIndex] = tip;
        }
      },
      error: (err: any) => {
        this.error = 'Failed to acknowledge tip';
        console.error(err);
      },
    });
  }

  // Mark tip as helpful
  markAsHelpful(tipId: number, helpful: boolean): void {
    this.coachingTipsService.markTipAsHelpful(tipId, helpful).subscribe({
      next: (tip: CoachingTip) => {
        // Update in both lists if present
        const unackIndex = this.unacknowledgedTips.findIndex(
          (t) => t.id === tipId
        );
        if (unackIndex !== -1) {
          this.unacknowledgedTips[unackIndex] = tip;
        }

        const recentIndex = this.recentTips.findIndex((t) => t.id === tipId);
        if (recentIndex !== -1) {
          this.recentTips[recentIndex] = tip;
        }
      },
      error: (err: any) => {
        this.error = 'Failed to update tip';
        console.error(err);
      },
    });
  }

  // Switch tabs
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.error = '';
  }

  // Get current user email (implement based on your auth system)
  getCurrentUserEmail(): string {
    // This should be implemented based on your authentication system
    // For now, returning a mock email - replace with actual implementation
    return localStorage.getItem('userEmail') || 'user@example.com';
  }

  // Utility methods
  getTipTypeLabel(type: TipType): string {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
}
