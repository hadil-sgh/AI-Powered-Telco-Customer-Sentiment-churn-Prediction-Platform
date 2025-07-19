import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { AudioStreamService } from '../../services/audio-stream.service';

interface CallRecord {
  id: number;
  customer: {
    name: string;
    phoneNumber: string;
    email: string;
  };
  agent: {
    firstName: string;
    lastName: string;
  };
  callTranscripts: AudioAnalysisResponse[];
  callDuration: string;
  callOutcome: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'ESCALATED';
  callDateTime: Date;
}

interface AudioAnalysisResponse {
  id: number;
  transcript: string;
  sentimentScore: number;
  emotions: string[];
  keywords: string[];
  timestamp: Date;
}

interface CallStats {
  totalCalls: number;
  successfulCalls: number;
  pendingCalls: number;
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
    pendingCalls: 0,
    avgDuration: '0:00',
  };

  // Math reference for template
  Math = Math;

  constructor(private audioStreamService: AudioStreamService) {}

  ngOnInit(): void {
    this.loadCalls();
    this.calculateStats();
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions if any
  }

  loadCalls(): void {
    // Mock data - replace with actual service call
    this.calls = [
      {
        id: 1,
        customer: {
          name: 'Ahmed Ben Ali',
          phoneNumber: '+216 98 123 456',
          email: 'ahmed.benali@email.com',
        },
        agent: {
          firstName: 'Hadil',
          lastName: 'Sghair',
        },
        callTranscripts: [
          {
            id: 1,
            transcript: 'Hello, I need help with my internet connection',
            sentimentScore: 0.2,
            emotions: ['frustrated', 'concerned'],
            keywords: ['internet', 'connection', 'help'],
            timestamp: new Date('2024-01-15T10:30:00'),
          },
        ],
        callDuration: 'PT15M30S',
        callOutcome: 'SUCCESSFUL',
        callDateTime: new Date('2024-01-15T10:00:00'),
      },
      {
        id: 2,
        customer: {
          name: 'Fatma Trabelsi',
          phoneNumber: '+216 97 456 789',
          email: 'fatma.trabelsi@email.com',
        },
        agent: {
          firstName: 'Hadil',
          lastName: 'Sghair',
        },
        callTranscripts: [
          {
            id: 2,
            transcript: 'Thank you for the excellent service',
            sentimentScore: 0.9,
            emotions: ['happy', 'satisfied'],
            keywords: ['thank you', 'excellent', 'service'],
            timestamp: new Date('2024-01-15T11:00:00'),
          },
        ],
        callDuration: 'PT8M45S',
        callOutcome: 'SUCCESSFUL',
        callDateTime: new Date('2024-01-15T11:00:00'),
      },
    ];

    this.applyFilters();
  }

  calculateStats(): void {
    this.callStats.totalCalls = this.calls.length;
    this.callStats.successfulCalls = this.calls.filter(
      (call) => call.callOutcome === 'SUCCESSFUL'
    ).length;
    this.callStats.pendingCalls = this.calls.filter(
      (call) => call.callOutcome === 'PENDING'
    ).length;

    // Calculate average duration
    const totalMinutes = this.calls.reduce((sum, call) => {
      return sum + this.parseDuration(call.callDuration);
    }, 0);
    const avgMinutes =
      this.calls.length > 0 ? totalMinutes / this.calls.length : 0;
    this.callStats.avgDuration = this.formatMinutes(avgMinutes);
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
      const matchesSearch =
        !this.searchTerm ||
        call.customer.name
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        call.customer.phoneNumber.includes(this.searchTerm);

      const matchesOutcome =
        !this.selectedOutcome || call.callOutcome === this.selectedOutcome;

      const matchesDate =
        !this.selectedDate ||
        call.callDateTime.toISOString().split('T')[0] === this.selectedDate;

      return matchesSearch && matchesOutcome && matchesDate;
    });

    this.sortCalls();
    this.updatePagination();
  }

  sortCalls(): void {
    this.filteredCalls.sort((a, b) => {
      switch (this.sortBy) {
        case 'callDateTime':
          return (
            new Date(b.callDateTime).getTime() -
            new Date(a.callDateTime).getTime()
          );
        case 'callDuration':
          return (
            this.parseDuration(b.callDuration) -
            this.parseDuration(a.callDuration)
          );
        case 'customer.name':
          return a.customer.name.localeCompare(b.customer.name);
        case 'callOutcome':
          return a.callOutcome.localeCompare(b.callOutcome);
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

  playCallRecording(call: CallRecord): void {
    // Implement audio playback functionality
    console.log('Playing recording for call:', call.id);
    // You can integrate with your audio service here
  }

  downloadTranscript(call: CallRecord): void {
    // Generate and download transcript
    const transcript = this.generateTranscriptReport(call);
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `call-transcript-${call.id}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  deleteCall(call: CallRecord): void {
    if (confirm('Are you sure you want to delete this call record?')) {
      this.calls = this.calls.filter((c) => c.id !== call.id);
      this.applyFilters();
      this.calculateStats();
    }
  }

  openNewCallModal(): void {
    // Implement new call functionality
    console.log('Opening new call modal');
  }

  // Utility methods
  formatDuration(duration: string): string {
    try {
      // Parse ISO 8601 duration format (PT15M30S)
      const minutes = this.parseDuration(duration);
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
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins}:00`;
  }

  getSentimentScore(call: CallRecord): number {
    if (!call.callTranscripts || call.callTranscripts.length === 0) return 0;
    const avgSentiment =
      call.callTranscripts.reduce(
        (sum, transcript) => sum + transcript.sentimentScore,
        0
      ) / call.callTranscripts.length;
    return avgSentiment;
  }

  getSentimentLabel(call: CallRecord): string {
    const score = this.getSentimentScore(call);
    if (score > 0.5) return 'Positive';
    if (score > 0) return 'Neutral';
    return 'Negative';
  }

  private generateTranscriptReport(call: CallRecord): string {
    let report = `Call Transcript Report\n`;
    report += `========================\n\n`;
    report += `Call ID: ${call.id}\n`;
    report += `Customer: ${call.customer.name}\n`;
    report += `Phone: ${call.customer.phoneNumber}\n`;
    report += `Agent: ${call.agent.firstName} ${call.agent.lastName}\n`;
    report += `Date: ${call.callDateTime.toLocaleString()}\n`;
    report += `Duration: ${this.formatDuration(call.callDuration)}\n`;
    report += `Outcome: ${call.callOutcome}\n\n`;

    if (call.callTranscripts && call.callTranscripts.length > 0) {
      report += `Transcript:\n`;
      report += `-----------\n`;
      call.callTranscripts.forEach((transcript, index) => {
        report += `\n[${transcript.timestamp.toLocaleTimeString()}] ${
          transcript.transcript
        }\n`;
        report += `Sentiment Score: ${transcript.sentimentScore.toFixed(2)}\n`;
        report += `Emotions: ${transcript.emotions.join(', ')}\n`;
        report += `Keywords: ${transcript.keywords.join(', ')}\n`;
      });
    }

    return report;
  }
}
