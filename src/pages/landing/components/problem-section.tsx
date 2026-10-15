import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { problemBridge, problemPoints } from "../constants";
import { SectionHeading } from "./section-heading";

/**
 * Seção de identificação, não de medo: descreve a rotina da planilha como ela é
 * e emenda no que o produto faz. Sem número de tempo perdido — ninguém mediu.
 */
export function ProblemSection() {
  return (
    <section className="border-border/50 border-y bg-muted/20 px-4 py-16 md:py-24">
      <div className="container mx-auto">
        <SectionHeading
          eyebrow="O de sempre"
          title="A conta está certa. Provar isso é que dá trabalho."
          description="Enquanto o cálculo vive numa planilha e o processo vive em outro lugar, cada pergunta do cliente vira retrabalho."
        />

        <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {problemPoints.map((point, index) => (
            <motion.li
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              viewport={{ once: true, margin: "-60px" }}
              className="rounded-2xl border border-border/60 bg-card p-5"
            >
              <h3 className="font-semibold text-base tracking-tight">
                {point.title}
              </h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {point.description}
              </p>
            </motion.li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          viewport={{ once: true }}
          className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-4 text-center"
        >
          <ArrowDown
            aria-hidden="true"
            className="size-5 text-muted-foreground/60"
          />
          <p className="text-balance font-medium text-base text-foreground leading-relaxed md:text-lg">
            {problemBridge}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
