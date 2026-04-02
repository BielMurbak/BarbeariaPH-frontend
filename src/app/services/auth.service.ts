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
    // Limpa tokens inválidos após mudança de secret key
    this.clearInvalidTokens();
    
    const clienteSalvo = localStorage.getItem('clienteLogado');
    if (clienteSalvo) {
      this.clienteLogadoSubject.next(JSON.parse(clienteSalvo));
    }
  }

  private clearInvalidTokens() {
    // Remove tokens que podem estar inválidos
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Tenta decodificar o token para ver se é válido
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000;
        if (payload.exp < now) {
          this.logout();
        }
      } catch (error) {
        // Token inválido, limpa tudo
        this.logout();
      }
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
