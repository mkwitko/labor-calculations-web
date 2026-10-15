import { useEffect } from "react";
import methodologyHtml from "./methodology.html?raw";

/**
 * Página de metodologia de cálculo — uso interno de auditoria, antes do
 * lançamento. Não é linkada de lugar nenhum e não entra no sitemap: só se chega
 * por URL direta. Embute o demonstrativo interativo (motor calculateLaborV3
 * portado, recálculo ao vivo no navegador) como documento isolado via iframe
 * srcDoc — mantém seus próprios estilos sem colidir com o design system do app.
 */
export default function MethodologyPage() {
  // A rota existe no bundle público, então marca noindex enquanto está montada
  // para o caso de alguém colar o link em lugar rastreável.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  return (
    <iframe
      title="Metodologia de Cálculo — LexLaboral"
      srcDoc={methodologyHtml}
      className="block h-[100dvh] w-full border-0"
    />
  );
}
