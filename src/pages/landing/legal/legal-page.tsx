import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  sections: {
    title: string;
    content: string;
  }[];
}

export function LegalPage({ title, lastUpdated, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 ">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Última atualização: {lastUpdated}
          </p>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <h2 className="text-lg font-semibold tracking-tight mb-3">
                  {index + 1}. {section.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground">
              Em caso de dúvidas sobre este documento, entre em contato pelo
              e-mail{" "}
              <a
                href="mailto:contato@lexlaboral.com.br"
                className="text-primary hover:underline"
              >
                contato@lexlaboral.com.br
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
