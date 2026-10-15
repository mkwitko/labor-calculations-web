import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { InfoBanner } from "@/components/info-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePatchPublicCalculationsTokenContact } from "@/http/generated/public/public";
import {
	type CalcKind,
	type CalcPerspective,
	capturePublicCalcEvent,
} from "@/lib/analytics";
import { formatCurrency } from "@/utils/value-format";
import { type Line, sumLines, VerbaList } from "../calculadora/verba-list";

/**
 * O resultado dentro do widget.
 *
 * Difere da página do trabalhador em duas coisas: não há "mandar para um
 * advogado" — o advogado é o dono do site em que a pessoa já está — e o contato
 * vai direto para ele, que é a conversão que faz o widget valer a pena para
 * quem o instalou.
 */
export function WidgetResult({
	token,
	source,
	kind,
	perspective,
	officeName,
	floor,
	ceiling,
	lines,
}: {
	token: string;
	/** `widget:<chave>` — aqui a origem é conhecida: o resultado é da mesma sessão. */
	source: string;
	kind: CalcKind;
	perspective: CalcPerspective;
	officeName: string;
	floor: number;
	ceiling: number;
	lines: Line[];
}) {
	const [name, setName] = useState("");
	const [contact, setContact] = useState("");
	const [sent, setSent] = useState(false);

	const documental = lines.filter((line) => line.certainty === "documental");
	const requerProva = lines.filter((line) => line.certainty === "requer_prova");

	const { mutate, isPending, error } = usePatchPublicCalculationsTokenContact({
		mutation: {
			onSuccess: () => {
				capturePublicCalcEvent("widget_contact_saved", {
					source,
					kind,
					perspective,
				});
				setSent(true);
			},
		},
	});

	// Um campo só para e-mail ou telefone: pedir os dois de quem acabou de
	// chegar derruba a conversão, e o escritório precisa de um jeito de responder,
	// não de dois.
	const isEmail = contact.includes("@");
	const canSend = name.trim().length > 1 && contact.trim().length > 5;

	function send() {
		if (!canSend) return;
		mutate({
			token,
			data: {
				name: name.trim(),
				...(isEmail
					? { email: contact.trim() }
					: { phone: contact.trim() }),
			},
		});
	}

	return (
		<div className="space-y-4">
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
							conseguir prová-las. {officeName} sabe quais provas pedir.
						</p>
						<VerbaList lines={requerProva} />
					</CardContent>
				</Card>
			)}

			{sent ? (
				<Card className="border-primary/30">
					<CardContent className="flex gap-3">
						<CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-primary" />
						<div>
							<p className="font-medium text-sm">Contato enviado</p>
							<p className="mt-1 text-muted-foreground text-sm">
								{officeName} recebeu seu cálculo com seus dados e vai falar com
								você. Você não precisa repetir nada.
							</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardContent className="space-y-3">
						<div>
							<p className="font-medium text-sm">
								Quer que {officeName} olhe o seu caso?
							</p>
							<p className="mt-1 text-muted-foreground text-sm">
								Deixe seu contato e o escritório recebe este cálculo já
								preenchido, com as verbas separadas entre o que se prova e o que
								falta apurar. Não é preciso repetir as respostas.
							</p>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="widget-name">Seu nome</Label>
								<Input
									id="widget-name"
									value={name}
									onChange={(event) => setName(event.target.value)}
									placeholder="Nome completo"
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="widget-contact">E-mail ou WhatsApp</Label>
								<Input
									id="widget-contact"
									value={contact}
									onChange={(event) => setContact(event.target.value)}
									placeholder="seu@email.com ou (11) 90000-0000"
								/>
							</div>
						</div>

						{error ? (
							<InfoBanner variant="warning">
								Não conseguimos enviar agora. Tente de novo em alguns instantes.
							</InfoBanner>
						) : null}

						<Button size="lg" disabled={!canSend || isPending} onClick={send}>
							{isPending ? (
								<>
									<Loader2Icon className="animate-spin" /> Enviando...
								</>
							) : (
								`Enviar para ${officeName}`
							)}
						</Button>

						<p className="text-muted-foreground text-xs">
							Seus dados vão só para {officeName}. Enviar não cria processo nem
							contrata serviço.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
