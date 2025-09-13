import { Routes } from '@angular/router';
import { PrincipalComponent } from './components/principal/principal/principal.component';

export const routes: Routes = [
    { path: '', redirectTo: 'principal', pathMatch: 'full' },
    { path: 'principal', component: PrincipalComponent },
];
