import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './Admin/sidebar/sidebar.component';
import { LoginComponent } from './Auth/login/login.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './Auth/register/register.component';
import { AccountValidationComponent } from './Auth/account-validation/account-validation.component';
import { AgentDashboardComponent } from './Agent/agent-dashboard/agent-dashboard.component';
import { AgentPerformanceComponent } from './Agent/agent-performance/agent-performance.component';
import { CallManagmentComponent } from './Agent/call-managment/call-managment.component';
import { PostCallComponent } from './Agent/post-call/post-call.component';
import { AdminAllTemplateComponent } from './Admin/admin-all-template/admin-all-template.component';
import { AgentAllTemplateComponent } from './Agent/agent-all-template/agent-all-template.component';
import { AgentSidebarComponent } from './Agent/agent-sidebar/agent-sidebar.component';
import { AllCallsComponent } from './Agent/all-calls/all-calls.component';
import { NotesComponent } from './Agent/notes/notes.component';

@NgModule({
  declarations: [
    AppComponent,

    NavbarComponent,
    FooterComponent,
    SidebarComponent,
    LoginComponent,
    RegisterComponent,
    AccountValidationComponent,
    AgentDashboardComponent,
    AgentPerformanceComponent,
    CallManagmentComponent,
    PostCallComponent,
    AdminAllTemplateComponent,
    AgentAllTemplateComponent,
    AgentSidebarComponent,
    AllCallsComponent,
    NotesComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent],
})
export class AppModule {}
