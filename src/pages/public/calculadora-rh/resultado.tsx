import { CalculatorIcon, ShieldAlertIcon } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "@/components/empty-state";
import { InfoBanner } from "@/components/info-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublicCalculationsToken } from "@/http/generated/public/public";
import { formatCurrency } from "@/utils/value-format";
import { type Line, sumLines, VerbaList } from "../calculadora/verba-list";

/**
 * O que a empresa pode fazer sobre cada item que vira exposição. O texto é
 * ligado ao nome que o motor emite — genérico não serve a ninguém, e é
 * justamente esta lista que transforma um número em ação.
 */
const MITIGATIONS: { match: string; action: string }[] = [
	{
		match: "Horas Extras",
		action:
			"Cartão de ponto guardado e assinado. Empresa com mais de 20 empregados é obrigada a registrar a jornada (CLT, art. 74, §2º); sem os controles em juízo, presume-se a jornada alegada (Súmula 338 do TST).",
	},
	{
		match: "Adicional Noturno",
		action:
			"Registro de jornada que mostre o horário real e pagamento do adicional em folha, com a hora reduzida de 52min30s.",
	},
	{
		match: "Insalubridade",
		action:
			"Laudo pericial atualizado (PPRA/PGR e LTCAT), EPI eficaz com ficha de entrega assinada, e o adicional em folha quando o agente não é neutralizado.",
	},
	{
		match: "Periculosidade",
		action:
			"Laudo técnico que caracterize ou afaste a exposição, e o adicional de 30% em folha quando ela existe.",
	},
	{
		match: "Reflexos",
		action:
			"Consequência automática dos adicionais habituais: resolvido o adicional, o reflexo cai junto.",
	},
];

function mitigationFor(name: string): string | null {
	return MITIGATIONS.find((item) => name.includes(item.match))?.action ?? null;
}

function Stat({
	label,
	value,
	hint,
	highlight,
}: {
	label: string;
	value: string;
	hint: string;
	highlight?: "risk" | "primary";
}) {
	return (
		<Card
			className={
				highlight === "risk"
					? "border-amber-200 dark:border-amber-900"
					: highlight === "primary"
						? "border-primary/30 bg-primary/5"
						: undefined
			}
		>
			<CardContent>
				<p className="text-muted-foreground text-xs">{label}</p>
				<p className="mt-1 font-semibold text-xl tabular-nums md:text-2xl">
					{value}
				</p>
				<p className="mt-1 text-muted-foreground text-xs leading-relaxed">
					{hint}
				</p>
			</CardContent>
		</Card>
	);
}

