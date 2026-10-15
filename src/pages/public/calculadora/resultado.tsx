import { CalculatorIcon } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckAuth } from "@/http/generated/auth/auth";
import { useGetPublicCalculationsToken } from "@/http/generated/public/public";
import { VerbaResultView } from "@/pages/public/verba-calculadora/result-verba";
import { AUDIENCE_PARAM, parseResultAudience } from "./audience-param";
import { ConsumerResult } from "./result-consumer";
import { LawyerResult } from "./result-lawyer";

/**
 * Duas páginas atrás do mesmo link.
 *
 * A do consumidor traz o número dele em linguagem comum e o caminho até um
 * advogado. A do advogado traz o resumo por grupo de certeza, as premissas do
 * cálculo e a importação. O mesmo conteúdo servindo aos dois falha com os dois:
 * um se assusta com o vocabulário, o outro não acha o que precisa decidir.
 *
 * Quem escolhe é só o `?para=` do link — o consumidor compartilha já endereçado
 * ao advogado. Sem parâmetro é a página do consumidor, mesmo para quem está
 * logado: o link cru é o dele, e um advogado logado que abre o próprio link do
 * cliente estava vendo a tela errada.
 */
export default function CalculadoraResultado() {
	const { token = "" } = useParams();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { data, isLoading, isError } = useGetPublicCalculationsToken(token);
	const { data: auth, isLoading: isAuthLoading } = useCheckAuth();

	if (isLoading || isAuthLoading) {
		return (
			<section className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-6">
				<Skeleton className="h-10 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
				<Skeleton className="h-64 w-full" />
			</section>
		);
	}

	if (isError || !data) {
		return (
			<section className="mx-auto w-full max-w-2xl p-4 md:p-6">
				<EmptyState
					icon={CalculatorIcon}
					title="Este link expirou ou não existe"
					description="Cálculos públicos ficam guardados por 90 dias. Depois disso, é preciso fazer um novo."
					action={{
						label: "Fazer um novo cálculo",
						onClick: () => navigate("/calculadora"),
					}}
				/>
			</section>
		);
	}

	const { result } = data;

	// Cálculo de verba isolada tem tela própria: não há faixa nem leitura de
	// rescisão para mostrar. Vale para o advogado também, porque o que ele decide
	// aqui — importar ou não — não muda.
	if (data.kind === "horas_extras" || data.kind === "ferias_13") {
		return (
			<VerbaResultView
				token={token}
				kind={data.kind}
				perspective={data.perspective}
				floor={result.floor}
				ceiling={result.ceiling}
				lines={result.lines}
				prescribed={result.prescribed}
				hasContact={data.hasContact}
				claimed={data.claimed}
			/>
		);
	}

	// Só o parâmetro decide. A sessão continua sendo lida, mas apenas para saber
	// se o advogado já pode importar ou se precisa entrar antes.
	const isLawyerView =
		parseResultAudience(searchParams.get(AUDIENCE_PARAM)) === "advogado";

	if (isLawyerView) {
		return (
			<LawyerResult
				token={token}
				kind={data.kind}
				perspective={data.perspective}
				isAuthenticated={Boolean(auth?.isAuthenticated)}
				floor={result.floor}
				ceiling={result.ceiling}
				lines={result.lines}
				claimed={data.claimed}
				hasContact={data.hasContact}
			/>
		);
	}

	return (
		<ConsumerResult
			token={token}
			kind={data.kind}
			perspective={data.perspective}
			floor={result.floor}
			ceiling={result.ceiling}
			lines={result.lines}
			pendingCount={result.pending.length}
			hasContact={data.hasContact}
			claimed={data.claimed}
		/>
	);
}
