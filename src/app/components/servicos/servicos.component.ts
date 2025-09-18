import { Component } from '@angular/core';
import { AgendamentoComponent } from '../agendamento/agendamento/agendamento-form.component';

@Component({
  selector: 'app-servicos',
  imports: [AgendamentoComponent],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.scss'
})
export class ServicosComponent {
  showModal = false;

  abrirModal() {
    this.showModal = true;
  }

  fecharModal() {
    this.showModal = false;
  }
}
