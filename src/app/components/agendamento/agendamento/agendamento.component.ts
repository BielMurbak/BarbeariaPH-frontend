import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-agendamento',
  imports: [CommonModule,FormsModule],
  templateUrl: './agendamento.component.html',
  styleUrl: './agendamento.component.scss'
})
export class AgendamentoComponent implements OnInit {
  @Input() showModal: boolean = false;
  @Output() modalClosed = new EventEmitter<void>();

  etapaAtual: string = 'servicos';
  servicoSelecionado: string = '';
  profissionalSelecionado: string = '';
  dataSelecionada: string = '';
  telefoneAdicionar: string = "";
  
  // Propriedades do calendário
  dataAtual = new Date();
  mesAtual = this.dataAtual.toLocaleString('pt-BR', { month: 'long' });
  anoAtual = this.dataAtual.getFullYear();
  diaSelecionado: number = 0;
  diasDoMes: number[] = [];

  fecharModal() {
    this.etapaAtual = 'servicos';
    this.modalClosed.emit();
  }

  selecionarServico(servico: string) {
    this.servicoSelecionado = servico;
    this.etapaAtual = 'profissional';
  }

  selecionarProfissional(profissional: string) {
    this.profissionalSelecionado = profissional;
    this.etapaAtual = 'data';
  }

  selecionarData(data: string) {
    this.dataSelecionada = data;
    this.etapaAtual = 'horario';
  }

   adicionarTelefone(telefone:string){
    this.telefoneAdicionar=telefone;
    this.etapaAtual="telefone";
  }
  

  voltarEtapa() {
    if (this.etapaAtual === 'profissional') this.etapaAtual = 'servicos';
    else if (this.etapaAtual === 'data') this.etapaAtual = 'profissional';
    else if (this.etapaAtual === 'horario') this.etapaAtual = 'data';
    else if(this.etapaAtual === 'telefone') this.etapaAtual = 'horario';
  }

  confirmarAgendamento() {
    Swal.fire({
    title: 'Agendamento confirmado!',
    icon: 'success',
    confirmButtonText: 'Fechar'
  });
    this.fecharModal();
  }

  ngOnInit() {
    this.gerarCalendario();
  }

  gerarCalendario() {
    const primeiroDia = new Date(this.anoAtual, this.dataAtual.getMonth(), 1);
    const ultimoDia = new Date(this.anoAtual, this.dataAtual.getMonth() + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();
    
    this.diasDoMes = [];
    
    // Adiciona espaços vazios para os dias antes do primeiro dia do mês
    for (let i = 0; i < diaSemanaInicio; i++) {
      this.diasDoMes.push(0);
    }
    
    // Adiciona os dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      this.diasDoMes.push(dia);
    }
  }

  mesAnterior() {
    this.dataAtual.setMonth(this.dataAtual.getMonth() - 1);
    this.atualizarCalendario();
  }

  proximoMes() {
    this.dataAtual.setMonth(this.dataAtual.getMonth() + 1);
    this.atualizarCalendario();
  }

  atualizarCalendario() {
    this.mesAtual = this.dataAtual.toLocaleString('pt-BR', { month: 'long' });
    this.anoAtual = this.dataAtual.getFullYear();
    this.gerarCalendario();
  }

  selecionarDia(dia: number) {
    if (dia > 0) {
      this.diaSelecionado = dia;
      this.dataSelecionada = `${dia}/${this.dataAtual.getMonth() + 1}/${this.anoAtual}`;
      this.etapaAtual = 'horario';
    }
  }
}
