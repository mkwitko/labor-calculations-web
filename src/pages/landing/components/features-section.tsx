import { motion } from "framer-motion";
import { calculators, featureGroups } from "../constants";
import { SectionHeading } from "./section-heading";

/**
 * Funcionalidades agrupadas pelo trabalho que resolvem — calcular, organizar,
 * produzir, escalar. Antes eram doze cartões soltos em grade: quem lia
 * terminava sabendo que o produto faz muita coisa, e não o que ele faz por ele.
 */
export function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-border/50 border-y bg-muted/20 px-4 py-16 md:py-24"
    >
      <div className="container mx-auto">
        <SectionHeading
          eyebrow="Recursos"
          title="Quatro trabalhos, uma plataforma"
          description="Tudo o que está listado aqui existe hoje no produto."
        />

        <div className="mx-auto max-w-5xl space-y-12 md:space-y-16">
          {featureGroups.map((group, groupIndex) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: groupIndex * 0.04 }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-card">
                  <group.icon aria-hidden="true" className="size-4 text-primary" />
                </span>
                <div>
                  <h3 className="font-bold text-lg tracking-tight">
                    {group.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {group.tagline}
                  </p>
                </div>
              </div>

              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {group.items.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-start gap-3">
                      <item.icon
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      />
                      <div>
                        <h4 className="font-semibold text-[15px] tracking-tight">
                          {item.title}
                        </h4>
                        <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mx-auto mt-14 max-w-4xl text-center"
        >
          <h3 className="font-semibold text-base tracking-tight">
            Verbas e adicionais que o motor cobre
          </h3>
          <ul className="mt-5 flex flex-wrap justify-center gap-2">
            {calculators.map((calc) => (
              <li
                key={calc.name}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm"
              >
                <calc.icon
                  aria-hidden="true"
                  className="size-3.5 text-muted-foreground"
                />
                {calc.name}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
