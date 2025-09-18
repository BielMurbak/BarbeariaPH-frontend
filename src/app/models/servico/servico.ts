import { Profissional } from "../profissional/profissional";

export interface Servico {
  id?: number;
  descricao: string;
  minDeDuracao: number;
}

export interface ProfissionalServico {
  id?: number;
  preco: number;
  profissionalEntity: Profissional;
  servicoEntity: Servico;
}

