import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { AgendamentoComponent } from '../agendamento/agendamento/agendamento-form.component';
import { AgendamentoService } from '../../services/agendamento/agendamento.service';
import { ClienteService } from '../../services/cliente/cliente.service';
import { NotificacaoService } from '../../services/notificacao.service';
import { ProfissionalservicoService } from '../../services/profissionalservico/profissionalservico.service';
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
  agendamentos: Agendamento[] = [];          // apenas PENDENTES
  historico: Agendamento[] = [];             // CONCLUIDO + CANCELADO
  agendamentoEditando: Agendamento | null = null;
  mostrarFormEdicao = false;
  editandoDados = false;
  dadosEdicao = { nome: '', sobrenome: '', celular: '' };
  menuAberto = false;
  secaoAtiva = 'agendamentos';
  showModalAgendamento = false;

  // Filtros histórico
  filtroHistorico = '';
  filtroStatusHistorico = '';

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
    private agendamentoService: AgendamentoService,
    private clienteService: ClienteService,
    private authService: AuthService,
    private notificacaoService: NotificacaoService,
    private profissionalServicoService: ProfissionalservicoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carregarTodos();
    this.verificarNotificacoes();
  }

  // ── Carregamento ─────────────────────────────────────────────────────────────
  carregarTodos() {
    const cliente = this.authService.getClienteLogado();
    if (!cliente) { this.router.navigate(['/login']); return; }

    this.agendamentoService.listar().subscribe({
      next: (lista) => {
        const meus = lista.filter(a => a.clienteEntity.id === cliente.id);

        // Verifica automaticamente se algum agendamento passou da hora e atualiza status
        const agora = new Date();
        const atualizacoes: Promise<void>[] = [];

        meus.forEach(ag => {
          if (ag.status === 'PENDENTE' && ag.data && ag.horario) {
            const [ano, mes, dia] = ag.data.split('-').map(Number);
            const [hora, min] = ag.horario.split(':').map(Number);
            const dtAg = new Date(ano, mes - 1, dia, hora, min);
            if (dtAg < agora) {
              // Passou da hora — marca como concluído via PATCH
              const p = this.agendamentoService.patch(ag.id!, { status: 'CONCLUIDO' }).toPromise()
                .then(() => { ag.status = 'CONCLUIDO'; })
                .catch(() => {});
              atualizacoes.push(p);
            }
          }
        });

        Promise.all(atualizacoes).then(() => {
          this.agendamentos = meus.filter(a => a.status === 'PENDENTE');
          this.historico    = meus.filter(a => a.status === 'CONCLUIDO' || a.status === 'CANCELADO');
        });
      },
      error: () => Swal.fire({ title: 'Erro', text: 'Erro ao carregar agendamentos', icon: 'error', confirmButtonColor: '#BC9E5F' })
    });
  }

  get historicoFiltrado(): Agendamento[] {
    let res = [...this.historico];
    if (this.filtroHistorico.trim()) {
      const b = this.filtroHistorico.toLowerCase();
      res = res.filter(a =>
        (a.observacoes || a.profissionalServicoEntity.servicoEntity?.descricao || '').toLowerCase().includes(b) ||
        (a.data || '').includes(b)
      );
    }
    if (this.filtroStatusHistorico) res = res.filter(a => a.status === this.filtroStatusHistorico);
    return res.sort((a, b) => (b.data + b.horario).localeCompare(a.data + a.horario));
  }

  // ── Notificações ─────────────────────────────────────────────────────────────
  verificarNotificacoes() {
    const cliente = this.authService.getClienteLogado();
    if (!cliente) return;
    const notificacoes = this.notificacaoService.obterNotificacoesCliente(cliente.id);
    if (notificacoes.length > 0) {
      const mensagens = notificacoes.map(n => `• ${n.mensagem}`).join('\n');
      Swal.fire({
        title: 'Você tem notificações',
        text: mensagens,
        icon: 'info',
        confirmButtonText: 'OK',
        confirmButtonColor: '#BC9E5F'
      }).then(() => this.notificacaoService.marcarComoLida(cliente.id));
    }
  }

  // ── Cancelar agendamento (cliente) ────────────────────────────────────────────
  cancelarAgendamento(ag: Agendamento) {
    Swal.fire({
      title: 'Cancelar agendamento?',
      html: `<p style="color:#4a4540">Você está cancelando:<br><strong>${ag.observacoes || ag.profissionalServicoEntity.servicoEntity?.descricao}</strong><br>em ${this.formatarData(ag.data)} às ${ag.horario}</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, cancelar',
      cancelButtonText: 'Voltar',
      confirmButtonColor: '#9a2020',
      cancelButtonColor: '#BC9E5F'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.agendamentoService.patch(ag.id!, { status: 'CANCELADO' }).subscribe({
        next: () => {
          this.agendamentos = this.agendamentos.filter(a => a.id !== ag.id);
          ag.status = 'CANCELADO';
          this.historico = [ag, ...this.historico];
          Swal.fire({ title: 'Cancelado', text: 'Seu agendamento foi cancelado.', icon: 'success', confirmButtonColor: '#BC9E5F' });
        },
        error: () => Swal.fire({ title: 'Erro', text: 'Não foi possível cancelar.', icon: 'error', confirmButtonColor: '#BC9E5F' })
      });
    });
  }

  // ── Editar ────────────────────────────────────────────────────────────────────
  editar(ag: Agendamento) {
    if (!ag.id) return;
    this.agendamentoEditando = { ...ag };
    this.buscarHorariosLivres(ag.data, ag.id);
    this.mostrarFormEdicao = true;
  }

  buscarHorariosLivres(data: string, agendamentoId?: number) {
    const d = new Date(data + 'T00:00:00');
    if (d.getDay() === 0) { this.horariosLivres = []; return; }
    this.agendamentoService.listar().subscribe({
      next: (ags) => {
        const ocupados = ags.filter(a => a.data === data && a.id !== agendamentoId && a.status === 'PENDENTE').map(a => a.horario);
        let livres = this.horariosDisponiveis.filter(h => !ocupados.includes(h));
        const hoje = new Date();
        if (d.toDateString() === hoje.toDateString()) {
          const agora = hoje.getHours() * 60 + hoje.getMinutes();
          livres = livres.filter(h => { const [hr, mn] = h.split(':').map(Number); return hr * 60 + mn > agora; });
        }
        this.horariosLivres = livres;
      },
      error: () => { this.horariosLivres = [...this.horariosDisponiveis]; }
    });
  }

  atualizarServico(novoServico: string) {
    if (!this.agendamentoEditando) return;
    this.profissionalServicoService.listar().subscribe({
      next: (ps) => {
        const found = ps.find((p: any) => p.servicoEntity?.descricao === novoServico);
        if (found && this.agendamentoEditando) this.agendamentoEditando.profissionalServicoEntity = found;
      }
    });
  }

  salvarEdicao() {
    if (!this.agendamentoEditando?.id) return;
    const d = new Date(this.agendamentoEditando.data + 'T00:00:00');
    if (d.getDay() === 0) { Swal.fire({ title: 'Erro', text: 'Não funcionamos aos domingos', icon: 'error', confirmButtonColor: '#BC9E5F' }); return; }
    if (d < new Date() && d.toDateString() !== new Date().toDateString()) {
      Swal.fire({ title: 'Erro', text: 'Não é possível agendar em data passada', icon: 'error', confirmButtonColor: '#BC9E5F' }); return;
    }
    const limpo = {
      id: this.agendamentoEditando.id, data: this.agendamentoEditando.data,
      local: this.agendamentoEditando.local, horario: this.agendamentoEditando.horario,
      status: this.agendamentoEditando.status,
      observacoes: this.agendamentoEditando.observacoes || this.agendamentoEditando.profissionalServicoEntity.servicoEntity?.descricao || '',
      preco: this.agendamentoEditando.preco || this.agendamentoEditando.profissionalServicoEntity.preco || 0,
      clienteEntity: { id: this.agendamentoEditando.clienteEntity.id },
      profissionalServicoEntity: { id: this.agendamentoEditando.profissionalServicoEntity.id }
    };
    this.agendamentoService.atualizar(this.agendamentoEditando.id, limpo).subscribe({
      next: () => {
        Swal.fire({ title: 'Atualizado!', text: 'Agendamento alterado com sucesso.', icon: 'success', confirmButtonColor: '#BC9E5F' });
        this.cancelarEdicao(); this.carregarTodos();
      },
      error: () => Swal.fire({ title: 'Erro', text: 'Erro ao atualizar agendamento', icon: 'error', confirmButtonColor: '#BC9E5F' })
    });
  }

  cancelarEdicao() { this.agendamentoEditando = null; this.mostrarFormEdicao = false; }

  // ── Navegação ─────────────────────────────────────────────────────────────────
  toggleMenu() { this.menuAberto = !this.menuAberto; }

  mostrarSecao(secao: string) {
    this.secaoAtiva = secao;
    if (secao === 'dados') {
      const c = this.getClienteLogado();
      if (c) this.dadosEdicao = { nome: c.nome, sobrenome: c.sobrenome, celular: c.celular };
    }
    if (secao === 'historico' || secao === 'agendamentos') this.carregarTodos();
  }

  abrirModalAgendamento() { this.showModalAgendamento = true; }

  onModalAgendamentoClosed() {
    this.showModalAgendamento = false;
    this.carregarTodos(); // recarrega para refletir novo agendamento
  }

  // ── Meus Dados ────────────────────────────────────────────────────────────────
  getClienteLogado() { return this.authService.getClienteLogado(); }

  iniciarEdicao() {
    const c = this.getClienteLogado();
    if (c) { this.dadosEdicao = { nome: c.nome, sobrenome: c.sobrenome, celular: c.celular }; this.editandoDados = true; }
  }

  salvarDados() {
    const c = this.getClienteLogado();
    if (!c?.id) return;
    this.clienteService.atualizar(c.id, { ...c, ...this.dadosEdicao }).subscribe({
      next: (r) => { this.authService.login(r); this.editandoDados = false; Swal.fire({ title: 'Atualizado!', text: 'Dados salvos com sucesso.', icon: 'success', confirmButtonColor: '#BC9E5F' }); },
      error: () => Swal.fire({ title: 'Erro', text: 'Erro ao atualizar dados', icon: 'error', confirmButtonColor: '#BC9E5F' })
    });
  }

  cancelarEdicaoDados() {
    this.editandoDados = false;
    const c = this.getClienteLogado();
    if (c) this.dadosEdicao = { nome: c.nome, sobrenome: c.sobrenome, celular: c.celular };
  }

  sair() { this.authService.logout(); this.router.navigate(['/login']); }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  formatarData(data: string): string {
    if (!data) return '-';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  formatarValor(ag: Agendamento): string {
    const v = ag.preco || ag.profissionalServicoEntity.preco || 0;
    return Number(v).toFixed(2);
  }

  formatarTelefone(event: any) {
    let v = event.target.value.replace(/\D/g, '');
    if (v.length >= 11) v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (v.length >= 10) v = v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    else if (v.length >= 6)  v = v.replace(/(\d{2})(\d{4})/, '($1) $2');
    else if (v.length >= 2)  v = v.replace(/(\d{2})/, '($1) ');
    this.dadosEdicao.celular = v;
  }

  getDataMinima(): string { return new Date().toISOString().split('T')[0]; }

  validarData(event: any) {
    const d = new Date(event.target.value + 'T00:00:00');
    if (d.getDay() === 0) {
      Swal.fire({ title: 'Domingo fechado', text: 'Não funcionamos aos domingos.', icon: 'error', confirmButtonColor: '#BC9E5F' });
      event.target.value = '';
      if (this.agendamentoEditando) this.agendamentoEditando.data = '';
    }
  }
}
