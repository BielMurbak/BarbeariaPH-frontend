import { ProfissionalservicoService } from "../../services/profissionalservico/profissionalservico.service";

export interface Profissional {
  id?: number;
  nome: string;
  telefone?: string;
  email?: string;
  profissionais?: ProfissionalservicoService[];
}

