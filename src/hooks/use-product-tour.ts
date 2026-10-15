import { type DriveStep, driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useCallback } from "react";
import { mobileNav } from "./use-mobile-nav";

const SEEN_KEY = "jurispro:tour:v1";

/** True on phone-width viewports (matches the `md` Tailwind breakpoint). */
function isMobile() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches
  );
}

/** Tempo de abrir/fechar do drawer (animação do Sheet) antes de destacar. */
const DRAWER_TRANSITION_MS = 350;

/**
 * Um tour por vez. Sem isto, dois gatilhos independentes empilhavam popovers:
 * quem cai direto em `/calculations/new` dispara o de boas-vindas (pelo layout)
 * e o do wizard (pela tela) no mesmo instante, e em desenvolvimento o
 * StrictMode invoca cada efeito duas vezes. O tour barrado **não** grava o
 * "visto" — ele volta na próxima visita.
 */
let tourOnScreen = false

/**
 * Reserva a vez e roda. Solta a vez se `run` lançar: o flag só é limpo no
 * `onDestroyed`, então uma exceção no meio da montagem o deixaria preso e
 * nenhum tour rodaria mais na sessão.
 */
function claimTour(run: () => void) {
  if (tourOnScreen) return
  tourOnScreen = true
  try {
    run()
  } catch (error) {
    tourOnScreen = false
    throw error
  }
}

/** Constrói e roda, a menos que já exista tour na tela. */
function driveExclusive(build: () => ReturnType<typeof driver>) {
  claimTour(() => build().drive())
}

/**
 * Âncoras que, no telefone, vivem dentro do drawer do menu — o resto está na
 * página. Um passo que aponta para cá precisa do drawer aberto, e um passo que
 * aponta para a página precisa dele fechado, senão o drawer cobre justamente o
 * elemento em destaque.
 */
const DRAWER_ANCHOR = /^\[data-tour="(sidebar|nav-[\w-]+)"\]$/

function needsDrawer(step: DriveStep): boolean {
  return typeof step.element === "string" && DRAWER_ANCHOR.test(step.element)
}

/**
 * O rail do desktop fica no DOM mesmo no telefone (`hidden md:flex`), então as
 * âncoras `sidebar`/`nav-*` existem em dobro e `querySelector` devolve o botão
 * invisível do rail em vez do gêmeo dentro do drawer — o destaque apontava para
 * o nada. Prefere o match visível; sem nenhum visível, cai no primeiro.
 */
function visibleElement(selector: string): Element {
  const matches = Array.from(document.querySelectorAll(selector))
  const visible = matches.find((el) => el.getClientRects().length > 0)
  return (visible ?? matches[0]) as Element
}

/**
 * Troca o seletor de cada passo por resolução tardia e visível. Tardia porque o
 * conteúdo do drawer só monta com ele aberto — um Element resolvido de antemão
 * ficaria obsoleto a cada abre-e-fecha. O seletor original vai para
 * `data.selector`, que é o que os testes consultam.
 */
function lateVisibleAnchors(steps: DriveStep[]) {
  for (const step of steps) {
    if (typeof step.element !== "string") continue
    const selector = step.element
    step.data = { ...step.data, selector }
    step.element = () => visibleElement(selector)
  }
}

/**
 * No telefone, cada passo abre ou fecha o drawer conforme o que ele destaca.
 * Fica aqui, e não em cada tour, para que um tour novo que aponte item de menu
 * já funcione sem ninguém lembrar de repetir a regra.
 */
function syncDrawerWithSteps(steps: DriveStep[]) {
  if (!isMobile()) return

  for (const step of steps) {
    const wantsDrawer = needsDrawer(step)
    const previous = step.onHighlightStarted

    step.onHighlightStarted = (element, s, opts) => {
      if (wantsDrawer) mobileNav.open()
      else mobileNav.close()
      previous?.(element, s, opts)
    }
  }
}

/** Factory shared by every contextual tour so they look and behave the same. */
function makeTour(
  steps: DriveStep[],
  seenKey: string,
  doneBtnText = "Concluir",
  onDone?: () => void,
) {
  // Lido antes de `lateVisibleAnchors` trocar o seletor por função.
  const stepNeedsDrawer = steps.map(needsDrawer)
  syncDrawerWithSteps(steps)
  lateVisibleAnchors(steps)

  /**
   * No telefone, entrar num passo cuja âncora vive no drawer exige o drawer
   * aberto **antes** de o driver resolver o elemento — o Sheet desmonta o
   * conteúdo ao fechar, então abrir só no onHighlightStarted é tarde demais
   * (o passo já foi resolvido sem elemento; é o que acontecia ao voltar do
   * passo do avatar para um item de menu). Ajusta o drawer, espera a animação
   * e só então move.
   */
  const moveWithDrawer = (targetIndex: number, move: () => void) => {
    const wantsDrawer = stepNeedsDrawer[targetIndex] ?? false
    if (mobileNav.get() === wantsDrawer) {
      move()
      return
    }
    mobileNav.set(wantsDrawer)
    setTimeout(move, DRAWER_TRANSITION_MS)
  }

  const tour = driver({
    showProgress: true,
    nextBtnText: "Próximo",
    prevBtnText: "Anterior",
    doneBtnText,
    progressText: "{{current}} de {{total}}",
    popoverClass: "jurispro-tour",
    steps,
    ...(isMobile()
      ? {
          onNextClick: () =>
            moveWithDrawer((tour.getActiveIndex() ?? 0) + 1, () =>
              tour.moveNext(),
            ),
          onPrevClick: () =>
            moveWithDrawer((tour.getActiveIndex() ?? 0) - 1, () =>
              tour.movePrevious(),
            ),
        }
      : {}),
    onDestroyed: () => {
      tourOnScreen = false
      // Fim de tour nunca deixa o drawer aberto por conta do tour.
      if (isMobile()) mobileNav.close()
      onDone?.();
      localStorage.setItem(seenKey, "1");
    },
  });
  return tour;
}

// ── Welcome tour (concise, nav-focused) ─────────────────────────────────
// Desktop spotlights the static sidebar + floating help button. Mobile drives
// the off-canvas drawer: the drawer is opened before the tour starts (see
// `runWelcome`), the same nav nodes are spotlighted inside it, and it closes
// when the tour ends.
function buildTour() {
  const mobile = isMobile();

  const navSteps: DriveStep[] = [
    {
      element: '[data-tour="sidebar"]',
      popover: {
        title: "Bem-vindo ao LexLaboral 👋",
        description: mobile
          ? "Este é o menu principal, aberto pelo botão ☰ no topo. Aqui você acessa clientes, casos, agenda, cálculos e a biblioteca de documentos."
          : "Este é o menu principal. Aqui você acessa clientes, casos, agenda, cálculos e a biblioteca de documentos.",
      },
    },
    {
      element: '[data-tour="nav-clients"]',
      popover: {
        title: "Clientes",
        description:
          "Comece cadastrando o reclamante da causa. É a partir do cliente que você abre casos e faz cálculos.",
      },
    },
    {
      element: '[data-tour="nav-cases"]',
      popover: {
        title: "Casos",
        description:
          "O caso é o centro de tudo: reúne cálculos, documentos, audiências, prazos e acordos de um mesmo processo.",
      },
    },
    {
      element: '[data-tour="nav-calculations"]',
      popover: {
        title: "Cálculos",
        description:
          "Faça a liquidação trabalhista com correção monetária, juros e todas as verbas — em um assistente guiado.",
      },
    },
    {
      element: '[data-tour="nav-agenda"]',
      popover: {
        title: "Agenda",
        description:
          "Audiências e prazos de todos os casos em um só lugar, com calculadora de prazos e sincronização com o Google Calendar.",
      },
    },
    // Desktop e mobile passam a compartilhar o mesmo gatilho (o avatar no
    // header), então a âncora não depende mais do viewport.
    {
      element: '[data-tour="help-button"]',
      popover: {
        title: "Precisa de ajuda?",
        description:
          "Neste menu ficam a Central de Ajuda, o refazer tour e as configurações da sua conta.",
      },
    },
  ];

  // Abrir e fechar o drawer por passo é responsabilidade de `makeTour`
  // (`syncDrawerWithSteps`), que decide pela âncora de cada passo. O laço à mão
  // que existia aqui mantinha o drawer aberto até no passo do avatar, que fica
  // no header — o drawer cobria justamente o que estava em destaque.
  return makeTour(navSteps, SEEN_KEY, "Concluir");
}

// Opens the mobile drawer (and lets it mount/animate) before spotlighting the
// nav items inside it; drives immediately on desktop.
function runWelcome() {
  claimTour(() => {
    const tour = buildTour();
    if (isMobile()) {
      mobileNav.open();
      setTimeout(() => tour.drive(), DRAWER_TRANSITION_MS);
    } else {
      tour.drive();
    }
  });
}

// ── Wizard tour (cálculo) ───────────────────────────────────────────────
// v2: o texto foi reescrito por extenso (v1 era enxuto demais para explicação
// jurídica). Chave nova faz o tour reaparecer para quem já dispensou a v1.
const WIZARD_SEEN_KEY = "jurispro:tour:wizard:v2";

