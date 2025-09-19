import { Cliente } from './cliente';

describe('Cliente', () => {
  it('should create an instance', () => {
    const cliente: Cliente = {
      nome: 'Teste',
      sobrenome: 'Cliente',
      celular: '11999999999'
    };
    expect(cliente).toBeTruthy();
  });
});
