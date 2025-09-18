import { ServicoService } from "../../services/servico/servico.service";
import { Profissional } from "../profissional/profissional";

export interface ProfissionalServico {
  id?: number;
  preco: number;
  profissional: Profissional;
  servico: ServicoService;
}