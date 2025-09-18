import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendamentoListComponent } from './agendamento-list.component';

describe('AgendamentoListComponent', () => {
  let component: AgendamentoListComponent;
  let fixture: ComponentFixture<AgendamentoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendamentoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendamentoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
