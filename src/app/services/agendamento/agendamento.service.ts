import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Agendamento } from '../../models/agendamento/agendamento';

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private api = "http://3.133.62.14:8080/api/agendamentos";

  constructor(private http: HttpClient) { }

  salvar(agendamento: Agendamento): Observable<Agendamento> {
    return this.http.post<Agendamento>(this.api, agendamento).pipe(
      catchError(error => throwError(() => error))
    );
  }

  listar(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(this.api).pipe(
      catchError(error => throwError(() => error))
    );
  }

  buscarPorId(id: number): Observable<Agendamento> {
    return this.http.get<Agendamento>(`${this.api}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  atualizar(id: number, agendamento: Agendamento): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${this.api}/${id}`, agendamento).pipe(
      catchError(error => throwError(() => error))
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }
}