import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { capturePageview } from "@/lib/analytics";

/**
 * Dispara `$pageview` a cada navegação da SPA.
 *
 * Precisa ser explícito porque `capture_pageview` está desligado no init: numa
 * SPA o PostHog só veria o primeiro carregamento e nunca as trocas de rota.
 *
 * Mora num hook, e não copiado em cada casca, porque o que estava faltando era
 * exatamente isto — o efeito existia só no layout autenticado, então nenhuma
 * página pública tinha pageview: as landings, as páginas de SEO e o widget não
 * apareciam no Web Analytics nem podiam ser o primeiro passo de um funil. Quem
 * chegava pelo Google e ia embora sem começar um cálculo não existia.
 *
 * Toda casca nova precisa chamar isto. Não chamar não quebra nada — só apaga a
 * página das métricas, em silêncio.
 */
export function usePageview(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    capturePageview();
  }, [pathname]);
}
