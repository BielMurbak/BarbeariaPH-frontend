import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendamentoComponent } from '../../agendamento/agendamento/agendamento.component';

@Component({
  selector: 'app-principal',
  imports: [CommonModule, AgendamentoComponent],
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.scss'
})
export class PrincipalComponent {
  showModal = false;

  abrirModal() {
    this.showModal = true;
  }

  fecharModal() {
    this.showModal = false;
  }
}
