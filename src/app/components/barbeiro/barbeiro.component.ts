import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { AgendamentoService } from '../../services/agendamento/agendamento.service';
import { ProfissionalService } from '../../services/profissional/profissional.service';
import { NotificacaoService } from '../../services/notificacao.service';
import { Agendamento } from '../../models/agendamento/agendamento';
import { Profissional } from '../../models/profissional/profissional';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-barbeiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './barbeiro.component.html',
  styleUrl: './barbeiro.component.scss'
})
export class BarbeiroComponent implements OnInit {
  profissionalLogado: Profissional | null = null;
  menuAberto = false;
  secaoAtiva = 'agendamentos';
  agendamentos: Agendamento[] = [];
  agendamentoEditando: Agendamento | null = null;
  mostrarFormEdicao = false;
  
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
    private router: Router,
    private agendamentoService: AgendamentoService,
    private profissionalService: ProfissionalService,
    private notificacaoService: NotificacaoService
  ) {}

  ngOnInit() {
    const profissionalSalvo = localStorage.getItem('profissionalLogado');
    if (profissionalSalvo) {
      this.profissionalLogado = JSON.parse(profissionalSalvo);
      this.carregarAgendamentos();
    } else {
      // Se não está logado, redireciona para login
      this.router.navigate(['/login']);
    }
  }



  carregarAgendamentos() {
    this.agendamentoService.listar().subscribe({
      next: (agendamentos) => {
        this.agendamentos = agendamentos.filter(a => a.status === 'PENDENTE');
      },
      error: () => {
        Swal.fire('Erro', 'Erro ao carregar agendamentos', 'error');
      }
    });
  }

  historico: Agendamento[] = [];

  carregarHistorico() {
    this.agendamentoService.listar().subscribe({
      next: (agendamentos) => {
        this.historico = agendamentos.filter(a => a.status === 'CONCLUIDO');
      },
      error: () => {
        Swal.fire('Erro', 'Erro ao carregar histórico', 'error');
      }
    });
  }

  editar(agendamento: Agendamento) {
    if (!agendamento.id) return;
    this.agendamentoEditando = { ...agendamento };
    this.buscarHorariosLivres(agendamento.data, agendamento.id);
    this.mostrarFormEdicao = true;
  }

  buscarHorariosLivres(data: string, agendamentoId?: number) {
    const dataSelecionada = new Date(data + 'T00:00:00');
    
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
        this.horariosLivres = this.horariosDisponiveis.filter(h => !horariosOcupados.includes(h));
      },
      error: () => {
        this.horariosLivres = [...this.horariosDisponiveis];
      }
    });
  }

  atualizarServico(novoServico: string) {
    if (!this.agendamentoEditando) return;
    
    fetch('http://localhost:8080/api/profissionais/servicos')
      .then(response => response.json())
      .then((profServicos: any[]) => {
        const profServicoCorreto = profServicos.find(ps => 
          ps.servicoEntity?.descricao === novoServico
        );
        
        if (profServicoCorreto && this.agendamentoEditando) {
          this.agendamentoEditando.profissionalServicoEntity = profServicoCorreto;
        }
      })
      .catch(error => console.error('Erro ao buscar profissional-serviços:', error));
  }

  salvarEdicao() {
    if (!this.agendamentoEditando || !this.agendamentoEditando.id) return;
    
    const dataSelecionada = new Date(this.agendamentoEditando.data + 'T00:00:00');
    
    if (dataSelecionada.getDay() === 0) {
      Swal.fire('Erro', 'Não funcionamos aos domingos', 'error');
      return;
    }
    
    this.agendamentoService.atualizar(this.agendamentoEditando.id, this.agendamentoEditando).subscribe({
      next: () => {
        const clienteId = this.agendamentoEditando!.clienteEntity.id;
        const nomeCliente = this.agendamentoEditando!.clienteEntity.nome || 'Cliente';
        const servico = this.agendamentoEditando!.profissionalServicoEntity.servicoEntity?.descricao || 'Serviço';
        const data = this.agendamentoEditando!.data;
        const horario = this.agendamentoEditando!.horario;
        
        this.notificacaoService.adicionarNotificacao(
          clienteId,
          `Seu agendamento foi alterado: ${servico} em ${data} às ${horario}`,
          'EDITADO'
        );
        
        Swal.fire('Sucesso', `Agendamento de ${nomeCliente} atualizado!`, 'success');
        this.cancelarEdicao();
        this.carregarAgendamentos();
      },
      error: () => {
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
        const clienteId = agendamento.clienteEntity.id;
        const nomeCliente = agendamento.clienteEntity.nome || 'Cliente';
        const servico = agendamento.profissionalServicoEntity.servicoEntity?.descricao || 'Serviço';
        const data = agendamento.data;
        const horario = agendamento.horario;
        
        this.agendamentoService.deletar(agendamento.id!).subscribe({
          next: () => {
            this.notificacaoService.adicionarNotificacao(
              clienteId,
              `Seu agendamento foi cancelado: ${servico} em ${data} às ${horario}`,
              'CANCELADO'
            );
            
            this.agendamentos = this.agendamentos.filter(a => a.id !== agendamento.id);
            Swal.fire('Sucesso', `Agendamento de ${nomeCliente} excluído!`, 'success');
          },
          error: (error) => {
            if (error.status === 0 || error.status === 200) {
              this.notificacaoService.adicionarNotificacao(
                clienteId,
                `Seu agendamento foi cancelado: ${servico} em ${data} às ${horario}`,
                'CANCELADO'
              );
              
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

  toggleMenu() {
    this.menuAberto = !this.menuAberto;
  }

  mostrarSecao(secao: string) {
    this.secaoAtiva = secao;
    if (secao === 'historico') {
      this.carregarHistorico();
    }
  }

  sair() {
    localStorage.removeItem('profissionalLogado');
    this.profissionalLogado = null;
    this.router.navigate(['/login']);
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