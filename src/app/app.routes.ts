import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AgendamentoListComponent } from './components/agendamento-list/agendamento-list.component';
import { BarbeiroComponent } from './components/barbeiro/barbeiro.component';
import { AuthGuard } from './guards/auth.guard';
import { BarbeiroGuard } from './guards/barbeiro.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'agendamentos', component: AgendamentoListComponent, canActivate: [AuthGuard] },
  { path: 'barbeiro', component: BarbeiroComponent, canActivate: [BarbeiroGuard] },
];
