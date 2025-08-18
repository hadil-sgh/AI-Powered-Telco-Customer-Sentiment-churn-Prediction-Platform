import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { AudioStreamService } from '../../services/audio-stream.service';
import { CallRecordService } from '../../services/call-record.service';
import { TokenService } from '../../services/token.service';
import { SentimentPointService } from '../../services/sentiment-point.service';
import { CallRecord } from '../../models/call-record';
import { SentimentPoint } from '../../models/SentimentPoint';
import { AudioAnalysisResponse } from '../../models/audio-analysis-response';
import Swal from 'sweetalert2';

interface CallStats {
  totalCalls: number;
  successfulCalls: number;
  avgDuration: string;
}

@Component({
  selector: 'app-all-calls',
  templateUrl: './all-calls.component.html',
  styleUrls: ['./all-calls.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: '0px', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-in-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('300ms ease-in-out', style({ height: '0px', opacity: 0 })),
      ]),
    ]),
  ],
})
export class AllCallsComponent implements OnInit, OnDestroy {
  // Data properties
  calls: CallRecord[] = [];
  filteredCalls: CallRecord[] = [];
  paginatedCalls: CallRecord[] = [];
  selectedCall: CallRecord | null = null;
  sentimentPoints: SentimentPoint[] = [];

  // UI state
  viewMode: 'table' | 'cards' = 'table';
  searchTerm: string = '';
  selectedOutcome: string = '';
  selectedDate: string = '';
  sortBy: string = 'callDateTime';
  activeAccordionIndex: number = -1;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Stats
  callStats: CallStats = {
    totalCalls: 0,
    successfulCalls: 0,
    avgDuration: '0:00',
  };

  // Math reference for template
  Math = Math;

  constructor(
    private audioStreamService: AudioStreamService,
    private callRecordService: CallRecordService,
    private tokenService: TokenService,
    private sentimentPointService: SentimentPointService
  ) {}

  ngOnInit(): void {
    this.loadCalls();
    this.loadSentimentPoints();
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions if any
  }

  loadSentimentPoints(): void {
    const userEmail = this.tokenService.getEmailFromToken();
    if (userEmail) {
      this.sentimentPointService.getSentimentPointsByUser(userEmail).subscribe({
        next: (sentimentPoints) => {
          this.sentimentPoints = sentimentPoints;
          console.log('Loaded sentiment points:', this.sentimentPoints);
        },
        error: (error) => {
          console.error('Error loading sentiment points:', error);
          this.sentimentPoints = [];
        },
      });
    }
  }

  loadCalls(): void {
    const userEmail = this.tokenService.getEmailFromToken();
    if (userEmail) {
      this.callRecordService.getCallRecordBySession(userEmail).subscribe({
        next: (calls) => {
          console.log('Raw calls data:', calls);
          this.calls = calls.map((call) => ({
            ...call,
            callDuration:
              typeof call.callDuration === 'number'
                ? { seconds: call.callDuration }
                : call.callDuration,
          }));
          console.log('Processed calls with sentiment:', this.calls.map(call => ({
            id: call.id,
            customer: call.customer?.firstName + ' ' + call.customer?.lastName,
            sentimentPoint: call.sentimentPoint,
            sentimentScore: call.sentimentPoint?.sentimentScore
          })));
          this.applyFilters();
          this.calculateStats();
        },
        error: (error) => {
          console.error('Error loading calls:', error);
          this.calls = [];
          this.applyFilters();
          this.calculateStats();
        },
      });
    } else {
      console.error('No user email found in token');
      this.calls = [];
      this.applyFilters();
      this.calculateStats();
    }
  }

  calculateStats(): void {
    this.callStats.totalCalls = this.calls.length;
    this.callStats.successfulCalls = this.calls.filter(
      (call) => call.callOutcome === 'SUCCESSFUL'
    ).length;

    // Fetch average duration from backend
    this.callRecordService.getAverageCallDuration().subscribe({
      next: (avgSeconds) => {
        // avgSeconds is in seconds, convert to minutes for display
        const avgMinutes = avgSeconds / 60;
        this.callStats.avgDuration = this.formatMinutes(avgMinutes);
      },
      error: (err) => {
        console.error('Failed to fetch average call duration:', err);
        this.callStats.avgDuration = '0:00';
      },
    });
  }

