import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-agent-sidebar',
  templateUrl: './agent-sidebar.component.html',
  styleUrls: ['./agent-sidebar.component.scss'],
})
export class AgentSidebarComponent implements OnInit, OnDestroy {
  constructor() {}

  ngOnInit(): void {
    // Initialize Perfect Scrollbar or other sidebar functionality if needed
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    const layoutMenu = document.getElementById('layout-menu');
    if (layoutMenu) {
      layoutMenu.classList.toggle('show');
    }
  }
}
