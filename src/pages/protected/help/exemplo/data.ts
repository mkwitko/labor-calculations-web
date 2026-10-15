// Dados de um processo fictício, isolados da UI. Ficam aqui, e não no banco,
// porque semear um caso de exemplo exigiria filtrar `isExample` em todo
// agregado — painel, financeiro, prescrição em risco — e um agregado esquecido
// mostraria valor fictício no financeiro de um escritório real.
export const EXAMPLE_CASE = {
  title: "Maria Aparecida Souza x Transportes Vale Verde Ltda.",
  processNumber: "0001234-56.2025.5.02.0011",
  court: "TRT da 2ª Região",
  vara: "11ª Vara do Trabalho de São Paulo",
  phase: "Em andamento (1ª instância)",
  actionType: "Reclamação trabalhista",
  openedAt: "12/03/2025",
  client: {
    name: "Maria Aparecida Souza",
    document: "123.456.789-00",
    role: "Reclamante",
  },
  defendant: {
    name: "Transportes Vale Verde Ltda.",
    document: "12.345.678/0001-90",
    role: "Reclamada",
  },
  contract: {
    admission: "01/02/2019",
    termination: "15/01/2025",
    lastSalary: "R$ 2.850,00",
    terminationType: "Dispensa sem justa causa",
  },
  calculation: {
    kind: "Liquidação (v3)",
    total: "R$ 41.732,18",
    lines: [
      { label: "Saldo de salário (15 dias)", value: "R$ 1.425,00" },
      { label: "Aviso prévio indenizado", value: "R$ 2.850,00" },
      { label: "13º proporcional", value: "R$ 237,50" },
      { label: "Férias vencidas + 1/3", value: "R$ 3.800,00" },
      { label: "Férias proporcionais + 1/3", value: "R$ 1.108,33" },
      { label: "Multa de 40% do FGTS", value: "R$ 6.643,20" },
      { label: "Horas extras + reflexos", value: "R$ 18.940,55" },
      { label: "Multa do art. 477 da CLT", value: "R$ 2.850,00" },
      { label: "Correção monetária (IPCA-E + SELIC)", value: "R$ 5.219,42" },
      { label: "(–) INSS e IRRF", value: "– R$ 1.341,82" },
    ],
  },
  hearing: {
    kind: "Audiência inicial",
    at: "28/08/2026, 14:30",
    place: "11ª VT de São Paulo — sala 4",
  },
  deadline: {
    kind: "Réplica",
    dueAt: "19/08/2026",
    status: "Em aberto",
  },
  task: { label: "Juntar cartões de ponto de 2023", status: "Pendente" },
  document: {
    name: "Petição inicial — Maria Aparecida Souza.docx",
    createdAt: "14/03/2025",
    template: "Petição inicial trabalhista",
  },
  movement: {
    at: "22/07/2026",
    description:
      "Juntada de petição de contestação pela reclamada (andamento sincronizado do DataJud/CNJ).",
  },
  fee: {
    kind: "Ad exitum",
    percent: "30% do proveito econômico",
    estimate: "R$ 12.519,65",
  },
} as const;