  // Search and Filter methods
  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.sortCalls();
  }

  applyFilters(): void {
    this.filteredCalls = this.calls.filter((call) => {
      const customerName = call.customer
        ? `${call.customer.firstName || ''} ${
            call.customer.lastName || ''
          }`.trim()
        : '';
      const customerPhone = call.customer?.phone || '';

      const matchesSearch =
        !this.searchTerm ||
        customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customerPhone.includes(this.searchTerm);

      const matchesOutcome =
        !this.selectedOutcome || call.callOutcome === this.selectedOutcome;

      const matchesDate =
        !this.selectedDate ||
        (call.callDateTime &&
          new Date(call.callDateTime).toISOString().split('T')[0] ===
            this.selectedDate);

      return matchesSearch && matchesOutcome && matchesDate;
    });

    this.sortCalls();
    this.updatePagination();
  }

  sortCalls(): void {
    this.filteredCalls.sort((a, b) => {
      switch (this.sortBy) {
        case 'callDateTime':
          const dateA = a.callDateTime ? new Date(a.callDateTime).getTime() : 0;
          const dateB = b.callDateTime ? new Date(b.callDateTime).getTime() : 0;
          return dateB - dateA;
        case 'callDuration':
          const durationA = this.parseDurationFromObject(a.callDuration);
          const durationB = this.parseDurationFromObject(b.callDuration);
          return durationB - durationA;
        case 'customer.name':
          const nameA = a.customer
            ? `${a.customer.firstName || ''} ${
                a.customer.lastName || ''
              }`.trim()
            : '';
          const nameB = b.customer
            ? `${b.customer.firstName || ''} ${
                b.customer.lastName || ''
              }`.trim()
            : '';
          return nameA.localeCompare(nameB);
        case 'callOutcome':
          const outcomeA = a.callOutcome || '';
          const outcomeB = b.callOutcome || '';
          return outcomeA.localeCompare(outcomeB);
        default:
          return 0;
      }
    });

    this.updatePagination();
  }

  // View mode methods
  setViewMode(mode: 'table' | 'cards'): void {
    this.viewMode = mode;
  }

  // Pagination methods
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCalls.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.updatePaginatedCalls();
  }

  updatePaginatedCalls(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedCalls = this.filteredCalls.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedCalls();
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

  // Call action methods
  viewCallDetails(call: CallRecord): void {
    this.selectedCall = call;
    this.activeAccordionIndex = -1; // Reset accordion state
    // Open modal using Bootstrap JS or your preferred method
    const modalElement = document.getElementById('callDetailsModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  toggleAccordion(index: number): void {
    // Prevent event bubbling
    event?.stopPropagation();

    // Toggle the accordion item
    if (this.activeAccordionIndex === index) {
      this.activeAccordionIndex = -1; // Close if already open
    } else {
      this.activeAccordionIndex = index; // Open the clicked item
    }

    console.log(
      'Accordion toggled:',
      index,
      'Active:',
      this.activeAccordionIndex
    );
  }

  deleteCall(call: CallRecord): void {
    Swal.fire({
      title: 'Delete Call?',
      text: 'Are you sure you want to delete this call? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.callRecordService.deleteCallRecord(call.id!).subscribe({
          next: () => {
            this.applyFilters();
            Swal.fire({
              title: 'Deleted!',
              text: 'The call has been deleted successfully.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          },
          error: (error) => {
            console.error('Error deleting note:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete call. Please try again.',
              icon: 'error',
              confirmButtonColor: '#3085d6',
            });
          },
        });
      }
    });
  }

  openNewCallModal(): void {
    // Implement new call functionality
    console.log('Opening new call modal');
  }

  // Utility methods
  formatDuration(duration: any): string {
    try {
      const minutes = this.parseDurationFromObject(duration);
      const hrs = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      const secs = Math.floor((minutes % 1) * 60);

      if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs
          .toString()
          .padStart(2, '0')}`;
      }
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    } catch {
      return '0:00';
    }
  }

  private parseDurationFromObject(duration: any): number {
    if (!duration) return 0;

    // Handle Java Duration object with seconds field
    if (typeof duration === 'object' && duration.seconds !== undefined) {
      return duration.seconds / 60; // Convert seconds to minutes
    }

    // Handle string format (legacy)
    if (typeof duration === 'string') {
      return this.parseDuration(duration);
    }

    return 0;
  }

  private parseDuration(duration: string): number {
    // Simple parser for PT15M30S format
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const hours = parseInt(match[1] || '0');
      const minutes = parseInt(match[2] || '0');
      const seconds = parseInt(match[3] || '0');
      return hours * 60 + minutes + seconds / 60;
    }
    return 0;
  }

  private formatMinutes(minutes: number): string {
    const totalSeconds = Math.round(minutes * 60);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getSentimentScore(call: CallRecord): number {
    // First check if the call has a direct sentimentPoint property
    if (call.sentimentPoint?.sentimentScore !== undefined) {
      console.log(`Found sentiment score for call ${call.id}:`, call.sentimentPoint.sentimentScore);
      return call.sentimentPoint.sentimentScore;
    }

    // Fallback: try to get sentiment from associated sentiment point using our service
    const sentimentPoint = this.sentimentPoints.find(
      (sp) => sp.call?.id === call.id
    );

    if (sentimentPoint && sentimentPoint.sentimentScore !== undefined) {
      console.log(`Found sentiment score from service for call ${call.id}:`, sentimentPoint.sentimentScore);
      return sentimentPoint.sentimentScore;
    }

    // Fallback: try to get sentiment from call transcripts
    if (call.callTranscripts && call.callTranscripts.length > 0) {
      const validSentiments = call.callTranscripts
        .filter((transcript) => transcript.sentiment?.score !== undefined)
        .map((transcript) => transcript.sentiment!.score!);

      if (validSentiments.length > 0) {
        const avgSentiment =
          validSentiments.reduce((sum, score) => sum + score, 0) /
          validSentiments.length;
        console.log(`Calculated sentiment from transcripts for call ${call.id}:`, avgSentiment);
        return avgSentiment;
      }
    }

    console.log(`No sentiment data found for call ${call.id}`);
    // Default fallback
    return 0;
  }

  getSentimentLabel(call: CallRecord): string {
    const score = this.getSentimentScore(call);
    if (score >= 0.85) return 'Excellent';
    if (score >= 0.7) return 'Positive';
    if (score >= 0.5) return 'Good';
    if (score >= 0.3) return 'Average';
    return 'Negative';
  }

  // Helper methods for template
  getCustomerName(customer: any): string {
    if (!customer) return 'Unknown Customer';
    return (
      `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
      'Unknown Customer'
    );
  }

  getCustomerPhone(customer: any): string {
    return customer?.phone || 'N/A';
  }

  getAgentName(agent: any): string {
    if (!agent) return 'Unknown Agent';
    return (
      `${agent.firstname || ''} ${agent.lastname || ''}`.trim() ||
      'Unknown Agent'
    );
  }

  getTranscriptText(transcript: any): string {
    return transcript?.text || 'No transcript available';
  }

  getTranscriptSentimentScore(transcript: any): number {
    return transcript?.sentiment?.score || 0;
  }

  private generateTranscriptReport(call: CallRecord): string {
    let report = `Call Transcript Report\n`;
    report += `========================\n\n`;
    report += `Call ID: ${call.id}\n`;

    const customerName = call.customer
      ? `${call.customer.firstName || ''} ${
          call.customer.lastName || ''
        }`.trim()
      : 'Unknown';
    const customerPhone = call.customer?.phone || 'Unknown';
    const agentName = call.agent
      ? `${call.agent.firstname || ''} ${call.agent.lastname || ''}`.trim()
      : 'Unknown';
    const callDate = call.callDateTime
      ? new Date(call.callDateTime).toLocaleString()
      : 'Unknown';

    report += `Customer: ${customerName}\n`;
    report += `Phone: ${customerPhone}\n`;
    report += `Agent: ${agentName}\n`;
    report += `Date: ${callDate}\n`;
    report += `Duration: ${this.formatDuration(call.callDuration)}\n`;
    report += `Outcome: ${call.callOutcome || 'Unknown'}\n\n`;

    if (call.callTranscripts && call.callTranscripts.length > 0) {
      report += `Transcript:\n`;
      report += `-----------\n`;
      call.callTranscripts.forEach((transcript, index) => {
        const timestamp = transcript.timestamp
          ? new Date(transcript.timestamp).toLocaleTimeString()
          : 'Unknown time';
        const text = transcript.text || 'No text available';
        const sentiment = transcript.sentiment?.score?.toFixed(2) || 'N/A';
        const speaker = transcript.speaker || 'Unknown';

        report += `\n[${timestamp}] ${speaker}: ${text}\n`;
        report += `Sentiment Score: ${sentiment}\n`;
      });
    }

    return report;
  }
}
