import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { faqs } from "../constants";
import { SectionHeading } from "./section-heading";

/**
 * O JSON-LD sai da mesma lista que a página desenha — duas cópias divergiriam
 * na primeira resposta editada, e resposta rica no Google contando algo que a
 * página não diz é pior do que não ter resposta rica nenhuma.
 */
const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
});

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 6) * 0.03, duration: 0.3 }}
      viewport={{ once: true }}
      className="border-border/50 border-b last:border-0"
    >
      <h3>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="group flex w-full items-center justify-between gap-4 py-5 text-left"
        >
          <span className="font-medium text-[15px] transition-colors group-hover:text-primary">
            {question}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`size-4 shrink-0 text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted-foreground text-sm leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-2xl">
        <SectionHeading
          eyebrow="FAQ"
          title="Perguntas frequentes"
          description="As dúvidas que aparecem antes de criar a conta."
        />

        <div className="rounded-2xl border border-border/60 bg-card px-5 sm:px-6">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              index={index}
            />
          ))}
        </div>

        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD estático, sem entrada do usuário
          dangerouslySetInnerHTML={{ __html: faqJsonLd }}
        />
      </div>
    </section>
  );
}
