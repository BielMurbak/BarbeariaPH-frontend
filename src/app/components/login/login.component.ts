import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { AgendamentoComponent } from '../agendamento/agendamento/agendamento-form.component';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, FooterComponent, AgendamentoComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  telefone = '';
  mostrarErro = false;
  mensagemErro = '';
  showModal = false;

  constructor(private router: Router) {}

  login() {
    if (!this.telefone) {
      this.mostrarErro = true;
      this.mensagemErro = 'Por favor, informe seu telefone.';
      return;
    }
    
    const clienteExiste = this.verificarCliente(this.telefone);
    
    if (clienteExiste) {
      this.router.navigate(['/agendamento-list']);
    } else {
      this.mostrarErro = true;
      this.mensagemErro = 'Ops! Parece que você ainda não possui agendamentos conosco. Para acessar sua área, é necessário realizar pelo menos um agendamento primeiro. Clique em "Agendar" abaixo para começar!';
    }
  }

  verificarCliente(telefone: string): boolean {
    const clientesCadastrados = ['(11) 99999-9999', '(11) 88888-8888'];
    return clientesCadastrados.includes(telefone);
  }

  fecharAlerta() {
    this.mostrarErro = false;
  }

  agendar() {
    this.showModal = true;
  }

  fecharModal() {
    this.showModal = false;
  }

  voltar() {
    this.router.navigate(['/']);
  }
}