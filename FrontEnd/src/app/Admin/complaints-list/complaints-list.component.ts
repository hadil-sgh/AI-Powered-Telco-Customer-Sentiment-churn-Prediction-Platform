import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ComplaintService } from '../../services/complaint.service';
import { Complaint, ComplaintStats } from '../../models/complaint';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

// Register Chart.js components
import {
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PieController,
  BarController,
} from 'chart.js';

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PieController,
  BarController
);

@Component({
  selector: 'app-complaints-list',
  templateUrl: './complaints-list.component.html',
  styleUrls: ['./complaints-list.component.scss'],
})
export class ComplaintsListComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas', { static: false })
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  complaints: Complaint[] = [];
  complaintStats: ComplaintStats[] = [];
  chart: Chart | null = null;
  loading = true;
  error = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;

  constructor(private complaintService: ComplaintService) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  ngAfterViewInit(): void {
    // Chart will be created after data is loaded
  }

  loadComplaints(): void {
    this.loading = true;
    this.error = '';

    this.complaintService.getAllComplaints().subscribe({
      next: (data) => {
        this.complaints = data;
        this.updatePagination();
        this.loadComplaintStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading complaints:', err);
        this.error = 'Failed to load complaints. Please try again.';
        this.loading = false;
      },
    });
  }

  loadComplaintStats(): void {
    this.complaintService.getComplaintStats().subscribe({
      next: (stats) => {
        this.complaintStats = stats;
        this.createChart();
      },
      error: (err) => {
        console.error('Error loading complaint stats:', err);
      },
    });
  }

  createChart(): void {
    if (!this.chartCanvas || this.complaintStats.length === 0) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    // Filter out stats with 0 count for cleaner chart
    const filteredStats = this.complaintStats.filter((stat) => stat.count > 0);

    const chartConfig: ChartConfiguration = {
      type: 'pie' as ChartType,
      data: {
        labels: filteredStats.map((stat) => stat.type),
        datasets: [
          {
            data: filteredStats.map((stat) => stat.percentage),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',   // Light red/pink
              'rgba(54, 162, 235, 0.2)',   // Light blue
              'rgba(255, 206, 86, 0.2)',   // Light yellow
              'rgba(75, 192, 192, 0.2)',   // Light teal
              'rgba(153, 102, 255, 0.2)',  // Light purple
              'rgba(255, 159, 64, 0.2)',   // Light orange
              'rgba(199, 199, 199, 0.2)',  // Light gray
              'rgba(83, 102, 255, 0.2)',   // Light indigo
              'rgba(255, 99, 255, 0.2)',   // Light magenta
              'rgba(99, 255, 132, 0.2)',   // Light green
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',     // Solid red/pink border
              'rgba(54, 162, 235, 1)',     // Solid blue border
              'rgba(255, 206, 86, 1)',     // Solid yellow border
              'rgba(75, 192, 192, 1)',     // Solid teal border
              'rgba(153, 102, 255, 1)',    // Solid purple border
              'rgba(255, 159, 64, 1)',     // Solid orange border
              'rgba(199, 199, 199, 1)',    // Solid gray border
              'rgba(83, 102, 255, 1)',     // Solid indigo border
              'rgba(255, 99, 255, 1)',     // Solid magenta border
              'rgba(99, 255, 132, 1)',     // Solid green border
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true,
              boxWidth: 12,
              font: {
                size: 12
              }
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const stat = filteredStats[context.dataIndex];
                return `${stat.type}: ${stat.count} (${stat.percentage}%)`;
              },
            },
          },
        },
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          }
        }
      },
    };

    this.chart = new Chart(ctx, chartConfig);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.complaints.length / this.itemsPerPage);
  }

  get paginatedComplaints(): Complaint[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.complaints.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getComplaintTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'Network Connectivity': 'label-danger',
      'Internet Speed / Data Issues': 'label-warning',
      'Billing & Charges': 'label-info',
      'Recharge or Balance Problems': 'label-primary',
      'SIM or Number Portability': 'label-success',
      'Service Activation/Deactivation': 'label-secondary',
      'Customer Support Experience': 'label-dark',
      'Account Login / App Issues': 'label-warning',
      'Value-Added Services': 'label-info',
      Other: 'label-secondary',
    };
    return colors[type] || 'label-secondary';
  }

  // Helper methods for stats calculations
  getNetworkIssuesCount(): number {
    const networkCount =
      this.complaintStats.find((s) => s.type === 'Network Connectivity')
        ?.count || 0;
    const speedCount =
      this.complaintStats.find((s) => s.type === 'Internet Speed / Data Issues')
        ?.count || 0;
    return networkCount + speedCount;
  }

  getBillingIssuesCount(): number {
    const billingCount =
      this.complaintStats.find((s) => s.type === 'Billing & Charges')?.count ||
      0;
    const rechargeCount =
      this.complaintStats.find((s) => s.type === 'Recharge or Balance Problems')
        ?.count || 0;
    return billingCount + rechargeCount;
  }

  getServiceIssuesCount(): number {
    const serviceCount =
      this.complaintStats.find(
        (s) => s.type === 'Service Activation/Deactivation'
      )?.count || 0;
    const simCount =
      this.complaintStats.find((s) => s.type === 'SIM or Number Portability')
        ?.count || 0;
    return serviceCount + simCount;
  }

  // Math utility for template
  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }
}
