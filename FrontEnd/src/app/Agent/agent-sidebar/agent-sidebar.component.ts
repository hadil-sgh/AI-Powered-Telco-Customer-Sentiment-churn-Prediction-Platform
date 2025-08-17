import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agent-sidebar',
  templateUrl: './agent-sidebar.component.html',
  styleUrls: ['./agent-sidebar.component.scss'],
})
export class AgentSidebarComponent implements OnInit, OnDestroy {
  constructor(private router: Router) {}

  ngOnInit(): void {
  
  }

  ngOnDestroy(): void {
   
  }
logout() {
  localStorage.removeItem('token');
  console.log('Tokens removed:', localStorage.getItem('token'));
  this.router.navigate(['/login']);
}




  toggleMobileMenu(): void {
    const layoutMenu = document.getElementById('layout-menu');
    if (layoutMenu) {
      layoutMenu.classList.toggle('show');
    }
  }
}
