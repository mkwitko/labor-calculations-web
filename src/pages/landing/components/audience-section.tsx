import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { personas } from "../constants";
import { SectionHeading } from "./section-heading";

/**
 * Para quem a plataforma é. Vem depois da demonstração e da confiança de
 * propósito: quem chegou até aqui já sabe o que o produto faz e agora quer
 * saber se a descrição é dele.
 */
export function AudienceSection() {
  return (
    <section
      id="para-quem"
      className="border-border/50 border-y bg-muted/20 px-4 py-16 md:py-24"
    >
      <div className="container mx-auto">
        <SectionHeading
          eyebrow="Para quem é"
          title="Feito para quem responde pelo número"
          description="O mesmo motor atende do advogado sozinho ao jurídico que precisa provisionar a folha inteira."
        />

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              viewport={{ once: true, margin: "-60px" }}
              className="flex flex-col rounded-2xl border border-border/60 bg-card p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8">
                <persona.icon
                  aria-hidden="true"
                  className="size-5 text-primary"
                />
              </span>
              <h3 className="mt-4 font-semibold text-base tracking-tight">
                {persona.title}
              </h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {persona.description}
              </p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {persona.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="text-foreground text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>

              {persona.href && (
                <Link
                  to={persona.href}
                  className="group mt-6 inline-flex items-center gap-1.5 font-medium text-primary text-sm hover:underline"
                >
                  {persona.hrefLabel}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
