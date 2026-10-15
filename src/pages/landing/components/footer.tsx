import { Link } from "react-router-dom";
import { AUDIENCES } from "../audiences";
import { seoPages } from "../calculadora/content";
import { scrollToSection } from "../utils/scroll";

/**
 * O rodapé perdeu os ícones de rede social: os três apontavam para a raiz do
 * Instagram, do LinkedIn e do YouTube, sem perfil nenhum do outro lado. Link
 * que não leva a lugar algum custa confiança justamente onde a página pede
 * confiança. Voltam quando os perfis existirem.
 */

const PRODUCT_LINKS = [
  { id: "como-funciona", label: "Como funciona" },
  { id: "features", label: "Funcionalidades" },
  { id: "seguranca", label: "Confiança e segurança" },
  { id: "precos", label: "Preços" },
  { id: "faq", label: "Perguntas frequentes" },
];

const CONTACT_EMAIL = "contato@lexlaboral.com.br";

export function Footer() {
  return (
    <footer className="border-border/50 border-t bg-muted/20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm">
                LL
              </span>
              <span className="font-bold text-lg">LexLaboral</span>
            </div>
            <p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
              Cálculo trabalhista com a conta aberta, e a gestão do caso no
              mesmo lugar.
            </p>
          </div>

          <div>
            <h2 className="mb-4 font-semibold text-sm">Produto</h2>
            <ul className="space-y-2.5 text-muted-foreground text-sm">
              {/* Link com hash, não botão de rolagem: o mesmo rodapé aparece nas
                  landings do trabalhador e de RH, onde essas seções não existem
                  — ali o clique precisa levar para a página do advogado, e não
                  morrer em silêncio. A landing lê o hash ao montar. */}
              {PRODUCT_LINKS.map((link) => (
                <li key={link.id}>
                  <Link
                    to={`/#${link.id}`}
                    className="text-left transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {/* Item na coluna existente, não coluna nova: o grid é de cinco
                  colunas e uma sexta quebraria o alinhamento. */}
              <li>
                <Link
                  to="/api"
                  className="transition-colors hover:text-foreground"
                >
                  API para desenvolvedores
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-semibold text-sm">Para quem</h2>
            <ul className="space-y-2.5 text-muted-foreground text-sm">
              {AUDIENCES.map((audience) => (
                <li key={audience.id}>
                  {audience.soon ? (
                    <span className="text-muted-foreground/70">
                      {audience.navLabel} · em breve
                    </span>
                  ) : (
                    <Link
                      to={audience.path}
                      className="transition-colors hover:text-foreground"
                    >
                      {audience.navLabel}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-semibold text-sm">Calculadoras grátis</h2>
            <ul className="space-y-2.5 text-muted-foreground text-sm">
              {seoPages.map((page) => (
                <li key={page.slug}>
                  <Link
                    to={`/calculadora/${page.slug}`}
                    className="transition-colors hover:text-foreground"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-semibold text-sm">Legal e contato</h2>
            <ul className="space-y-2.5 text-muted-foreground text-sm">
              <li>
                <Link
                  to="/privacidade"
                  className="transition-colors hover:text-foreground"
                >
                  Privacidade
                </Link>
              </li>
              <li>
                <Link
                  to="/termos"
                  className="transition-colors hover:text-foreground"
                >
                  Termos de uso
                </Link>
              </li>
              <li>
                <Link
                  to="/lgpd"
                  className="transition-colors hover:text-foreground"
                >
                  LGPD
                </Link>
              </li>
              <li>
                {/* O e-mail é uma palavra só e estourava a coluna no celular,
                    empurrando a página inteira para o lado. */}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="break-all transition-colors hover:text-foreground"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-border/50 border-t pt-6 md:flex-row">
          <p className="text-muted-foreground text-xs">
            © 2026 LexLaboral. Ferramenta de apoio ao trabalho do advogado — não
            substitui a análise profissional do caso.
          </p>
          <button
            type="button"
            onClick={(event) => scrollToSection("top", event)}
            className="text-muted-foreground text-xs transition-colors hover:text-primary"
          >
            Voltar ao topo
          </button>
        </div>
      </div>
    </footer>
  );
}
