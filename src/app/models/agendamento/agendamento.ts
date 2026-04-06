export interface Agendamento {
  id?: number;
  data: string;
  local: string;
  horario: string;
  status?: string;
  observacoes: string; // Serviços completos
  preco: number; // Preço total
  clienteEntity: {
    id: number;
    nome?: string;
    sobrenome?: string;
    celular?: string;
  };
  profissionalServicoEntity: {
    id: number;
    preco?: number;
    servicoEntity?: {
      descricao?: string;
    };
    profissionalEntity?: {
      nome?: string;
    };
  };
}