import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private clienteLogadoSubject = new BehaviorSubject<any>(null);
  public clienteLogado$ = this.clienteLogadoSubject.asObservable();

  constructor() {
    const clienteSalvo = localStorage.getItem('clienteLogado');
    if (clienteSalvo) {
      this.clienteLogadoSubject.next(JSON.parse(clienteSalvo));
    }
  }

  login(cliente: any) {
    localStorage.setItem('clienteLogado', JSON.stringify(cliente));
    this.clienteLogadoSubject.next(cliente);
  }

  logout() {
    localStorage.removeItem('clienteLogado');
    this.clienteLogadoSubject.next(null);
  }

  getClienteLogado() {
    return this.clienteLogadoSubject.value;
  }
}