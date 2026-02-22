import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AnimalListComponent } from './animal-list/animal-list';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'animals', component: AnimalListComponent, canActivate: [authGuard] },      
    { path: '', redirectTo: 'animals', pathMatch: 'full' }, 
];