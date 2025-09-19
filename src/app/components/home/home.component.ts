import { Component } from '@angular/core';
import { PrincipalComponent } from '../principal/principal/principal.component';
import { SobreNosComponent } from '../sobre-nos/sobre-nos.component';
import { ServicosComponent } from '../servicos/servicos.component';
import { ContatoComponent } from '../contato/contato.component';
import { FooterComponent } from '../footer/footer.component';
import { AgendamentoComponent } from '../agendamento/agendamento/agendamento-form.component';

@Component({
  selector: 'app-home',
  imports: [PrincipalComponent, SobreNosComponent, ServicosComponent, ContatoComponent, FooterComponent, AgendamentoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  showModalAgendamento = false;

  abrirModalAgendamento() {
    this.showModalAgendamento = true;
  }

  fecharModalAgendamento() {
    this.showModalAgendamento = false;
  }
}