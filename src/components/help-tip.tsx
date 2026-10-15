import { HelpCircleIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Inline contextual help. Use next to dense legal fields (art. 467, prescrição,
// equiparação, reflexos, ADC 58...) to explain what a field means.
export function HelpTip({
  title,
  children,
  learnMoreHref,
  className,
}: {
  title?: string;
  children: ReactNode;
  learnMoreHref?: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors align-middle",
            className,
          )}
          aria-label="Ajuda"
        >
          <HelpCircleIcon className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-w-xs text-sm">
        {title && <p className="font-semibold text-foreground mb-1">{title}</p>}
        <div className="text-muted-foreground leading-relaxed">{children}</div>
        {learnMoreHref && (
          <a
            href={learnMoreHref}
            className="text-primary text-xs mt-2 inline-block hover:underline"
          >
            Saber mais →
          </a>
        )}
      </PopoverContent>
    </Popover>
  );
}
