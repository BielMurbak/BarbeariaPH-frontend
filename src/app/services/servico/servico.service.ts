import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servico } from '../../models/servico/servico';

@Injectable({
  providedIn: 'root'
})
export class ServicoService {

  private api = "http://localhost:8080/api/servicos"
  
  constructor(private http: HttpClient) { }

  save(servico: Servico): Observable<Servico> {
    return this.http.post<Servico>(this.api, servico);
  }
}
