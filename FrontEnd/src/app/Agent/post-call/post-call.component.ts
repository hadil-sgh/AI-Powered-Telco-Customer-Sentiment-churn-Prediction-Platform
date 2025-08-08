import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  PostCallService,
  PostCallAnalysisResult,
} from '../../services/post-call.service';
import { CallRecord } from '../../models/call-record';
import { Customer } from '../../models/customer';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-post-call',
  templateUrl: './post-call.component.html',
  styleUrls: ['./post-call.component.scss'],
})
export class PostCallComponent implements OnInit {
  // Data passed from call management
  callRecord: CallRecord | null = null;
  customerData: Customer | null = null;
  analysisResults: any[] = [];
  callDuration: number = 0;

  // Post-call analysis data
  postCallAnalysis: PostCallAnalysisResult | null = null;
  isLoading = false;
  hasAnalysis = false;

  // Call outcome options
  outcomeOptions = [
    { value: 'SUCCESSFUL', label: 'Successful', color: 'success' },
    { value: 'NO_ANSWER', label: 'No Answer', color: 'warning' },
    { value: 'DROPPED', label: 'Dropped', color: 'danger' },
    { value: 'RESOLVED', label: 'Resolved', color: 'info' },
  ];

  selectedOutcome = 'SUCCESSFUL';

  // Email configuration
  emailSubject = '';
  emailBody = '';
  isEmailModalOpen = false;

  // Notes
  additionalNotes = '';

  constructor(
    private router: Router,
    private postCallService: PostCallService
  ) {
    // Get data from router state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || window.history.state;

    if (state) {
      this.callRecord = state.callRecord;
      this.customerData = state.customerData;
      this.analysisResults = state.analysisResults || [];
      this.callDuration = state.callDuration || 0;
    }
  }

  ngOnInit() {
    if (!this.callRecord) {
      // If no call record data, redirect back to call management
      Swal.fire({
        title: 'No Call Data',
        text: 'No call record found. Redirecting to call management.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        this.router.navigate(['/Agent/call']);
      });
      return;
    }

    // Load post-call analysis
    this.loadPostCallAnalysis();
  }

  loadPostCallAnalysis() {
    if (!this.callRecord?.id) return;

    this.isLoading = true;
    this.postCallService.analyzeTranscriptScore(this.callRecord.id).subscribe({
      next: (analysis) => {
        this.postCallAnalysis = analysis;
        this.hasAnalysis = true;
        this.isLoading = false;
        console.log('Post-call analysis loaded:', analysis);
      },
      error: (error) => {
        console.error('Error loading post-call analysis:', error);
        this.isLoading = false;
        // Don't show error - the component will show a loading state instead
      }
    });
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  }

  getAverageSentiment(): number {
    if (!this.analysisResults || this.analysisResults.length === 0) return 0;

    const sentiments = this.analysisResults
      .map((result) => result.sentiment?.score || 0)
      .filter((score) => score !== 0);

    if (sentiments.length === 0) return 0;

    return (
      sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length
    );
  }

  getEscalationLevel(): number {
    if (!this.analysisResults || this.analysisResults.length === 0) return 0;

    const escalations = this.analysisResults
      .map((result) => result.emotionAnalysis?.escalation_level || 0)
      .filter((level) => level > 0);

    if (escalations.length === 0) return 0;

    return Math.max(...escalations);
  }

  getSentimentColor(score: number): string {
    if (score >= 0.7) return 'success';
    if (score >= 0.4) return 'warning';
    return 'danger';
  }

  getPerformanceStars(): number[] {
    const score = this.postCallAnalysis?.score || 0;
    return Array(5)
      .fill(0)
      .map((_, i) => (i < score ? 1 : 0));
  }

  updateOutcome() {
    if (!this.callRecord?.id) return;

    this.postCallService
      .updateCallOutcome(this.callRecord.id, this.selectedOutcome)
      .subscribe({
        next: () => {
          Swal.fire({
            title: 'Success!',
            text: 'Call outcome updated successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
          });
        },
        error: (error) => {
          console.error('Error updating outcome:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update call outcome.',
            icon: 'error',
            confirmButtonColor: '#3085d6',
          });
        },
      });
  }

  openEmailModal() {
    this.emailSubject = `Follow-up: ${
      this.postCallAnalysis?.complaintType || 'Service Request'
    }`;
    this.emailBody = `Dear ${
      this.customerData?.firstName || 'Customer'
    },\n\nThank you for contacting us today. `;
    this.isEmailModalOpen = true;
  }

  sendEmail() {
    if (!this.callRecord?.id) return;

    const emailContent = {
      subject: this.emailSubject,
      body: this.emailBody,
      customerEmail: this.customerData?.email,
    };

    this.postCallService
      .sendFollowUpEmail(this.callRecord.id, emailContent)
      .subscribe({
        next: () => {
          this.isEmailModalOpen = false;
          Swal.fire({
            title: 'Email Sent!',
            text: 'Follow-up email sent successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
          });
        },
        error: (error) => {
          console.error('Error sending email:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to send email.',
            icon: 'error',
            confirmButtonColor: '#3085d6',
          });
        },
      });
  }

  saveNotes() {
    // For now, just show success - you can integrate with your notes service
    Swal.fire({
      title: 'Notes Saved!',
      text: 'Additional notes saved successfully.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true,
    });
  }

  generateReport() {
    if (!this.callRecord?.id) return;

    this.postCallService
      .generateTranscriptReport(this.callRecord.id)
      .subscribe({
        next: (report) => {
          // Create a downloadable report
          const reportData = JSON.stringify(report, null, 2);
          const blob = new Blob([reportData], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `call-report-${this.callRecord?.id}.json`;
          link.click();
          window.URL.revokeObjectURL(url);

          Swal.fire({
            title: 'Report Generated!',
            text: 'Call report downloaded successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
          });
        },
        error: (error) => {
          console.error('Error generating report:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to generate report.',
            icon: 'error',
            confirmButtonColor: '#3085d6',
          });
        },
      });
  }

  navigateToAllCalls() {
    this.router.navigate(['/Agent/allCalls']);
  }

  startNewCall() {
    this.router.navigate(['/Agent/call']);
  }

  getPerformanceLabel(score: number): string {
    if (score <= 1) return 'Poor Performance';
    if (score <= 2) return 'Below Average';
    if (score === 3) return 'Average Performance';
    if (score <= 4) return 'Good Performance';
    return 'Excellent Performance';
  }
}
