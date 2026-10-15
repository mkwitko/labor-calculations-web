import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Cabeçalho das seções da landing. Existe para que a página inteira tenha uma
 * régua tipográfica só — antes cada seção repetia o mesmo bloco com tamanhos e
 * espaçamentos ligeiramente diferentes, e a página parecia montada aos pedaços.
 *
 * `as` mantém a ordem dos títulos correta: a landing tem um `h1` no hero, e
 * toda seção abaixo dele começa em `h2`.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true, margin: "-80px" }}
      className={cn(
        "mb-10 md:mb-14",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-[0.18em]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-balance font-bold text-2xl tracking-tight md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
          {description}
        </p>
      )}
    </motion.div>
  );
}
