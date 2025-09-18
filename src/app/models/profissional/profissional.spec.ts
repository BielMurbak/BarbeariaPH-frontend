import { ProfissionalService } from '../../services/profissional/profissional.service';
import { Profissional } from './profissional';

describe('Profissional', () => {
  it('should create an instance', () => {
    expect(new ProfissionalService()).toBeTruthy();
  });
});
