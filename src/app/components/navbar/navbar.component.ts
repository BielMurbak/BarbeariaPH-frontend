import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  menuAberto = false;

  constructor(private router: Router) {}

  toggleMenu() {
    this.menuAberto = !this.menuAberto;
  }

  scrollToSection(sectionId: string) {
    console.log('Tentando scroll para:', sectionId);
    const element = document.getElementById(sectionId);
    console.log('Elemento encontrado:', element);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      console.log('Scroll executado');
    } else {
      console.log('Elemento não encontrado!');
    }
  }

  navigateToAgendamentos() {
    console.log('Clicou em agendamentos');
    this.router.navigate(['/login']);
  }
}
