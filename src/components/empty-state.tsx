import { HelpCircleIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Action = {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
};

// Standardized empty state that teaches: icon + title + explanation + primary
// action (+ optional secondary/help link). Replaces bare "Nenhum X" messages.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondary,
  helpArticle,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: Action;
  secondary?: ReactNode;
  /** Slug de artigo da Central de Ajuda; vira o link "Como funciona". */
  helpArticle?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {description}
        </p>
      )}
      {(action || secondary) && (
        <div className="flex items-center gap-2 mt-4">
          {action && (
            <Button size="sm" onClick={action.onClick}>
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </Button>
          )}
          {secondary}
        </div>
      )}
      {/* Fora do bloco de ações de propósito: uma lista filtrada vazia não tem
          CTA e ainda assim merece o caminho de aprendizado. */}
      {helpArticle && (
        <Link
          to={`/ajuda?artigo=${helpArticle}`}
          className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary hover:underline"
        >
          <HelpCircleIcon className="w-3.5 h-3.5" />
          Como funciona
        </Link>
      )}
    </div>
  );
}
