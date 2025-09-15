import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PrincipalComponent } from './components/principal/principal/principal.component';
import { SobreNosComponent } from './components/sobre-nos/sobre-nos.component';
import { ServicosComponent } from './components/servicos/servicos.component';
import { FooterComponent } from './components/footer/footer.component';
import { ContatoComponent } from "./components/contato/contato.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, PrincipalComponent, SobreNosComponent, ServicosComponent, FooterComponent, ContatoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'BarbeariaPH-frontend';
}
