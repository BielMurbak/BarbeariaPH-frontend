import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agendamento } from '../../models/agendamento/agendamento';
import { ClienteService } from '../cliente/cliente.service';
import { ProfissionalService } from '../profissional/profissional.service';
import { ServicoService } from '../servico/servico.service';
import { ProfissionalservicoService } from '../profissionalservico/profissionalservico.service';


@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private api = "http://localhost:8080/api/agendamentos";

  constructor(
    private http: HttpClient,
    private clienteService: ClienteService,
    private profissionalService: ProfissionalService,
    private servicoService: ServicoService,
    private profissionalServicoService: ProfissionalservicoService
  ) { }

  salvar(agendamento: Agendamento): Observable<Agendamento> {
    return this.http.post<Agendamento>(this.api, agendamento);
  }

  salvarEtapa(agendamento: any): Observable<any> {
    return this.http.post<any>(`${this.api}/etapa`, agendamento);
  }

  criarCliente(cliente: any): Observable<any> {
    return this.clienteService.save(cliente);
  }

  criarProfissional(profissional: any): Observable<any> {
    return this.profissionalService.save(profissional);
  }

  criarServico(servico: any): Observable<any> {
    return this.servicoService.save(servico);
  }

  criarProfissionalServico(profissionalServico: any): Observable<any> {
    return this.profissionalServicoService.save(profissionalServico);
  }
}