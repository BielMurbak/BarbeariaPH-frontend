import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  @Output() abrirModal = new EventEmitter<void>();

  agendar() {
    this.abrirModal.emit();
  }
}
