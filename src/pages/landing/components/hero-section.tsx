import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { heroCalculation, heroReassurances } from "../constants";
import { scrollToSection } from "../utils/scroll";
import { AppFrame, AppFrameRow } from "./app-frame";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 pt-28 pb-16 md:pt-36 md:pb-24">
      {/* Um único halo estático atrás do texto. O fundo antes tinha três blobs
          animando em laço infinito — custo de pintura constante no elemento que
          disputa o LCP com o próprio título. */}
      <div
        aria-hidden="true"
        className="-z-10 pointer-events-none absolute inset-0"
      >
        <div className="-translate-x-1/2 absolute top-0 left-1/2 h-[520px] w-[900px] max-w-[140vw] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="container mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.p
            variants={itemVariants}
            className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.18em]"
          >
            Cálculo e gestão trabalhista
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="mt-5 text-balance font-bold text-3xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
          >
            Cálculo trabalhista que você consegue{" "}
            <span className="text-primary underline decoration-primary/30 decoration-4 underline-offset-8">
              defender
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground leading-relaxed md:text-lg"
          >
            Calcule verbas, liquidação e passivo com correção monetária e juros,
            gere a peça a partir do cálculo e acompanhe prazos, audiências e
            clientes — tudo com a conta aberta, verba a verba, e o fundamento
            legal ao lado.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              to="/authentication/sign-up"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-base text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:shadow-xl sm:w-auto"
            >
              Começar 7 dias grátis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={() => scrollToSection("como-funciona")}
              className="inline-flex w-full items-center justify-center rounded-xl border border-border px-8 py-3.5 font-medium text-base text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:w-auto"
            >
              Ver como funciona
            </button>
          </motion.div>

          <motion.ul
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {heroReassurances.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 text-muted-foreground text-sm"
              >
                <CheckCircle2 className="size-4 text-primary" />
                {item}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mx-auto mt-14 max-w-3xl md:mt-20"
        >
          <AppFrame caption={`LexLaboral · ${heroCalculation.caseLabel}`}>
            <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {heroCalculation.summary.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-border/60 bg-muted/30 p-3"
                >
                  <div className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                    {card.label}
                  </div>
                  <div className="mt-1 font-bold text-foreground text-sm">
                    {card.value}
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    {card.sub}
                  </div>
                </div>
              ))}
            </div>

            <div>
              {heroCalculation.rows.map((row) => (
                <AppFrameRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                />
              ))}
              {heroCalculation.correction.map((row) => (
                <AppFrameRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  muted
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-border/60 border-t pt-4">
              <span className="font-semibold text-sm">
                Total com correção e juros
              </span>
              <span className="font-bold text-primary text-xl tabular-nums sm:text-2xl">
                {heroCalculation.total}
              </span>
            </div>
          </AppFrame>
        </motion.div>
      </div>
    </section>
  );
}
