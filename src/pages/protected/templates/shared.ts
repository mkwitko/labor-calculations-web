export const TYPE_LABELS: Record<string, string> = {
  parecer_tecnico: "Parecer Técnico",
  peticao_inicial: "Petição Inicial",
  proposta_acordo: "Proposta de Acordo",
  notificacao_extrajudicial: "Notificação Extrajudicial",
  danos_morais: "Danos Morais",
  aviso_previo_indenizado: "Aviso Prévio Indenizado",
  horas_extras_adicionais: "Horas Extras e Adicionais",
  fgts_e_multa: "FGTS e Multa",
  recurso_ordinario: "Recurso Ordinário",
  contestacao: "Contestação",
  rescisao_indireta: "Rescisão Indireta",
  termo_quitacao: "Termo de Quitação",
  customizado: "Customizado",
};

export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const MAX_FILE_BYTES = 5_242_880;

export type TemplateItem = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  isSystem: boolean;
  fileKey: string | null;
  createdAt: string | Date;
};
