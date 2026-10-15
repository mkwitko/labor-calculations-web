// Prerender static HTML for the public legal routes so their raw HTML (served
// before any JavaScript runs) contains the real page content. Needed because
// the app is a client-rendered SPA: without this, every route returns the
// landing index.html, so crawlers/reviewers (e.g. Google OAuth verification)
// visiting /privacidade see landing text instead of the privacy policy.
//
// Content comes from the shared data module (src/.../legal/content.ts) via
// Vite's ssrLoadModule — the same source the React pages use, so the static
// HTML never drifts from what users see. We build HTML from the data rather
// than server-rendering the React components, which would emit framer-motion's
// initial opacity:0 state and hide the text.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distIndex = resolve(root, "dist/index.html");

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderDoc(doc) {
  const sections = doc.sections
    .map(
      (s, i) =>
        `        <section>\n          <h2>${i + 1}. ${escapeHtml(
          s.title,
        )}</h2>\n          <p style="white-space: pre-line;">${escapeHtml(
          s.content,
        )}</p>\n        </section>`,
    )
    .join("\n");

  return `      <main style="max-width: 720px; margin: 0 auto; padding: 48px 24px; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #1a1a1a;">
        <p><a href="/">← Voltar ao site LexLaboral</a></p>
        <h1>${escapeHtml(doc.title)}</h1>
        <p>Última atualização: ${escapeHtml(doc.lastUpdated)}</p>
${sections}
        <p>Em caso de dúvidas sobre este documento, entre em contato pelo e-mail <a href="mailto:contato@lexlaboral.com.br">contato@lexlaboral.com.br</a>.</p>
        <p><a href="/privacidade">Política de Privacidade</a> · <a href="/termos">Termos de Uso</a> · <a href="/lgpd">Política de Proteção de Dados (LGPD)</a></p>
      </main>`;
}

// Páginas de SEO da calculadora: mesmo princípio das legais, renderer próprio.
// O conteúdo vem do módulo de dados que as páginas React também consomem, então
// o HTML servido ao buscador não diverge do que o usuário vê.
function renderSeoPage(page) {
  const sections = page.sections
    .map(
      (s) =>
        `        <section>\n          <h2>${escapeHtml(
          s.title,
        )}</h2>\n          <p style="white-space: pre-line;">${escapeHtml(
          s.content,
        )}</p>\n        </section>`,
    )
    .join("\n");

  const faq = page.faq
    .map(
      (item) =>
        `        <section>\n          <h3>${escapeHtml(
          item.question,
        )}</h3>\n          <p style="white-space: pre-line;">${escapeHtml(
          item.answer,
        )}</p>\n        </section>`,
    )
    .join("\n");

  const faqJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });

  return `      <main style="max-width: 720px; margin: 0 auto; padding: 48px 24px; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #1a1a1a;">
        <p><a href="/">← Voltar ao site LexLaboral</a></p>
        <h1>${escapeHtml(page.title)}</h1>
        <p style="white-space: pre-line;">${escapeHtml(page.intro)}</p>
        <p><a href="/calculadora">Calcule a sua rescisão agora</a></p>
${sections}
        <h2>Perguntas frequentes</h2>
${faq}
        <script type="application/ld+json">${faqJsonLd}</script>
      </main>`;
}

// Domínio de produção. Configurável porque o repo não o guarda em lugar
// nenhum — o build de produção deve exportar SITE_URL.
const siteUrl = (process.env.SITE_URL ?? "https://lexlaboral.com.br")
  .trim()
  .replace(/\/$/, "");

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

/**
 * Troca título, descrição, canonical, og: e twitter: da página estática.
 *
 * Sem a troca de `canonical`/`og:url`, toda página gerada aqui herdava as tags
 * da raiz e se declarava como sendo a home — o buscador via cinco URLs
 * afirmando serem a mesma, e a página de conteúdo perdia para a landing.
 */
