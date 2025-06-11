import { Routes } from '@angular/router';
import { AllTemplateComponent } from './all-template/all-template.component';
import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
    {
        path: '',
        component: LoginComponent
    },
      {
        path: 'desktop',
        component: AllTemplateComponent
    }

];
