import { Component, OnInit } from '@angular/core';
import { NotesService } from '../../services/notes.service';
import { TokenService } from '../../services/token.service';
import { Note } from '../../models/note';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  loading = false;
  error = '';

  // Filters
  searchTerm = '';
  filterByCustomer = '';
  sortBy = 'newest';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Agent info
  currentAgentName = '';
  currentAgentEmail = '';

  // Selected note for viewing
  selectedNote: Note | null = null;
  showNoteModal = false;

  // Math reference for template
  Math = Math;

  constructor(
    private notesService: NotesService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.loading = true;
    this.error = '';

    // Get agent email from token for session-based notes
    const agentEmail = this.tokenService.getEmailFromToken();
    const agentName = this.tokenService.getFullNameFromToken();
    
    if (!agentEmail) {
      this.error = 'Unable to get agent information. Please login again.';
      this.loading = false;
      return;
    }

    // Store current agent info
    this.currentAgentEmail = agentEmail;
    this.currentAgentName = agentName || 'Agent';

    this.notesService.getNotesByAgent(agentEmail).subscribe({
      next: (notes: Note[]) => {
        this.notes = notes;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notes:', error);
        this.error = 'Failed to load notes. Please try again.';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    let filtered = [...this.notes];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.description?.toLowerCase().includes(term) ||
          note.customer?.firstName?.toLowerCase().includes(term) ||
          note.customer?.lastName?.toLowerCase().includes(term)
      );
    }

    // Customer filter
    if (this.filterByCustomer) {
      filtered = filtered.filter(
        (note) =>
          note.customer?.customerID?.toString() === this.filterByCustomer
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return (b.id || 0) - (a.id || 0);
        case 'oldest':
          return (a.id || 0) - (b.id || 0);
        case 'customer':
          const customerA = `${a.customer?.firstName || ''} ${
            a.customer?.lastName || ''
          }`;
          const customerB = `${b.customer?.firstName || ''} ${
            b.customer?.lastName || ''
          }`;
          return customerA.localeCompare(customerB);
        default:
          return 0;
      }
    });

    this.filteredNotes = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredNotes.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  get paginatedNotes(): Note[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredNotes.slice(start, end);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  viewNote(note: Note): void {
    this.selectedNote = note;
    this.showNoteModal = true;
  }

  deleteNote(note: Note): void {
    if (confirm(`Are you sure you want to delete this note?`)) {
      this.notesService.deleteNote(note.id!).subscribe({
        next: () => {
          this.notes = this.notes.filter((n) => n.id !== note.id);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting note:', error);
          alert('Failed to delete note. Please try again.');
        },
      });
    }
  }

  closeNoteModal(): void {
    this.showNoteModal = false;
    this.selectedNote = null;
  }

  getUniqueCustomers(): { id: number; name: string }[] {
    const customers = new Map();
    this.notes.forEach((note) => {
      if (note.customer?.customerID) {
        customers.set(note.customer.customerID, {
          id: note.customer.customerID,
          name: `${note.customer.firstName || ''} ${
            note.customer.lastName || ''
          }`.trim(),
        });
      }
    });
    return Array.from(customers.values());
  }

  getCallInfo(note: Note): string {
    if (note.call?.id) {
      return `Call #${note.call.id}`;
    }
    return 'No call info';
  }

  getFormattedDate(note: Note): string {
    // You might want to add a proper timestamp field to your Note model
    // For now, using a placeholder
    return new Date().toLocaleDateString();
  }

  getNotesStats(): { total: number; filtered: number } {
    return {
      total: this.notes.length,
      filtered: this.filteredNotes.length
    };
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterByCustomer = '';
    this.sortBy = 'newest';
    this.onFilterChange();
  }
}
