import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const drive = vi.fn();
const moveNext = vi.fn();
const movePrevious = vi.fn();
// Índice do passo ativo, controlado por cada teste de navegação.
let activeIndex = 0;
const driverFactory = vi.fn(() => ({
  drive,
  moveNext,
  movePrevious,
  getActiveIndex: () => activeIndex,
}));
// Guarda o `onDestroyed` de cada tour criado, para simular o fim dele.
const onDestroyedCalls: Array<() => void> = [];
// Guarda os passos, para exercitar o `onHighlightStarted` de cada um.
let lastSteps: Array<{
  element?: unknown;
  data?: { selector?: string };
  onHighlightStarted?: (...args: never[]) => void;
}> = [];
// Config do último tour criado, para exercitar onNextClick/onPrevClick.
let lastConfig: {
  onDestroyed?: () => void;
  onNextClick?: () => void;
  onPrevClick?: () => void;
  steps?: typeof lastSteps;
} = {};

vi.mock("driver.js", () => ({
  driver: (config: typeof lastConfig) => {
    if (config.onDestroyed) onDestroyedCalls.push(config.onDestroyed);
    lastSteps = config.steps ?? [];
    lastConfig = config;
    return driverFactory();
  },
}));
vi.mock("driver.js/dist/driver.css", () => ({}));

/** O stub de `matchMedia` do setup responde desktop; isto vira telefone. */
function asMobile(mobile: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: mobile,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const { mobileNav } = await import("./use-mobile-nav");

const { useProductTour } = await import("./use-product-tour");

beforeEach(() => {
  // Libera o guard de qualquer tour que o teste anterior deixou na tela: ele é
  // estado de módulo e não morre entre testes.
  for (const done of onDestroyedCalls) done();
  onDestroyedCalls.length = 0;
  lastSteps = [];
  lastConfig = {};
  activeIndex = 0;
  localStorage.clear();
  drive.mockClear();
  moveNext.mockClear();
  movePrevious.mockClear();
  driverFactory.mockClear();
  mobileNav.close();
  asMobile(false);
  vi.useFakeTimers();
});

/** O hook usa `useCallback`, então precisa de um render para existir. */
function tour() {
  return renderHook(() => useProductTour()).result.current;
}

describe("useProductTour", () => {
  it("runs only one tour when the same first-visit trigger fires twice", () => {
    // O StrictMode invoca o efeito duas vezes em desenvolvimento, e o "visto"
    // só era gravado no fim do tour — então os dois passavam pelo guard e dois
    // popovers apareciam empilhados.
    tour().startWizardTourIfFirstVisit();
    tour().startWizardTourIfFirstVisit();
    vi.runAllTimers();

    expect(drive).toHaveBeenCalledTimes(1);
  });

  it("does not start a second tour while another one is on screen", () => {
    // Boas-vindas (disparado pelo layout) e wizard (disparado pela tela de
    // cálculo) podiam abrir juntos para quem cai direto em /calculations/new.
    tour().startIfFirstVisit();
    vi.runAllTimers();
    expect(drive).toHaveBeenCalledTimes(1);

    tour().startWizardTourIfFirstVisit();
    vi.runAllTimers();
    expect(drive).toHaveBeenCalledTimes(1);
  });

  it("opens the drawer for a step anchored in the menu, and closes it for a page step", () => {
    asMobile(true);
    tour().startIfFirstVisit();
    vi.runAllTimers();

    const navStep = lastSteps.find(
      (s) => s.data?.selector === '[data-tour="nav-clients"]',
    );
    const headerStep = lastSteps.find(
      (s) => s.data?.selector === '[data-tour="help-button"]',
    );

    mobileNav.close();
    navStep?.onHighlightStarted?.();
    expect(mobileNav.get()).toBe(true);

    // O avatar fica no header: manter o drawer aberto cobriria o destaque.
    headerStep?.onHighlightStarted?.();
    expect(mobileNav.get()).toBe(false);
  });

  it("leaves the drawer closed on desktop", () => {
    tour().startIfFirstVisit();
    vi.runAllTimers();

    const navStep = lastSteps.find(
      (s) => s.data?.selector === '[data-tour="nav-clients"]',
    );
    navStep?.onHighlightStarted?.();

    expect(mobileNav.get()).toBe(false);
  });

  it("resolves anchors lazily, preferring the visible duplicate", () => {
    // O rail do desktop fica no DOM (`hidden md:flex`) mesmo no telefone, então
    // `nav-*` existe em dobro e o primeiro match do documento é o invisível.
    const hidden = document.createElement("button");
    hidden.setAttribute("data-tour", "nav-clients");
    const visible = document.createElement("button");
    visible.setAttribute("data-tour", "nav-clients");
    visible.getClientRects = () =>
      [{}] as unknown as ReturnType<Element["getClientRects"]>;
    document.body.append(hidden, visible);

    try {
      tour().startIfFirstVisit();
      vi.runAllTimers();

      const navStep = lastSteps.find(
        (s) => s.data?.selector === '[data-tour="nav-clients"]',
      );
      expect(typeof navStep?.element).toBe("function");
      expect((navStep?.element as () => Element)()).toBe(visible);
    } finally {
      hidden.remove();
      visible.remove();
    }
  });

  it("settles the drawer before moving between drawer and page steps on mobile", () => {
    asMobile(true);
    tour().startIfFirstVisit();
    vi.runAllTimers();
    drive.mockClear();

    const helpIndex = lastSteps.findIndex(
      (s) => s.data?.selector === '[data-tour="help-button"]',
    );
    expect(helpIndex).toBeGreaterThan(0);

    // Avançar do último item de menu para o passo do avatar: fecha o drawer e
    // só move depois da animação — senão o drawer cobre o destaque.
    activeIndex = helpIndex - 1;
    mobileNav.open();
    lastConfig.onNextClick?.();
    expect(mobileNav.get()).toBe(false);
    expect(moveNext).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(moveNext).toHaveBeenCalledTimes(1);

    // Voltar do avatar para o item de menu: o Sheet desmonta o conteúdo ao
    // fechar, então o drawer precisa reabrir ANTES de o driver resolver o passo.
    activeIndex = helpIndex;
    lastConfig.onPrevClick?.();
    expect(mobileNav.get()).toBe(true);
    expect(movePrevious).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(movePrevious).toHaveBeenCalledTimes(1);
  });

  it("does not intercept navigation on desktop", () => {
    tour().startIfFirstVisit();
    vi.runAllTimers();

    expect(lastConfig.onNextClick).toBeUndefined();
    expect(lastConfig.onPrevClick).toBeUndefined();
  });

  it("lets the skipped tour run on the next visit", () => {
    tour().startIfFirstVisit();
    vi.runAllTimers();
    tour().startWizardTourIfFirstVisit();
    vi.runAllTimers();

    // Fim do tour de boas-vindas: ele grava o "visto" e libera a vez.
    for (const done of onDestroyedCalls) done();
    drive.mockClear();

    tour().startWizardTourIfFirstVisit();
    vi.runAllTimers();

    expect(drive).toHaveBeenCalledTimes(1);
  });
});
