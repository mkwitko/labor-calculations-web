import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { googleDisclosure, methodologyNote, trustPillars } from "../constants";
import { SectionHeading } from "./section-heading";

/**
 * A seção de confiança. Sem depoimento, sem selo e sem número de clientes:
 * enquanto não houver prova social real, o que sustenta a página é o que dá
 * para verificar — a conta aberta, a procedência do índice, o isolamento por
 * organização e o controle de acesso.
 *
 * A divulgação do Google Calendar mora aqui de propósito. É exigência da
 * política de dados do Google que a página inicial diga quais dados a
 * integração acessa, e ela some junto se alguém remover a seção.
 */
export function TrustSection() {
  return (
    <section id="seguranca" className="px-4 py-16 md:py-24">
      <div className="container mx-auto">
        <SectionHeading
          eyebrow="Confiança"
          title="Por que confiar no número que sai daqui"
          description="Não por promessa de precisão: porque a conta fica aberta, o índice tem procedência e o dado tem dono."
        />

        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
          {trustPillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              viewport={{ once: true, margin: "-60px" }}
              className="rounded-2xl border border-border/60 bg-card p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8">
                <pillar.icon aria-hidden="true" className="size-5 text-primary" />
              </span>
              <h3 className="mt-4 font-semibold text-base tracking-tight">
                {pillar.title}
              </h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-muted-foreground text-sm leading-relaxed">
          {methodologyNote}
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mx-auto mt-12 max-w-5xl rounded-2xl border border-border/60 bg-muted/20 p-6 md:p-8"
        >
          <h3 className="font-semibold text-base tracking-tight">
            {googleDisclosure.title}
          </h3>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {googleDisclosure.points.map((point) => (
              <li key={point.text} className="flex items-start gap-3">
                <point.icon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <span className="text-muted-foreground text-sm leading-relaxed">
                  {point.text}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-muted-foreground text-xs leading-relaxed">
            O uso e a transferência de informações recebidas das APIs do Google
            obedecem à{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Política de Dados de Usuário dos Serviços de API do Google
            </a>
            , incluindo os requisitos de Uso Limitado. Saiba mais na{" "}
            <Link to="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </section>
  );
}
