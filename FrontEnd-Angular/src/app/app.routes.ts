import { Routes } from '@angular/router';
import { AllTemplateComponent } from './all-template/all-template.component';
import { LoginComponent } from './features/login/login.component';
import { CallManagementComponent } from './features/Agent-Interface/call-management/call-management.component';
import { PerformanceUpdateComponent } from './features/Agent-Interface/performance-update/performance-update.component';
import { DashboardComponent } from './features/Agent-Interface/dashboard/dashboard.component';

export const routes: Routes = [
    {
        path: '',
        component: LoginComponent
    },
      {
        path: 'Agent',
        component: AllTemplateComponent,
        children: [
            {path: 'call',component: CallManagementComponent},
            {path: 'callPerformance', component: PerformanceUpdateComponent},
            {path: 'dashboard',component: DashboardComponent}

        ]
        
    }

];