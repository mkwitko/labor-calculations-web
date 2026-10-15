import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { usePostPublicCalculationsHorasExtras } from "@/http/generated/public/public";
import {
	capturePublicCalcEvent,
	type PublicCalcProps,
} from "@/lib/analytics";
import {
	INITIAL_OVERTIME_STATE,
	isOvertimeComplete,
	type OvertimeFormState,
	toOvertimePayload,
} from "./state";

/**
 * Calculadora de horas extras: tela única, não wizard. Quem busca por esta verba
 * não saiu do emprego — perguntar como foi a demissão, que era o que esta página
 * fazia, mandava a pessoa embora.
 */
export default function OvertimeCalculator({
	source = "site",
	embedded = false,
}: {
	source?: string;
	/** Dentro das páginas de SEO já vem embrulhado: sem cartão próprio. */
	embedded?: boolean;
}) {
	const [state, setState] = useState<OvertimeFormState>(INITIAL_OVERTIME_STATE);
	const navigate = useNavigate();

	// Tela única: não existe `public_calc_step` aqui, o funil desta verba é
	// started → created. Os props são os mesmos das outras calculadoras para a
	// quebra por origem valer nas duas.
	const funnelProps: PublicCalcProps = {
		source,
		kind: "horas_extras",
		perspective: "trabalhador",
	};

	const { mutate, isPending, error } = usePostPublicCalculationsHorasExtras({
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

	function set<K extends keyof OvertimeFormState>(
		key: K,
		value: OvertimeFormState[K],
	) {
		setState((current) => ({ ...current, [key]: value }));
	}

	const canSubmit = isOvertimeComplete(state);
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
				<p className="text-muted-foreground text-xs">
					O salário do contrato, sem adicionais. É dele que sai o valor da hora.
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="weeklySchedule">Jornada contratual</Label>
				<Select
					value={state.weeklySchedule}
					onValueChange={(value) => set("weeklySchedule", value as "44" | "40")}
				>
					<SelectTrigger id="weeklySchedule" className="w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="44">44 horas por semana</SelectItem>
						<SelectItem value="40">40 horas por semana</SelectItem>
					</SelectContent>
				</Select>
				<p className="text-muted-foreground text-xs">
					A jornada muda o divisor: 220 horas para 44h, 200 para 40h. Jornada
					menor deixa a hora mais cara.
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="extraHoursPerWeek">Horas extras por semana</Label>
				<Input
					id="extraHoursPerWeek"
					inputMode="decimal"
					placeholder="5"
					value={state.extraHoursPerWeek}
					onChange={(event) => set("extraHoursPerWeek", event.target.value)}
				/>
				<p className="text-muted-foreground text-xs">
					Uma média basta. Uma hora a mais por dia útil dá cerca de 5 por semana.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="startDate">Desde quando</Label>
					<Input
						id="startDate"
						type="date"
						value={state.startDate}
						onChange={(event) => set("startDate", event.target.value)}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="endDate">Até quando</Label>
					<Input
						id="endDate"
						type="date"
						value={state.endDate}
						onChange={(event) => set("endDate", event.target.value)}
					/>
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
				onClick={() => mutate({ data: toOvertimePayload(state, source) })}
			>
				{isPending ? "Calculando..." : "Calcular horas extras"}
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
