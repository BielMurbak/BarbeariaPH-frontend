import { Component } from '@angular/core';
import { PrincipalComponent } from '../principal/principal/principal.component';
import { SobreNosComponent } from '../sobre-nos/sobre-nos.component';
import { ServicosComponent } from '../servicos/servicos.component';
import { ContatoComponent } from '../contato/contato.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [PrincipalComponent, SobreNosComponent, ServicosComponent, ContatoComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent { }