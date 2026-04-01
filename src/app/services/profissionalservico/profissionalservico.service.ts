import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProfissionalServico } from '../../models/servico/servico';

@Injectable({
  providedIn: 'root'
})
export class ProfissionalservicoService {

  private api = "http://localhost:8080/api/profissionais/servicos"

  constructor(private http: HttpClient) { }

  save(profissionalServico: ProfissionalServico): Observable<ProfissionalServico> {
    return this.http.post<ProfissionalServico>(this.api, profissionalServico).pipe(
      catchError(error => throwError(() => error))
    );
  }

  listar(): Observable<ProfissionalServico[]> {
    return this.http.get<ProfissionalServico[]>(this.api).pipe(
      catchError(error => throwError(() => error))
    );
  }

  buscarPorId(id: number): Observable<ProfissionalServico> {
    return this.http.get<ProfissionalServico>(`${this.api}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  atualizar(id: number, profissionalServico: ProfissionalServico): Observable<ProfissionalServico> {
    return this.http.put<ProfissionalServico>(`${this.api}/${id}`, profissionalServico).pipe(
      catchError(error => throwError(() => error))
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
