export interface Agendamento {
  id?: number;
  data: string;
  local: string;
  horario: string;
  status?: string;
  clienteEntity: { id: number };
  profissionalServicoEntity: { id: number };
}