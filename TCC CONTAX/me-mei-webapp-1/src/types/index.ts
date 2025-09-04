export interface Empresa {
  id: string;
  nome: string;
  tipo: 'ME' | 'MEI';
  cnpj?: string;
  limiteMensal?: number;
}

export interface NotaFiscal {
  id: string;
  data: string;
  empresaId: string;
  descricao: string;
  valor: number;
}

export interface Despesa {
  id: string;
  data: string;
  descricao: string;
  valor: number;
}

export interface Faturamento {
  mes: string;
  total: number;
}

export interface Imposto {
  ano: number;
  mes: number;
  valor: number;
}

export interface ControleMensal {
  mes: string;
  ano: number;
  despesas: Despesa[];
  faturamento: Faturamento;
  imposto: Imposto;
}