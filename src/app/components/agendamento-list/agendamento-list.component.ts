import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { AgendamentoComponent } from '../agendamento/agendamento/agendamento-form.component';

@Component({
  selector: 'app-agendamento-list',
  imports: [CommonModule, RouterModule, FormsModule, FooterComponent, AgendamentoComponent],
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

  historicos = [
    {
      id: 1,
      cliente: 'Maria Silva',
      servico: 'Corte + Escova',
      valor: 'R$ 50,00',
      barbeiro: 'Ana',
      dataHora: '10/12/2024 10:00',
      status: 'Concluído'
    },
    {
      id: 2,
      cliente: 'José Santos',
      servico: 'Barba',
      valor: 'R$ 20,00',
      barbeiro: 'Carlos',
      dataHora: '08/12/2024 15:30',
      status: 'Concluído'
    }
  ];

  menuAberto = false;
  secaoAtiva = 'agendamentos';

  dadosCliente = {
    nome: 'João',
    sobrenome: 'Silva',
    telefone: '(11) 99999-9999'
  };

  toggleMenu() {
    this.menuAberto = !this.menuAberto;
  }

  mostrarSecao(secao: string) {
    this.secaoAtiva = secao;
  }

  showModalAgendamento = false;

  salvarDados() {
    console.log('Dados salvos:', this.dadosCliente);
  }

  abrirModalAgendamento() {
    this.showModalAgendamento = true;
  }

  fecharModalAgendamento() {
    this.showModalAgendamento = false;
  }

  editar(id: number) {
    console.log('Editar agendamento:', id);
  }

  excluir(id: number) {
    console.log('Excluir agendamento:', id);
  }
}
