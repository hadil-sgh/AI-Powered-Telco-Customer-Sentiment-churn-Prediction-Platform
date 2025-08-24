import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KnowledgeBaseService } from '../../services/knowledge-base.service';
import { TokenService } from '../../services/token.service';
import {
  KnowledgeBase,
  KnowledgeBaseCreate,
  KnowledgeBaseUpdate,
  KnowledgeBaseFilter,
  KnowledgeStatus,
  Priority,
  PageResponse,
} from '../../models/knowledge-base';

@Component({
  selector: 'app-knowlage-base',
  templateUrl: './knowlage-base.component.html',
  styleUrls: ['./knowlage-base.component.scss'],
})
export class KnowlageBaseComponent implements OnInit {
  knowledgeBases: KnowledgeBase[] = [];
  filteredKnowledgeBases: KnowledgeBase[] = [];
  categories: string[] = [];

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Forms
  knowledgeBaseForm!: FormGroup;
  filterForm!: FormGroup;

  // UI State
  showModal = false;
  isEditMode = false;
  selectedKnowledgeBase: KnowledgeBase | null = null;
  loading = false;

  // Enums for template
  KnowledgeStatus = KnowledgeStatus;
  Priority = Priority;

  // Sort options
  sortBy = 'createdAt';
  sortDir = 'desc';

  // Expose Math to template
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private knowledgeBaseService: KnowledgeBaseService,
    private tokenService: TokenService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadKnowledgeBases();
    this.loadCategories();
  }

  private initializeForms(): void {
    this.knowledgeBaseForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', Validators.required],
      category: ['', Validators.required],
      priority: [Priority.MEDIUM, Validators.required],
      status: [KnowledgeStatus.DRAFT],
    });

    this.filterForm = this.fb.group({
      status: [''],
      category: [''],
      priority: [''],
      search: [''],
    });
  }

  loadKnowledgeBases(): void {
    this.loading = true;
    const filter: KnowledgeBaseFilter = this.filterForm.value;

    console.log('Loading knowledge bases with params:', {
      filter,
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
    });

    this.knowledgeBaseService
      .getAllKnowledgeBases(
        filter,
        this.currentPage,
        this.pageSize,
        this.sortBy,
        this.sortDir
      )
      .subscribe({
        next: (response: PageResponse<KnowledgeBase>) => {
          console.log('Received response:', response);
          this.knowledgeBases = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading knowledge bases:', error);
          this.loading = false;
        },
      });
  }

  loadCategories(): void {
    this.knowledgeBaseService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  onFilter(): void {
    this.currentPage = 0;
    this.loadKnowledgeBases();
  }

  onSort(column: string): void {
    console.log('Sorting by:', column); // Debug log
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'desc'; // Default to desc for better UX
    }
    this.currentPage = 0; // Reset to first page when sorting
    this.loadKnowledgeBases();
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadKnowledgeBases();
    }
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedKnowledgeBase = null;
    this.knowledgeBaseForm.reset({
      priority: Priority.MEDIUM,
      status: KnowledgeStatus.DRAFT,
    });
    this.showModal = true;
  }

  openEditModal(knowledgeBase: KnowledgeBase): void {
    this.isEditMode = true;
    this.selectedKnowledgeBase = knowledgeBase;
    this.knowledgeBaseForm.patchValue({
      title: knowledgeBase.title,
      content: knowledgeBase.content,
      category: knowledgeBase.category,
      priority: knowledgeBase.priority,
      status: knowledgeBase.status,
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.knowledgeBaseForm.reset();
  }

  onSubmit(): void {
    if (this.knowledgeBaseForm.valid) {
      this.loading = true;

      if (this.isEditMode && this.selectedKnowledgeBase) {
        const updateData: KnowledgeBaseUpdate = this.knowledgeBaseForm.value;
        this.knowledgeBaseService
          .updateKnowledgeBase(this.selectedKnowledgeBase.id, updateData)
          .subscribe({
            next: (response) => {
              this.loadKnowledgeBases();
              this.closeModal();
              this.loading = false;
            },
            error: (error) => {
              console.error('Error updating knowledge base:', error);
              this.loading = false;
            },
          });
      } else {
        const createData: KnowledgeBaseCreate = {
          title: this.knowledgeBaseForm.value.title,
          content: this.knowledgeBaseForm.value.content,
          category: this.knowledgeBaseForm.value.category,
          priority: this.knowledgeBaseForm.value.priority,
        };

        this.knowledgeBaseService.createKnowledgeBase(createData).subscribe({
          next: (response) => {
            this.loadKnowledgeBases();
            this.closeModal();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error creating knowledge base:', error);
            this.loading = false;
          },
        });
      }
    }
  }

  deleteKnowledgeBase(id: number): void {
    if (confirm('Are you sure you want to delete this knowledge base entry?')) {
      this.knowledgeBaseService.deleteKnowledgeBase(id).subscribe({
        next: () => {
          this.loadKnowledgeBases();
        },
        error: (error) => {
          console.error('Error deleting knowledge base:', error);
        },
      });
    }
  }

  updateStatus(id: number, status: KnowledgeStatus): void {
    console.log('Updating status:', id, status); // Debug log
    this.loading = true;
    this.knowledgeBaseService.updateStatus(id, status).subscribe({
      next: (response) => {
        console.log('Status updated successfully:', response);
        this.loadKnowledgeBases();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating status:', error);
        // Add user-friendly error handling here
        alert('Failed to update status. Please try again.');
        this.loading = false;
      },
    });
  }

  getPriorityClass(priority: Priority): string {
    switch (priority) {
      case Priority.LOW:
        return 'badge-light-success';
      case Priority.MEDIUM:
        return 'badge-light-primary';
      case Priority.HIGH:
        return 'badge-light-warning';
      case Priority.URGENT:
        return 'badge-light-danger';
      default:
        return 'badge-light-secondary';
    }
  }

  getCategoryClass(category: string): string {
    // Generate consistent colors based on category name
    const categoryColors = {
      'Customer Service': 'badge-light-primary',
      Billing: 'badge-light-success',
      Technical: 'badge-light-warning',
      Sales: 'badge-light-info',
      Support: 'badge-light-secondary',
      Policy: 'badge-light-danger',
      Training: 'badge-light-dark',
      Documentation: 'badge-light-primary',
      Procedures: 'badge-light-success',
      Guidelines: 'badge-light-warning',
      FAQ: 'badge-light-info',
      Troubleshooting: 'badge-light-danger',
      'Best Practices': 'badge-light-secondary',
    };

    // If category matches predefined colors, use it
    if (categoryColors[category as keyof typeof categoryColors]) {
      return categoryColors[category as keyof typeof categoryColors];
    }

    // Generate color based on string hash for consistent coloring
    const hash = this.hashString(category);
    const colors = [
      'badge-light-primary',
      'badge-light-success',
      'badge-light-warning',
      'badge-light-info',
      'badge-light-secondary',
      'badge-light-danger',
    ];

    return colors[hash % colors.length];
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

  getStatusClass(status: KnowledgeStatus): string {
    switch (status) {
      case KnowledgeStatus.DRAFT:
        return 'badge-light-secondary';
      case KnowledgeStatus.PUBLISHED:
        return 'badge-light-success';
      case KnowledgeStatus.ARCHIVED:
        return 'badge-light-dark';
      default:
        return 'badge-light-secondary';
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(0, this.currentPage - 2);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
