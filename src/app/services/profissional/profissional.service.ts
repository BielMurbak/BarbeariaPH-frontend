import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Profissional } from '../../models/profissional/profissional';

@Injectable({
  providedIn: 'root'
})
export class ProfissionalService {

  private api = "http://localhost:8080/api/profissionais"
   
  constructor(private http: HttpClient) { }

  save(profissional: Profissional): Observable<Profissional> {
    return this.http.post<Profissional>(this.api, profissional).pipe(
      catchError(error => throwError(() => error))
    );
  }

  listar(): Observable<Profissional[]> {
    return this.http.get<Profissional[]>(this.api).pipe(
      catchError(error => throwError(() => error))
    );
  }

  buscarPorId(id: number): Observable<Profissional> {
    return this.http.get<Profissional>(`${this.api}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  atualizar(id: number, profissional: Profissional): Observable<Profissional> {
    return this.http.put<Profissional>(`${this.api}/${id}`, profissional).pipe(
      catchError(error => throwError(() => error))
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
