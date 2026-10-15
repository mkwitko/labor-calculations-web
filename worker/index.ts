/**
 * Worker do front: serve o SPA e, num caminho só, faz proxy reverso do PostHog.
 *
 * O motivo é medição, não performance: `us.i.posthog.com` está nas listas do
 * uBlock, do Brave e do DNS de operadora. Sem proxy, o evento de quem usa
 * bloqueador nunca sai do navegador — e a perda não é uniforme, então o funil
 * fica torto e não só menor.
 *
 * O prefixo é opaco de propósito. `/analytics`, `/tracking`, `/telemetry` e
 * `/posthog` já são regra em lista de bloqueio; a documentação da PostHog pede
 * explicitamente um caminho próprio da aplicação. Mudar `PROXY_PREFIX` aqui
 * obriga a mudar `api_host` em `src/lib/analytics.ts` no mesmo commit — os dois
 * juntos são o contrato.
 *
 * Só as rotas do prefixo chegam neste script: `run_worker_first` em
 * `wrangler.jsonc` mantém o resto como asset estático puro, com o roteamento de
 * SPA intacto.
 */

const PROXY_PREFIX = "/lxl";

/** Região US do projeto (`us.posthog.com`). Trocar de região muda os dois. */
const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

type Env = { ASSETS: { fetch: (request: Request) => Promise<Response> } };
type Ctx = { waitUntil: (promise: Promise<unknown>) => void };

/**
 * Os assets do SDK (`array.js`, `recorder.js`, `surveys.js`) vivem em outro
 * host e são imutáveis por versão — valem cache na borda. O resto é ingestão e
 * consulta de flag: passa direto, sempre.
 */
async function retrieveAsset(
  request: Request,
  pathWithSearch: string,
  ctx: Ctx,
): Promise<Response> {
  const cache = (caches as unknown as { default: Cache }).default;

  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(`https://${ASSET_HOST}${pathWithSearch}`);
  ctx.waitUntil(cache.put(request, response.clone()));
  return response;
}

/**
 * O cookie é removido antes de sair: o cookie de sessão do LexLaboral é de
 * primeira parte e não tem por que atravessar para a PostHog. O IP real vai em
 * `X-Forwarded-For` porque é dele que sai a geolocalização do evento — sem isso
 * todo evento passa a vir do datacenter da Cloudflare.
 */
async function forwardRequest(
  request: Request,
  pathWithSearch: string,
): Promise<Response> {
  const headers = new Headers(request.headers);
  headers.delete("cookie");
  headers.set("X-Forwarded-For", request.headers.get("CF-Connecting-IP") ?? "");

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  return fetch(
    new Request(`https://${API_HOST}${pathWithSearch}`, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : null,
      redirect: request.redirect,
    }),
  );
}

export default {
  async fetch(request: Request, env: Env, ctx: Ctx): Promise<Response> {
    const url = new URL(request.url);

    if (!url.pathname.startsWith(`${PROXY_PREFIX}/`)) {
      return env.ASSETS.fetch(request);
    }

    // A PostHog recebe o caminho sem o prefixo: para ela o proxy não existe.
    const path = url.pathname.slice(PROXY_PREFIX.length);
    const pathWithSearch = path + url.search;

    if (path.startsWith("/static/") || path.startsWith("/array/")) {
      return retrieveAsset(request, pathWithSearch, ctx);
    }

    return forwardRequest(request, pathWithSearch);
  },
};
