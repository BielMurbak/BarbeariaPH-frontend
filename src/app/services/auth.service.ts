import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api';
  private clienteLogadoSubject = new BehaviorSubject<any>(null);
  public clienteLogado$ = this.clienteLogadoSubject.asObservable();

  constructor(private http: HttpClient) {
    const clienteSalvo = localStorage.getItem('clienteLogado');
    if (clienteSalvo) {
      this.clienteLogadoSubject.next(JSON.parse(clienteSalvo));
    }
  }

  loginJWT(celular: string, senha: string): Observable<{token: string, role: string}> {
    return this.http.post<{token: string, role: string}>(`${this.baseUrl}/auth/login`, {
      celular: celular,
      senha: senha
    });
  }

  login(cliente: any) {
    localStorage.setItem('clienteLogado', JSON.stringify(cliente));
    this.clienteLogadoSubject.next(cliente);
  }

  logout() {
    localStorage.removeItem('clienteLogado');
    localStorage.removeItem('token');
    this.clienteLogadoSubject.next(null);
  }

  getClienteLogado() {
    return this.clienteLogadoSubject.value;
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
