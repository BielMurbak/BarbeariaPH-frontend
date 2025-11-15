import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { AgendamentoComponent } from '../agendamento/agendamento/agendamento-form.component';
import { ClienteService } from '../../services/cliente/cliente.service';
import { ProfissionalService } from '../../services/profissional/profissional.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

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

  constructor(
    private router: Router,
    private clienteService: ClienteService,
    private profissionalService: ProfissionalService,
    private authService: AuthService
  ) {}

  login() {
    if (!this.telefone) {
      this.mostrarErro = true;
      this.mensagemErro = 'Por favor, informe seu telefone.';
      return;
    }
    
    // Primeiro verifica se é profissional
    this.profissionalService.listar().subscribe({
      next: (profissionais) => {
        const profissional = profissionais.find(p => p.celular === this.telefone);
        
        if (profissional) {
          // É barbeiro - redireciona para área do barbeiro
          localStorage.setItem('profissionalLogado', JSON.stringify(profissional));
          this.router.navigate(['/barbeiro']);
          return;
        }
        
        // Não é barbeiro, verifica se é cliente
        this.clienteService.listar().subscribe({
          next: (clientes) => {
            const cliente = clientes.find(c => c.celular === this.telefone);
            
            if (cliente) {
              this.authService.login(cliente);
              this.router.navigate(['/agendamentos']);
            } else {
              this.mostrarErro = true;
              this.mensagemErro = 'Ops! Parece que você ainda não possui agendamentos conosco. Para acessar sua área, é necessário realizar pelo menos um agendamento primeiro. Clique em "Agendar" abaixo para começar!';
            }
          },
          error: () => {
            Swal.fire('Erro', 'Erro ao verificar cliente', 'error');
          }
        });
      },
      error: () => {
        Swal.fire('Erro', 'Erro ao verificar dados', 'error');
      }
    });
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
    this.telefone = valor;
  }
}