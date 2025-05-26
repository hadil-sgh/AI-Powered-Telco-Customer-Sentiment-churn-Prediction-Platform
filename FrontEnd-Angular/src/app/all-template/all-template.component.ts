import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from "../navbar/navbar.component";
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
@Component({
  selector: 'app-all-template',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, RouterOutlet, FooterComponent],
  templateUrl: './all-template.component.html',
  styleUrl: './all-template.component.css'
})
export class AllTemplateComponent {

}
