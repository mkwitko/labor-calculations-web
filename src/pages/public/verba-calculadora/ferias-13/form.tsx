import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePostPublicCalculationsFeriasDecimoTerceiro } from "@/http/generated/public/public";
import {
	capturePublicCalcEvent,
	type PublicCalcProps,
} from "@/lib/analytics";
import { OptionButton } from "@/pages/public/calculadora/option-button";
import {
	INITIAL_VACATION_13TH_STATE,
	isVacation13thComplete,
	toVacation13thPayload,
	type Vacation13thFormState,
} from "./state";

/**
 * Calculadora de férias e 13º: tela única. A maior parte de quem busca por estas
 * verbas ainda está empregada — por isso a data de saída só aparece para quem
 * disser que saiu.
 */
export default function Vacation13thCalculator({
	source = "site",
	embedded = false,
}: {
	source?: string;
	embedded?: boolean;
}) {
	const [state, setState] = useState<Vacation13thFormState>(
		INITIAL_VACATION_13TH_STATE,
	);
	const navigate = useNavigate();

	// Tela única: não existe `public_calc_step` aqui, o funil desta verba é
	// started → created. Os props são os mesmos das outras calculadoras para a
	// quebra por origem valer nas duas.
	const funnelProps: PublicCalcProps = {
		source,
		kind: "ferias_13",
		perspective: "trabalhador",
	};

	const { mutate, isPending, error } =
		usePostPublicCalculationsFeriasDecimoTerceiro({
			mutation: {
				onSuccess: (data) => {
					capturePublicCalcEvent("public_calc_created", funnelProps);
					navigate(`/calculadora/r/${data.token}`);
				},
			},
		});

	// biome-ignore lint/correctness/useExhaustiveDependencies: dispara na montagem
	useEffect(() => {
		capturePublicCalcEvent("public_calc_started", funnelProps);
	}, []);

	function set<K extends keyof Vacation13thFormState>(
		key: K,
		value: Vacation13thFormState[K],
	) {
		setState((current) => ({ ...current, [key]: value }));
	}

	const canSubmit = isVacation13thComplete(state);
	const errorStatus = (error as { response?: { status?: number } } | null)
		?.response?.status;

	const body = (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="monthlySalary">Salário mensal</Label>
				<Input
					id="monthlySalary"
					inputMode="decimal"
					placeholder="3000"
					value={state.monthlySalary}
					onChange={(event) => set("monthlySalary", event.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="startDate">Data de admissão</Label>
				<Input
					id="startDate"
					type="date"
					value={state.startDate}
					onChange={(event) => set("startDate", event.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label>Situação</Label>
				<OptionButton
					selected={state.stillEmployed}
					onClick={() => set("stillEmployed", true)}
				>
					Ainda trabalho nesta empresa
				</OptionButton>
				<OptionButton
					selected={!state.stillEmployed}
					onClick={() => set("stillEmployed", false)}
				>
					Já saí
				</OptionButton>
			</div>

			{!state.stillEmployed && (
				<div className="space-y-2">
					<Label htmlFor="endDate">Data de saída</Label>
					<Input
						id="endDate"
						type="date"
						value={state.endDate}
						onChange={(event) => set("endDate", event.target.value)}
					/>
				</div>
			)}

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="vacationVencidasCount">
						Períodos de férias não gozados
					</Label>
					<Input
						id="vacationVencidasCount"
						inputMode="numeric"
						value={state.vacationVencidasCount}
						onChange={(event) =>
							set("vacationVencidasCount", event.target.value)
						}
					/>
					<p className="text-muted-foreground text-xs">
						Anos completos em que você não tirou férias. Se tirou todas, deixe
						zero.
					</p>
				</div>
				<div className="space-y-2">
					<Label htmlFor="unpaid13ths">13º não pagos</Label>
					<Input
						id="unpaid13ths"
						inputMode="numeric"
						value={state.unpaid13ths}
						onChange={(event) => set("unpaid13ths", event.target.value)}
					/>
					<p className="text-muted-foreground text-xs">
						Quantos décimos terceiros a empresa deixou de pagar.
					</p>
				</div>
			</div>

			{errorStatus === 429 && (
				<p className="text-destructive text-sm">
					Muitos cálculos deste computador na última hora. Tente de novo mais
					tarde.
				</p>
			)}
			{Boolean(error) && errorStatus !== 429 && (
				<p className="text-destructive text-sm">
					Não foi possível calcular agora. Confira os dados e tente de novo.
				</p>
			)}

			<Button
				size="lg"
				className="w-full"
				disabled={!canSubmit || isPending}
				onClick={() => mutate({ data: toVacation13thPayload(state, source) })}
			>
				{isPending ? "Calculando..." : "Calcular férias e 13º"}
			</Button>
		</div>
	);

	if (embedded) return body;

	return (
		<Card>
			<CardContent>{body}</CardContent>
		</Card>
	);
}
