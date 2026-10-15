import { InfoBanner } from "@/components/info-banner";
import { Card, CardContent } from "@/components/ui/card";
import type { CalcPerspective } from "@/lib/analytics";
import { ShareWithLawyer } from "@/pages/public/calculadora/share-with-lawyer";
import {
	type Line,
	sumLines,
	VerbaList,
} from "@/pages/public/calculadora/verba-list";
import { formatCurrency } from "@/utils/value-format";

const TITLES = {
	horas_extras: "Horas extras e reflexos",
	ferias_13: "Férias e 13º em aberto",
} as const;

/**
 * Resultado de uma verba isolada. Não tem faixa como a rescisão: em horas extras
 * tudo depende de prova, e em férias quase tudo sai de documento. Mostrar duas
 * pontas onde só há uma daria falsa precisão.
 */
export function VerbaResultView({
	token,
	kind,
	perspective,
	floor,
	ceiling,
	lines,
	prescribed,
	hasContact,
	claimed,
}: {
	token: string;
	kind: "horas_extras" | "ferias_13";
	perspective: CalcPerspective;
	floor: number;
	ceiling: number;
	lines: Line[];
	prescribed?: boolean;
	hasContact: boolean;
	claimed: boolean;
}) {
	if (prescribed) {
		return (
			<section className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-6">
				<h1 className="font-semibold text-foreground text-xl">
					O prazo para cobrar já passou
				</h1>
				<InfoBanner variant="warning">
					A ação trabalhista tem de ser proposta em até dois anos depois do fim
					do contrato (CF, art. 7º, XXIX). Pelas datas informadas, esse prazo já
					correu. Ainda assim vale conversar com um advogado: contrato que
					continuou de outra forma, ou afastamento, podem mudar a contagem.
				</InfoBanner>
			</section>
		);
	}

	const documental = lines.filter((line) => line.certainty === "documental");
	const requerProva = lines.filter((line) => line.certainty === "requer_prova");

	return (
		<section className="mx-auto w-full max-w-2xl space-y-4 p-4 md:space-y-6 md:p-6">
			<div>
				<p className="font-medium text-primary text-xs uppercase tracking-wide">
					{TITLES[kind]}
				</p>
				<h1 className="mt-1 font-semibold text-2xl text-foreground">
					{formatCurrency(ceiling)}
				</h1>
				<p className="text-muted-foreground text-sm">
					Valor corrigido até hoje, com juros pela ADC 58. É estimativa a partir
					do que você informou — não confere documento nem garante recebimento.
				</p>
			</div>

			{documental.length > 0 && (
				<Card>
					<CardContent>
						<div className="mb-3 flex items-baseline justify-between gap-4">
							<h2 className="font-medium text-foreground text-sm">
								O que se prova com documento
							</h2>
							<span className="whitespace-nowrap font-semibold text-sm tabular-nums">
								{formatCurrency(sumLines(documental))}
							</span>
						</div>
						<VerbaList lines={documental} />
					</CardContent>
				</Card>
			)}

			{requerProva.length > 0 && (
				<Card className="border-amber-200 dark:border-amber-900">
					<CardContent>
						<div className="mb-1 flex items-baseline justify-between gap-4">
							<h2 className="font-medium text-foreground text-sm">
								O que depende de prova
							</h2>
							<span className="whitespace-nowrap font-semibold text-sm tabular-nums">
								{formatCurrency(sumLines(requerProva))}
							</span>
						</div>
						<p className="mb-3 text-muted-foreground text-sm">
							{kind === "horas_extras"
								? "Hora extra se prova com controle de jornada. Empresa com mais de 20 empregados é obrigada a registrar a jornada (CLT, art. 74, §2º); sem os controles em juízo, presume-se a jornada alegada (Súmula 338 do TST)."
								: "A dobra depende de demonstrar que o período de 12 meses para conceder as férias passou sem que elas fossem gozadas."}
						</p>
						<VerbaList lines={requerProva} />
					</CardContent>
				</Card>
			)}

			<ShareWithLawyer
				token={token}
				kind={kind}
				perspective={perspective}
				floor={floor}
				ceiling={ceiling}
				pendingCount={requerProva.length}
				hasContact={hasContact}
			/>

			{claimed && (
				<p className="text-muted-foreground text-xs">
					Um escritório já trouxe este cálculo para dentro do sistema.
				</p>
			)}
		</section>
	);
}
