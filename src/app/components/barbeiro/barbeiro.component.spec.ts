import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarbeiroComponent } from './barbeiro.component';

describe('BarbeiroComponent', () => {
  let component: BarbeiroComponent;
  let fixture: ComponentFixture<BarbeiroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarbeiroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarbeiroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});