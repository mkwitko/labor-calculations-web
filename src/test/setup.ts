import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom não implementa matchMedia, e código que decide layout por breakpoint
// (use-product-tour, use-mobile-nav) chama window.matchMedia direto. Sem este
// stub o teste falha com "window.matchMedia is not a function". Padrão =
// desktop; um teste que precise de mobile sobrescreve matches.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  cleanup();
});
