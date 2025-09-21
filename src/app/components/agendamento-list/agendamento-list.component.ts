import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { AgendamentoComponent } from '../agendamento/agendamento/agendamento-form.component';
import { AgendamentoService } from '../../services/agendamento/agendamento.service';
import { Agendamento } from '../../models/agendamento/agendamento';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agendamento-list',
  imports: [CommonModule, RouterModule, FormsModule, FooterComponent, AgendamentoComponent],
  templateUrl: './agendamento-list.component.html',
  styleUrl: './agendamento-list.component.scss'
})
export class AgendamentoListComponent implements OnInit {
  agendamentos: Agendamento[] = [];
  agendamentoEditando: Agendamento | null = null;
  mostrarFormEdicao = false;

  constructor(private agendamentoService: AgendamentoService) {}

  ngOnInit() {
    this.carregarAgendamentos();
  }

  carregarAgendamentos() {
    this.agendamentoService.listar().subscribe({
      next: (agendamentos) => {
        this.agendamentos = agendamentos;
      },
      error: (error) => {
        Swal.fire('Erro', 'Erro ao carregar agendamentos', 'error');
      }
    });
  }

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

  editar(agendamento: Agendamento) {
    this.agendamentoEditando = { ...agendamento };
    this.mostrarFormEdicao = true;
  }

  salvarEdicao() {
    if (this.agendamentoEditando && this.agendamentoEditando.id) {
      this.agendamentoService.atualizar(this.agendamentoEditando.id, this.agendamentoEditando).subscribe({
        next: () => {
          Swal.fire('Sucesso', 'Agendamento atualizado!', 'success');
          this.carregarAgendamentos();
          this.cancelarEdicao();
        },
        error: () => {
          Swal.fire('Erro', 'Erro ao atualizar agendamento', 'error');
        }
      });
    }
  }

  cancelarEdicao() {
    this.agendamentoEditando = null;
    this.mostrarFormEdicao = false;
  }

  excluir(id: number) {
    Swal.fire({
      title: 'Confirmar exclusão',
      text: 'Deseja realmente excluir este agendamento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.agendamentoService.deletar(id).subscribe({
          next: () => {
            Swal.fire('Sucesso', 'Agendamento excluído!', 'success');
            this.carregarAgendamentos();
          },
          error: () => {
            Swal.fire('Erro', 'Erro ao excluir agendamento', 'error');
          }
        });
      }
    });
  }
}
