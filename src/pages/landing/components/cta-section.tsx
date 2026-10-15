import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { heroReassurances } from "../constants";

/**
 * Fechamento. A versão anterior prometia "calcular 10x mais rápido" e convidava
 * a "juntar-se aos advogados que já economizam horas" — as duas coisas são
 * número e prova social que não existem. O convite aqui é o que a página pode
 * cumprir: entrar, fazer um cálculo e conferir a conta.
 */
export function CTASection() {
  return (
    <section className="px-4 py-20 md:py-28">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true, margin: "-80px" }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center md:px-12 md:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              color: "var(--color-primary-foreground)",
            }}
          />

          <div className="relative">
            <h2 className="text-balance font-bold text-2xl text-primary-foreground leading-tight tracking-tight md:text-4xl">
              Faça o primeiro cálculo hoje e confira a conta
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-balance text-primary-foreground/70 leading-relaxed md:text-lg">
              São 7 dias com a plataforma inteira liberada. Se a conta não
              convencer você, não convence o juízo — e você não pagou nada para
              descobrir.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/authentication/sign-up"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-foreground px-8 py-3.5 font-semibold text-base text-primary shadow-lg transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                Começar 7 dias grátis
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/calculadora"
                className="inline-flex w-full items-center justify-center rounded-xl border border-primary-foreground/25 px-8 py-3.5 font-medium text-base text-primary-foreground/85 transition-colors hover:bg-primary-foreground/10 sm:w-auto"
              >
                Testar a calculadora grátis
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {heroReassurances.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-primary-foreground/70 text-sm"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-4 text-primary-foreground/60"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-8 text-primary-foreground/60 text-sm">
              Já tem conta?{" "}
              <Link
                to="/authentication"
                className="font-medium text-primary-foreground underline underline-offset-4"
              >
                Entrar
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
