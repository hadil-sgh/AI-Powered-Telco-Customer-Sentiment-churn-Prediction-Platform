import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Auth/login/login.component';
import { AllTemplateComponent } from './all-template/all-template.component';
import { RegisterComponent } from './Auth/register/register.component';
import { AccountValidationComponent } from './Auth/account-validation/account-validation.component';

const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'register',component: RegisterComponent},
    {path: 'validation', component: AccountValidationComponent},
    {
        path: 'Agent',
        component: AllTemplateComponent,
        children: [
            // {path: 'call',component: CallManagementComponent},
            // {path: 'callPerformance', component: PerformanceUpdateComponent},
            // {path: 'dashboard',component: DashboardComponent}


        ]
        
    }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
