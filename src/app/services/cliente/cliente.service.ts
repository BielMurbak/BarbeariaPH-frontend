import { Injectable } from '@angular/core';
import { Cliente } from '../../models/cliente/cliente';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private api = "http://localhost:8080/api/clientes";

  constructor(private http: HttpClient) { }

  save(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.api, cliente).pipe(
      catchError(error => throwError(() => error))
    );
  }

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.api).pipe(
      catchError(error => throwError(() => error))
    );
  }

  buscarPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.api}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  atualizar(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.api}/${id}`, cliente).pipe(
      catchError(error => throwError(() => error))
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }
}