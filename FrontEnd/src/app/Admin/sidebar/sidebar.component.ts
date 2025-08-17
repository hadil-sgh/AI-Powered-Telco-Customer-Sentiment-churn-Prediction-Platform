import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  constructor(private router: Router) {
  }
logout() {
  localStorage.removeItem('token');
  console.log('Tokens removed:', localStorage.getItem('token'));
  this.router.navigate(['/login']);
}
}
