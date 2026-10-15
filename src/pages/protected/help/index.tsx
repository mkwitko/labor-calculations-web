import Fuse from "fuse.js";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  HeadphonesIcon,
  FolderOpenIcon,
  PlayCircleIcon,
  SearchIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOUR_AREAS, useProductTour } from "@/hooks/use-product-tour";
import { cn } from "@/lib/utils";
import { HELP_ARTICLES, HELP_CATEGORIES, type HelpArticle } from "./articles";

// Renders the lightweight markdown used in article bodies: ## headings,
// - bullets, **bold** and paragraphs.
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: static split
      <strong key={i} className="font-semibold text-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      p
    ),
  );
}

function ArticleBody({ body }: { body: string }) {
  const lines = body.split("\n");
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul
          key={`ul-${blocks.length}`}
          className="list-disc pl-5 space-y-1 text-sm text-foreground/90"
        >
          {bullets.map((b, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            <li key={i}>{renderInline(b)}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("## ")) {
      flush();
      blocks.push(
        <h2
          key={`h-${blocks.length}`}
          className="text-base font-semibold text-foreground mt-5 mb-1"
        >
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("- ")) {
      bullets.push(line.slice(2));
    } else if (line.trim() === "") {
      flush();
    } else {
      flush();
      blocks.push(
        <p
          key={`p-${blocks.length}`}
          className="text-sm text-foreground/90 leading-relaxed"
        >
          {renderInline(line)}
        </p>,
      );
    }
  }
  flush();

  return <div className="space-y-2">{blocks}</div>;
}

export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const slugFromUrl = searchParams.get("artigo");
  const [active, setActive] = useState<HelpArticle | null>(
    () => HELP_ARTICLES.find((a) => a.slug === slugFromUrl) ?? null,
  );
  const { start, replayTour } = useProductTour();
  const navigate = useNavigate();

  // A URL é a fonte quando ela nomeia um artigo: um link vindo de um empty
  // state precisa abrir direto no conteúdo, sem passar pela grade.
  useEffect(() => {
    if (!slugFromUrl) return;
    const found = HELP_ARTICLES.find((a) => a.slug === slugFromUrl);
    if (found) setActive(found);
  }, [slugFromUrl]);

  const fuse = useMemo(
    () =>
      new Fuse(HELP_ARTICLES, {
        keys: ["title", "summary", "body", "category"],
        threshold: 0.4,
      }),
    [],
  );

  const searched = query.trim()
    ? fuse.search(query).map((r) => r.item)
    : HELP_ARTICLES;
  const results =
    category && !query.trim()
      ? searched.filter((a) => a.category === category)
      : searched;

  if (active) {
    return (
      <div className="p-4 md:p-6 mx-auto space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setActive(null);
            // Sem limpar o parâmetro, o efeito acima reabriria o artigo.
            if (slugFromUrl) setSearchParams({}, { replace: true });
          }}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Voltar
        </Button>
        <div>
          <p className="text-xs font-medium text-primary uppercase tracking-wide">
            {active.category}
          </p>
          <h1 className="text-2xl font-semibold text-foreground mt-1">
            {active.title}
          </h1>
        </div>
        <ArticleBody body={active.body} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 mx-auto space-y-5">
      <PageHeader
        title="Central de Ajuda"
        subtitle="Tutoriais e respostas para usar a plataforma"
        actions={
          <Button variant="outline" size="sm" onClick={start}>
            <PlayCircleIcon className="w-4 h-4" />
            Tour de boas-vindas
          </Button>
        }
      />

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ajuda..."
          className="pl-9"
        />
      </div>

      {!query.trim() && (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-colors",
              category === null
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            Todos
          </button>
          {HELP_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-colors",
                category === c
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {!query.trim() && (
        <Link
          to="/ajuda/exemplo"
          className="block bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            <FolderOpenIcon className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Ver um caso de exemplo
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Um processo fictício já povoado — cálculo, audiência, prazo,
            documento e honorário — para você ver como tudo se encaixa.
          </p>
        </Link>
      )}

      {!query.trim() && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <PlayCircleIcon className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Refazer tours guiados
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Reveja o passo a passo de cada área quando quiser.
          </p>
          <div className="flex flex-wrap gap-2">
            {TOUR_AREAS.map((t) => (
              <Button
                key={t.area}
                variant="outline"
                size="sm"
                title={t.hint}
                onClick={() => {
                  replayTour(t.area);
                  navigate(t.route);
                }}
              >
                <PlayCircleIcon className="w-4 h-4" />
                {t.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {results.map((a) => (
          <button
            key={a.slug}
            type="button"
            onClick={() => setActive(a)}
            className={cn(
              "text-left bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors",
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <BookOpenIcon className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wide">
                {a.category}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">{a.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{a.summary}</p>
          </button>
        ))}
        {results.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full py-8 text-center">
            Nenhum artigo encontrado.
          </p>
        )}
      </div>

      {/* Saída para quem não achou resposta aqui. Antes desta ponte, a Central
          de Ajuda era um beco: artigo que não respondia terminava em nada. */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold text-foreground text-sm">
            Não achou o que precisava?
          </p>
          <p className="text-muted-foreground text-xs">
            Fale direto com quem faz o LexLaboral — dúvida, problema ou
            sugestão.
          </p>
        </div>
        <Button onClick={() => navigate("/suporte")}>
          <HeadphonesIcon className="w-4 h-4" />
          Falar com o suporte
        </Button>
      </div>
    </div>
  );
}
