import { BookOpenIcon, CheckIcon, ScaleIcon, ShieldCheckIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Casca comum das calculadoras públicas: cabeçalho, trilha de passos e cartão
 * de confiança. As duas (trabalhador e RH) perguntam coisas diferentes, mas
 * quem chega não deveria sentir que trocou de produto no meio do caminho.
 */

/**
 * Trilha de passos: mostra onde a pessoa está e o que ainda vem. Passo já
 * respondido é clicável para voltar e corrigir; passo à frente, não — pular
 * pergunta produziria cálculo com campo em branco.
 */
export function StepRail({
	labels,
	current,
	onSelect,
	isComplete,
}: {
	labels: string[];
	current: number;
	onSelect: (step: number) => void;
	isComplete: (step: number) => boolean;
}) {
	return (
		<nav aria-label="Etapas do cálculo">
			<ol className="space-y-1">
				{labels.map((label, index) => {
					const isCurrent = index === current;
					const isDone = index < current && isComplete(index);
					const canGo = index < current;

					return (
						<li key={label}>
							<button
								type="button"
								disabled={!canGo}
								onClick={() => canGo && onSelect(index)}
								className={cn(
									"flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
									isCurrent && "bg-primary/8 font-medium text-foreground",
									!isCurrent && canGo && "text-muted-foreground hover:bg-muted",
									!isCurrent && !canGo && "text-muted-foreground/60",
								)}
							>
								<span
									className={cn(
										"flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
										isCurrent && "border-primary bg-primary/10 text-primary",
										isDone &&
											"border-primary bg-primary text-primary-foreground",
										!isCurrent && !isDone && "border-border",
									)}
								>
									{isDone ? <CheckIcon className="size-3" /> : index + 1}
								</span>
								{label}
							</button>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

/**
 * Quem chega aqui não tem como julgar se a conta está certa. O que pode julgar
 * é se a conta está aberta — por isso os três pontos são verificáveis, não
 * adjetivos.
 */
export function TrustCard({
	className,
	audience = "trabalhador",
}: {
	className?: string;
	audience?: "trabalhador" | "rh";
}) {
	return (
		<Card className={className}>
			<CardContent className="space-y-3">
				<p className="font-medium text-sm">Por que confiar neste número</p>
				<ul className="space-y-2.5 text-muted-foreground text-xs leading-relaxed">
					<li className="flex gap-2">
						<ScaleIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
						<span>
							{audience === "rh"
								? "É o mesmo motor de liquidação que advogados trabalhistas usam para instruir processo — inclusive do outro lado da mesa."
								: "É o mesmo motor de cálculo que advogados trabalhistas usam aqui dentro para instruir processo."}
						</span>
					</li>
					<li className="flex gap-2">
						<BookOpenIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
						<span>
							Correção monetária e juros pela ADC 58, com a conta inteira
							aberta verba a verba no resultado.
						</span>
					</li>
					<li className="flex gap-2">
						<ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
						<span>
							{audience === "rh"
								? "Cada verba vem com o artigo de lei que a sustenta, separando o que é devido do que depende de prova."
								: "Cada verba vem com o artigo de lei que a sustenta — e com a ressalva de quando depende de prova."}
						</span>
					</li>
				</ul>
			</CardContent>
		</Card>
	);
}

/** Duas colunas no desktop, coluna única no celular. */
export function WizardShell({
	title,
	subtitle,
	audience,
	rail,
	children,
}: {
	title: string;
	subtitle: string;
	audience?: "trabalhador" | "rh";
	rail: ReactNode;
	children: ReactNode;
}) {
	return (
		<section className="mx-auto w-full max-w-6xl p-4 md:p-6">
			<div className="mb-4 md:mb-6">
				<h1 className="font-semibold text-foreground text-xl md:text-2xl">
					{title}
				</h1>
				<p className="text-muted-foreground text-sm">{subtitle}</p>
			</div>

			<div className="grid gap-4 md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
				<aside className="hidden lg:block">
					{rail}
					<TrustCard className="mt-4" audience={audience} />
				</aside>

				<div className="min-w-0">
					<Card>
						<CardContent>{children}</CardContent>
					</Card>
					<TrustCard className="mt-4 lg:hidden" audience={audience} />
				</div>
			</div>
		</section>
	);
}
