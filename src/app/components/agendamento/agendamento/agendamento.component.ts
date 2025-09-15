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

etapaAtual: string = 'servicos';              // Controla qual tela principal está ativa
servicoSelecionado: string = '';              // Armazena o serviço escolhido pelo usuário
profissionalSelecionado: string = '';         // Armazena o profissional escolhido
dataSelecionada: string = '';                 // Armazena a data escolhida
telefoneAdicionar: string = "";               // Armazena o telefone digitado

// ===== VARIÁVEIS DE CONTROLE DE SUBMENUS =====
// Estas variáveis controlam quando mostrar telas secundárias dentro da etapa 'servicos'
mostrarCombos: boolean = false;               // Mostra opções de combo quando true
mostrarTipoCorte: boolean = false;            // Mostra tipos de corte quando true
mostrarServicosAdicionais: boolean = false;   // Mostra serviços extras quando true
servicosAdicionaisSelecionados: string[] = []; // Array para múltiplas seleções de serviços extras

// ===== VARIÁVEIS DO CALENDÁRIO =====
dataAtual = new Date();                       // Data atual do sistema
mesAtual = this.dataAtual.toLocaleString('pt-BR', { month: 'long' }); // Nome do mês em português
anoAtual = this.dataAtual.getFullYear();      // Ano atual
diaSelecionado: number = 0;                   // Dia selecionado pelo usuário
diasDoMes: number[] = [];                     // Array com todos os dias do mês para exibição

// ===== CONFIGURAÇÃO DE TEXTOS DINÂMICOS =====
// Lista que mapeia cada etapa com seu título e descrição correspondente
lista = [
  { etapa: "mostrarServicosAdicionas", titulo: "Serviço", texto: "Selecione o serviço que deseja agendar um horário." },
  { etapa: "profissional", titulo: "Profissional", texto: "Escolha o profissional." },
  { etapa: "data", titulo: "Data", texto: "Selecione a data." },
  { etapa: "telefone", titulo: "Telefone", texto: "Digite seu telefone." }
];

// ===== MÉTODOS DE NAVEGAÇÃO =====

fecharModal() {
  // Reseta o sistema para o estado inicial
  this.etapaAtual = 'servicos';
  this.modalClosed.emit();
}

selecionarServico(servico: string) {
  // CONTROLADOR PRINCIPAL: decide qual caminho seguir baseado no serviço escolhido
  this.servicoSelecionado = servico;
  if(servico === "combo"){
    this.mostrarCombos = true;              // Ativa submenu de combos
  } else if(servico === "corte"){
    this.mostrarTipoCorte = true;           // Ativa submenu de tipos de corte

  }else{
    alert("Fazer o resumo e fazer barba,sobrancelha");
  }
   
  }

// ===== MÉTODOS DE SELEÇÃO ESPECÍFICA =====
// Todos seguem o mesmo padrão: salvar escolha + desativar submenu + avançar etapa

selecionarCombo(combo: string) {
  this.servicoSelecionado = combo;
  this.mostrarCombos = false;               // Desativa submenu
  this.etapaAtual = 'profissional';         // Avança para próxima etapa
}

selecionarCorte(corte: string) {
  this.servicoSelecionado = corte;
  this.mostrarTipoCorte = false;            // Desativa submenu
  this.etapaAtual = 'mostrarServicosAdicionas'; // Vai para serviços adicionais
}

// ===== SISTEMA DE MÚLTIPLA SELEÇÃO (Serviços Adicionais) =====
selecionarServicosAdicionais(servico: string) {
  // Permite selecionar/desselecionar múltiplos serviços extras
  const index = this.servicosAdicionaisSelecionados.indexOf(servico);
  if (index > -1) {
    this.servicosAdicionaisSelecionados.splice(index, 1); // Remove se já selecionado
  } else {
    this.servicosAdicionaisSelecionados.push(servico);    // Adiciona se não selecionado
  }
}

continuarServicosAdicionais() {
  // Finaliza seleção múltipla e continua fluxo
  this.servicoSelecionado = this.servicosAdicionaisSelecionados.join(', ');
  this.mostrarServicosAdicionais = false;
  this.etapaAtual = 'profissional';
}

// ===== FLUXO LINEAR SIMPLES =====
// Métodos que apenas avançam para próxima etapa
selecionarProfissional(profissional: string) {
  this.profissionalSelecionado = profissional;
  this.etapaAtual = 'data';
}

selecionarData(data: string) {
  this.dataSelecionada = data;
  this.etapaAtual = 'horario';
}

adicionarTelefone(telefone: string) {
  this.telefoneAdicionar = telefone;
  this.etapaAtual = "telefone";
}

// ===== NAVEGAÇÃO REVERSA =====
voltarEtapa() {
  // Sistema de volta: cada etapa sabe para onde voltar
  if (this.etapaAtual === 'profissional') this.etapaAtual = 'servicos';
  else if (this.etapaAtual === 'data') this.etapaAtual = 'profissional';
  else if (this.etapaAtual === 'horario') this.etapaAtual = 'data';
  else if(this.etapaAtual === 'telefone') this.etapaAtual = 'horario';
}

// ===== FINALIZAÇÃO =====
confirmarAgendamento() {
  // Mostra confirmação e fecha modal
  Swal.fire({
    title: 'Agendamento confirmado!',
    icon: 'success',
    confirmButtonText: 'Fechar'
  });
  this.fecharModal();
}

// ===== SISTEMA DE CALENDÁRIO =====
// Gera array de dias para exibição em grid 7x6 (semana x semanas)

ngOnInit() {
  this.gerarCalendario(); // Inicializa calendário ao carregar componente
}

gerarCalendario() {
  // Calcula primeiro e último dia do mês atual
  const primeiroDia = new Date(this.anoAtual, this.dataAtual.getMonth(), 1);
  const ultimoDia = new Date(this.anoAtual, this.dataAtual.getMonth() + 1, 0);
  const diasNoMes = ultimoDia.getDate();
  const diaSemanaInicio = primeiroDia.getDay(); // 0=domingo, 1=segunda...
  
  this.diasDoMes = [];
  
  // Adiciona espaços vazios antes do primeiro dia (para alinhar com dia da semana)
  for (let i = 0; i < diaSemanaInicio; i++) {
    this.diasDoMes.push(0); // 0 = célula vazia
  }
  
  // Adiciona todos os dias do mês
  for (let dia = 1; dia <= diasNoMes; dia++) {
    this.diasDoMes.push(dia);
  }
}

// ===== NAVEGAÇÃO DO CALENDÁRIO =====
mesAnterior() {
  this.dataAtual.setMonth(this.dataAtual.getMonth() - 1);
  this.atualizarCalendario();
}

proximoMes() {
  this.dataAtual.setMonth(this.dataAtual.getMonth() + 1);
  this.atualizarCalendario();
}

atualizarCalendario() {
  // Atualiza nome do mês e ano, depois regenera grid de dias
  this.mesAtual = this.dataAtual.toLocaleString('pt-BR', { month: 'long' });
  this.anoAtual = this.dataAtual.getFullYear();
  this.gerarCalendario();
}

selecionarDia(dia: number) {
  // Só permite selecionar dias válidos (> 0)
  if (dia > 0) {
    this.diaSelecionado = dia;
    this.dataSelecionada = `${dia}/${this.dataAtual.getMonth() + 1}/${this.anoAtual}`;
    this.etapaAtual = 'horario'; 
  }
}

}