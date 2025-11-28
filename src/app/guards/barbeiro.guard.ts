import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BarbeiroGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const profissional = localStorage.getItem('profissionalLogado');
    const cliente = localStorage.getItem('clienteLogado');
    
    if (profissional && !cliente) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}