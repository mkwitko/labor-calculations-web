import { motion } from "framer-motion";
import { Check, Sparkles, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  describePlan,
  formatBRL,
  type PlanInterval,
  seatLabel,
  usePlans,
} from "@/hooks/use-plans";
import { pricingPlans } from "../constants";
import { SectionHeading } from "./section-heading";

/**
 * Valor exibido vem do Stripe, sempre. Quando o preço não pode ser lido, a
 * seção diz isso — nunca mostra um número de reserva, porque preço errado numa
 * página de vendas é promessa que a fatura desmente.
 */

function IntervalToggle({
  interval,
  onChange,
}: {
  interval: PlanInterval;
  onChange: (interval: PlanInterval) => void;
}) {
  return (
    <div
      className="inline-flex items-center p-1 rounded-full border border-border/50 bg-muted/30"
      role="group"
      aria-label="Periodicidade da cobrança"
    >
      {(
        [
          { id: "monthly" as const, label: "Mensal" },
          { id: "yearly" as const, label: "Anual" },
        ] satisfies Array<{ id: PlanInterval; label: string }>
      ).map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={interval === option.id}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            interval === option.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function PricingSection() {
  const [interval, setInterval] = useState<PlanInterval>("monthly");
  const { planByCode, extraMember, isLoading, isUnavailable } = usePlans();

  const extraPrice = extraMember[interval];

  return (
    <section
      id="precos"
      className="border-border/50 border-y bg-muted/20 px-4 py-16 md:py-24"
    >
      <div className="container mx-auto">
        <SectionHeading
          eyebrow="Preços"
          title="Um plano por escritório"
          description="A mensalidade é do escritório, não por cabeça. Escolha pelo tamanho do time e comece com 7 dias grátis."
          className="mb-8 md:mb-10"
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-10 text-center md:mb-14"
        >
          <IntervalToggle interval={interval} onChange={setInterval} />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
          {pricingPlans.map((copy, index) => {
            const plan = planByCode(copy.code);
            const display = plan ? describePlan(plan, interval) : null;

            return (
              <motion.div
                key={copy.code}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="relative flex mt-5"
              >
                {copy.popular && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3.5 py-1 bg-primary text-primary-foreground text-[11px] font-semibold rounded-full shadow-lg shadow-primary/25 whitespace-nowrap"
                  >
                    <Sparkles className="w-3 h-3" />
                    Mais Popular
                  </motion.div>
                )}

                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`relative flex w-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl ${
                    copy.popular
                      ? "border-primary/30 shadow-lg shadow-primary/10 hover:shadow-primary/15"
                      : "border-border/40 shadow-sm hover:shadow-md"
                  }`}
                >
                  {display?.savingsBadge && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/15">
                      <Check className="w-3 h-3" />
                      {display.savingsBadge}
                    </div>
                  )}

                  <div className="px-6 pt-8 pb-6 border-b border-border/30">
                    <div className="text-xs font-semibold uppercase tracking-widest mb-1 text-muted-foreground">
                      {plan?.name ?? copy.code}
                    </div>
                    <p className="text-sm mb-5 text-muted-foreground min-h-10">
                      {copy.description}
                    </p>

                    {isLoading && (
                      <div
                        className="h-12 w-40 rounded-lg bg-muted animate-pulse"
                        aria-label="Carregando preço"
                      />
                    )}

                    {!isLoading && display && (
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold leading-none tracking-tight">
                          {display.headline}
                        </span>
                        <span className="text-base mb-1 text-muted-foreground">
                          {display.period}
                        </span>
                      </div>
                    )}

                    {!isLoading && !display && (
                      <p className="text-base font-semibold text-foreground">
                        Preço sob consulta
                      </p>
                    )}

                    <p className="text-xs mt-2 text-muted-foreground h-4 leading-4">
                      {display?.footnote ?? ""}
                    </p>

                    {plan && (
                      <div className="mt-5 flex items-center gap-1.5 rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-xs font-semibold text-foreground">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        {seatLabel(plan.maxMembers)}
                      </div>
                    )}

                    {plan?.allowsExtraMembers && extraPrice && (
                      <div className="mt-2 flex items-center gap-1.5 px-3 text-xs text-muted-foreground">
                        <UserPlus className="w-3.5 h-3.5" />
                        Depois disso, {formatBRL(extraPrice.amountCents)} por
                        advogado
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-6 flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1">
                      {copy.features.map((feature, i) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -6 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.03 }}
                          viewport={{ once: true }}
                          className="flex items-center gap-3"
                        >
                          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Check className="size-3 text-primary" />
                          </div>
                          <span className="text-sm text-foreground">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    <Link to="/authentication/sign-up" className="mt-8 block">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                          copy.popular
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                            : "bg-primary/8 text-primary hover:bg-primary/15 border border-primary/15"
                        }`}
                      >
                        {copy.cta}
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          {isUnavailable
            ? "Fale com a gente para conhecer os valores atualizados."
            : "7 dias grátis · Sem cartão de crédito · Cancele quando quiser"}
        </motion.p>
      </div>
    </section>
  );
}
