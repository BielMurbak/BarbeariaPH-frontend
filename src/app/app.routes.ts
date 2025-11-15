import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AgendamentoListComponent } from './components/agendamento-list/agendamento-list.component';
import { BarbeiroComponent } from './components/barbeiro/barbeiro.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'agendamentos', component: AgendamentoListComponent },
  { path: 'barbeiro', component: BarbeiroComponent},

];
