import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfissionalServico } from '../../models/servico/servico';

@Injectable({
  providedIn: 'root'
})
export class ProfissionalservicoService {

  private api = "http://localhost:8080/api/profissionais/servicos"

  constructor(private http: HttpClient) { }

  save(profissionalServico: ProfissionalServico): Observable<ProfissionalServico> {
    return this.http.post<ProfissionalServico>(this.api, profissionalServico);
  }
}