export default function CalculadoraRhResultado() {
	const { token = "" } = useParams();
	const navigate = useNavigate();
	const { data, isLoading, isError } = useGetPublicCalculationsToken(token);

	if (isLoading) {
		return (
			<section className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6">
				<Skeleton className="h-10 w-3/4" />
				<Skeleton className="h-64 w-full" />
			</section>
		);
	}

	if (isError || !data) {
		return (
			<section className="mx-auto w-full max-w-3xl p-4 md:p-6">
				<EmptyState
					icon={CalculatorIcon}
					title="Este link expirou ou não existe"
					description="Cálculos ficam guardados por 90 dias. Depois disso, é preciso fazer um novo."
					action={{
						label: "Fazer um novo cálculo",
						onClick: () => navigate("/rh/calculadora"),
					}}
				/>
			</section>
		);
	}

	const { result } = data;
	const employer = result.employer;
	const lines = result.lines as Line[];
	const documental = lines.filter((line) => line.certainty === "documental");
	const requerProva = lines.filter((line) => line.certainty === "requer_prova");

	// Cálculo feito na perspectiva do trabalhador aberto nesta rota: manda para
	// a tela dele em vez de mostrar números vazios.
	if (!employer) {
		return (
			<section className="mx-auto w-full max-w-3xl p-4 md:p-6">
				<EmptyState
					icon={CalculatorIcon}
					title="Este cálculo é da calculadora do trabalhador"
					description="Ele não tem a leitura de custo para a empresa."
					action={{
						label: "Ver o cálculo",
						onClick: () => navigate(`/calculadora/r/${token}`),
					}}
				/>
			</section>
		);
	}

	return (
		<section className="mx-auto w-full max-w-3xl space-y-4 p-4 md:space-y-6 md:p-6">
			<div>
				<p className="font-medium text-primary text-xs uppercase tracking-wide">
					Custo de desligamento
				</p>
				<h1 className="mt-1 font-semibold text-foreground text-xl">
					O que sai do caixa e o que pode virar processo
				</h1>
				<p className="text-muted-foreground text-sm">
					Estimativa com os dados informados, pelo mesmo motor de liquidação que
					advogados usam para instruir processo.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<Stat
					label="Custo de desligar hoje"
					value={formatCurrency(employer.severanceCost)}
					hint="Verbas rescisórias, FGTS e multa, mais encargos patronais."
					highlight="primary"
				/>
				<Stat
					label="Exposição em reclamação"
					value={formatCurrency(employer.exposure)}
					hint="Somando o que depende de prova, custas e honorários de sucumbência."
					highlight="risk"
				/>
				<Stat
					label="Diferença"
					value={formatCurrency(employer.gap)}
					hint="O que está em jogo na documentação: é o que se evita provando o que já se paga."
				/>
			</div>

			<Card>
				<CardContent>
					<div className="mb-3 flex items-baseline justify-between gap-4">
						<h2 className="font-medium text-foreground text-sm">
							Rescisão: o que é devido de qualquer forma
						</h2>
						<span className="whitespace-nowrap font-semibold text-sm tabular-nums">
							{formatCurrency(sumLines(documental))}
						</span>
					</div>
					<VerbaList lines={documental} />
					<p className="mt-3 text-muted-foreground text-xs">
						Encargos patronais (INSS empresa e SAT/RAT):{" "}
						<span className="font-medium tabular-nums">
							{formatCurrency(employer.employerCharges)}
						</span>{" "}
						— não aparecem na memória de cálculo do empregado, mas saem do caixa.
					</p>
				</CardContent>
			</Card>

			{requerProva.length > 0 && (
				<Card className="border-amber-200 dark:border-amber-900">
					<CardContent>
						<div className="mb-1 flex items-baseline justify-between gap-4">
							<h2 className="flex items-center gap-2 font-medium text-foreground text-sm">
								<ShieldAlertIcon className="size-4 text-amber-600 dark:text-amber-400" />
								O que vira exposição
							</h2>
							<span className="whitespace-nowrap font-semibold text-sm tabular-nums">
								{formatCurrency(sumLines(requerProva))}
							</span>
						</div>
						<p className="mb-3 text-muted-foreground text-sm">
							Estas verbas só entram se forem provadas — e a prova costuma ser
							documento que a empresa deveria ter.
						</p>
						<ul className="divide-y divide-border">
							{requerProva.map((line) => {
								const action = mitigationFor(line.name);
								return (
									<li key={line.name} className="py-3 first:pt-0 last:pb-0">
										<div className="flex items-baseline justify-between gap-4">
											<p className="text-sm">{line.name}</p>
											<span className="whitespace-nowrap font-medium text-sm tabular-nums">
												{formatCurrency(line.total)}
											</span>
										</div>
										{line.legalRef && (
											<p className="text-muted-foreground text-xs">
												{line.legalRef}
											</p>
										)}
										{action && (
											<p className="mt-1 text-muted-foreground text-xs leading-relaxed">
												<span className="font-medium text-foreground">
													Como reduzir:
												</span>{" "}
												{action}
											</p>
										)}
									</li>
								);
							})}
						</ul>
						<p className="mt-3 text-muted-foreground text-xs">
							Custas e honorários de sucumbência estimados:{" "}
							<span className="font-medium tabular-nums">
								{formatCurrency(employer.litigationExtras)}
							</span>
							.
						</p>
					</CardContent>
				</Card>
			)}

			<InfoBanner variant="info">
				Correção monetária e juros pela ADC 58. Estimativa: não substitui
				parecer jurídico nem auditoria de folha.
			</InfoBanner>

			<Card className="bg-muted/40">
				<CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="font-medium text-sm">
							Quer este número conferido por um advogado?
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							Mande o link para o escritório que atende a empresa. Ele importa o
							cálculo com um clique e revisa jornada, adicionais e verbas pagas.
						</p>
					</div>
					<Button
						variant="outline"
						size="lg"
						className="shrink-0"
						onClick={() => navigator.clipboard.writeText(window.location.href)}
					>
						Copiar link
					</Button>
				</CardContent>
			</Card>

			<div className="flex justify-center">
				<Button variant="ghost" size="lg" asChild>
					<Link to="/rh/calculadora">Refazer o cálculo</Link>
				</Button>
			</div>
		</section>
	);
}
