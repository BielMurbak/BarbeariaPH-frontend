import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AgendamentoService } from '../../services/agendamento/agendamento.service';
import { ProfissionalService } from '../../services/profissional/profissional.service';
import { ClienteService } from '../../services/cliente/cliente.service';
import { ProfissionalservicoService } from '../../services/profissionalservico/profissionalservico.service';
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
  mostrarFormNovoAgendamento = false;

  // Filtros agendamentos
  filtroTexto = '';
  colunaOrdenacao: ColunaOrdenacao = 'data';
  direcaoOrdenacao: 'asc' | 'desc' = 'asc';

  // Filtros histórico
  filtroTextoHistorico = '';
  filtroStatusHistorico = '';
  colunaOrdenacaoHistorico: ColunaOrdenacao = 'data';
  direcaoOrdenacaoHistorico: 'asc' | 'desc' = 'desc';

  // Novo agendamento
  novoAgendamento = {
    nome: '', sobrenome: '', telefone: '',
    servico: '', servicoAdicional: '',
    data: '', horario: ''
  };
  profissionalServicos: any[] = [];
  horariosNovoAgendamento: string[] = [];

  servicosDisponiveis: { nome: string; preco: number }[] = [];

  servicosAdicionaisDisponiveis = [
    { nome: '', label: 'Nenhum' },
    { nome: 'Barba', label: 'Barba — R$ 35,00' },
    { nome: 'Sobrancelha', label: 'Sobrancelha — R$ 10,00' }
  ];

  horariosDisponiveis = [
    '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
    '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
    '18:00','18:30','19:00','19:30','20:00','20:30'
  ];
  horariosLivres: string[] = [];

  // Caixa
  periodoCaixa: 'semana' | 'mes' = 'semana';

  constructor(
    private router: Router,
    private agendamentoService: AgendamentoService,
    private profissionalService: ProfissionalService,
    private clienteService: ClienteService,
    private profissionalServicoService: ProfissionalservicoService,
    private notificacaoService: NotificacaoService
  ) {}

  ngOnInit() {
    const s = localStorage.getItem('profissionalLogado');
    if (s) {
      this.profissionalLogado = JSON.parse(s);
      this.carregarServicosDisponiveis();
      this.carregarAgendamentos();
    } else {
      this.router.navigate(['/login']);
    }
  }

  // ── Carrega serviços do backend ───────────────────────────────────────────────
  carregarServicosDisponiveis() {
    this.profissionalServicoService.listar().subscribe({
      next: (ps: any[]) => {
        this.profissionalServicos = ps;
        const vistos = new Set<string>();
        this.servicosDisponiveis = ps
          .filter((p: any) => {
            const desc = p.servicoEntity?.descricao;
            if (!desc || vistos.has(desc)) return false;
            vistos.add(desc);
            return true;
          })
          .map((p: any) => ({ nome: p.servicoEntity.descricao, preco: p.preco || 0 }));
      },
      error: () => {
        // Fallback
        this.servicosDisponiveis = [
          { nome: 'Cabelo e barba', preco: 60.00 },
          { nome: 'Degrade e sobrancelha', preco: 45.00 },
          { nome: 'Social e sobrancelha', preco: 40.00 },
          { nome: 'Cabelo Social', preco: 35.00 },
          { nome: 'Cabelo', preco: 40.00 },
          { nome: 'Acabamento no Cabelo', preco: 20.00 },
          { nome: 'Barba', preco: 35.00 },
          { nome: 'Sobrancelha', preco: 10.00 }
        ];
      }
    });
  }

  carregarAgendamentos() {
    this.agendamentoService.listar().subscribe({
      next: async (ags) => {
        const agora = new Date();

        // Auto-atualiza pendentes que já passaram usando firstValueFrom
        const pendentesVencidos = ags.filter(a => {
          if (a.status !== 'PENDENTE' || !a.data || !a.horario) return false;
          const [ano, mes, dia] = a.data.split('-').map(Number);
          const [hr, mn] = a.horario.split(':').map(Number);
          return new Date(ano, mes - 1, dia, hr, mn) < agora;
        });

        await Promise.all(
          pendentesVencidos.map(a =>
            firstValueFrom(this.agendamentoService.patch(a.id!, { status: 'CONCLUIDO' }))
              .then(() => { a.status = 'CONCLUIDO'; })
              .catch(() => {})
          )
        );

        this.agendamentos = ags.filter(a => a.status === 'PENDENTE');
      },
      error: () => Swal.fire({ title: 'Erro', text: 'Erro ao carregar agendamentos', icon: 'error', confirmButtonColor: '#BC9E5F' })
    });
  }

  carregarHistorico() {
    this.agendamentoService.listar().subscribe({
      next: (ags) => { this.historico = ags.filter(a => a.status === 'CONCLUIDO' || a.status === 'CANCELADO'); },
      error: () => Swal.fire({ title: 'Erro', text: 'Erro ao carregar histórico', icon: 'error', confirmButtonColor: '#BC9E5F' })
    });
  }

  // ── Getters filtrados/ordenados ───────────────────────────────────────────────
  get agendamentosFiltrados(): Agendamento[] {
    return this.aplicarFiltro(this.agendamentos, this.filtroTexto, '', this.colunaOrdenacao, this.direcaoOrdenacao);
  }

  get historicoFiltrado(): Agendamento[] {
    return this.aplicarFiltro(this.historico, this.filtroTextoHistorico, this.filtroStatusHistorico, this.colunaOrdenacaoHistorico, this.direcaoOrdenacaoHistorico);
  }

  private aplicarFiltro(lista: Agendamento[], texto: string, status: string, col: ColunaOrdenacao, dir: 'asc'|'desc'): Agendamento[] {
    let r = [...lista];
    if (texto.trim()) {
      const b = texto.toLowerCase();
      r = r.filter(a => {
        const nome = `${a.clienteEntity.nome||''} ${a.clienteEntity.sobrenome||''}`.toLowerCase();
        const serv = this.getServico(a).toLowerCase();
        return nome.includes(b) || serv.includes(b);
      });
    }
    if (status) r = r.filter(a => a.status === status);
    if (col) r.sort((a, b) => {
      let vA: any = '', vB: any = '';
      switch (col) {
        case 'nome':    vA = `${a.clienteEntity.nome||''} ${a.clienteEntity.sobrenome||''}`.toLowerCase(); vB = `${b.clienteEntity.nome||''} ${b.clienteEntity.sobrenome||''}`.toLowerCase(); break;
        case 'servico': vA = this.getServico(a).toLowerCase(); vB = this.getServico(b).toLowerCase(); break;
        case 'data':    vA = a.data||''; vB = b.data||''; break;
        case 'horario': vA = a.horario||''; vB = b.horario||''; break;
        case 'valor':   vA = a.preco||a.profissionalServicoEntity.preco||0; vB = b.preco||b.profissionalServicoEntity.preco||0; break;
        case 'status':  vA = (a.status||'').toLowerCase(); vB = (b.status||'').toLowerCase(); break;
      }
      if (vA < vB) return dir === 'asc' ? -1 : 1;
      if (vA > vB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return r;
  }

  ordenarPor(col: ColunaOrdenacao) {
    if (this.colunaOrdenacao === col) this.direcaoOrdenacao = this.direcaoOrdenacao === 'asc' ? 'desc' : 'asc';
    else { this.colunaOrdenacao = col; this.direcaoOrdenacao = 'asc'; }
  }
  ordenarHistoricoPor(col: ColunaOrdenacao) {
    if (this.colunaOrdenacaoHistorico === col) this.direcaoOrdenacaoHistorico = this.direcaoOrdenacaoHistorico === 'asc' ? 'desc' : 'asc';
    else { this.colunaOrdenacaoHistorico = col; this.direcaoOrdenacaoHistorico = 'asc'; }
  }
  getIconeOrdenacao(col: ColunaOrdenacao, ctx: 'ag'|'hist' = 'ag'): string {
    const c = ctx === 'ag' ? this.colunaOrdenacao : this.colunaOrdenacaoHistorico;
    const d = ctx === 'ag' ? this.direcaoOrdenacao : this.direcaoOrdenacaoHistorico;
    if (c !== col) return 'fa-sort';
    return d === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
  limparFiltros() { this.filtroTexto = ''; this.colunaOrdenacao = 'data'; this.direcaoOrdenacao = 'asc'; }

  // ── Novo agendamento pelo barbeiro ────────────────────────────────────────────
  abrirNovoAgendamento() {
    this.novoAgendamento = { nome: '', sobrenome: '', telefone: '', servico: '', servicoAdicional: '', data: '', horario: '' };
    this.horariosNovoAgendamento = [];
    if (this.profissionalServicos.length === 0) {
      this.profissionalServicoService.listar().subscribe({ next: (ps: any[]) => { this.profissionalServicos = ps; } });
    }
    this.mostrarFormNovoAgendamento = true;
  }

  onNovaDataChange() {
    if (!this.novoAgendamento.data) return;
    const d = new Date(this.novoAgendamento.data + 'T00:00:00');
    if (d.getDay() === 0) {
      Swal.fire({ title: 'Domingo fechado', text: 'Não funcionamos aos domingos.', icon: 'error', confirmButtonColor: '#BC9E5F' });
      this.novoAgendamento.data = ''; this.horariosNovoAgendamento = []; return;
    }
    this.agendamentoService.listar().subscribe({ next: (ags) => {
      const ocupados = ags.filter(a => a.data === this.novoAgendamento.data && a.status === 'PENDENTE').map(a => a.horario);
      this.horariosNovoAgendamento = this.horariosDisponiveis.filter(h => !ocupados.includes(h));
    }});
  }

  getPrecoNovoAgendamento(): number {
    let total = 0;
    if (this.novoAgendamento.servico && this.profissionalServicos.length) {
      const ps = this.profissionalServicos.find((p: any) => p.servicoEntity?.descricao === this.novoAgendamento.servico);
      if (ps) total += ps.preco || 0;
    }
    if (this.novoAgendamento.servicoAdicional && this.profissionalServicos.length) {
      const pa = this.profissionalServicos.find((p: any) => p.servicoEntity?.descricao === this.novoAgendamento.servicoAdicional);
      if (pa) total += pa.preco || 0;
    }
    return total;
  }

  salvarNovoAgendamento() {
    const { nome, sobrenome, telefone, servico, data, horario } = this.novoAgendamento;
    if (!nome || !sobrenome || !telefone || !servico || !data || !horario) {
      Swal.fire({ title: 'Campos obrigatórios', text: 'Preencha todos os campos para criar o agendamento.', icon: 'warning', confirmButtonColor: '#BC9E5F' }); return;
    }
    const psEncontrado = this.profissionalServicos.find((p: any) => p.servicoEntity?.descricao === servico);
    if (!psEncontrado) {
      Swal.fire({ title: 'Serviço não encontrado', text: 'Serviço não disponível no sistema.', icon: 'error', confirmButtonColor: '#BC9E5F' }); return;
    }
    this.clienteService.listar().subscribe({ next: (clientes) => {
      const telNum = telefone.replace(/\D/g, '');
      const clienteExistente = clientes.find((c: any) => c.celular.replace(/\D/g, '') === telNum);
      if (clienteExistente) {
        this.criarAgendamentoParaCliente(clienteExistente, psEncontrado);
      } else {
        const novoCliente = { nome, sobrenome, celular: telefone, senha: telNum.slice(-6) };
        this.clienteService.save(novoCliente).subscribe({
          next: (c) => this.criarAgendamentoParaCliente(c, psEncontrado),
          error: () => Swal.fire({ title: 'Erro', text: 'Não foi possível criar o cliente.', icon: 'error', confirmButtonColor: '#BC9E5F' })
        });
      }
    }});
  }

  private criarAgendamentoParaCliente(cliente: any, psEncontrado: any) {
    const { servicoAdicional, data, horario } = this.novoAgendamento;
    let servicoCompleto = psEncontrado.servicoEntity.descricao;
    let precoTotal = psEncontrado.preco || 0;
    if (servicoAdicional) {
      const pa = this.profissionalServicos.find((p: any) => p.servicoEntity?.descricao === servicoAdicional);
      if (pa) { servicoCompleto += ' + ' + servicoAdicional; precoTotal += pa.preco || 0; }
    }
    const ag = {
      data, local: 'Barbearia PH', horario, status: 'PENDENTE',
      observacoes: servicoCompleto, preco: precoTotal,
      clienteEntity: { id: cliente.id },
      profissionalServicoEntity: { id: psEncontrado.id }
    };
    this.agendamentoService.salvar(ag).subscribe({
      next: () => {
        Swal.fire({ title: 'Agendamento criado!', html: `<p>${servicoCompleto}<br>${this.formatarData(data)} às ${horario}<br><strong>R$ ${precoTotal.toFixed(2)}</strong></p>`, icon: 'success', confirmButtonColor: '#BC9E5F' });
        this.mostrarFormNovoAgendamento = false;
        this.carregarAgendamentos();
      },
      error: (e) => Swal.fire({ title: 'Erro', text: e?.error || 'Erro ao criar agendamento.', icon: 'error', confirmButtonColor: '#BC9E5F' })
    });
  }

  // ── Edição ─────────────────────────────────────────────────────────────────────
  editar(ag: Agendamento) {
    if (!ag.id) return;
    this.agendamentoEditando = JSON.parse(JSON.stringify(ag));
    this.buscarHorariosLivres(ag.data, ag.id);
    this.mostrarFormEdicao = true;
  }

  buscarHorariosLivres(data: string, agId?: number) {
    const d = new Date(data + 'T00:00:00');
    if (d.getDay() === 0) { this.horariosLivres = []; return; }
    this.agendamentoService.listar().subscribe({
      next: (ags) => {
        const ocu = ags.filter(a => a.data === data && a.id !== agId && a.status === 'PENDENTE').map(a => a.horario);
        this.horariosLivres = this.horariosDisponiveis.filter(h => !ocu.includes(h));
      },
      error: () => { this.horariosLivres = [...this.horariosDisponiveis]; }
    });
  }

  atualizarServico(novoServico: string) {
    if (!this.agendamentoEditando) return;

    // Busca profissionalServico pelo nome do serviço
    const psEncontrado = this.profissionalServicos.find(
      (p: any) => p.servicoEntity?.descricao === novoServico
    );

    if (psEncontrado) {
      this.agendamentoEditando.profissionalServicoEntity = {
        id: psEncontrado.id,
        preco: psEncontrado.preco,
        servicoEntity: psEncontrado.servicoEntity,
        profissionalEntity: psEncontrado.profissionalEntity
      };
      this.agendamentoEditando.preco = psEncontrado.preco;
      this.agendamentoEditando.observacoes = novoServico;
    } else {
      // Fallback com lista local
      const servicoLocal = this.servicosDisponiveis.find(s => s.nome === novoServico);
      if (servicoLocal && this.agendamentoEditando) {
        this.agendamentoEditando.profissionalServicoEntity = {
          ...this.agendamentoEditando.profissionalServicoEntity,
          preco: servicoLocal.preco,
          servicoEntity: { descricao: novoServico }
        };
        this.agendamentoEditando.preco = servicoLocal.preco;
        this.agendamentoEditando.observacoes = novoServico;
      }
    }
  }

  salvarEdicao() {
    if (!this.agendamentoEditando?.id) return;

    const d = new Date(this.agendamentoEditando.data + 'T00:00:00');
    if (d.getDay() === 0) {
      Swal.fire({ title: 'Erro', text: 'Não funcionamos aos domingos', icon: 'error', confirmButtonColor: '#BC9E5F' }); return;
    }
    if (!this.agendamentoEditando.horario) {
      Swal.fire({ title: 'Atenção', text: 'Selecione um horário disponível.', icon: 'warning', confirmButtonColor: '#BC9E5F' }); return;
    }

    const precoFinal = this.agendamentoEditando.preco
      || this.agendamentoEditando.profissionalServicoEntity.preco
      || 0;

    const observacoesFinal = this.agendamentoEditando.observacoes
      || this.agendamentoEditando.profissionalServicoEntity.servicoEntity?.descricao
      || '';

    const payload = {
      data: this.agendamentoEditando.data,
      local: this.agendamentoEditando.local || 'Barbearia PH',
      horario: this.agendamentoEditando.horario,
      status: this.agendamentoEditando.status || 'PENDENTE',
      observacoes: observacoesFinal,
      preco: precoFinal,
      clienteEntity: { id: this.agendamentoEditando.clienteEntity.id },
      profissionalServicoEntity: { id: this.agendamentoEditando.profissionalServicoEntity.id }
    };

    this.agendamentoService.atualizar(this.agendamentoEditando.id, payload).subscribe({
      next: () => {
        const { clienteEntity, data, horario } = this.agendamentoEditando!;
        this.notificacaoService.adicionarNotificacao(
          clienteEntity.id,
          `Seu agendamento foi alterado: ${observacoesFinal} em ${data} às ${horario}`,
          'EDITADO'
        );

        // Atualiza a lista local imediatamente
        const idx = this.agendamentos.findIndex(a => a.id === this.agendamentoEditando!.id);
        if (idx !== -1) {
          this.agendamentos[idx] = {
            ...this.agendamentos[idx],
            data: payload.data,
            horario: payload.horario,
            local: payload.local,
            status: payload.status as any,
            observacoes: payload.observacoes,
            preco: payload.preco,
            profissionalServicoEntity: this.agendamentoEditando!.profissionalServicoEntity,
          };
        }

        Swal.fire({
          title: 'Atualizado!',
          text: `Agendamento de ${clienteEntity.nome || 'cliente'} salvo com sucesso.`,
          icon: 'success',
          confirmButtonColor: '#BC9E5F'
        });
        this.cancelarEdicao();
        // Recarrega para sincronizar com banco
        this.carregarAgendamentos();
      },
      error: (err) => {
        const msg = err?.error || err?.message || 'Erro ao atualizar agendamento.';
        Swal.fire({ title: 'Erro', text: msg, icon: 'error', confirmButtonColor: '#BC9E5F' });
      }
    });
  }

  cancelarEdicao() { this.agendamentoEditando = null; this.mostrarFormEdicao = false; }

  excluir(ag: Agendamento) {
    if (!ag.id) return;
    Swal.fire({
      title: 'Cancelar agendamento?',
      html: `<p style="color:#4a4540">Você está cancelando o agendamento de <strong>${ag.clienteEntity.nome||'cliente'}</strong>:<br>
             ${ag.observacoes || ag.profissionalServicoEntity.servicoEntity?.descricao || 'Serviço'}<br>
             em ${this.formatarData(ag.data)} às ${ag.horario}</p>`,
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Sim, cancelar', cancelButtonText: 'Voltar',
      confirmButtonColor: '#9a2020', cancelButtonColor: '#BC9E5F'
    }).then(r => {
      if (!r.isConfirmed) return;
      const { id, clienteEntity, profissionalServicoEntity, data, horario } = ag;

      // PATCH status → CANCELADO (não deleta do banco)
      this.agendamentoService.patch(id!, { status: 'CANCELADO' }).subscribe({
        next: () => {
          this.notificacaoService.adicionarNotificacao(
            clienteEntity.id,
            `Seu agendamento foi cancelado: ${profissionalServicoEntity.servicoEntity?.descricao||'Serviço'} em ${data} às ${horario}`,
            'CANCELADO'
          );
          // Move da lista de pendentes para o histórico com status CANCELADO
          this.agendamentos = this.agendamentos.filter(a => a.id !== id);
          ag.status = 'CANCELADO';
          this.historico = [ag, ...this.historico];
          Swal.fire({ title: 'Cancelado!', text: 'Agendamento cancelado com sucesso.', icon: 'success', confirmButtonColor: '#BC9E5F' });
        },
        error: () => {
          Swal.fire({ title: 'Erro', text: 'Erro ao cancelar agendamento.', icon: 'error', confirmButtonColor: '#BC9E5F' });
        }
      });
    });
  }

  // ── Caixa ─────────────────────────────────────────────────────────────────────
  getCaixaResumo() {
    const todos = [...this.agendamentos, ...this.historico];
    const concluidos = todos.filter(a => a.status === 'CONCLUIDO');
    const cancelados = todos.filter(a => a.status === 'CANCELADO');
    const fat = concluidos.reduce((acc, a) => acc + (a.preco || a.profissionalServicoEntity.preco || 0), 0);
    return { faturamentoTotal: fat.toFixed(2), totalAtendimentos: concluidos.length, totalCancelados: cancelados.length };
  }

  getCaixaServicos() {
    const concluidos = [...this.agendamentos, ...this.historico].filter(a => a.status === 'CONCLUIDO');
    const mapa = new Map<string, { quantidade: number; receita: number }>();
    concluidos.forEach(a => {
      const n = this.getServico(a);
      const p = a.preco || a.profissionalServicoEntity.preco || 0;
      const c = mapa.get(n) || { quantidade: 0, receita: 0 };
      mapa.set(n, { quantidade: c.quantidade + 1, receita: c.receita + p });
    });
    return Array.from(mapa.entries()).map(([nome, v]) => ({ nome, quantidade: v.quantidade, receita: v.receita.toFixed(2) })).sort((a, b) => b.quantidade - a.quantidade);
  }

  getAtendimentosRecentes() {
    return [...this.agendamentos, ...this.historico]
      .filter(a => a.status === 'CONCLUIDO' || a.status === 'CANCELADO')
      .sort((a, b) => (b.data + b.horario).localeCompare(a.data + a.horario))
      .slice(0, 15);
  }

  getCaixaGraficoData(): { label: string; atendimentos: number; faturamento: number }[] {
    const todos = [...this.agendamentos, ...this.historico].filter(a => a.status === 'CONCLUIDO');
    const hoje = new Date();
    if (this.periodoCaixa === 'semana') {
      const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());
      return diasSemana.map((label, i) => {
        const d = new Date(inicioSemana);
        d.setDate(inicioSemana.getDate() + i);
        const iso = d.toISOString().split('T')[0];
        const do_dia = todos.filter(a => a.data === iso);
        return { label, atendimentos: do_dia.length, faturamento: do_dia.reduce((acc, a) => acc + (a.preco || a.profissionalServicoEntity.preco || 0), 0) };
      });
    } else {
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const ano = hoje.getFullYear();
      return meses.map((label, i) => {
        const mes = String(i + 1).padStart(2, '0');
        const do_mes = todos.filter(a => a.data && a.data.startsWith(`${ano}-${mes}`));
        return { label, atendimentos: do_mes.length, faturamento: do_mes.reduce((acc, a) => acc + (a.preco || a.profissionalServicoEntity.preco || 0), 0) };
      });
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────────
  toggleMenu() { this.menuAberto = !this.menuAberto; }

  mostrarSecao(secao: string) {
    this.secaoAtiva = secao;
    if (secao === 'historico' || secao === 'caixa') this.carregarHistorico();
    if (secao === 'caixa') this.carregarAgendamentos();
  }

  sair() { localStorage.removeItem('profissionalLogado'); this.profissionalLogado = null; this.router.navigate(['/login']); }
  getDataMinima() { return new Date().toISOString().split('T')[0]; }

  validarData(ev: any) {
    if (new Date(ev.target.value + 'T00:00:00').getDay() === 0) {
      Swal.fire({ title: 'Domingo fechado', text: 'Não funcionamos aos domingos.', icon: 'error', confirmButtonColor: '#BC9E5F' });
      ev.target.value = '';
      if (this.agendamentoEditando) this.agendamentoEditando.data = '';
    }
  }

  formatarData(data: string): string {
    if (!data) return '-';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  formatarValor(ag: Agendamento): string {
    return Number(ag.preco || ag.profissionalServicoEntity.preco || 0).toFixed(2);
  }

  formatarTelefone(ev: any) {
    let v = ev.target.value.replace(/\D/g, '');
    if (v.length >= 11) v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (v.length >= 10) v = v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    else if (v.length >= 6)  v = v.replace(/(\d{2})(\d{4})/, '($1) $2');
    else if (v.length >= 2)  v = v.replace(/(\d{2})/, '($1) ');
    ev.target.value = v;
    this.novoAgendamento.telefone = v;
  }

  getServico(ag: Agendamento): string { return ag.observacoes || ag.profissionalServicoEntity.servicoEntity?.descricao || 'N/A'; }

  getMaxBarValue(): number {
    const dados = this.getCaixaGraficoData();
    return Math.max(...dados.map(d => d.faturamento), 1);
  }
}