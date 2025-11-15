import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notificacao {
  id: string;
  clienteId: number;
  mensagem: string;
  tipo: 'EDITADO' | 'CANCELADO';
  timestamp: Date;
  lida: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  private notificacoesSubject = new BehaviorSubject<Notificacao[]>([]);
  public notificacoes$ = this.notificacoesSubject.asObservable();

  constructor() {
    const notificacoesSalvas = localStorage.getItem('notificacoes');
    if (notificacoesSalvas) {
      this.notificacoesSubject.next(JSON.parse(notificacoesSalvas));
    }
  }

  adicionarNotificacao(clienteId: number, mensagem: string, tipo: 'EDITADO' | 'CANCELADO') {
    const notificacoes = this.notificacoesSubject.value;
    const novaNotificacao: Notificacao = {
      id: Date.now().toString(),
      clienteId,
      mensagem,
      tipo,
      timestamp: new Date(),
      lida: false
    };
    
    const novasNotificacoes = [...notificacoes, novaNotificacao];
    this.notificacoesSubject.next(novasNotificacoes);
    localStorage.setItem('notificacoes', JSON.stringify(novasNotificacoes));
  }

  marcarComoLida(clienteId: number) {
    const notificacoes = this.notificacoesSubject.value;
    const notificacoesAtualizadas = notificacoes.map(n => 
      n.clienteId === clienteId ? { ...n, lida: true } : n
    );
    this.notificacoesSubject.next(notificacoesAtualizadas);
    localStorage.setItem('notificacoes', JSON.stringify(notificacoesAtualizadas));
  }

  obterNotificacoesCliente(clienteId: number): Notificacao[] {
    return this.notificacoesSubject.value.filter(n => n.clienteId === clienteId && !n.lida);
  }
}