function applyTemplate(template, { title, description, rootHtml, path = "/" }) {
  const url = `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const safeTitle = escapeAttr(title);
  const safeDescription = escapeAttr(description);

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta\s+name="description"[\s\S]*?>/,
      `<meta name="description" content="${safeDescription}" />`,
    )
    .replace(
      /<link\s+rel="canonical"[\s\S]*?>/,
      `<link rel="canonical" href="${url}" />`,
    )
    .replace(
      /<meta\s+property="og:url"[\s\S]*?>/,
      `<meta property="og:url" content="${url}" />`,
    )
    .replace(
      /<meta\s+property="og:title"[\s\S]*?\/>/,
      `<meta property="og:title" content="${safeTitle}" />`,
    )
    .replace(
      /<meta\s+property="og:description"[\s\S]*?\/>/,
      `<meta property="og:description" content="${safeDescription}" />`,
    )
    .replace(
      /<meta\s+name="twitter:title"[\s\S]*?\/>/,
      `<meta name="twitter:title" content="${safeTitle}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"[\s\S]*?\/>/,
      `<meta name="twitter:description" content="${safeDescription}" />`,
    )
    .replace(
      /<div id="root">[\s\S]*?<\/div>/,
      `<div id="root">\n${rootHtml}\n    </div>`,
    );
}

