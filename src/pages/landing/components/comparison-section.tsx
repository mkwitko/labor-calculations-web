import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { comparisonItems } from "../constants";
import { SectionHeading } from "./section-heading";

/**
 * Planilha × LexLaboral.
 *
 * A tabela antiga prometia "2-4 horas por cálculo" e fechava com "baseado na
 * média de advogados trabalhistas brasileiros" — número que ninguém mediu e
 * fonte que não existe. Aqui a comparação é qualitativa: o que muda na rotina,
 * não quanto tempo alguém alegou economizar.
 */
export function ComparisonSection() {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="container mx-auto">
        <SectionHeading
          eyebrow="Comparação"
          title="Planilha e LexLaboral, lado a lado"
          description="A diferença não é o cálculo em si — é conseguir mostrar de onde ele veio meses depois."
        />

        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-card">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Comparação entre fazer o cálculo em planilha e fazer no LexLaboral
            </caption>
            <thead className="hidden sm:table-header-group">
              <tr className="bg-muted/40">
                <th
                  scope="col"
                  className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider sm:px-6"
                >
                  Na rotina
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider sm:table-cell sm:px-6"
                >
                  Planilha
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left font-semibold text-primary text-xs uppercase tracking-wider sm:table-cell sm:px-6"
                >
                  LexLaboral
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonItems.map((item) => (
                <tr
                  key={item.feature}
                  className="block border-border/50 border-t p-4 align-top sm:table-row sm:p-0"
                >
                  <th
                    scope="row"
                    className="block text-left font-medium text-foreground sm:table-cell sm:px-6 sm:py-4"
                  >
                    {item.feature}
                  </th>
                  <td className="block pt-3 text-muted-foreground sm:table-cell sm:px-6 sm:py-4 sm:pt-4">
                    <span className="mb-1 block font-semibold text-[11px] uppercase tracking-wider sm:hidden">
                      Planilha
                    </span>
                    <span className="flex items-start gap-2">
                      <Minus
                        aria-hidden="true"
                        className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50"
                      />
                      {item.manual}
                    </span>
                  </td>
                  <td className="block pt-3 text-foreground sm:table-cell sm:px-6 sm:py-4 sm:pt-4">
                    <span className="mb-1 block font-semibold text-[11px] text-primary uppercase tracking-wider sm:hidden">
                      LexLaboral
                    </span>
                    <span className="flex items-start gap-2">
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 size-3.5 shrink-0 text-primary"
                      />
                      {item.lexlaboral}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mx-auto mt-6 max-w-2xl text-center text-muted-foreground text-sm"
        >
          O LexLaboral é ferramenta de apoio ao seu trabalho: a conta é aberta
          justamente para você conferir e assumir cada número.
        </motion.p>
      </div>
    </section>
  );
}
