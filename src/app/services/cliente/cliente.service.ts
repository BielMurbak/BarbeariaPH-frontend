import { Injectable } from '@angular/core';
import { Cliente } from '../../models/cliente/cliente';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private api = "http://localhost:8080/api/clientes";

  constructor(private http: HttpClient) { }

  save(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.api, cliente);
  }

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.api);
  }
}