/**
 * Quem rola a página é o `#root`, não a janela: o `index.css` dá
 * `height: 100%; overflow: auto` a `html`, `body` e `#root`, e o contêiner mais
 * interno é que fica com a barra. Por isso `window.scrollTo` não move nada e o
 * "voltar ao topo" do rodapé não fazia efeito nenhum.
 */
export function getScroller(): HTMLElement {
  return document.getElementById("root") ?? document.documentElement;
}

export function scrollToSection(id: string, e?: { preventDefault?(): void }) {
  e?.preventDefault?.();

  if (id === "top") {
    getScroller().scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