function buildWizardTour() {
  return makeTour(
    [
      {
        popover: {
          title: "Assistente de cálculo",
          description:
            "Este assistente monta uma liquidação trabalhista completa em quatro passos: <strong>Identificação</strong> (quem é o reclamante), <strong>Contrato</strong> (datas e motivo da rescisão), <strong>Remuneração</strong> (salário, horas extras, adicionais) e <strong>Liquidação</strong> (correção, juros e descontos).<br><br>Você não precisa saber tudo de antemão — pode voltar a qualquer passo antes de salvar, e o que já foi preenchido é mantido.",
        },
      },
      {
        popover: {
          title: "Comece pelo básico, o resto é opcional",
          description:
            "Só quatro informações são obrigatórias: <strong>cliente</strong>, <strong>data de admissão</strong>, <strong>data de rescisão</strong> e <strong>último salário</strong>. Com elas o sistema já calcula saldo de salário, aviso prévio, 13º, férias e FGTS.<br><br>Verbas que dependem do caso — equiparação salarial, insalubridade, multa do art. 467, prescrição quinquenal — ficam recolhidas em <strong>“Opções avançadas”</strong>. Abra só o que a sua causa pedir; o que ficar fechado não entra na conta.",
        },
      },
      {
        popover: {
          title: "Não sabe o que um campo significa?",
          description:
            "Todo campo jurídico tem um ícone <strong>?</strong> ao lado. Passe o mouse (ou toque, no celular) para ver o que ele é, como o cálculo o usa e qual artigo da CLT o embasa.<br><br>Se quiser o assunto por extenso, a <strong>Central de Ajuda</strong> — no menu do seu avatar — tem um artigo por verba, com exemplo numérico.",
        },
      },
      {
        popover: {
          title: "O que é Estimativa e o que é Liquidação",
          description:
            "A <strong>Estimativa</strong> dá uma ordem de grandeza rápida, útil para a primeira conversa com o cliente: soma as verbas sem corrigir valores no tempo.<br><br>A <strong>Liquidação</strong> é a conta que vai aos autos: aplica correção monetária (IPCA-E e SELIC, na forma da ADC 58), juros, INSS e IRRF, e mostra a memória de cálculo verba por verba.<br><br>Enquanto você preenche, uma prévia aparece de lado — é orientação, não o resultado final.",
        },
      },
    ],
    WIZARD_SEEN_KEY,
    "Entendi",
  );
}

// ── Case hub tour (dentro de um caso) ───────────────────────────────────
const CASE_HUB_SEEN_KEY = "jurispro:tour:case-hub:v1";

function buildCaseHubTour() {
  return makeTour(
    [
      {
        element: '[data-tour="case-subnav"]',
        popover: {
          title: "Tudo do processo em um lugar",
          description:
            "Quatro abas reúnem o processo: Caso (visão geral, partes e notas), Números (cálculos, acordos e financeiro), Prazos (audiências, prazos e tarefas) e Autos (documentos e andamentos).",
        },
      },
      {
        element: '[data-tour="case-numeros"]',
        popover: {
          title: "Números do caso",
          description:
            "Cálculos e acordos deste processo, e — se seu papel tiver acesso — os honorários e parcelas em Financeiro.",
        },
      },
      {
        element: '[data-tour="case-autos"]',
        popover: {
          title: "Autos do processo",
          description:
            "Documentos gerados e os andamentos sincronizados da base pública do CNJ (DataJud) pelo número do processo.",
        },
      },
    ],
    CASE_HUB_SEEN_KEY,
    "Entendi",
  );
}

// ── Templates / biblioteca de documentos ────────────────────────────────
const TEMPLATES_SEEN_KEY = "jurispro:tour:templates:v1";

function buildTemplatesTour() {
  return makeTour(
    [
      {
        element: '[data-tour="templates-list"]',
        popover: {
          title: "Modelos de documentos",
          description:
            "Use os modelos do sistema ou envie os seus (.docx). Os campos entre chaves são preenchidos automaticamente com dados do cliente, caso e cálculo.",
        },
      },
      {
        element: '[data-tour="templates-placeholders"]',
        popover: {
          title: "Campos disponíveis",
          description:
            "Veja aqui todos os campos que você pode inserir no documento. Valide o modelo antes de gerar para não faltar nenhuma informação.",
        },
      },
    ],
    TEMPLATES_SEEN_KEY,
    "Entendi",
  );
}

