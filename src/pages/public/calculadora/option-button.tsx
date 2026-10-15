import { CheckIcon } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

// Botão de opção grande e clicável, com marca de seleção além da cor — cor
// sozinha não é sinal acessível. Compartilhado pelo wizard de rescisão e pelas
// calculadoras por verba.
export function OptionButton({
	selected,
	onClick,
	children,
}: {
	selected: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={selected}
			className={cn(
				"flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
				selected
					? "border-primary bg-primary/5 font-medium text-foreground"
					: "border-border bg-background hover:bg-muted",
			)}
		>
			<span>{children}</span>
			{selected && <CheckIcon className="size-4 shrink-0 text-primary" />}
		</button>
	);
}
