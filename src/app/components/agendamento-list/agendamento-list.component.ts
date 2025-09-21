import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { AgendamentoComponent } from '../agendamento/agendamento/agendamento-form.component';
import { AgendamentoService } from '../../services/agendamento/agendamento.service';
import { ClienteService } from '../../services/cliente/cliente.service';
import { Agendamento } from '../../models/agendamento/agendamento';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
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
  editandoDados = false;
  dadosEdicao = { nome: '', sobrenome: '', celular: '' };
  
  servicosDisponiveis = [
    { nome: 'Cabelo e barba', preco: 60.00 },
    { nome: 'Degrade e sobrancelha', preco: 45.00 },
    { nome: 'Social e sobrancelha', preco: 40.00 },
    { nome: 'Cabelo Social', preco: 35.00 },
    { nome: 'Cabelo', preco: 40.00 },
    { nome: 'Acabamento no Cabelo', preco: 20.00 },
    { nome: 'Barba', preco: 35.00 },
    { nome: 'Sobrancelha', preco: 10.00 }
  ];
  
  horariosDisponiveis = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];
  horariosLivres: string[] = [];

  constructor(
    private agendamentoService: AgendamentoService,
    private clienteService: ClienteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carregarAgendamentos();
  }

  carregarAgendamentos() {
    const cliente = this.authService.getClienteLogado();
    
    if (!cliente) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.agendamentoService.listar().subscribe({
      next: (agendamentos) => {
        this.agendamentos = agendamentos.filter(a => 
          a.clienteEntity.id === cliente.id && 
          a.status === 'PENDENTE'
        );
      },
      error: (error) => {
        Swal.fire('Erro', 'Erro ao carregar agendamentos', 'error');
      }
    });
  }

  menuAberto = false;
  secaoAtiva = 'agendamentos';

  toggleMenu() {
    this.menuAberto = !this.menuAberto;
  }

  mostrarSecao(secao: string) {
    this.secaoAtiva = secao;
    if (secao === 'dados') {
      const cliente = this.getClienteLogado();
      if (cliente) {
        this.dadosEdicao = {
          nome: cliente.nome,
          sobrenome: cliente.sobrenome,
          celular: cliente.celular
        };
      }
    }
  }

  showModalAgendamento = false;



  abrirModalAgendamento() {
    this.showModalAgendamento = true;
  }

  fecharModalAgendamento() {
    this.showModalAgendamento = false;
  }

  editar(agendamento: Agendamento) {
    if (!agendamento.id) return;
    this.agendamentoEditando = { ...agendamento };
    this.buscarHorariosLivres(agendamento.data, agendamento.id);
    this.mostrarFormEdicao = true;
  }
  
  buscarHorariosLivres(data: string, agendamentoId?: number) {
    const dataSelecionada = new Date(data + 'T00:00:00');
    const hoje = new Date();
    
    // Verifica se é domingo
    if (dataSelecionada.getDay() === 0) {
      this.horariosLivres = [];
      return;
    }
    
    this.agendamentoService.listar().subscribe({
      next: (agendamentos) => {
        const agendamentosNaData = agendamentos.filter(a => 
          a.data === data && a.id !== agendamentoId && a.status === 'PENDENTE'
        );
        
        const horariosOcupados = agendamentosNaData.map(a => a.horario);
        let horariosDisponiveis = this.horariosDisponiveis.filter(h => !horariosOcupados.includes(h));
        
        // Se for hoje, remove horários que já passaram
        if (dataSelecionada.toDateString() === hoje.toDateString()) {
          const agora = hoje.getHours() * 60 + hoje.getMinutes();
          horariosDisponiveis = horariosDisponiveis.filter(h => {
            const [hora, minuto] = h.split(':').map(Number);
            const horarioMinutos = hora * 60 + minuto;
            return horarioMinutos > agora;
          });
        }
        
        this.horariosLivres = horariosDisponiveis;
      },
      error: () => {
        this.horariosLivres = [...this.horariosDisponiveis];
      }
    });
  }
  
  atualizarServico(novoServico: string) {
    if (!this.agendamentoEditando) return;
    
    const servico = this.servicosDisponiveis.find(s => s.nome === novoServico);
    if (servico && this.agendamentoEditando.profissionalServicoEntity) {
      this.agendamentoEditando.profissionalServicoEntity.preco = servico.preco;
      if (!this.agendamentoEditando.profissionalServicoEntity.servicoEntity) {
        this.agendamentoEditando.profissionalServicoEntity.servicoEntity = {};
      }
      this.agendamentoEditando.profissionalServicoEntity.servicoEntity.descricao = novoServico;
    }
  }

  salvarEdicao() {
    if (!this.agendamentoEditando || !this.agendamentoEditando.id) return;
    
    const dataSelecionada = new Date(this.agendamentoEditando.data + 'T00:00:00');
    const hoje = new Date();
    
    if (dataSelecionada < hoje && dataSelecionada.toDateString() !== hoje.toDateString()) {
      Swal.fire('Erro', 'Não é possível agendar em data anterior a hoje', 'error');
      return;
    }
    
    if (dataSelecionada.getDay() === 0) {
      Swal.fire('Erro', 'Não funcionamos aos domingos', 'error');
      return;
    }
    
    this.agendamentoService.atualizar(this.agendamentoEditando.id, this.agendamentoEditando).subscribe({
      next: () => {
        Swal.fire('Sucesso', 'Agendamento atualizado!', 'success');
        this.cancelarEdicao();
        this.carregarAgendamentos();
      },
      error: (error) => {
        console.error('Erro ao atualizar:', error);
        Swal.fire('Erro', 'Erro ao atualizar agendamento', 'error');
      }
    });
  }

  cancelarEdicao() {
    this.agendamentoEditando = null;
    this.mostrarFormEdicao = false;
  }

  excluir(agendamento: Agendamento) {
    if (!agendamento.id) return;
    
    Swal.fire({
      title: 'Confirmar exclusão',
      text: 'Deseja realmente excluir este agendamento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.agendamentoService.deletar(agendamento.id!).subscribe({
          next: () => {
            this.agendamentos = this.agendamentos.filter(a => a.id !== agendamento.id);
            Swal.fire('Sucesso', 'Agendamento excluído!', 'success');
          },
          error: (error) => {
            console.log('Erro capturado:', error);
            if (error.status === 0 || error.status === 200) {
              this.agendamentos = this.agendamentos.filter(a => a.id !== agendamento.id);
              Swal.fire('Sucesso', 'Agendamento excluído!', 'success');
            } else {
              Swal.fire('Erro', 'Erro ao excluir agendamento', 'error');
            }
          }
        });
      }
    });
  }

  historico: Agendamento[] = [];

  getHistorico() {
    const cliente = this.authService.getClienteLogado();
    if (!cliente) return [];
    
    this.agendamentoService.listar().subscribe({
      next: (agendamentos) => {
        this.historico = agendamentos.filter(a => 
          a.clienteEntity.id === cliente.id && 
          (a.status === 'CONCLUIDO' || a.status === 'CANCELADO')
        );
      }
    });
    
    return this.historico;
  }

  getClienteLogado() {
    return this.authService.getClienteLogado();
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  iniciarEdicao() {
    const cliente = this.getClienteLogado();
    if (cliente) {
      this.dadosEdicao = {
        nome: cliente.nome,
        sobrenome: cliente.sobrenome,
        celular: cliente.celular
      };
      this.editandoDados = true;
    }
  }

  salvarDados() {
    const cliente = this.getClienteLogado();
    if (!cliente || !cliente.id) return;

    const clienteAtualizado = {
      id: cliente.id,
      nome: this.dadosEdicao.nome,
      sobrenome: this.dadosEdicao.sobrenome,
      celular: this.dadosEdicao.celular
    };

    this.clienteService.atualizar(cliente.id, clienteAtualizado).subscribe({
      next: (response) => {
        this.authService.login(response);
        this.editandoDados = false;
        Swal.fire('Sucesso', 'Dados atualizados com sucesso!', 'success');
      },
      error: () => {
        Swal.fire('Erro', 'Erro ao atualizar dados', 'error');
      }
    });
  }

  cancelarEdicaoDados() {
    this.editandoDados = false;
    const cliente = this.getClienteLogado();
    if (cliente) {
      this.dadosEdicao = {
        nome: cliente.nome,
        sobrenome: cliente.sobrenome,
        celular: cliente.celular
      };
    }
  }

  formatarTelefone(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length >= 11) {
      valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (valor.length >= 10) {
      valor = valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (valor.length >= 6) {
      valor = valor.replace(/(\d{2})(\d{4})/, '($1) $2');
    } else if (valor.length >= 2) {
      valor = valor.replace(/(\d{2})/, '($1) ');
    }
    this.dadosEdicao.celular = valor;
  }
  
  getDataMinima(): string {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  }
  
  validarData(event: any) {
    const dataSelecionada = new Date(event.target.value + 'T00:00:00');
    if (dataSelecionada.getDay() === 0) {
      Swal.fire('Erro', 'Não funcionamos aos domingos. Selecione outro dia.', 'error');
      event.target.value = '';
      if (this.agendamentoEditando) {
        this.agendamentoEditando.data = '';
      }
    }
  }
}
