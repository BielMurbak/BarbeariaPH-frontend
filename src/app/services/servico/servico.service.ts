import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Servico } from '../../models/servico/servico';

@Injectable({
  providedIn: 'root'
})
export class ServicoService {

  private api = "http://3.133.62.14:8080/api/servicos"
  
  constructor(private http: HttpClient) { }

  save(servico: Servico): Observable<Servico> {
    return this.http.post<Servico>(this.api, servico).pipe(
      catchError(error => throwError(() => error))
    );
  }

  listar(): Observable<Servico[]> {
    return this.http.get<Servico[]>(this.api).pipe(
      catchError(error => throwError(() => error))
    );
  }

  buscarPorId(id: number): Observable<Servico> {
    return this.http.get<Servico>(`${this.api}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  atualizar(id: number, servico: Servico): Observable<Servico> {
    return this.http.put<Servico>(`${this.api}/${id}`, servico).pipe(
      catchError(error => throwError(() => error))
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
