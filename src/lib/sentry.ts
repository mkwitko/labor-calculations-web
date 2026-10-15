import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import { posthogSentryTags } from "@/lib/analytics";

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

// Only enabled in production builds with a DSN configured. In dev the init is a
// no-op so local errors surface in the console instead of Sentry.
export const sentryEnabled = import.meta.env.PROD && !!dsn;

export function initSentry(): void {
  if (!sentryEnabled) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration(),
    ],
    /**
     * A ponte com a PostHog. A integração oficial `posthog-js`↔Sentry foi
     * descontinuada pela própria PostHog em favor do error tracking dela, então
     * o elo é feito por tag: a partir de um issue do Sentry se chega à pessoa e
     * à sessão, onde está o que ela fez antes de quebrar.
     *
     * Não force o carregamento da PostHog aqui — `posthogSentryTags` devolve
     * `null` se ela ainda não subiu, e o erro precisa chegar ao Sentry de todo
     * jeito. Um erro sem tag é melhor do que um erro perdido.
     */
    beforeSend(event) {
      const tags = posthogSentryTags();
      if (tags) event.tags = { ...event.tags, ...tags };
      return event;
    },
    // Performance tracing — sample down if volume becomes an issue.
    tracesSampleRate: 0.2,
    // Session Replay — no replays normally, always on when an error occurs.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

export { Sentry };
