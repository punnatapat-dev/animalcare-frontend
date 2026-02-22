import { Routes } from '@angular/router';

import { LoginComponent } from './login/login';
import { AnimalListComponent } from './animal-list/animal-list';
export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'animals', component: AnimalListComponent },
    { path: '', redirectTo: 'animals', pathMatch: 'full' }, 
];