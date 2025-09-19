import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { AgendamentoService } from '../../../services/agendamento/agendamento.service';
import { ClienteService } from '../../../services/cliente/cliente.service';
import { ProfissionalService } from '../../../services/profissional/profissional.service';
import { ServicoService } from '../../../services/servico/servico.service';
import { ProfissionalservicoService } from '../../../services/profissionalservico/profissionalservico.service';
import { Agendamento } from '../../../models/agendamento/agendamento';

@Component({
  selector: 'app-agendamento',
  imports: [CommonModule],
  templateUrl: './agendamento-form.component.html',
  styleUrl: './agendamento-form.component.scss'
})
export class AgendamentoComponent implements OnInit {
@Input() showModal: boolean = false;
@Output() modalClosed = new EventEmitter<void>();

constructor(
  private agendamentoService: AgendamentoService,
  private clienteService: ClienteService,
  private profissionalService: ProfissionalService,
  private servicoService: ServicoService,
  private profissionalServicoService: ProfissionalservicoService
) {}

etapaAtual: string = 'servicos';
servicoSelecionado: string = '';
profissionalSelecionado: string = '';
dataSelecionada: string = '';
horarioSelecionado: string = '';

agendamentoId: number | null = null;


mostrarCombos: boolean = false;              
mostrarTipoCorte: boolean = false;          
mostrarServicosAdicionais: boolean = false;  
resumo : boolean = false;
jaCadastradoNoBanco : boolean = false;

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
  this.agendamentoId = null;
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
  this.mostrarCombos = false;
  this.resumo = true;
  this.etapaAtual = 'profissional';
}

selecionarCorte(corte: string) {
  this.servicoSelecionado = corte;
  this.mostrarTipoCorte = false;
  this.resumo = true;
  this.mostrarServicosAdicionais = true;
}

selecionarServicosAdicionais(servico: string) {
  const index = this.servicosAdicionaisSelecionados.indexOf(servico);
  if (index > -1) {
    this.servicosAdicionaisSelecionados.splice(index, 1);
  } else {
    this.servicosAdicionaisSelecionados.push(servico);
  }

}

continuarServicosAdicionais() {
  this.mostrarServicosAdicionais = false;
  this.resumo = true;
  this.etapaAtual = 'profissional';
}

selecionarProfissional(profissional: string) {
  this.profissionalSelecionado = profissional;

  this.etapaAtual = 'data';
}

adicionarTelefone(horario: string) {
  this.horarioSelecionado = horario;
  
  this.etapaAtual = "telefone";
}

