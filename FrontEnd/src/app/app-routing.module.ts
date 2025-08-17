import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Auth/login/login.component';
import { RegisterComponent } from './Auth/register/register.component';
import { AccountValidationComponent } from './Auth/account-validation/account-validation.component';
import { AdminAllTemplateComponent } from './Admin/admin-all-template/admin-all-template.component';
import { CallManagmentComponent } from './Agent/call-managment/call-managment.component';
import { AgentPerformanceComponent } from './Agent/agent-performance/agent-performance.component';
import { AgentDashboardComponent } from './Agent/agent-dashboard/agent-dashboard.component';
import { PostCallComponent } from './Agent/post-call/post-call.component';
import { AgentAllTemplateComponent } from './Agent/agent-all-template/agent-all-template.component';
import { AllCallsComponent } from './Agent/all-calls/all-calls.component';
import { NotesComponent } from './Agent/notes/notes.component';
import { ProfileManagementComponent } from './profile-management/profile-management.component';
import { QuickTipsComponent } from './Admin/quick-tips/quick-tips.component';
import { TeamManagementComponent } from './Admin/team-management/team-management.component';
import { AgentsPerformancesComponent } from './Admin/agents-performances/agents-performances.component';
import { ComplaintsListComponent } from './Admin/complaints-list/complaints-list.component';
import { KnowlageBaseComponent } from './Admin/knowlage-base/knowlage-base.component';
import { AdminDashboeardComponent } from './Admin/admin-dashboeard/admin-dashboeard.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'validation', component: AccountValidationComponent },
  {
    path: 'Agent',
    component: AgentAllTemplateComponent,
    children: [
      { path: 'call', component: CallManagmentComponent },
      { path: 'Performance', component: AgentPerformanceComponent },
      { path: 'dashboard', component: AgentDashboardComponent },
      { path: 'postCall', component: PostCallComponent },
      { path: 'allCalls', component: AllCallsComponent },
      { path: 'notes', component: NotesComponent },
      { path: 'profile', component: ProfileManagementComponent }
    ],
  },
  {
    path: 'Admin',
    component: AdminAllTemplateComponent,
    children: [
        { path: 'profile', component: ProfileManagementComponent },
        { path: 'dashboard', component: AdminDashboeardComponent },
        { path: 'team', component: TeamManagementComponent },
        { path: 'agents', component: AgentsPerformancesComponent },
        { path: 'complaints', component: ComplaintsListComponent },
        { path: 'knowledge', component: KnowlageBaseComponent },
        { path: 'quick-tips', component: QuickTipsComponent }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
