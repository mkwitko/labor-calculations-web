import { motion } from "framer-motion";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	CalculatorIcon,
	CheckIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HelpTip } from "@/components/help-tip";
import { InfoBanner } from "@/components/info-banner";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { usePostPublicCalculations } from "@/http/generated/public/public";
import {
	capturePublicCalcEvent,
	type PublicCalcProps,
} from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { TerminationType } from "../calculadora/steps";
import { StepRail, WizardShell } from "../calculadora/wizard-shell";
import {
	isRhStepComplete,
	RH_INITIAL_STATE,
	RH_STEP_COUNT,
	RH_STEP_LABELS,
	type RhState,
	toRhPayload,
} from "./steps";

const TERMINATION_OPTIONS: {
	value: TerminationType;
	label: string;
	hint: string;
}[] = [
	{
		value: "sem_justa_causa",
		label: "Dispensa sem justa causa",
		hint: "Aviso prévio, multa de 40% do FGTS e liberação do seguro-desemprego.",
	},
	{
		value: "pedido_demissao",
		label: "Pedido de demissão",
		hint: "Sem aviso indenizado e sem multa de 40%.",
	},
	{
		value: "com_justa_causa",
		label: "Dispensa por justa causa",
		hint: "Só saldo de salário e férias vencidas — e o maior risco de reversão em juízo.",
	},
	{
		value: "rescisao_indireta",
		label: "Rescisão indireta pedida pelo empregado",
		hint: "Se reconhecida, paga como dispensa sem justa causa.",
	},
];

const ADDITIONALS: {
	field: keyof Pick<
		RhState,
		"extraHours" | "nightWork" | "insalubrity" | "dangerousWork"
	>;
	label: string;
	help: string;
}[] = [
	{
		field: "extraHours",
		label: "Hora extra habitual",
		help: "Habitualidade é o que gera reflexo em 13º, férias e FGTS. Hora extra esporádica não muda a base.",
	},
	{
		field: "nightWork",
		label: "Trabalho noturno",
		help: "Adicional de 20% entre 22h e 5h no trabalho urbano, com hora reduzida de 52min30s.",
	},
	{
		field: "insalubrity",
		label: "Insalubridade paga em folha",
		help: "Se o laudo existe e o adicional é pago, o risco é baixo. Se a atividade é insalubre e nada é pago, a exposição é alta.",
	},
	{
		field: "dangerousWork",
		label: "Periculosidade paga em folha",
		help: "30% sobre o salário-base. Vale para inflamáveis, energia elétrica, segurança e motociclista profissional.",
	},
];

const STEP_SUBTITLES = [
	"Define quais verbas são devidas e qual o risco de reversão.",
	"O tempo de casa muda aviso prévio, férias e a base da multa de 40%.",
	"É a base de quase todas as verbas e dos encargos patronais.",
	"Aviso indenizado projeta o contrato e aumenta 13º, férias e FGTS.",
	"O que ficou em aberto entra no cálculo e conta contra a empresa.",
	"Adicional habitual integra a remuneração e reflete no resto.",
];

function OptionButton({
	selected,
	onClick,
	children,
}: {
	selected: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={selected}
			className={cn(
				"flex w-full items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
				selected
					? "border-primary bg-primary/5 text-foreground"
					: "border-border bg-background hover:bg-muted",
			)}
		>
			<span>{children}</span>
			{selected && <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />}
		</button>
	);
}