async function main() {
  const vite = await createServer({
    root,
    logLevel: "warn",
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    // We only ssrLoadModule a single data file — skip dependency discovery /
    // pre-bundling entirely to avoid a noisy (harmless) abort on close.
    optimizeDeps: { noDiscovery: true, include: [] },
  });

  try {
    const { privacyDoc, termsDoc, lgpdDoc } = await vite.ssrLoadModule(
      "/src/pages/landing/legal/content.ts",
    );

    const template = await readFile(distIndex, "utf8");

    const routes = [
      {
        path: "privacidade",
        doc: privacyDoc,
        title:
          "Política de Privacidade — LexLaboral",
        description:
          "Como o LexLaboral coleta, usa, armazena e compartilha seus dados, incluindo os dados do Google Calendar, sob Uso Limitado.",
      },
      {
        path: "termos",
        doc: termsDoc,
        title: "Termos de Uso — LexLaboral",
        description:
          "Termos de Uso da plataforma LexLaboral para advogados trabalhistas.",
      },
      {
        path: "lgpd",
        doc: lgpdDoc,
        title: "Política de Proteção de Dados (LGPD) — LexLaboral",
        description:
          "Política de Proteção de Dados (LGPD) do LexLaboral: bases legais, direitos do titular e medidas de segurança.",
      },
    ];

    for (const route of routes) {
      const html = applyTemplate(template, {
        title: route.title,
        description: route.description,
        rootHtml: renderDoc(route.doc),
        path: `/${route.path}`,
      });
      const outFile = resolve(root, "dist", route.path, "index.html");
      await mkdir(dirname(outFile), { recursive: true });
      await writeFile(outFile, html, "utf8");
      console.log(`prerendered /${route.path} -> dist/${route.path}/index.html`);
    }

    const { seoPages } = await vite.ssrLoadModule(
      "/src/pages/landing/calculadora/content.ts",
    );

    for (const page of seoPages) {
      const html = applyTemplate(template, {
        title: page.metaTitle,
        description: page.metaDescription,
        rootHtml: renderSeoPage(page),
        path: `/calculadora/${page.slug}`,
      });
      const outFile = resolve(
        root,
        "dist",
        "calculadora",
        page.slug,
        "index.html",
      );
      await mkdir(dirname(outFile), { recursive: true });
      await writeFile(outFile, html, "utf8");
      console.log(
        `prerendered /calculadora/${page.slug} -> dist/calculadora/${page.slug}/index.html`,
      );
    }

    // Landing do trabalhador: mesmo princípio das de SEO — HTML servido antes
    // do JavaScript, montado a partir do módulo de dados que a página consome.
    const worker = await vite.ssrLoadModule(
      "/src/pages/landing/trabalhador/content.ts",
    );

    const workerHtml = applyTemplate(template, {
      title: "Calculadora de rescisão grátis para trabalhadores",
      description:
        "Descubra quanto você tem a receber na rescisão: sete perguntas, resultado com o artigo de lei de cada verba. Grátis e sem cadastro.",
      rootHtml: renderSeoPage({
        title: worker.hero.title,
        intro: worker.hero.subtitle,
        sections: worker.steps.map((s) => ({
          title: s.title,
          content: s.description,
        })),
        faq: worker.faq,
      }),
      path: "/trabalhador",
    });

    const workerFile = resolve(root, "dist", "trabalhador", "index.html");
    await mkdir(dirname(workerFile), { recursive: true });
    await writeFile(workerFile, workerHtml, "utf8");
    console.log("prerendered /trabalhador -> dist/trabalhador/index.html");

    // Landing de empresas e RH.
    const rh = await vite.ssrLoadModule("/src/pages/landing/rh/content.ts");

    const rhHtml = applyTemplate(template, {
      title: "Quanto custa desligar um funcionário — calculadora grátis",
      description:
        "Custo do desligamento com encargos e exposição em caso de reclamação trabalhista, com o fundamento legal de cada verba. Grátis, sem cadastro.",
      rootHtml: renderSeoPage({
        title: rh.hero.title,
        intro: rh.hero.subtitle,
        sections: [
          ...rh.numbers.map((n) => ({ title: n.title, content: n.description })),
          ...rh.risks.map((r) => ({ title: r.title, content: r.description })),
        ],
        faq: rh.faq,
      }),
      path: "/rh",
    });

    const rhFile = resolve(root, "dist", "rh", "index.html");
    await mkdir(dirname(rhFile), { recursive: true });
    await writeFile(rhFile, rhHtml, "utf8");
    console.log("prerendered /rh -> dist/rh/index.html");

    // Página de API: o HTML cru importa aqui porque quem busca "API cálculo
    // trabalhista" precisa achar a página antes de o JavaScript rodar.
    const api = await vite.ssrLoadModule("/src/pages/landing/api/content.ts");

    const apiHtml = applyTemplate(template, {
      title: "API de cálculo trabalhista — LexLaboral",
      description:
        "Integre a liquidação trabalhista do LexLaboral na sua aplicação: um POST, resposta com verbas, correção, juros e fundamento legal. Ambiente de teste que não cobra.",
      rootHtml: renderSeoPage({
        title: api.hero.title,
        intro: api.hero.subtitle,
        sections: api.steps.map((step) => ({
          title: step.title,
          content: step.description,
        })),
        faq: api.faq,
      }),
      path: "/api",
    });

    const apiFile = resolve(root, "dist", "api", "index.html");
    await mkdir(dirname(apiFile), { recursive: true });
    await writeFile(apiFile, apiHtml, "utf8");
    console.log("prerendered /api -> dist/api/index.html");

    // `/metodologia` fica de fora de propósito: é página de auditoria interna,
    // sem link em lugar nenhum e fora do sitemap. Só se chega por URL direta.
    const paths = [
      "/",
      "/trabalhador",
      "/rh",
      "/calculadora",
      "/rh/calculadora",
      ...seoPages.map((page) => `/calculadora/${page.slug}`),
      "/privacidade",
      "/termos",
      "/lgpd",
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join("\n")}
</urlset>
`;

    await writeFile(resolve(root, "dist/sitemap.xml"), sitemap, "utf8");
    console.log("generated dist/sitemap.xml");

    const robots = `User-agent: *
Allow: /
Disallow: /metodologia

Sitemap: ${siteUrl}/sitemap.xml
`;

    await writeFile(resolve(root, "dist/robots.txt"), robots, "utf8");
    console.log("generated dist/robots.txt");
  } finally {
    await vite.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
