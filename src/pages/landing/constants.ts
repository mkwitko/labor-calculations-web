import {
  BarChart3,
  Boxes,
  Building2,
  Calculator,
  Calendar,
  CalendarCheck,
  ClipboardList,
  Code2,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Gavel,
  Globe,
  History,
  KeyRound,
  Landmark,
  Layers,
  Lock,
  Percent,
  Scale,
  Share2,
  ShieldCheck,
  Timer,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";

/**
 * Toda a copy da landing do advogado mora aqui — nenhum componente escreve
 * texto de venda no meio do JSX.
 *
 * Regra que vale para cada linha deste arquivo: **só entra o que o produto faz
 * hoje**. Sem cliente inventado, sem depoimento, sem métrica de tempo que
 * ninguém mediu. O que sustenta a página é o que o motor de cálculo e o app
 * realmente entregam; prova social real entra quando existir.
 */

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

/** Reforços logo abaixo do CTA — fatos, não promessas de desempenho. */
export const heroReassurances = [
  "7 dias grátis",
  "Sem cartão de crédito",
  "Cancele quando quiser",
];

/**
 * Números do quadro de exemplo do hero. É demonstração de interface, e a tela
 * diz isso em texto — número de tela nunca é apresentado como caso real.
 */
export const heroCalculation = {
  caseLabel: "João da Silva — dispensa sem justa causa",
  summary: [
    { label: "Período", value: "4a 7m", sub: "01/03/2021 – 30/09/2025" },
    { label: "Último salário", value: "R$ 5.500,00", sub: "mensal" },
    { label: "Motivo", value: "Sem justa causa", sub: "aviso indenizado" },
  ],
  rows: [
    { label: "Aviso prévio indenizado", value: "R$ 12.450,00" },
    { label: "13º proporcional", value: "R$ 4.583,33" },
    { label: "Férias proporcionais + 1/3", value: "R$ 5.500,00" },
    { label: "FGTS do período", value: "R$ 3.666,67" },
    { label: "Multa de 40% do FGTS", value: "R$ 1.466,67" },
    { label: "Horas extras + reflexos", value: "R$ 4.200,00" },
    { label: "Adicional noturno", value: "R$ 4.000,83" },
  ],
  correction: [
    { label: "Correção monetária (IPCA-E)", value: "R$ 2.482,20" },
    { label: "Juros (ADC 58)", value: "R$ 393,80" },
  ],
  total: "R$ 38.743,50",
};

// ---------------------------------------------------------------------------
// Fundamento legal (a "prova" que temos: a lei, não logotipo de cliente)
// ---------------------------------------------------------------------------

export const legalFoundations = [
  { abbr: "CLT", name: "CLT e Lei 13.467/2017" },
  { abbr: "TST", name: "Súmulas do TST" },
  { abbr: "IPCA-E", name: "Correção — Súmula 381" },
  { abbr: "ADC 58", name: "Juros — ADC 58 (STF)" },
  { abbr: "CNJ", name: "Andamentos — DataJud" },
];

// ---------------------------------------------------------------------------
// Problema
// ---------------------------------------------------------------------------

export const problemPoints = [
  {
    title: "A planilha é de outra pessoa",
    description:
      "A fórmula veio de um colega, ninguém sabe de onde saiu o índice e mudar uma coluna quebra o resto.",
  },
  {
    title: "Correção e juros feitos à mão",
    description:
      "Buscar o índice do mês, aplicar até a data certa e refazer tudo quando a liquidação muda de data.",
  },
  {
    title: "O cálculo não fala com o processo",
    description:
      "Valor numa planilha, prazo na agenda, documento no Word, andamento no e-mail do escritório.",
  },
  {
    title: "Refazer para explicar",
    description:
      "Cliente pergunta de onde veio o número e a resposta exige remontar a conta do zero.",
  },
];

export const problemBridge =
  "O LexLaboral reúne o cálculo, o processo e o documento no mesmo lugar — e deixa a conta aberta, verba a verba, para você mostrar de onde saiu cada número.";

// ---------------------------------------------------------------------------
// Demonstração do produto (o que o visitante vê antes de decidir)
// ---------------------------------------------------------------------------

export type DemoRow = { label: string; value: string; muted?: boolean };

export const demoTabs = [
  {
    id: "calculo",
    label: "Cálculo",
    icon: Calculator,
    title: "Do formulário ao demonstrativo",
    description:
      "Você informa admissão, saída, salário e o que pedir. O motor aplica a verba, os reflexos e os descontos, e devolve o demonstrativo verba a verba — cada linha com o fundamento legal ao lado.",
    steps: [
      "Dados do contrato e da dispensa",
      "Seleção das verbas e adicionais",
      "Demonstrativo aberto, verba a verba",
    ],
    caption: "Demonstrativo de rescisão",
    rows: [
      { label: "Aviso prévio indenizado", value: "R$ 12.450,00" },
      { label: "13º proporcional (7/12)", value: "R$ 4.583,33" },
      { label: "Férias proporcionais + 1/3", value: "R$ 5.500,00" },
      { label: "FGTS + multa de 40%", value: "R$ 5.133,34" },
      { label: "INSS e IRRF", value: "− R$ 1.842,10", muted: true },
    ] satisfies DemoRow[],
    footer: { label: "Total bruto", value: "R$ 27.666,67" },
  },
  {
    id: "liquidacao",
    label: "Liquidação",
    icon: Scale,
    title: "Correção e juros até a data que você define",
    description:
      "O principal é corrigido pelo IPCA-E e os juros seguem a ADC 58, até a data de liquidação escolhida. A tabela de índices usada fica gravada no cálculo — atualizar é ato explícito seu.",
    steps: [
      "Principal por verba",
      "Correção monetária e juros no período",
      "Planilha em XLSX pronta para instruir",
    ],
    caption: "Liquidação até 30/09/2026",
    rows: [
      { label: "Principal", value: "R$ 27.666,67" },
      { label: "Correção monetária (IPCA-E)", value: "R$ 2.482,20" },
      { label: "Juros (ADC 58)", value: "R$ 393,80" },
      { label: "Tabela de índices", value: "congelada no cálculo", muted: true },
    ] satisfies DemoRow[],
    footer: { label: "Total atualizado", value: "R$ 30.542,67" },
  },
  {
    id: "passivo",
    label: "Passivo",
    icon: BarChart3,
    title: "A folha inteira avaliada de uma vez",
    description:
      "Suba a folha em planilha e receba a exposição do quadro todo: valor por pessoa, verba a verba, com o mesmo motor do cálculo individual. Serve para provisão, due diligence e decisão de acordo.",
    steps: [
      "Upload da planilha da folha",
      "Avaliação em lote, empregado a empregado",
      "Exposição total e por verba",
    ],
    caption: "Avaliação em lote — 128 empregados",
    rows: [
      { label: "Horas extras e reflexos", value: "R$ 412.880,00" },
      { label: "Adicional noturno", value: "R$ 96.400,00" },
      { label: "Intervalo intrajornada", value: "R$ 74.220,00" },
      { label: "Empregados avaliados", value: "128", muted: true },
    ] satisfies DemoRow[],
    footer: { label: "Exposição estimada", value: "R$ 583.500,00" },
  },
  {
    id: "gestao",
    label: "Gestão",
    icon: Workflow,
    title: "O caso com tudo dentro",
    description:
      "Cada processo reúne cálculos, documentos, audiências, prazos, tarefas, partes e andamentos. Os andamentos chegam sozinhos da base pública do CNJ, com aviso por e-mail quando o processo anda; audiências e prazos podem ir para o seu Google Agenda.",
    steps: [
      "Caso em lista ou kanban por fase",
      "Prazos, audiências e tarefas no mesmo painel",
      "Andamentos do tribunal conferidos todo dia",
    ],
    caption: "1001234-56.2026.5.02.0011",
    rows: [
      { label: "Audiência de instrução", value: "12/11 · 14h" },
      { label: "Prazo — manifestação", value: "em 5 dias úteis" },
      { label: "Petição inicial (DOCX)", value: "gerada" },
      { label: "Andamentos do CNJ", value: "conferidos hoje", muted: true },
    ] satisfies DemoRow[],
    footer: { label: "Valor da causa", value: "R$ 30.542,67" },
  },
];

// ---------------------------------------------------------------------------
// Funcionalidades por trabalho a ser feito
// ---------------------------------------------------------------------------

export const featureGroups = [
  {
    id: "calcule",
    icon: Calculator,
    title: "Calcule",
    tagline: "Da verba isolada ao passivo da folha inteira.",
    items: [
      {
        icon: Gavel,
        title: "Rescisão completa e verbas isoladas",
        description:
          "Do aviso prévio à equiparação salarial: todas as verbas, juntas ou uma a uma.",
      },
      {
        icon: Scale,
        title: "Liquidação com correção e juros",
        description:
          "IPCA-E e juros na forma da ADC 58, até a data que você definir.",
      },
      {
        icon: Percent,
        title: "INSS, IRRF e FGTS",
        description:
          "Descontos e FGTS já apurados e separados do líquido — sem conta por fora.",
      },
      {
        icon: Boxes,
        title: "Passivo em lote",
        description:
          "Suba a folha em planilha e veja a exposição do quadro inteiro, verba a verba.",
      },
    ],
  },
  {
    id: "organize",
    icon: Workflow,
    title: "Organize",
    tagline: "O processo inteiro num lugar só, com o cálculo dentro.",
    items: [
      {
        icon: Layers,
        title: "Casos em lista ou kanban",
        description:
          "Cálculos, documentos, prazos, partes e andamentos reunidos por processo.",
      },
      {
        icon: Calendar,
        title: "Agenda, prazos e Google Agenda",
        description:
          "Prazos de todos os casos num painel, em dias úteis — sincronizados com o Google Agenda.",
      },
      {
        icon: TrendingUp,
        title: "Acompanhamento automático no CNJ",
        description:
          "Consultamos o DataJud todo dia e avisamos por e-mail quando o processo anda.",
      },
      {
        icon: Landmark,
        title: "Acordos e financeiro",
        description:
          "Simule acordos, parcele e acompanhe recebido, a receber e em atraso.",
      },
    ],
  },
  {
    id: "produza",
    icon: FileText,
    title: "Produza",
    tagline: "O cálculo vira peça, planilha e explicação.",
    items: [
      {
        icon: FileText,
        title: "12 modelos de documento",
        description:
          "Da petição inicial à proposta de acordo, em DOCX editável e já preenchido.",
      },
      {
        icon: ClipboardList,
        title: "Modelos com a sua marca",
        description:
          "Envie o template no seu padrão e o sistema preenche os dados do caso.",
      },
      {
        icon: FileSpreadsheet,
        title: "Planilha de liquidação em XLSX",
        description:
          "Verbas, correção, juros e totais, pronta para instruir o processo.",
      },
      {
        icon: FileSearch,
        title: "Demonstrativo com fundamento",
        description:
          "Conta aberta e base legal ao lado de cada verba — para o cliente e para o juízo.",
      },
    ],
  },
  {
    id: "escale",
    icon: Users,
    title: "Escale",
    tagline: "Da banca de dois à operação com volume.",
    items: [
      {
        icon: Users,
        title: "Equipe com papéis e permissões",
        description:
          "Sócios, associados e estagiários — cada pessoa vê só o que lhe cabe.",
      },
      {
        icon: Share2,
        title: "Portal do cliente",
        description:
          "Seu cliente acompanha o caso sozinho, em linguagem simples.",
      },
      {
        icon: Globe,
        title: "Calculadora pública e widget",
        description:
          "Calculadora grátis com o mesmo motor, para embutir no site do escritório.",
      },
      {
        icon: Code2,
        title: "API pública",
        description:
          "O motor de cálculo no seu sistema, com chave de acesso e uso medido.",
      },
    ],
  },
];

/** Chips da faixa de verbas — o que o motor cobre, em uma olhada. */
export const calculators = [
  { name: "Aviso prévio", icon: Timer },
  { name: "13º salário", icon: Calculator },
  { name: "Férias + 1/3", icon: Calendar },
  { name: "FGTS + multa de 40%", icon: Landmark },
  { name: "Horas extras e reflexos", icon: Timer },
  { name: "Adicional noturno", icon: History },
  { name: "Insalubridade", icon: ShieldCheck },
  { name: "Periculosidade", icon: ShieldCheck },
  { name: "Equiparação salarial", icon: Scale },
  { name: "Art. 467 e prescrição", icon: Gavel },
  { name: "Intervalo intrajornada", icon: Timer },
  { name: "Correção + juros", icon: TrendingUp },
];

// ---------------------------------------------------------------------------
// Confiança: motor, procedência e segurança
// ---------------------------------------------------------------------------

export const trustPillars = [
  {
    icon: FileSearch,
    title: "A conta fica aberta",
    description:
      "Nenhum total aparece sozinho: cada verba mostra a fórmula aplicada, o período considerado e o fundamento legal. É o que você leva para o cliente e para o juízo.",
  },
  {
    icon: History,
    title: "O número que você levou continua reproduzível",
    description:
      "Cada cálculo congela a tabela de índices que usou. Atualizar para os índices de hoje é ato explícito seu, registrado em trilha de auditoria — editar um cálculo não muda o valor pelas suas costas.",
  },
  {
    icon: Lock,
    title: "Dados de cada escritório isolados",
    description:
      "Casos, clientes e cálculos pertencem à organização. O acesso é verificado no servidor a cada requisição, por papel — esconder um botão nunca é o que protege o dado.",
  },
  {
    icon: KeyRound,
    title: "Acesso sob o seu controle",
    description:
      "Convites por link de uso único, papéis por pessoa, portal do cliente separado do acesso da equipe e chaves de API revogáveis a qualquer momento.",
  },
];

export const methodologyNote =
  "A metodologia de cada verba — base de cálculo, reflexos, correção e juros — está descrita em português, com o dispositivo legal correspondente.";

/** Divulgação do Google Calendar exigida pela política de dados do Google. */
export const googleDisclosure = {
  title: "Integração opcional com o Google Calendar",
  points: [
    {
      icon: CalendarCheck,
      text: "Audiências e prazos dos seus casos viram eventos no seu Google Agenda, e você pode importar para cá os eventos que já estão lá.",
    },
    {
      icon: ShieldCheck,
      text: "A conexão só acontece com a sua autorização expressa e pode ser revogada nas Configurações ou na sua Conta Google.",
    },
    {
      icon: Lock,
      text: "Os dados do Google são usados apenas nessa sincronização: não vendemos, não usamos para anúncios e não compartilhamos com terceiros.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Para quem é
// ---------------------------------------------------------------------------

export type Persona = {
  icon: typeof Gavel;
  title: string;
  description: string;
  highlights: string[];
  /** Página própria do público, quando existe. */
  href?: string;
  hrefLabel?: string;
};

export const personas: Persona[] = [
  {
    icon: Gavel,
    title: "Advogado trabalhista",
    description:
      "Você faz o cálculo, a peça e o acompanhamento do processo — e precisa que a conta seja defensável quando perguntarem de onde veio.",
    highlights: [
      "Rescisão e liquidação com correção e juros",
      "Documentos em DOCX a partir do cálculo",
      "Prazos e audiências no mesmo lugar do caso",
    ],
  },
  {
    icon: Building2,
    title: "Escritório com equipe",
    description:
      "Mais de uma pessoa mexendo nos mesmos processos, e a padronização se perde entre planilhas particulares.",
    highlights: [
      "Papéis e permissões por pessoa",
      "Modelos de documento com a marca do escritório",
      "Portal para o cliente acompanhar sem ligar",
    ],
  },
  {
    icon: Users,
    title: "Jurídico e RH de empresa",
    description:
      "Volume alto e necessidade de previsibilidade: quanto custa desligar, quanto vale a exposição, quanto provisionar.",
    highlights: [
      "Passivo trabalhista em lote pela folha",
      "Custo de desligamento com encargos",
      "API para integrar ao sistema interno",
    ],
    href: "/rh",
    hrefLabel: "Ver a página para empresas e RH",
  },
];

// ---------------------------------------------------------------------------
// Planilha vs LexLaboral (sem tempo inventado)
// ---------------------------------------------------------------------------

export const comparisonItems = [
  {
    feature: "Origem da fórmula",
    manual: "Herdada de outra planilha, sem fonte",
    lexlaboral: "Metodologia descrita com o fundamento legal",
  },
  {
    feature: "Correção monetária e juros",
    manual: "Índice buscado e aplicado à mão",
    lexlaboral: "IPCA-E e ADC 58 aplicados pelo motor",
  },
  {
    feature: "Reprodução do valor levado ao processo",
    manual: "Depende de achar a versão certa do arquivo",
    lexlaboral: "Tabela de índices congelada no cálculo",
  },
  {
    feature: "Do cálculo ao documento",
    manual: "Copiar, colar e formatar no editor",
    lexlaboral: "DOCX gerado com os dados do caso",
  },
  {
    feature: "Acompanhamento do cliente",
    manual: "PDF por e-mail a cada pergunta",
    lexlaboral: "Portal com andamento, valores e documentos",
  },
  {
    feature: "Vários processos ao mesmo tempo",
    manual: "Uma pasta e uma planilha por caso",
    lexlaboral: "Casos, prazos e cálculos num painel só",
  },
];

// ---------------------------------------------------------------------------
// Planos — só a copy. Preço e teto vêm do Stripe (`usePlans`).
// ---------------------------------------------------------------------------

/**
 * Escrever valor à mão nesta lista foi o que fez a landing anunciar um preço
 * enquanto a fatura cobrava outro. O plano é do escritório, não da pessoa.
 */
const CORE_FEATURES = [
  "Cálculos trabalhistas ilimitados",
  "Correção monetária e juros",
  "12 modelos de documento em DOCX",
  "Planilha de liquidação em XLSX",
  "Simulador de acordo",
  "Compartilhamento de cálculo com o cliente",
];

export const pricingPlans = [
  {
    code: "solo" as const,
    description: "Para quem advoga sozinho",
    features: [...CORE_FEATURES, "Suporte por e-mail"],
    cta: "Começar 7 dias grátis",
    popular: false,
  },
  {
    code: "banca" as const,
    description: "Para a banca pequena, com equipe",
    features: [
      ...CORE_FEATURES,
      "Papéis e permissões por pessoa",
      "Portal do cliente",
      "Suporte por e-mail",
    ],
    cta: "Começar 7 dias grátis",
    popular: true,
  },
  {
    code: "escritorio" as const,
    description: "Para o escritório estruturado",
    features: [
      ...CORE_FEATURES,
      "Papéis e permissões por pessoa",
      "Portal do cliente",
      "Passivo trabalhista em lote",
      "Prioridade no suporte",
    ],
    cta: "Começar 7 dias grátis",
    popular: false,
  },
  {
    code: "max" as const,
    description: "Para operação grande, com volume",
    features: [
      ...CORE_FEATURES,
      "Papéis e permissões por pessoa",
      "Portal do cliente",
      "Passivo trabalhista em lote",
      "API pública para integrações",
      "Prioridade no suporte",
    ],
    cta: "Começar 7 dias grátis",
    popular: false,
  },
];

// ---------------------------------------------------------------------------
// FAQ — objeções reais, respostas só do que existe
// ---------------------------------------------------------------------------

export const faqs = [
  {
    question: "Existe teste grátis? Precisa de cartão?",
    answer:
      "Sim: 7 dias grátis, sem cartão de crédito. Você cria a conta, usa a plataforma inteira no período e só escolhe um plano se quiser continuar.",
  },
  {
    question: "Quais cálculos o LexLaboral faz?",
    answer:
      "Rescisão completa e verbas isoladas — aviso prévio, 13º, férias + 1/3, FGTS e multa de 40%, horas extras e reflexos, adicional noturno, insalubridade, periculosidade, equiparação salarial, art. 467 e prescrição quinquenal — além de INSS, IRRF e FGTS do período. Também faz a liquidação, com correção monetária e juros até a data escolhida.",
  },
  {
    question: "Como funcionam a correção monetária e os juros?",
    answer:
      "A correção segue o IPCA-E e os juros a forma definida na ADC 58, aplicados até a data de liquidação que você definir. O demonstrativo mostra principal, correção e juros separados, verba a verba.",
  },
  {
    question: "Se eu abrir um cálculo antigo, o valor muda sozinho?",
    answer:
      "Não. Cada cálculo grava a tabela de índices que usou. Atualizar para os índices de hoje é uma ação explícita sua, registrada em trilha de auditoria — o valor que você levou ao processo continua reproduzível.",
  },
  {
    question: "O LexLaboral substitui o cálculo do perito?",
    answer:
      "Não. É ferramenta de apoio para a sua conta, a sua peça e a sua negociação. Em processo judicial, o cálculo pericial segue sendo necessário quando o juízo o determina.",
  },
  {
    question: "Posso avaliar o passivo de uma folha inteira?",
    answer:
      "Sim. Você sobe a folha em planilha e a avaliação em lote devolve a exposição por empregado e por verba, com o mesmo motor do cálculo individual.",
  },
  {
    question: "Consigo gerar documentos a partir do cálculo?",
    answer:
      "Sim. São 12 modelos em DOCX editável — parecer técnico, petição inicial, contestação, recurso ordinário, termo de quitação, rescisão indireta, aviso prévio indenizado, danos morais, horas extras e adicionais, FGTS e multa, notificação extrajudicial e proposta de acordo. Você também pode enviar o seu próprio modelo, com a marca do escritório.",
  },
  {
    question: "Dá para usar em equipe?",
    answer:
      "Sim. O plano é do escritório e tem teto de pessoas. Você convida sócios, associados e estagiários com papéis diferentes, e cada pessoa enxerga o que o papel dela permite.",
  },
  {
    question: "Sou avisado quando o processo anda?",
    answer:
      "Sim. Todo dia o LexLaboral consulta a base pública do CNJ (DataJud) pelos seus casos ativos com número de processo e, quando aparece movimentação nova, manda um e-mail com o que mudou. A cobertura é da Justiça do Trabalho (TRT e TST), e o DataJud é um espelho alimentado pelos tribunais com alguma defasagem — por isso o aviso complementa a consulta aos autos, não a substitui.",
  },
  {
    question: "Meus dados ficam separados dos de outros escritórios?",
    answer:
      "Sim. Casos, clientes, cálculos e documentos pertencem à sua organização, e o servidor confere essa fronteira a cada requisição — não é só a interface que esconde.",
  },
  {
    question: "Meu cliente consegue acompanhar o caso?",
    answer:
      "Sim, pelo portal do cliente: ele entra por um convite de uso único e vê andamento, audiências, documentos e valores em linguagem simples, sem instalar nada.",
  },
  {
    question: "Existe API?",
    answer:
      "Sim, uma API pública para chamar o motor de cálculo a partir do seu sistema, com chave de acesso, uso medido e cobrança por chamada.",
  },
  {
    question: "Dá para colocar uma calculadora no site do escritório?",
    answer:
      "Sim. Há uma calculadora pública gratuita para o trabalhador e um widget que você embute no site do escritório — quem calcula por ali chega até você com o cálculo já feito.",
  },
];
