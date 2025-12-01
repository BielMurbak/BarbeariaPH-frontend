import { Injectable } from '@angular/core';
import { Cliente } from '../../models/cliente/cliente';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private api = "http://3.133.62.14:8080/api/clientes";

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

  buscarPorTelefoneESenha(telefone: string, senha: string): Observable<any> {
    const loginData = { celular: telefone, senha: senha };
    return this.http.post<any>('http://3.133.62.14:8080/api/auth/login', loginData).pipe(
      catchError(error => throwError(() => error))
    );
  }
}