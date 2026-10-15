import type { PostHog } from "posthog-js";
import { env } from "@/env";

// Product analytics is on only in production builds with a PostHog key set.
export const analyticsEnabled = import.meta.env.PROD && !!env.VITE_POSTHOG_KEY;

// posthog-js is heavy (~70kB gz), so it's dynamically imported the first time
// analytics is used — keeping it out of the initial app bundle.
let phPromise: Promise<PostHog | null> | null = null;

/**
 * A instância já resolvida, ou `null` enquanto o import não voltou.
 *
 * Existe para quem não pode esperar nem provocar o carregamento: o `beforeSend`
 * do Sentry roda dentro do tratamento do erro e é síncrono. Sem isto, ler o
 * contexto da PostHog ali significaria baixar 70kB no exato momento em que a
 * aplicação está quebrando.
 */
let loadedPosthog: PostHog | null = null;

function getPosthog(): Promise<PostHog | null> {
  if (!analyticsEnabled) return Promise.resolve(null);
  if (!phPromise) {
    phPromise = import("posthog-js").then(({ default: posthog }) => {
      posthog.init(env.VITE_POSTHOG_KEY as string, {
        // Proxy reverso de primeira parte (`worker/index.ts`), não o host da
        // PostHog: o domínio deles é bloqueado por uBlock/Brave e o evento de
        // quem usa bloqueador nunca sairia daqui. O prefixo é o mesmo dos dois
        // lados — mudar um sem o outro derruba toda a medição em silêncio, sem
        // erro no console e sem teste que quebre.
        // `||`, não `??`: a variável vazia no `.env` é o caso normal e chega
        // como string vazia, que `??` deixaria passar como host.
        api_host: env.VITE_POSTHOG_HOST || "/lxl",
        // Os links que a própria PostHog gera (toolbar, "ver no PostHog")
        // precisam apontar para o app dela, que não passa pelo proxy.
        ui_host: "https://us.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false,
        capture_pageleave: true,
        // Exceção também virá como evento `$exception` aqui, além de ir para o
        // Sentry. Não é duplicação inútil: no Sentry o erro é uma pilha sem
        // antes e depois, e é na PostHog que ele entra na mesma linha do tempo
        // do funil — "quebrou no passo 4 e a pessoa foi embora" é uma pergunta
        // que só o lado que tem os dois eventos responde.
        capture_exceptions: true,
      });
      loadedPosthog = posthog;
      return posthog;
    });
  }
  return phPromise;
}

/**
 * Sobe a PostHog sem esperar por um evento.
 *
 * `capture_exceptions` só observa depois de inicializado, e as páginas públicas
 * só disparavam evento quando alguém começava um cálculo — erro em quem chegou
 * pelo Google e foi embora sem tocar em nada era invisível dos dois lados.
 *
 * Vai para a fila de ociosidade, não para o caminho da primeira pintura: o
 * pacote é grande e o Sentry, que é eager, cobre a janela até isto resolver.
 */
export function initAnalytics(): void {
  if (!analyticsEnabled) return;

  const start = () => void getPosthog();

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(start, { timeout: 3000 });
    return;
  }

  window.setTimeout(start, 1500);
}

/** Projeto `lexlaboral / Default project` na PostHog US — usado só para link. */
const POSTHOG_PROJECT_ID = "551597";

/**
 * Tags que fazem a ponte Sentry → PostHog: da pilha do erro para a pessoa e a
 * sessão em que ele aconteceu. Devolve `null` quando a PostHog ainda não subiu
 * ou está desligada — nunca força o carregamento.
 */
export function posthogSentryTags(): Record<string, string> | null {
  if (!loadedPosthog) return null;

  const distinctId = loadedPosthog.get_distinct_id();

  return {
    posthog_distinct_id: distinctId,
    posthog_session_id: loadedPosthog.get_session_id(),
    // `ui_host`, não o proxy: este link é para humano abrir, não para o SDK.
    posthog_person_url: `https://us.posthog.com/project/${POSTHOG_PROJECT_ID}/person/${encodeURIComponent(distinctId)}`,
  };
}

// Fire a $pageview (SPA navigations aren't auto-captured).
export function capturePageview(): void {
  if (!analyticsEnabled) return;
  void getPosthog().then((ph) => ph?.capture("$pageview"));
}

// Ties the current PostHog session to the authenticated lawyer.
export function identifyUser(
  id: string,
  props?: { email?: string; name?: string },
): void {
  if (!analyticsEnabled) return;
  void getPosthog().then((ph) => ph?.identify(id, props));
}

// Clears identity on sign-out so a shared machine doesn't merge sessions.
export function resetAnalytics(): void {
  if (!analyticsEnabled) return;
  void getPosthog().then((ph) => ph?.reset());
}

// Fire a domain event (e.g. calculation_created, case_created).
export function captureEvent(
  name: string,
  props?: Record<string, unknown>,
): void {
  if (!analyticsEnabled) return;
  void getPosthog().then((ph) => ph?.capture(name, props));
}

/** O que foi calculado — mesmo vocabulário do `kind` da API pública. */
export type CalcKind = "rescisao" | "horas_extras" | "ferias_13";

/** De quem é a leitura — mesmo `perspective` da API pública. */
export type CalcPerspective = "trabalhador" | "empresa";

/**
 * Porta de entrada, no mesmo formato que o back grava e `/admin/funil` rotula:
 * `site`, `rh`, `seo:<slug>`, `widget:<chave>`. Escrever outro valor aqui não
 * dá erro em lugar nenhum — só cria uma origem órfã no funil, invisível ao lado
 * das outras.
 */
export type CalcSource = string;

/**
 * Os três props que todo evento do funil público carrega.
 *
 * Sem eles o funil do PostHog quebra na primeira quebra por origem: evento sem
 * `source` não entra no grupo de nenhuma porta de entrada, e é justo o passo
 * abandonado — o que o banco não sabe — que fica invisível.
 *
 * `source` é opcional só nas telas de resultado: o link abre em outro navegador
 * (o advogado que recebeu do cliente) e ali não existe origem para ler.
 */
export type PublicCalcProps = {
  source?: CalcSource;
  kind: CalcKind;
  perspective: CalcPerspective;
};

type PublicCalcEvent =
  | "public_calc_started"
  | "public_calc_step"
  | "public_calc_created"
  | "public_calc_shared"
  | "public_calc_contact_saved"
  | "public_calc_claimed"
  | "widget_contact_saved";

/**
 * Único caminho para os eventos do funil público — o tipo é o que garante que
 * nenhuma calculadora nova entre no ar emitindo metade dos props.
 */
export function capturePublicCalcEvent(
  name: PublicCalcEvent,
  props: PublicCalcProps & Record<string, unknown>,
): void {
  captureEvent(name, props);
}
