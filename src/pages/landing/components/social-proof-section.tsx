import { legalFoundations } from "../constants";

/**
 * A faixa de "prova" que temos hoje: a base legal que o motor aplica. Não é
 * logotipo de cliente nem selo de certificação — nenhum dos dois existe, e
 * inventá-los seria a única coisa que a landing não pode fazer.
 */
export function SocialProofSection() {
  return (
    <section className="border-border/50 border-y bg-background px-4 py-10">
      <div className="container mx-auto">
        <p className="text-center font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
          Cálculos fundamentados na legislação e na jurisprudência
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12">
          {legalFoundations.map((item) => (
            <li
              key={item.abbr}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-1 font-bold text-[10px] tracking-wide">
                {item.abbr}
              </span>
              <span className="hidden font-medium text-sm sm:inline">
                {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
