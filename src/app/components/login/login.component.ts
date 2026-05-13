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
  senha = '';

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

    if (!this.senha || this.senha.trim() === '') {
      this.mostrarErro = true;
      this.mensagemErro = 'Por favor, informe sua senha.';
      return;
    }

    // Faz login JWT primeiro — se falhar, credenciais inválidas
    this.authService.loginJWT(this.telefone, this.senha).subscribe({
      next: (response) => {
        // ✅ campo correto retornado pelo Keycloak
        const token = response.access_token;
        localStorage.setItem('token', token);

        // Com token em mãos, verifica se é profissional ou cliente
        this.profissionalService.listar().subscribe({
          next: (profissionais) => {
            const profissional = profissionais.find(p => p.celular === this.telefone);

            if (profissional) {
              // É barbeiro
              localStorage.removeItem('clienteLogado');
              localStorage.setItem('profissionalLogado', JSON.stringify(profissional));
              this.router.navigate(['/barbeiro']);
              return;
            }

            // Não é barbeiro, verifica se é cliente
            this.clienteService.listar().subscribe({
              next: (clientes) => {
                const cliente = clientes.find(c => c.celular === this.telefone);
                if (cliente) {
                  localStorage.removeItem('profissionalLogado');
                  this.authService.login(cliente);
                  this.router.navigate(['/agendamentos']);
                } else {
                  this.mostrarErro = true;
                  this.mensagemErro = 'Usuário não encontrado.';
                }
              },
              error: () => {
                this.mostrarErro = true;
                this.mensagemErro = 'Erro ao verificar dados do cliente.';
              }
            });
          },
          error: () => {
            this.mostrarErro = true;
            this.mensagemErro = 'Erro ao verificar dados.';
          }
        });
      },
      error: () => {
        this.mostrarErro = true;
        this.mensagemErro = 'Telefone ou senha incorretos!';
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
}