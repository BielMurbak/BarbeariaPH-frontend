import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AgendamentoService } from '../../services/agendamento/agendamento.service';
import { ProfissionalService } from '../../services/profissional/profissional.service';
import { NotificacaoService } from '../../services/notificacao.service';
import { Agendamento } from '../../models/agendamento/agendamento';
import { Profissional } from '../../models/profissional/profissional';
import Swal from 'sweetalert2';

type ColunaOrdenacao = 'nome' | 'servico' | 'data' | 'horario' | 'valor' | 'status' | '';

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
  historico: Agendamento[] = [];
  agendamentoEditando: Agendamento | null = null;
  mostrarFormEdicao = false;

  // Filtros e ordenação — agendamentos
  filtroTexto = '';
  filtroStatus = '';
  colunaOrdenacao: ColunaOrdenacao = 'data';
  direcaoOrdenacao: 'asc' | 'desc' = 'asc';

  // Filtros e ordenação — histórico
  filtroTextoHistorico = '';
  colunaOrdenacaoHistorico: ColunaOrdenacao = 'data';
  direcaoOrdenacaoHistorico: 'asc' | 'desc' = 'desc';

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

  horariosDisponiveis = [
    '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
    '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
    '18:00','18:30','19:00','19:30','20:00','20:30'
  ];
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
      this.router.navigate(['/login']);
    }
  }

  carregarAgendamentos() {
    this.agendamentoService.listar().subscribe({
      next: (agendamentos) => {
        this.agendamentos = agendamentos.filter(a => a.status === 'PENDENTE');
      },
      error: () => Swal.fire('Erro', 'Erro ao carregar agendamentos', 'error')
    });
  }

  carregarHistorico() {
    this.agendamentoService.listar().subscribe({
      next: (agendamentos) => {
        this.historico = agendamentos.filter(a => a.status === 'CONCLUIDO');
      },
      error: () => Swal.fire('Erro', 'Erro ao carregar histórico', 'error')
    });
  }

  // ── Getters filtrados/ordenados ─────────────────────────────────────────────

  get agendamentosFiltrados(): Agendamento[] {
    return this.aplicarFiltroOrdenacao(
      this.agendamentos, this.filtroTexto, this.filtroStatus,
      this.colunaOrdenacao, this.direcaoOrdenacao
    );
  }

  get historicoFiltrado(): Agendamento[] {
    return this.aplicarFiltroOrdenacao(
      this.historico, this.filtroTextoHistorico, '',
      this.colunaOrdenacaoHistorico, this.direcaoOrdenacaoHistorico
    );
  }

  private aplicarFiltroOrdenacao(
    lista: Agendamento[], texto: string, status: string,
    coluna: ColunaOrdenacao, direcao: 'asc' | 'desc'
  ): Agendamento[] {
    let res = [...lista];

    if (texto.trim()) {
      const busca = texto.toLowerCase().trim();
      res = res.filter(a => {
        const nome = `${a.clienteEntity.nome || ''} ${a.clienteEntity.sobrenome || ''}`.toLowerCase();
        const serv = this.getServico(a).toLowerCase();
        return nome.includes(busca) || serv.includes(busca);
      });
    }

    if (status) res = res.filter(a => a.status === status);

    if (coluna) {
      res.sort((a, b) => {
        let vA: string | number = '';
        let vB: string | number = '';
        switch (coluna) {
          case 'nome':
            vA = `${a.clienteEntity.nome || ''} ${a.clienteEntity.sobrenome || ''}`.toLowerCase();
            vB = `${b.clienteEntity.nome || ''} ${b.clienteEntity.sobrenome || ''}`.toLowerCase();
            break;
          case 'servico':
            vA = this.getServico(a).toLowerCase();
            vB = this.getServico(b).toLowerCase();
            break;
          case 'data':  vA = a.data || '';      vB = b.data || '';      break;
          case 'horario': vA = a.horario || ''; vB = b.horario || ''; break;
          case 'valor':
            vA = a.preco || a.profissionalServicoEntity.preco || 0;
            vB = b.preco || b.profissionalServicoEntity.preco || 0;
            break;
          case 'status': vA = (a.status || '').toLowerCase(); vB = (b.status || '').toLowerCase(); break;
        }
        if (vA < vB) return direcao === 'asc' ? -1 : 1;
        if (vA > vB) return direcao === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return res;
  }

  ordenarPor(coluna: ColunaOrdenacao) {
    if (this.colunaOrdenacao === coluna) {
      this.direcaoOrdenacao = this.direcaoOrdenacao === 'asc' ? 'desc' : 'asc';
    } else {
      this.colunaOrdenacao = coluna;
      this.direcaoOrdenacao = 'asc';
    }
  }

  ordenarHistoricoPor(coluna: ColunaOrdenacao) {
    if (this.colunaOrdenacaoHistorico === coluna) {
      this.direcaoOrdenacaoHistorico = this.direcaoOrdenacaoHistorico === 'asc' ? 'desc' : 'asc';
    } else {
      this.colunaOrdenacaoHistorico = coluna;
      this.direcaoOrdenacaoHistorico = 'asc';
    }
  }

  getIconeOrdenacao(coluna: ColunaOrdenacao, ctx: 'ag' | 'hist' = 'ag'): string {
    const col = ctx === 'ag' ? this.colunaOrdenacao : this.colunaOrdenacaoHistorico;
    const dir = ctx === 'ag' ? this.direcaoOrdenacao : this.direcaoOrdenacaoHistorico;
    if (col !== coluna) return 'fa-sort';
    return dir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  limparFiltros() {
    this.filtroTexto = '';
    this.filtroStatus = '';
    this.colunaOrdenacao = 'data';
    this.direcaoOrdenacao = 'asc';
  }

  // ── Edição ──────────────────────────────────────────────────────────────────

  editar(agendamento: Agendamento) {
    if (!agendamento.id) return;
    this.agendamentoEditando = { ...agendamento };
    this.buscarHorariosLivres(agendamento.data, agendamento.id);
    this.mostrarFormEdicao = true;
  }

  buscarHorariosLivres(data: string, agendamentoId?: number) {
    const d = new Date(data + 'T00:00:00');
    if (d.getDay() === 0) { this.horariosLivres = []; return; }
    this.agendamentoService.listar().subscribe({
      next: (ags) => {
        const ocupados = ags.filter(a => a.data === data && a.id !== agendamentoId && a.status === 'PENDENTE').map(a => a.horario);
        this.horariosLivres = this.horariosDisponiveis.filter(h => !ocupados.includes(h));
      },
      error: () => { this.horariosLivres = [...this.horariosDisponiveis]; }
    });
  }

  atualizarServico(novoServico: string) {
    if (!this.agendamentoEditando) return;
    fetch('http://localhost:8080/api/profissionais/servicos')
      .then(r => r.json())
      .then((ps: any[]) => {
        const found = ps.find(p => p.servicoEntity?.descricao === novoServico);
        if (found && this.agendamentoEditando) this.agendamentoEditando.profissionalServicoEntity = found;
      })
      .catch(e => console.error('Erro ao buscar serviços:', e));
  }

  salvarEdicao() {
    if (!this.agendamentoEditando?.id) return;
    if (new Date(this.agendamentoEditando.data + 'T00:00:00').getDay() === 0) {
      Swal.fire('Erro', 'Não funcionamos aos domingos', 'error'); return;
    }
    const limpo = {
      id: this.agendamentoEditando.id,
      data: this.agendamentoEditando.data,
      local: this.agendamentoEditando.local,
      horario: this.agendamentoEditando.horario,
      status: this.agendamentoEditando.status,
      observacoes: this.agendamentoEditando.observacoes || this.agendamentoEditando.profissionalServicoEntity.servicoEntity?.descricao || '',
      preco: this.agendamentoEditando.preco || this.agendamentoEditando.profissionalServicoEntity.preco || 0,
      clienteEntity: { id: this.agendamentoEditando.clienteEntity.id },
      profissionalServicoEntity: { id: this.agendamentoEditando.profissionalServicoEntity.id }
    };
    this.agendamentoService.atualizar(this.agendamentoEditando.id, limpo).subscribe({
      next: () => {
        const { clienteEntity, profissionalServicoEntity, data, horario } = this.agendamentoEditando!;
        this.notificacaoService.adicionarNotificacao(
          clienteEntity.id,
          `Seu agendamento foi alterado: ${profissionalServicoEntity.servicoEntity?.descricao || 'Serviço'} em ${data} às ${horario}`,
          'EDITADO'
        );
        Swal.fire('Sucesso', `Agendamento de ${clienteEntity.nome || 'Cliente'} atualizado!`, 'success');
        this.cancelarEdicao();
        this.carregarAgendamentos();
      },
      error: () => Swal.fire('Erro', 'Erro ao atualizar agendamento', 'error')
    });
  }

  cancelarEdicao() { this.agendamentoEditando = null; this.mostrarFormEdicao = false; }

  excluir(agendamento: Agendamento) {
    if (!agendamento.id) return;
    Swal.fire({
      title: 'Confirmar exclusão', text: 'Deseja realmente excluir este agendamento?',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;
      const { id, clienteEntity, profissionalServicoEntity, data, horario } = agendamento;
      const servico = profissionalServicoEntity.servicoEntity?.descricao || 'Serviço';
      this.agendamentoService.deletar(id!).subscribe({
        next: () => {
          this.notificacaoService.adicionarNotificacao(clienteEntity.id, `Seu agendamento foi cancelado: ${servico} em ${data} às ${horario}`, 'CANCELADO');
          this.agendamentos = this.agendamentos.filter(a => a.id !== id);
          Swal.fire('Sucesso', `Agendamento de ${clienteEntity.nome || 'Cliente'} excluído!`, 'success');
        },
        error: (error) => {
          if (error.status === 0 || error.status === 200) {
            this.notificacaoService.adicionarNotificacao(clienteEntity.id, `Seu agendamento foi cancelado: ${servico} em ${data} às ${horario}`, 'CANCELADO');
            this.agendamentos = this.agendamentos.filter(a => a.id !== id);
            Swal.fire('Sucesso', 'Agendamento excluído!', 'success');
          } else {
            Swal.fire('Erro', 'Erro ao excluir agendamento', 'error');
          }
        }
      });
    });
  }

  toggleMenu() { this.menuAberto = !this.menuAberto; }

  mostrarSecao(secao: string) {
    this.secaoAtiva = secao;
    if (secao === 'historico' || secao === 'caixa') this.carregarHistorico();
  }

  sair() {
    localStorage.removeItem('profissionalLogado');
    this.profissionalLogado = null;
    this.router.navigate(['/login']);
  }

  getDataMinima(): string { return new Date().toISOString().split('T')[0]; }

  validarData(event: any) {
    const d = new Date(event.target.value + 'T00:00:00');
    if (d.getDay() === 0) {
      Swal.fire('Erro', 'Não funcionamos aos domingos. Selecione outro dia.', 'error');
      event.target.value = '';
      if (this.agendamentoEditando) this.agendamentoEditando.data = '';
    }
  }

  formatarData(data: string): string {
    if (!data) return '-';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  formatarValor(agendamento: Agendamento): string {
    const val = agendamento.preco || agendamento.profissionalServicoEntity.preco || 0;
    return Number(val).toFixed(2);
  }

  getServico(agendamento: Agendamento): string {
    return agendamento.observacoes || agendamento.profissionalServicoEntity.servicoEntity?.descricao || 'N/A';
  }

  // ── Métodos da seção Caixa ────────────────────────────────────────────────

  private getAllAgendamentos(): Agendamento[] {
    return [...this.agendamentos, ...this.historico];
  }

  getCaixaResumo() {
    const todos = this.getAllAgendamentos();
    const concluidos = todos.filter(a => a.status === 'CONCLUIDO');
    const cancelados = todos.filter(a => a.status === 'CANCELADO');
    const faturamento = concluidos.reduce((acc, a) => acc + (a.preco || a.profissionalServicoEntity.preco || 0), 0);
    const ticket = concluidos.length > 0 ? faturamento / concluidos.length : 0;
    return {
      faturamentoTotal: faturamento.toFixed(2),
      totalAtendimentos: concluidos.length,
      ticketMedio: ticket.toFixed(2),
      totalCancelados: cancelados.length
    };
  }

  getCaixaServicos(): { nome: string; quantidade: number; receita: string }[] {
    const concluidos = this.getAllAgendamentos().filter(a => a.status === 'CONCLUIDO');
    const mapa = new Map<string, { quantidade: number; receita: number }>();
    concluidos.forEach(a => {
      const nome = this.getServico(a);
      const preco = a.preco || a.profissionalServicoEntity.preco || 0;
      const atual = mapa.get(nome) || { quantidade: 0, receita: 0 };
      mapa.set(nome, { quantidade: atual.quantidade + 1, receita: atual.receita + preco });
    });
    return Array.from(mapa.entries())
      .map(([nome, v]) => ({ nome, quantidade: v.quantidade, receita: v.receita.toFixed(2) }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }

  getAtendimentosRecentes(): Agendamento[] {
    return this.getAllAgendamentos()
      .filter(a => a.status === 'CONCLUIDO' || a.status === 'CANCELADO')
      .sort((a, b) => {
        const da = (a.data || '') + (a.horario || '');
        const db = (b.data || '') + (b.horario || '');
        return db.localeCompare(da);
      })
      .slice(0, 20);
  }
}