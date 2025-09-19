import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agendamento } from '../../models/agendamento/agendamento';

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private api = "http://localhost:8080/api/agendamentos";

  constructor(private http: HttpClient) { }

  salvar(agendamento: Agendamento): Observable<Agendamento> {
    return this.http.post<Agendamento>(this.api, agendamento);
  }
}