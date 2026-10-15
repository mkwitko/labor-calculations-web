import {
	CheckCircle2Icon,
	FileSearchIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/value-format";
import type { CalcKind, CalcPerspective } from "@/lib/analytics";
import { ImportCard } from "./import-card";
import { LawyerEntryCard } from "./lawyer-entry-card";
import { type Line, sumLines, VerbaList } from "./verba-list";

/**
 * O que o wizard assume quando o leigo responde. São regras fixas do
 * `answers-to-input.ts`, não adivinhação da tela: o advogado precisa saber
 * exatamente onde o número é chute antes de levar isso a lugar nenhum.
 */
const ASSUMPTIONS = [
	"Base de cálculo e média dos três últimos meses saem do único salário informado — quem tinha variável está subestimado.",
	'Hora extra e adicional noturno entram como 20h/mês; insalubridade, como grau médio (20%). "Não sei" liga a verba com essa mesma estimativa.',
	"Férias vencidas vêm da contagem que o cliente fez de cabeça; as proporcionais o motor calcula pelo período.",
	"Nada de verba paga por fora, equiparação, intervalo intrajornada ou estabilidade — o wizard não pergunta.",
];

export function LawyerResult({
	token,
	kind,
	perspective,
	floor,
	ceiling,
	lines,
	claimed,
	hasContact,
	isAuthenticated,
}: {
	token: string;
	kind: CalcKind;
	perspective: CalcPerspective;
	floor: number;
	ceiling: number;
	lines: Line[];
	claimed: boolean;
	hasContact: boolean;
	isAuthenticated: boolean;
}) {
	const documental = lines.filter((line) => line.certainty === "documental");
	const requerProva = lines.filter((line) => line.certainty === "requer_prova");

	return (
		<section className="mx-auto w-full max-w-3xl space-y-4 p-4 md:space-y-6 md:p-6">
			<div>
				<p className="font-medium text-primary text-xs uppercase tracking-wide">
					Cálculo recebido
				</p>
				<h1 className="mt-1 font-semibold text-foreground text-xl">
					Uma pessoa calculou a rescisão dela e mandou para você
				</h1>
				<p className="text-muted-foreground text-sm">
					Estimativa feita por leigo, em linguagem comum, com o motor de
					liquidação da plataforma. Confira as premissas antes de usar.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<Card>
					<CardContent>
						<p className="text-muted-foreground text-xs">Piso documental</p>
						<p className="mt-1 font-semibold text-lg tabular-nums">
							{formatCurrency(floor)}
						</p>
						<p className="mt-1 text-muted-foreground text-xs">
							{documental.length} verbas
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<p className="text-muted-foreground text-xs">Depende de prova</p>
						<p className="mt-1 font-semibold text-lg tabular-nums">
							{formatCurrency(sumLines(requerProva))}
						</p>
						<p className="mt-1 text-muted-foreground text-xs">
							{requerProva.length} verbas
						</p>
					</CardContent>
				</Card>
				<Card className="border-primary/30 bg-primary/5">
					<CardContent>
						<p className="text-muted-foreground text-xs">Teto estimado</p>
						<p className="mt-1 font-semibold text-lg tabular-nums">
							{formatCurrency(ceiling)}
						</p>
						<p className="mt-1 text-muted-foreground text-xs">
							{lines.length} verbas
						</p>
					</CardContent>
				</Card>
			</div>

			{isAuthenticated ? (
				<ImportCard
					token={token}
					kind={kind}
					perspective={perspective}
					claimed={claimed}
				/>
			) : (
				<LawyerEntryCard token={token} />
			)}

			<Card>
				<CardContent className="space-y-3">
					<div className="flex items-center gap-2">
						<TriangleAlertIcon className="size-4 text-amber-600 dark:text-amber-400" />
						<h2 className="font-medium text-foreground text-sm">
							Premissas do cálculo, para você conferir
						</h2>
					</div>
					<ul className="space-y-2 text-muted-foreground text-sm">
						{ASSUMPTIONS.map((item) => (
							<li key={item} className="flex gap-2">
								<span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
								{item}
							</li>
						))}
					</ul>
					<p className="text-muted-foreground text-xs">
						Importando, o cálculo entra como liquidação editável, com a mesma
						tabela de índices — você ajusta jornada, adicionais e abatimentos na
						tela do cálculo.
					</p>
				</CardContent>
			</Card>

			<div className="space-y-4">
				<Card>
					<CardContent>
						<div className="mb-3 flex items-baseline justify-between gap-4">
							<h2 className="flex items-center gap-2 font-medium text-foreground text-sm">
								<CheckCircle2Icon className="size-4 text-primary" />
								Documental
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
							<div className="mb-3 flex items-baseline justify-between gap-4">
								<h2 className="flex items-center gap-2 font-medium text-foreground text-sm">
									<FileSearchIcon className="size-4 text-amber-600 dark:text-amber-400" />
									Depende de prova
								</h2>
								<span className="whitespace-nowrap font-semibold text-sm tabular-nums">
									{formatCurrency(sumLines(requerProva))}
								</span>
							</div>
							<VerbaList lines={requerProva} />
						</CardContent>
					</Card>
				)}
			</div>

			<Card>
				<CardContent className="space-y-2">
					<h2 className="font-medium text-foreground text-sm">
						Dados de contato
					</h2>
					<p className="text-muted-foreground text-sm">
						{hasContact
							? "A pessoa deixou nome e contato. Eles vêm junto na importação, no cadastro do cliente — não ficam expostos nesta página, que é aberta a quem tiver o link."
							: "A pessoa não deixou contato. A importação cria o cliente mesmo assim, e você completa o cadastro depois."}
					</p>
				</CardContent>
			</Card>
		</section>
	);
}
