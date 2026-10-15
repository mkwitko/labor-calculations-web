import { CheckIcon, LinkIcon, MessageCircleIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePatchPublicCalculationsTokenContact } from "@/http/generated/public/public";
import {
	type CalcKind,
	type CalcPerspective,
	capturePublicCalcEvent,
} from "@/lib/analytics";
import { formatCurrency } from "@/utils/value-format";
import { buildResultUrl } from "./audience-param";

type ShareAction = "whatsapp" | "copy";

/**
 * O consumidor leva o cálculo ao advogado **dele**. Não existe lista de
 * advogados aqui, nem encaminhamento, nem indicação: captação de cliente
 * intermediada é o que o Código de Ética da OAB e o Provimento 205/2021 vedam
 * com mais força. Quem escolhe o destinatário é a pessoa, no aplicativo dela.
 *
 * O contato é pedido no ato de compartilhar, e não num formulário solto no fim
 * da página: é o único instante em que a pessoa entende para que ele serve — o
 * advogado vai abrir o link e precisa saber com quem falar. Continua opcional,
 * e pular executa a ação do mesmo jeito.
 */
export function ShareWithLawyer({
	token,
	kind,
	perspective,
	floor,
	ceiling,
	pendingCount,
	hasContact,
}: {
	token: string;
	/** Da resposta da API, não do wizard: esta tela abre em outro navegador. */
	kind: CalcKind;
	perspective: CalcPerspective;
	floor: number;
	ceiling: number;
	pendingCount: number;
	hasContact: boolean;
}) {
	const [copied, setCopied] = useState(false);
	const [pendingAction, setPendingAction] = useState<ShareAction | null>(null);
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");

	const { mutate } = usePatchPublicCalculationsTokenContact();

	// O link compartilhado já vai endereçado: o advogado abre na versão dele
	// mesmo sem ter conta, sem precisar descobrir que existe outra visão.
	const url = buildResultUrl(token, "advogado");

	const message =
		`Fiz uma estimativa da minha rescisão no LexLaboral: entre ${formatCurrency(floor)} e ${formatCurrency(ceiling)}` +
		(pendingCount > 0
			? `, com ${pendingCount} ${pendingCount === 1 ? "verba que ainda depende" : "verbas que ainda dependem"} de prova.`
			: ".") +
		`\n\nO cálculo aberto, verba por verba, está aqui: ${url}`;

	/**
	 * Roda dentro do clique, sempre síncrono: `window.open` depois de um `await`
	 * é barrado como pop-up. O contato é gravado em paralelo — perder o contato é
	 * menos grave do que perder o compartilhamento, que é o objetivo da tela.
	 */
	function runAction(action: ShareAction) {
		if (action === "whatsapp") {
			window.open(
				`https://wa.me/?text=${encodeURIComponent(message)}`,
				"_blank",
				"noopener,noreferrer",
			);
			return;
		}

		navigator.clipboard.writeText(url);
		setCopied(true);
	}

	function start(action: ShareAction) {
		if (hasContact) {
			runAction(action);
			return;
		}
		setPendingAction(action);
	}

	function confirm(withContact: boolean) {
		const action = pendingAction;
		setPendingAction(null);
		if (!action) return;

		if (withContact && (name || phone || email)) {
			capturePublicCalcEvent("public_calc_contact_saved", {
				kind,
				perspective,
			});
			mutate({
				token,
				data: {
					name: name || undefined,
					phone: phone || undefined,
					email: email || undefined,
				},
			});
		}

		capturePublicCalcEvent("public_calc_shared", {
			kind,
			perspective,
			channel: action,
			withContact,
		});
		runAction(action);
	}

	return (
		<>
			<Card className="border-primary/30">
				<CardContent className="space-y-4">
					<div>
						<h2 className="font-medium text-foreground text-sm">
							Leve este cálculo ao seu advogado
						</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							O link abre a conta inteira, com o fundamento legal de cada verba e
							a lista do que falta apurar. É por onde a conversa começa sem você
							precisar explicar nada.
						</p>
					</div>

					<div className="flex flex-wrap gap-2">
						<Button size="lg" onClick={() => start("whatsapp")}>
							<MessageCircleIcon />
							Enviar por WhatsApp
						</Button>
						<Button variant="outline" size="lg" onClick={() => start("copy")}>
							{copied ? <CheckIcon /> : <LinkIcon />}
							{copied ? "Link copiado" : "Copiar link"}
						</Button>
					</div>

					<p className="text-muted-foreground text-xs">
						Não indicamos advogados nem recebemos por indicação. Você escolhe
						para quem enviar.
					</p>
				</CardContent>
			</Card>

			<Dialog
				open={pendingAction !== null}
				onOpenChange={(open) => {
					if (!open) setPendingAction(null);
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Quer deixar seu contato junto?</DialogTitle>
						<DialogDescription>
							O advogado vai abrir o link e ver a conta inteira — mas não vê quem
							é você. Com o contato, ele já procura você sabendo do que se trata,
							e você não precisa repetir a história.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3">
						<div className="space-y-1.5">
							<Label htmlFor="share-name">Nome</Label>
							<Input
								id="share-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="share-phone">Telefone ou WhatsApp</Label>
							<Input
								id="share-phone"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="share-email">E-mail</Label>
							<Input
								id="share-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<p className="text-muted-foreground text-xs">
								É por onde você recebe acesso para acompanhar o caso, se o
								advogado abrir o portal do cliente.
							</p>
						</div>
					</div>

					<p className="text-muted-foreground text-xs">
						Seus dados vão apenas para o escritório que importar este cálculo.
						Apagamos tudo em 90 dias.
					</p>

					<DialogFooter className="gap-2 sm:gap-2">
						<Button variant="ghost" size="lg" onClick={() => confirm(false)}>
							Pular
						</Button>
						<Button size="lg" onClick={() => confirm(true)}>
							Salvar e continuar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
