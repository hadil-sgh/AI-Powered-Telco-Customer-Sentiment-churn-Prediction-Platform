import { Component, OnInit } from '@angular/core';
import { NotesService } from '../../services/notes.service';
import { TokenService } from '../../services/token.service';
import { Note } from '../../models/note';
import Swal from 'sweetalert2';

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

  // Cached data to prevent infinite loops
  uniqueCustomers: { id: number; name: string }[] = [];
  paginatedNotesCache: Note[] = [];
  totalDisplayStart = 0;
  totalDisplayEnd = 0;

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
    console.log('Notes component initialized');
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
        console.log('Notes loaded successfully:', notes.length, 'notes');
      },
      error: (error) => {
        console.error('Error loading notes:', error);
        this.error = 'Failed to load notes. Please try again.';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    console.log('Applying filters to', this.notes.length, 'notes');
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
    console.log('Filtered down to', filtered.length, 'notes');
    this.updatePagination();
    this.updateUniqueCustomers();
  }

  updateUniqueCustomers(): void {
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
    this.uniqueCustomers = Array.from(customers.values());
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredNotes.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }

    // Update cached paginated results and display info
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedNotesCache = this.filteredNotes.slice(start, end);

    this.totalDisplayStart = (this.currentPage - 1) * this.pageSize + 1;
    this.totalDisplayEnd = Math.min(
      this.currentPage * this.pageSize,
      this.filteredNotes.length
    );
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
    Swal.fire({
      title: 'Delete Note?',
      text: 'Are you sure you want to delete this note? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.notesService.deleteNote(note.id!).subscribe({
          next: () => {
            this.notes = this.notes.filter((n) => n.id !== note.id);
            this.applyFilters();
            Swal.fire({
              title: 'Deleted!',
              text: 'The note has been deleted successfully.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          },
          error: (error) => {
            console.error('Error deleting note:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete note. Please try again.',
              icon: 'error',
              confirmButtonColor: '#3085d6',
            });
          },
        });
      }
    });
  }

  closeNoteModal(): void {
    this.showNoteModal = false;
    this.selectedNote = null;
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
      filtered: this.filteredNotes.length,
    };
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterByCustomer = '';
    this.sortBy = 'newest';
    this.onFilterChange();
  }
}
