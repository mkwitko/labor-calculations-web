import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * O advogado que recebeu o link do próprio cliente e ainda não tem sessão
 * aberta. O `next` traz ele de volta a esta página depois de entrar — a lista
 * de destinos aceitos é fechada (`safeNextPath`), senão viraria redirect aberto.
 */
export function LawyerEntryCard({ token }: { token: string }) {
	const next = encodeURIComponent(`/calculadora/r/${token}`);

	return (
		<Card className="bg-muted/40">
			<CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="font-medium text-sm">Recebeu este link de um cliente?</p>
					<p className="mt-1 text-muted-foreground text-sm">
						Entre na sua conta para trazer o cálculo para o seu escritório, com o
						cliente cadastrado e a liquidação criada.
					</p>
				</div>
				<div className="flex shrink-0 gap-2">
					<Button variant="outline" size="lg" asChild>
						<Link to={`/authentication?next=${next}`}>Entrar</Link>
					</Button>
					<Button size="lg" asChild>
						<Link to={`/authentication/sign-up?next=${next}`}>Criar conta</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