export default function CalculadoraRh({
	source = "rh",
	embedded = false,
}: {
	source?: string;
	embedded?: boolean;
}) {
	const [step, setStep] = useState(0);
	const [state, setState] = useState<RhState>(RH_INITIAL_STATE);
	const navigate = useNavigate();

	// O cálculo é o mesmo do trabalhador — muda de quem é a leitura. É por isso
	// que `kind` continua `rescisao` e só `perspective` distingue esta tela.
	const funnelProps: PublicCalcProps = {
		source,
		kind: "rescisao",
		perspective: "empresa",
	};

	const { mutate, isPending, error } = usePostPublicCalculations({
		mutation: {
			onSuccess: (data) => {
				capturePublicCalcEvent("public_calc_created", funnelProps);
				navigate(`/rh/calculadora/r/${data.token}`);
			},
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: dispara na montagem
	useEffect(() => {
		capturePublicCalcEvent("public_calc_started", funnelProps);
	}, []);

	function set<K extends keyof RhState>(key: K, value: RhState[K]) {
		setState((current) => ({ ...current, [key]: value }));
	}

	const isLast = step === RH_STEP_COUNT - 1;
	const canAdvance = isRhStepComplete(state, step);
	const remaining = RH_STEP_COUNT - step - 1;

	function advance() {
		if (!canAdvance) return;
		capturePublicCalcEvent("public_calc_step", {
			...funnelProps,
			step,
			label: RH_STEP_LABELS[step],
		});
		if (!isLast) {
			setStep(step + 1);
			return;
		}
		mutate({ data: toRhPayload(state, source) });
	}

	const errorStatus = (error as { response?: { status?: number } } | null)
		?.response?.status;

	const body = (
		<div className="space-y-4 md:space-y-6">
			<div className="space-y-2">
				<div className="flex items-center justify-between text-muted-foreground text-xs">
					<span>
						Passo {step + 1} de {RH_STEP_COUNT}
					</span>
					<span>
						{remaining === 0
							? "última pergunta"
							: `faltam ${remaining} ${remaining === 1 ? "pergunta" : "perguntas"}`}
					</span>
				</div>
				<Progress value={((step + 1) / RH_STEP_COUNT) * 100} />
			</div>

			<motion.div
				key={step}
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.18 }}
				className="space-y-4"
			>
				{step === 0 && (
					<div className="space-y-3">
						<div>
							<h2 className="font-semibold text-foreground text-xl">
								Qual o motivo do desligamento?
							</h2>
							<p className="text-muted-foreground text-sm">
								{STEP_SUBTITLES[0]}
							</p>
						</div>
						{TERMINATION_OPTIONS.map((option) => (
							<OptionButton
								key={option.value}
								selected={state.terminationType === option.value}
								onClick={() => set("terminationType", option.value)}
							>
								<span className="font-medium">{option.label}</span>
								<span className="mt-0.5 block text-muted-foreground text-xs">
									{option.hint}
								</span>
							</OptionButton>
						))}
					</div>
				)}

				{step === 1 && (
					<div className="space-y-4">
						<div>
							<h2 className="font-semibold text-foreground text-xl">
								Qual o período do contrato?
							</h2>
							<p className="text-muted-foreground text-sm">
								{STEP_SUBTITLES[1]}
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="rh-start">Admissão</Label>
							<Input
								id="rh-start"
								type="date"
								value={state.startDate}
								onChange={(e) => set("startDate", e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="rh-end">Desligamento</Label>
							<Input
								id="rh-end"
								type="date"
								value={state.endDate}
								onChange={(e) => set("endDate", e.target.value)}
							/>
						</div>
					</div>
				)}

				{step === 2 && (
					<div className="space-y-4">
						<div>
							<h2 className="font-semibold text-foreground text-xl">
								Qual a última remuneração?
							</h2>
							<p className="text-muted-foreground text-sm">
								{STEP_SUBTITLES[2]}
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="rh-salary" className="flex items-center gap-1.5">
								Remuneração mensal
								<HelpTip title="O que somar">
									Salário-base mais as parcelas de natureza salarial pagas com
									habitualidade: comissão, prêmio habitual, gratificação de
									função. Vale-transporte e diária de viagem não entram.
								</HelpTip>
							</Label>
							<CurrencyInput
								id="rh-salary"
								value={state.lastSalary}
								onChange={(e) => set("lastSalary", e.target.value)}
							/>
						</div>
					</div>
				)}

				{step === 3 && (
					<div className="space-y-3">
						<div>
							<h2 className="font-semibold text-foreground text-xl">
								O aviso prévio será trabalhado?
							</h2>
							<p className="text-muted-foreground text-sm">
								{STEP_SUBTITLES[3]}
							</p>
						</div>
						<OptionButton
							selected={state.priorNoticeWorked}
							onClick={() => set("priorNoticeWorked", true)}
						>
							Trabalhado
						</OptionButton>
						<OptionButton
							selected={!state.priorNoticeWorked}
							onClick={() => set("priorNoticeWorked", false)}
						>
							Indenizado
						</OptionButton>
					</div>
				)}

				{step === 4 && (
					<div className="space-y-4">
						<div>
							<h2 className="font-semibold text-foreground text-xl">
								Há verbas em aberto?
							</h2>
							<p className="text-muted-foreground text-sm">
								{STEP_SUBTITLES[4]}
							</p>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="rh-vacation"
								className="flex items-center gap-1.5"
							>
								Períodos de férias vencidas não gozadas
								<HelpTip title="Férias vencidas">
									Período aquisitivo completo que passou do período concessivo
									sai em dobro (CLT, art. 137), com o terço.
								</HelpTip>
							</Label>
							<Input
								id="rh-vacation"
								type="number"
								min={0}
								max={10}
								value={state.vacationVencidasCount}
								onChange={(e) => set("vacationVencidasCount", e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="rh-13th">13º salários não pagos</Label>
							<Input
								id="rh-13th"
								type="number"
								min={0}
								max={10}
								value={state.unpaid13ths}
								onChange={(e) => set("unpaid13ths", e.target.value)}
							/>
						</div>
					</div>
				)}

				{step === 5 && (
					<div className="space-y-4">
						<div>
							<h2 className="font-semibold text-foreground text-xl">
								Quais adicionais existem no contrato?
							</h2>
							<p className="text-muted-foreground text-sm">
								{STEP_SUBTITLES[5]}
							</p>
						</div>
						{ADDITIONALS.map((item) => (
							<div
								key={item.field}
								className="flex items-start justify-between gap-4 rounded-lg border border-border p-3"
							>
								<Label
									htmlFor={`rh-${item.field}`}
									className="block cursor-pointer"
								>
									<span className="flex items-center gap-1.5">
										{item.label}
										<HelpTip title={item.label}>{item.help}</HelpTip>
									</span>
								</Label>
								<Switch
									id={`rh-${item.field}`}
									checked={state[item.field]}
									onCheckedChange={(value) => set(item.field, value)}
								/>
							</div>
						))}
						<InfoBanner variant="tip">
							Marque o que é pago em folha hoje. O que existe na prática e não
							aparece na folha é justamente o que vira exposição em reclamação.
						</InfoBanner>
					</div>
				)}
			</motion.div>

			{error ? (
				<InfoBanner variant="warning">
					{errorStatus === 429
						? "Muitos cálculos seguidos. Tente de novo daqui a pouco."
						: "Não conseguimos calcular agora. Tente de novo em alguns instantes."}
				</InfoBanner>
			) : null}

			<div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-border border-t bg-card px-4 py-3 md:static md:mx-0 md:border-0 md:px-0 md:pb-0">
				{step > 0 ? (
					<Button variant="ghost" size="lg" onClick={() => setStep(step - 1)}>
						<ArrowLeftIcon /> Voltar
					</Button>
				) : (
					<span />
				)}
				<Button size="lg" onClick={advance} disabled={!canAdvance || isPending}>
					{isLast ? (
						<>
							<CalculatorIcon />
							{isPending ? "Calculando..." : "Ver o custo"}
						</>
					) : (
						<>
							Continuar <ArrowRightIcon />
						</>
					)}
				</Button>
			</div>
		</div>
	);

	if (embedded) return body;

	return (
		<WizardShell
			title="Quanto custa desligar?"
			subtitle="Seis perguntas com a folha na mão. Custo do desligamento e exposição em caso de reclamação, com o mesmo motor que os advogados usam."
			audience="rh"
			rail={
				<StepRail
					labels={RH_STEP_LABELS}
					current={step}
					onSelect={setStep}
					isComplete={(index) => isRhStepComplete(state, index)}
				/>
			}
		>
			{body}
		</WizardShell>
	);
}
