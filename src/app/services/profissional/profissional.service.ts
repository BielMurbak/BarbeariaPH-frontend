import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profissional } from '../../models/profissional/profissional';

@Injectable({
  providedIn: 'root'
})
export class ProfissionalService {

  private api = "http://localhost:8080/api/profissionais"
   
  constructor(private http: HttpClient) { }

  save(profissional: Profissional): Observable<Profissional> {
    return this.http.post<Profissional>(this.api, profissional);
  }
}
