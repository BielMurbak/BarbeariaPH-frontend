import { TestBed } from '@angular/core/testing';

import { ProfissionalservicoService } from './profissionalservico.service';

describe('ProfissionalservicoService', () => {
  let service: ProfissionalservicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfissionalservicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
