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
horarioSelecionado: string = '';              // Armazena o horário selecionado
telefoneAdicionar: string = "";               // Armazena o telefone digitado

mostrarCombos: boolean = false;              
mostrarTipoCorte: boolean = false;          
mostrarServicosAdicionais: boolean = false;  
resumo : boolean = false;

servicosAdicionaisSelecionados: string[] = []; 


dataAtual = new Date();                    
mesAtual = this.dataAtual.toLocaleString('pt-BR', { month: 'long' }); 
anoAtual = this.dataAtual.getFullYear();     
diaSelecionado: number = 0;                 
diasDoMes: number[] = [];                    


lista = [
  { etapa: "mostrarServicosAdicionas", titulo: "Serviço", texto: "Selecione o serviço que deseja agendar um horário." },
  { etapa: "profissional", titulo: "Profissional", texto: "Escolha o profissional." },
  { etapa: "data", titulo: "Data", texto: "Selecione a data." },
  { etapa: "telefone", titulo: "Telefone", texto: "Digite seu telefone." }
];



fecharModal() {

  this.etapaAtual = 'servicos';
  this.mostrarCombos = false;
  this.mostrarTipoCorte = false;
  this.mostrarServicosAdicionais = false;
  this.resumo = false;
  this.servicosAdicionaisSelecionados = [];
  this.servicoSelecionado = '';
  this.profissionalSelecionado = '';
  this.dataSelecionada = '';
  this.horarioSelecionado = '';
  this.telefoneAdicionar = '';
  this.modalClosed.emit();
}

selecionarServico(servico: string) {
  
  this.servicoSelecionado = servico;
  
     
  this.mostrarCombos = false;
  this.mostrarTipoCorte = false;
  this.mostrarServicosAdicionais = false;
  
  if(servico === "combo"){
    this.mostrarCombos = true;           
  } else if(servico === "corte"){
    this.mostrarTipoCorte = true;          
  } else if(servico === "barba"){
    this.servicoSelecionado = "Barba";
    this.resumo = true;
    this.mostrarServicosAdicionais = true;  
  } else {
    this.servicoSelecionado = "Sobrancelha";
    this.resumo = true;
    this.mostrarServicosAdicionais = true;
  }
}




selecionarCombo(combo: string) {
  this.servicoSelecionado = combo;
  this.mostrarCombos = false;               // Desativa submenu
  this.resumo = true;                       // Ativa resumo
  this.etapaAtual = 'profissional';         // Avança para próxima etapa
}

selecionarCorte(corte: string) {
  this.servicoSelecionado = corte;
  this.mostrarTipoCorte = false;            // Desativa submenu
  this.resumo = true;                       // Ativa resumo
  this.mostrarServicosAdicionais = true;    // Ativa tela de serviços adicionais
}

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
  this.mostrarServicosAdicionais = false;
  this.resumo = true;                       // Ativa resumo
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

adicionarTelefone(horario: string) {
  this.horarioSelecionado = horario;
  this.etapaAtual = "telefone";
}


voltarEtapa() {
  // Sistema de volta: cada etapa sabe para onde voltar
  if (this.etapaAtual === 'profissional') {
    this.etapaAtual = 'servicos';
    // Reseta todos os submenus ao voltar para serviços
    this.mostrarCombos = false;
    this.mostrarTipoCorte = false;
    this.mostrarServicosAdicionais = false;
  }
  else if (this.etapaAtual === 'mostrarServicosAdicionas') {
    this.etapaAtual = 'profissional';
    this.mostrarServicosAdicionais = false;
  }
  else if (this.etapaAtual === 'data') this.etapaAtual = 'profissional';
  else if (this.etapaAtual === 'horario') this.etapaAtual = 'data';
  else if(this.etapaAtual === 'telefone') this.etapaAtual = 'horario';
}


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
  const hoje = new Date();
  const mesAtualSistema = hoje.toLocaleString('pt-BR', { month: 'long' });
  
  if(this.mesAtual === mesAtualSistema){
    Swal.fire({
      title: 'Não é possível agendar mês anterior. Escolha hoje ou uma  mês  futura.',
      icon: "error",
      confirmButtonText: 'Fechar'
    });
    return;
  }
  
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
  if (dia > 0) {
    const hoje = new Date();
    const diaAtualSistema = hoje.getDate();
    const dataSelecionada = new Date(this.anoAtual, this.dataAtual.getMonth(), dia);
    const diaSemana = dataSelecionada.getDay();
    
    // Verifica se está tentando selecionar dia passado no mês atual
    if(dia < diaAtualSistema && this.dataAtual.getMonth() === hoje.getMonth()){
      Swal.fire({
        title: 'Não é possível agendar em dia anterior. Escolha hoje ou uma data futura.',
        icon: "error",
        confirmButtonText: 'Fechar'
      });
      return;
    }
    
    // Verifica se é domingo (0 = domingo)
    if(diaSemana === 0){
      Swal.fire({
        title: 'Não funcionamos aos domingos. Escolha outro dia.',
        icon: "error",
        confirmButtonText: 'Fechar'
      });
      return;
    }
    
    this.diaSelecionado = dia;
    this.dataSelecionada = `${dia}/${this.dataAtual.getMonth() + 1}/${this.anoAtual}`;
    this.etapaAtual = 'horario'; 
  }
}

isDomingo(dia: number): boolean {
  if (dia <= 0) return false;
  const data = new Date(this.anoAtual, this.dataAtual.getMonth(), dia);
  return data.getDay() === 0;
}

calcularTotal(): string {
  let total = 0;
  
  // Preços dos serviços principais
  if (this.servicoSelecionado.includes('Cabelo e barba')) total += 60;
  else if (this.servicoSelecionado.includes('Degrade e sobrancelha')) total += 45;
  else if (this.servicoSelecionado.includes('Social e sobrancelha')) total += 40;
  else if (this.servicoSelecionado.includes('Cabelo Social')) total += 35;
  else if (this.servicoSelecionado.includes('Cabelo')) total += 40;
  else if (this.servicoSelecionado.includes('Acabamento no Cabelo')) total += 20;
    else if (this.servicoSelecionado.includes('Barba')) total += 35;
       else if (this.servicoSelecionado.includes('Sobrancelha')) total += 10;
  
  // Preços dos serviços adicionais
  this.servicosAdicionaisSelecionados.forEach(servico => {
    if (servico === 'Barba') total += 35;
    if (servico === 'Sobracelha') total += 10;
  });
  
  return total.toFixed(2);
}

}