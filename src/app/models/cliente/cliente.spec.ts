import { ClienteService } from '../../services/cliente/cliente.service';
import { Cliente } from './cliente';

describe('Cliente', () => {
  it('should create an instance', () => {
    expect(new ClienteService()).toBeTruthy();
  });
});
