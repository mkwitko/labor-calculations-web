import { Link } from "react-router-dom";
import { InfoBanner } from "@/components/info-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/value-format";
import { buildResultUrl } from "./audience-param";
import type { CalcKind, CalcPerspective } from "@/lib/analytics";
import { ShareWithLawyer } from "./share-with-lawyer";
import { type Line, sumLines, VerbaList } from "./verba-list";

/**
 * A página de quem fez o cálculo. Fala com alguém que não conhece a
 * nomenclatura, acabou de sair do emprego e quer saber quanto tem a receber —
 * por isso o número vem primeiro e o vocabulário jurídico vem depois, sempre
 * com o que ele significa.
 */
export function ConsumerResult({
	token,
	kind,
	perspective,
	floor,
	ceiling,
	lines,
	pendingCount,
	hasContact,
	claimed,
}: {
	token: string;
	kind: CalcKind;
	perspective: CalcPerspective;
	floor: number;
	ceiling: number;
	lines: Line[];
	pendingCount: number;
	hasContact: boolean;
	claimed: boolean;
}) {
	const documental = lines.filter((line) => line.certainty === "documental");
	const requerProva = lines.filter((line) => line.certainty === "requer_prova");

	return (
		<section className="mx-auto w-full max-w-2xl space-y-4 p-4 md:space-y-6 md:p-6">
			<div>
				<h1 className="font-semibold text-foreground text-xl">
					Seu cálculo de rescisão
				</h1>
				<p className="text-muted-foreground text-sm">
					Estimativa feita com os dados que você informou.
				</p>
			</div>

			<Card className="border-primary/30 bg-primary/5">
				<CardContent>
					<p className="text-muted-foreground text-sm">Sua rescisão está entre</p>
					<p className="mt-1 font-semibold text-2xl tabular-nums md:text-3xl">
						{formatCurrency(floor)}
						<span className="mx-2 font-normal text-muted-foreground">e</span>
						{formatCurrency(ceiling)}
					</p>
					<p className="mt-2 text-muted-foreground text-sm">
						O valor mais baixo é o que se prova com documento. O mais alto inclui
						o que ainda depende de prova.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<div className="mb-3 flex items-baseline justify-between gap-4">
						<h2 className="font-medium text-foreground text-sm">
							O que já se prova com documento
						</h2>
						<span className="whitespace-nowrap font-semibold text-sm tabular-nums">
							{formatCurrency(sumLines(documental))}
						</span>
					</div>
					<VerbaList lines={documental} />
				</CardContent>
			</Card>

			{requerProva.length > 0 && (
				<Card className="border-amber-200 dark:border-amber-900">
					<CardContent>
						<div className="mb-1 flex items-baseline justify-between gap-4">
							<h2 className="font-medium text-foreground text-sm">
								O que ainda falta apurar
							</h2>
							<span className="whitespace-nowrap font-semibold text-sm tabular-nums">
								{formatCurrency(sumLines(requerProva))}
							</span>
						</div>
						<p className="mb-3 text-muted-foreground text-sm">
							Essas verbas entram no valor mais alto da faixa, mas só se você
							conseguir prová-las. Um advogado trabalhista sabe quais provas
							pedir.
						</p>
						<VerbaList lines={requerProva} />
					</CardContent>
				</Card>
			)}

			<InfoBanner variant="info">
				O cálculo usa o mesmo motor que advogados usam para montar petição, com
				correção monetária e juros pela ADC 58.
			</InfoBanner>

			{claimed ? (
				<Card>
					<CardContent>
						<p className="font-medium text-sm">
							Um escritório já trouxe este cálculo para dentro do sistema
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							Se foi o advogado que você procurou, ele já tem seus dados e o
							cálculo completo. Se você ainda não falou com ninguém, refaça o
							cálculo e mande para quem você escolher.
						</p>
					</CardContent>
				</Card>
			) : (
				<ShareWithLawyer
					token={token}
					kind={kind}
					perspective={perspective}
					floor={floor}
					ceiling={ceiling}
					pendingCount={pendingCount}
					hasContact={hasContact}
				/>
			)}

			<div className="flex flex-col items-center gap-2">
				<Button variant="ghost" size="lg" asChild>
					<Link to="/calculadora">Refazer o cálculo</Link>
				</Button>
				{/* Saída para o advogado que abriu o link sem o parâmetro — por
				    exemplo, colando a URL na barra em vez de clicar no que recebeu. */}
				<a
					href={buildResultUrl(token, "advogado")}
					className="text-muted-foreground text-xs underline underline-offset-4 hover:text-foreground"
				>
					Sou advogado e recebi este link
				</a>
			</div>
		</section>
	);
}
