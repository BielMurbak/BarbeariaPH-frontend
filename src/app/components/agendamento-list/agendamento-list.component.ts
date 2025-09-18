import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-agendamento-list',
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './agendamento-list.component.html',
  styleUrl: './agendamento-list.component.scss'
})
export class AgendamentoListComponent {
  agendamentos = [
    {
      id: 1,
      cliente: 'João Silva',
      servico: 'Corte + Barba',
      valor: 'R$ 45,00',
      barbeiro: 'Carlos',
      dataHora: '15/12/2024 14:30'
    },
    {
      id: 2,
      cliente: 'Pedro Santos',
      servico: 'Corte',
      valor: 'R$ 25,00',
      barbeiro: 'João',
      dataHora: '15/12/2024 16:00'
    }
  ];

  menuAberto = false;

  toggleMenu() {
    this.menuAberto = !this.menuAberto;
  }

  editar(id: number) {
    console.log('Editar agendamento:', id);
  }

  excluir(id: number) {
    console.log('Excluir agendamento:', id);
  }
}
