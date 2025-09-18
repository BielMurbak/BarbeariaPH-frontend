import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-login',
  imports: [FormsModule, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  telefone = '';

  constructor(private router: Router) {}

  login() {
    if (this.telefone) {
      this.router.navigate(['/agendamento-list']);
    }
  }

  voltar() {
    this.router.navigate(['/']);
  }
}