// ── Agenda ──────────────────────────────────────────────────────────────
const AGENDA_SEEN_KEY = "jurispro:tour:agenda:v1";

function buildAgendaTour() {
  return makeTour(
    [
      {
        element: '[data-tour="agenda-calendar"]',
        popover: {
          title: "Sua agenda unificada",
          description:
            "Audiências e prazos de todos os casos aparecem aqui. Clique em uma data para ver os detalhes. Conecte o Google Calendar nas Configurações para sincronizar.",
        },
      },
      {
        element: '[data-tour="agenda-upcoming"]',
        popover: {
          title: "Próximos compromissos",
          description:
            "Aqui ficam os itens mais próximos, para você não perder nenhum prazo ou audiência.",
        },
      },
    ],
    AGENDA_SEEN_KEY,
    "Entendi",
  );
}

// Replayable tours surfaced in the Help Center. Replaying clears the "seen"
// flag and navigates to the page, where the first-visit trigger runs it again.
export type TourArea =
  | "welcome"
  | "cases"
  | "calculations"
  | "agenda"
  | "templates";

const TOUR_KEYS: Record<TourArea, string> = {
  welcome: SEEN_KEY,
  cases: CASE_HUB_SEEN_KEY,
  calculations: WIZARD_SEEN_KEY,
  agenda: AGENDA_SEEN_KEY,
  templates: TEMPLATES_SEEN_KEY,
};

export const TOUR_AREAS: Array<{
  area: TourArea;
  label: string;
  route: string;
  hint?: string;
}> = [
  { area: "welcome", label: "Boas-vindas (visão geral)", route: "/home" },
  { area: "calculations", label: "Assistente de cálculo", route: "/calculations/new" },
  { area: "agenda", label: "Agenda", route: "/agenda" },
  { area: "templates", label: "Modelos de documento", route: "/library/templates" },
  {
    area: "cases",
    label: "Caso (abas do processo)",
    route: "/cases",
    hint: "Aparece ao abrir um caso.",
  },
];

/** Runs a first-visit tour once, after a short delay so the layout is painted. */
function runOncePerVisit(seenKey: string, build: () => ReturnType<typeof driver>) {
  if (localStorage.getItem(seenKey)) return;
  // O guard fica dentro do timer: dois gatilhos disparados no mesmo instante
  // agendam os dois, e é na hora de rodar que o segundo precisa desistir.
  setTimeout(() => driveExclusive(build), 500);
}

export function useProductTour() {
  const start = useCallback(() => {
    runWelcome();
  }, []);

  const startIfFirstVisit = useCallback(() => {
    if (localStorage.getItem(SEEN_KEY)) return;
    // small delay so the layout is painted before spotlighting
    setTimeout(runWelcome, 600);
  }, []);

  const startWizardTourIfFirstVisit = useCallback(
    () => runOncePerVisit(WIZARD_SEEN_KEY, buildWizardTour),
    [],
  );

  const startCaseHubTourIfFirstVisit = useCallback(
    () => runOncePerVisit(CASE_HUB_SEEN_KEY, buildCaseHubTour),
    [],
  );

  const startTemplatesTourIfFirstVisit = useCallback(
    () => runOncePerVisit(TEMPLATES_SEEN_KEY, buildTemplatesTour),
    [],
  );

  const startAgendaTourIfFirstVisit = useCallback(
    () => runOncePerVisit(AGENDA_SEEN_KEY, buildAgendaTour),
    [],
  );

  const reset = useCallback(() => {
    localStorage.removeItem(SEEN_KEY);
  }, []);

  // Clears the "seen" flag so the tour runs again when its page mounts.
  const replayTour = useCallback((area: TourArea) => {
    localStorage.removeItem(TOUR_KEYS[area]);
  }, []);

  // Runs a tour immediately (used when already on the target page, where a
  // route change wouldn't remount and re-trigger the first-visit effect).
  const startTour = useCallback((area: TourArea) => {
    if (area === "welcome") {
      setTimeout(runWelcome, 100);
      return;
    }
    const builders: Record<Exclude<TourArea, "welcome">, () => ReturnType<typeof driver>> = {
      calculations: buildWizardTour,
      agenda: buildAgendaTour,
      templates: buildTemplatesTour,
      cases: buildCaseHubTour,
    };
    setTimeout(() => driveExclusive(builders[area]), 100);
  }, []);

  return {
    start,
    startIfFirstVisit,
    startWizardTourIfFirstVisit,
    startCaseHubTourIfFirstVisit,
    startTemplatesTourIfFirstVisit,
    startAgendaTourIfFirstVisit,
    reset,
    replayTour,
    startTour,
  };
}