voltarEtapa() {
  if (this.etapaAtual === 'profissional') {
    this.etapaAtual = 'servicos';
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

jaCadastrado(telefone: string) {
  this.clienteService.listar().subscribe({
    next: (clientes) => {
      console.log('Lista de clientes do banco:', clientes);
      console.log('Telefone buscado:', telefone);
      const clienteExiste = clientes.some(cliente => cliente.celular === telefone);
      this.jaCadastradoNoBanco = clienteExiste;
      console.log('Cliente já cadastrado:', clienteExiste);
    },
    error: (error) => {
      console.error('Erro ao buscar clientes:', error);
    }
  });
}

finalizarAgendamento(telefoneInput: HTMLInputElement) {
  const telefone = telefoneInput.value;
  
  if (!telefone) {
    Swal.fire({
      title: 'Digite seu telefone!',
      icon: 'warning',
      confirmButtonText: 'OK'
    });
    return;
  }

if (this.jaCadastradoNoBanco) {
  this.clienteService.listar().subscribe({
    next: (clientes) => {
      const clienteExistente = clientes.find(cliente => cliente.celular === telefone);

      if (clienteExistente) {
        const cliente = {
          id: clienteExistente.id,
          nome: clienteExistente.nome,
          sobrenome: clienteExistente.sobrenome,
          celular: clienteExistente.celular
        };

        this.criarServicoEAgendamento(cliente);
      }
    },
    error: (error) => {
      console.error('Erro ao buscar cliente existente:', error);
    }
  });
} else {
  const nomeInput = document.getElementById('nomeInput') as HTMLInputElement;
  const sobrenomeInput = document.getElementById('sobrenomeInput') as HTMLInputElement;

  const cliente = {
    nome: nomeInput?.value,
    sobrenome: sobrenomeInput?.value,
    celular: telefone
  };

  this.clienteService.save(cliente).subscribe({
    next: (clienteResponse) => {
      this.criarServicoEAgendamento(clienteResponse);
    },
    error: (error) => {
      console.error('Erro completo do cliente:', error);
      Swal.fire({
        title: 'Erro ao criar cliente!',
        text: `Erro: ${error.status} - ${JSON.stringify(error.error)}`,
        icon: 'error',
        confirmButtonText: 'Fechar'
      });
    }
  });
}
}


criarServicoEAgendamento(clienteResponse: any) {
  // 2. Criar serviço
  const servico = {
    descricao: this.servicoSelecionado,
    minDeDuracao: this.getDuracao(this.servicoSelecionado)
  };

  this.servicoService.save(servico).subscribe({
    next: (servicoResponse) => {
      // 3. Criar profissionalServico
      const profissionalServico: any = {
        profissionalEntity: { id: 1 },
        servicoEntity: { id: servicoResponse.id },
        preco: parseFloat(this.calcularTotal())
      };

      this.profissionalServicoService.save(profissionalServico).subscribe({
        next: (profissionalServicoResponse) => {
          // 4. Criar agendamento
          const agendamento = {
            data: this.formatarDataParaISO(),
            local: "Barbearia PH",
            horario: this.horarioSelecionado,
            status: "PENDENTE",
            clienteEntity: { id: clienteResponse.id! },
            profissionalServicoEntity: { id: profissionalServicoResponse.id! }
          };

          console.log('=== DADOS DO AGENDAMENTO ===');
          console.log('Data formatada:', this.formatarDataParaISO());
          console.log('Horário:', this.horarioSelecionado);
          console.log('Cliente ID:', clienteResponse.id);
          console.log('ProfissionalServico ID:', profissionalServicoResponse.id);
          console.log('Agendamento completo:', agendamento);

          this.agendamentoService.salvar(agendamento).subscribe({
            next: (response) => {
              Swal.fire({
                title: 'Agendamento confirmado!',
                text: `${this.servicoSelecionado} em ${this.dataSelecionada} às ${this.horarioSelecionado}`,
                icon: 'success',
                confirmButtonText: 'Fechar'
              });
              this.fecharModal();
            },
            error: (error) => {
              console.error('=== ERRO NO AGENDAMENTO ===');
              console.error('Status:', error.status);
              console.error('Error completo:', error);
              console.error('Error body:', error.error);
              Swal.fire({
                title: 'Erro ao criar agendamento!',
                text: `Erro: ${error.status} - ${error.error?.message || JSON.stringify(error.error) || 'Servidor indisponível'}`,
                icon: 'error',
                confirmButtonText: 'Fechar'
              });
            }
          });
        },
        error: (error) => {
          Swal.fire({
            title: 'Erro ao criar profissional/serviço!',
            text: `Erro: ${error.status} - ${error.error?.message || 'Servidor indisponível PS'}`,
            icon: 'error',
            confirmButtonText: 'Fechar'
          });
        }
      });
    },
    error: (error) => {
      Swal.fire({
        title: 'Erro ao criar serviço!',
        text: `Erro: ${error.status} - ${error.error?.message || 'Servidor indisponível'}`,
        icon: 'error',
        confirmButtonText: 'Fechar'
      });
    }
  });
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
  
  for (let i = 0; i < diaSemanaInicio; i++) {
    this.diasDoMes.push(0);
  }
  
  for (let dia = 1; dia <= diasNoMes; dia++) {
    this.diasDoMes.push(dia);
  }
}

mesAnterior() {
  const hoje = new Date();
  const mesAtualSistema = hoje.toLocaleString('pt-BR', { month: 'long' });
  
  if(this.mesAtual === mesAtualSistema){
    Swal.fire({
      title: 'Não é possível agendar mês anterior. Escolha hoje ou uma mês futura.',
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
    
    if(dia < diaAtualSistema && this.dataAtual.getMonth() === hoje.getMonth()){
      Swal.fire({
        title: 'Não é possível agendar em dia anterior. Escolha hoje ou uma data futura.',
        icon: "error",
        confirmButtonText: 'Fechar'
      });
      return;
    }
    
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

formatarDataParaISO(): string {
  if (!this.dataSelecionada) {
    console.error('Data não selecionada!');
    return '';
  }
  const [dia, mes, ano] = this.dataSelecionada.split('/');
  const dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  console.log('Data original:', this.dataSelecionada, 'Data formatada:', dataFormatada);
  return dataFormatada;
}

getEspecializacao(servico: string): string {
  // Mapeia serviço para especialização do enum backend
  if (servico.toLowerCase().includes('sobrancelha')) return 'Sobrancelha';
  if (servico.toLowerCase().includes('corte') || servico.toLowerCase().includes('cabelo')) return 'Corte';
  if (servico.toLowerCase().includes('barba')) return 'Barba';
  if (servico.toLowerCase().includes('depilação')) return 'DepilaçãoDeNariz';
  if (servico.toLowerCase().includes('limpeza')) return 'LimpezaDePele';
  return 'Corte'; // padrão
}

getDuracao(servico: string): number {
  // Mapeia serviço para duração em minutos
  if (servico.toLowerCase().includes('cabelo e barba')) return 90;
  if (servico.toLowerCase().includes('degrade')) return 60;
  if (servico.toLowerCase().includes('social')) return 45;
  if (servico.toLowerCase().includes('cabelo')) return 60;
  if (servico.toLowerCase().includes('barba')) return 30;
  if (servico.toLowerCase().includes('sobrancelha')) return 15;
  if (servico.toLowerCase().includes('acabamento')) return 20;
  return 30; // padrão
}

calcularTotal(): string {
  let total = 0;
  
  if (this.servicoSelecionado.includes('Cabelo e barba')) total += 60;
  else if (this.servicoSelecionado.includes('Degrade e sobrancelha')) total += 45;
  else if (this.servicoSelecionado.includes('Social e sobrancelha')) total += 40;
  else if (this.servicoSelecionado.includes('Cabelo Social')) total += 35;
  else if (this.servicoSelecionado.includes('Cabelo')) total += 40;
  else if (this.servicoSelecionado.includes('Acabamento no Cabelo')) total += 20;
  else if (this.servicoSelecionado.includes('Barba')) total += 35;
  else if (this.servicoSelecionado.includes('Sobrancelha')) total += 10;
  
  this.servicosAdicionaisSelecionados.forEach(servico => {
    if (servico === 'Barba') total += 35;
    if (servico === 'Sobracelha') total += 10;
  });
  
  return total.toFixed(2);
}

};
  