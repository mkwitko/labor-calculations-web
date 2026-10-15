import { BriefcaseIcon, CheckCircle2Icon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { InfoBanner } from "@/components/info-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useClaimPublicCalculation } from "@/http/generated/public/public";
import {
	type CalcKind,
	type CalcPerspective,
	capturePublicCalcEvent,
} from "@/lib/analytics";

/**
 * O outro lado do link: quem recebeu do cliente. Traz o cálculo para dentro do
 * escritório criando cliente e liquidação, com o mesmo snapshot de índices — o
 * advogado tem que ver o número que o cliente viu.
 */
export function ImportCard({
	token,
	kind,
	perspective,
	claimed,
}: {
	token: string;
	/** Da resposta da API: o advogado abre o link sem ter passado pelo wizard. */
	kind: CalcKind;
	perspective: CalcPerspective;
	claimed: boolean;
}) {
	const navigate = useNavigate();
	const [invitePortal, setInvitePortal] = useState(true);

	const { mutate, isPending, error } = useClaimPublicCalculation({
		mutation: {
			onSuccess: (data) => {
				capturePublicCalcEvent("public_calc_claimed", {
					kind,
					perspective,
					invitePortal,
				});
				// O aviso do portal vive num toast porque a navegação já leva o
				// advogado para a tela do cálculo — a informação seria perdida se
				// ficasse nesta página.
				if (data.portalInviteUrl) {
					toast.success(
						data.portalEmailSent
							? "Cálculo importado. O convite do portal foi enviado ao cliente."
							: "Cálculo importado. O convite do portal foi criado, mas o e-mail não saiu — copie o link na ficha do cliente.",
					);
				} else {
					toast.success("Cálculo importado para o seu escritório.");
				}

				navigate(`/calculations/${data.calculationId}`);
			},
		},
	});

	if (claimed) {
		return (
			<Card>
				<CardContent className="flex items-start gap-3">
					<CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
					<div>
						<p className="font-medium text-sm">
							Este cálculo já foi importado por um escritório
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							Se não foi o seu, o cliente precisa refazer o cálculo e mandar o
							link novo — cada cálculo público entra em um escritório só.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const status = (error as { response?: { status?: number } } | null)?.response
		?.status;

	return (
		<Card className="border-primary/30">
			<CardContent className="space-y-4">
				<div className="flex items-start gap-3">
					<BriefcaseIcon className="mt-0.5 size-4 shrink-0 text-primary" />
					<div>
						<p className="font-medium text-sm">
							Trazer este cálculo para o seu escritório
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							Cria o cliente com os dados que ele deixou e a liquidação
							completa, com os mesmos índices deste cálculo. Você revisa jornada
							e adicionais depois, na tela do cálculo.
						</p>
					</div>
				</div>

				<div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
					<Label htmlFor="invite-portal" className="block cursor-pointer">
						Convidar o cliente para o portal
						<span className="mt-0.5 block font-normal text-muted-foreground text-xs">
							Ele recebe um link de primeiro acesso e passa a acompanhar o caso,
							os documentos e os valores por conta própria.
						</span>
					</Label>
					<Switch
						id="invite-portal"
						checked={invitePortal}
						onCheckedChange={setInvitePortal}
					/>
				</div>

				{error ? (
					<InfoBanner variant="warning">
						{status === 409
							? "Outro escritório já importou este cálculo."
							: status === 402
								? "Sua assinatura precisa estar ativa para importar."
								: status === 403
									? "Seu papel na organização não permite criar cliente e cálculo."
									: "Não conseguimos importar agora. Tente de novo em alguns instantes."}
					</InfoBanner>
				) : null}

				<Button
					size="lg"
					disabled={isPending}
					onClick={() => mutate({ token, data: { invitePortal } })}
				>
					{isPending ? "Importando..." : "Importar para o meu escritório"}
				</Button>
			</CardContent>
		</Card>
	);
}
