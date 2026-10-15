import { motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon, CalculatorIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HelpTip } from "@/components/help-tip";
import { InfoBanner } from "@/components/info-banner";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { usePostPublicCalculations } from "@/http/generated/public/public";
import {
	capturePublicCalcEvent,
	type PublicCalcProps,
} from "@/lib/analytics";
import { OptionButton } from "./option-button";
import {
	INITIAL_STATE,
	isStepComplete,
	type LayAnswer,
	STEP_COUNT,
	STEP_LABELS,
	type TerminationType,
	toPayload,
	type WizardState,
} from "./steps";
import { StepRail, WizardShell } from "./wizard-shell";

const TERMINATION_OPTIONS: { value: TerminationType; label: string }[] = [
	{ value: "sem_justa_causa", label: "Fui demitido" },
	{ value: "pedido_demissao", label: "Pedi demissão" },
	{ value: "com_justa_causa", label: "Fui demitido por justa causa" },
	{ value: "rescisao_indireta", label: "Quero sair por culpa da empresa" },
];

const LAY_OPTIONS: { value: LayAnswer; label: string }[] = [
	{ value: "sim", label: "Sim" },
	{ value: "nao", label: "Não" },
	{ value: "nao_sei", label: "Não sei" },
];

const ADDITIONALS: {
	field: keyof Pick<
		WizardState,
		"extraHours" | "nightWork" | "insalubrity" | "dangerousWork"
	>;
	label: string;
	help: string;
}[] = [
	{
		field: "extraHours",
		label: "Fazia hora extra com frequência",
		help: "Qualquer tempo além da jornada contratada: ficar depois do horário, chegar antes, trabalhar no almoço ou responder demanda fora do expediente.",
	},
	{
		field: "nightWork",
		label: "Trabalhava depois das 22h",
		help: "O adicional noturno vale para o trabalho urbano entre 22h e 5h. A hora noturna também é reduzida: 52 minutos e 30 segundos valem por uma hora.",
	},
	{
		field: "insalubrity",
		label: "Tinha contato com agente insalubre",
		help: "Ruído alto, calor, frio, produto químico, agente biológico (hospital, limpeza, coleta). O grau é definido por perícia — aqui assumimos o grau médio.",
	},
	{
		field: "dangerousWork",
		label: "Trabalhava em atividade perigosa",
		help: "Inflamáveis, explosivos, energia elétrica, segurança patrimonial e motociclista profissional. O adicional é de 30% sobre o salário-base.",
	},
];

// Uma linha de apoio por passo: diz por que a pergunta importa. Sem isso o leigo
// responde no chute, e o chute é o que estraga o cálculo.
const STEP_SUBTITLES = [
	"O motivo da saída define quais verbas você tem direito a receber.",
	"O tempo de casa muda o aviso prévio, as férias e a multa do FGTS.",
	"É a base de quase todas as verbas do cálculo.",
	"Sem registro as verbas são as mesmas, mas primeiro é preciso reconhecer o vínculo.",
	"Aviso não cumprido é pago em dinheiro e ainda estica o contrato.",
	"São as verbas mais fáceis de conferir no seu contracheque.",
	"Adicionais habituais entram no cálculo de férias, 13º e FGTS.",
];


export type CalculatedPayload = {
	token: string;
	result: {
		floor: number;
		ceiling: number;
		lines: { name: string; legalRef?: string; total: number; certainty: string }[];
		pending: string[];
	};
};

export default function Calculadora({
	source = "site",
	embedded = false,
	widget,
	onCalculated,
}: {
	source?: string;
	/** Dentro das páginas de SEO o wizard já vem embrulhado: sem cartão próprio. */
	embedded?: boolean;
	/** Presente só no widget de um escritório: atribui o cálculo a ele. */
	widget?: { widgetKey: string; hostSite?: string };
	/**
	 * Quando dado, recebe o resultado em vez de navegar para
	 * `/calculadora/r/:token`. Dentro de um iframe navegar seria trocar a página
	 * inteira do widget por outra que assume ter cabeçalho e rodapé.
	 */
	onCalculated?: (data: CalculatedPayload) => void;
}) {
	const [step, setStep] = useState(0);
	const [state, setState] = useState<WizardState>(INITIAL_STATE);
	const [showOtherTermination, setShowOtherTermination] = useState(false);
	const navigate = useNavigate();

	// Os mesmos três props em todo evento deste wizard: é o que deixa o funil do
	// PostHog quebrar por origem sem perder o passo do meio.
	const funnelProps: PublicCalcProps = {
		source,
		kind: "rescisao",
		perspective: "trabalhador",
	};

	const { mutate, isPending, error } = usePostPublicCalculations({
		mutation: {
			onSuccess: (data) => {
				capturePublicCalcEvent("public_calc_created", funnelProps);
				if (onCalculated) {
					onCalculated(data as CalculatedPayload);
					return;
				}
				navigate(`/calculadora/r/${data.token}`);
			},
		},
	});

	// Uma vez por montagem: quantos abrem o wizard é o denominador de tudo.
	// biome-ignore lint/correctness/useExhaustiveDependencies: dispara na montagem
	useEffect(() => {
		capturePublicCalcEvent("public_calc_started", funnelProps);
	}, []);

	function set<K extends keyof WizardState>(key: K, value: WizardState[K]) {
		setState((current) => ({ ...current, [key]: value }));
	}

	const isLast = step === STEP_COUNT - 1;
	const canAdvance = isStepComplete(state, step);
	const remaining = STEP_COUNT - step - 1;

	function advance() {
		if (!canAdvance) return;
		capturePublicCalcEvent("public_calc_step", {
			...funnelProps,
			step,
			label: STEP_LABELS[step],
		});
		if (!isLast) {
			setStep(step + 1);
			return;
		}
		mutate({ data: toPayload(state, source, widget) });
	}

	const errorStatus = (error as { response?: { status?: number } } | null)
		?.response?.status;

	const body = (
		<div className="space-y-4 md:space-y-6">
			<div className="space-y-2">
				<div className="flex items-center justify-between text-muted-foreground text-xs">
					<span>
						Passo {step + 1} de {STEP_COUNT}
					</span>
					<span>
						{remaining === 0
							? "última pergunta"
							: `faltam ${remaining} ${remaining === 1 ? "pergunta" : "perguntas"}`}
					</span>
				</div>
				<Progress value={((step + 1) / STEP_COUNT) * 100} />
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
								Como o seu trabalho terminou?
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
								{option.label}
							</OptionButton>
						))}
						<button
							type="button"
							className="text-muted-foreground text-xs underline underline-offset-4 hover:text-foreground"
							onClick={() => setShowOtherTermination(true)}
						>
							Foi acordo ou fim de contrato temporário
						</button>
						{showOtherTermination && (
							<InfoBanner variant="info">
								O acordo do art. 484-A e o fim de contrato por prazo determinado
								seguem outra conta, que esta calculadora ainda não faz. Encaixar
								no tipo mais parecido daria um número errado. Faça o cálculo
								pelo motivo mais próximo para ter uma ideia e procure um
								advogado trabalhista para o número exato.
							</InfoBanner>
						)}
					</div>
				)}

				{step === 1 && (
					<div className="space-y-4">
						<div>
							<h2 className="font-semibold text-foreground text-xl">
								Quando você entrou e quando saiu?
							</h2>
							<p className="text-muted-foreground text-sm">
								{STEP_SUBTITLES[1]}
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="startDate">Data de entrada</Label>
							<Input
								id="startDate"
								type="date"
								value={state.startDate}
								onChange={(e) => set("startDate", e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="endDate">Data de saída</Label>
							<Input
								id="endDate"
								type="date"
								value={state.endDate}
								onChange={(e) => set("endDate", e.target.value)}
							/>
						</div>
						{state.startDate !== "" &&
							state.endDate !== "" &&
							state.startDate > state.endDate && (
								<InfoBanner variant="warning">
									A data de saída está antes da data de entrada.
								</InfoBanner>
							)}
					</div>
				)}

				{step === 2 && (
					<div className="space-y-4">
						<div>
							<h2 className="font-semibold text-foreground text-xl">
								Qual era o seu último salário?
							</h2>
							<p className="text-muted-foreground text-sm">
								{STEP_SUBTITLES[2]}
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastSalary" className="flex items-center gap-1.5">
								Salário mensal
								<HelpTip title="Qual valor usar">
									O salário bruto do último mês, antes dos descontos de INSS e
									imposto de renda. Se você recebia comissão ou prêmio todo mês,
									some a média deles.
								</HelpTip>
							</Label>
							<CurrencyInput
								id="lastSalary"
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
								Você trabalhava com carteira assinada?
							</h2>
							<p className="text-muted-foreground text-sm">
								{STEP_SUBTITLES[3]}
							</p>
						</div>
						<OptionButton
							selected={state.registeredContract}
							onClick={() => set("registeredContract", true)}
						>
							Sim, tinha registro na carteira
						</OptionButton>
						<OptionButton
							selected={!state.registeredContract}
							onClick={() => set("registeredContract", false)}
						>
							Não, trabalhava sem registro
						</OptionButton>
						{!state.registeredContract && (
							<InfoBanner variant="tip">
								Sem registro, você tem direito às mesmas verbas — mas primeiro é
								preciso reconhecer o vínculo na Justiça. O cálculo já considera
								esse cenário.
							</InfoBanner>
						)}
					</div>
				)}

				{step === 4 && (
					<div className="space-y-3">
						<div>
							<h2 className="font-semibold text-foreground text-xl">
								Você cumpriu o aviso prévio trabalhando?
							</h2>
							<p className="text-muted-foreground text-sm">
								{STEP_SUBTITLES[4]}
							</p>
						</div>
						<OptionButton
							selected={state.priorNoticeWorked}
							onClick={() => set("priorNoticeWorked", true)}
						>
							Sim, trabalhei o aviso
						</OptionButton>
						<OptionButton
							selected={!state.priorNoticeWorked}
							onClick={() => set("priorNoticeWorked", false)}
						>
							Não, saí na hora ou fui dispensado do aviso
						</OptionButton>
					</div>
				)}

				{step === 5 && (
					<div className="space-y-4">
						<div>
							<h2 className="font-semibold text-foreground text-xl">
								Ficou faltando receber férias ou 13º?
							</h2>
							<p className="text-muted-foreground text-sm">
								{STEP_SUBTITLES[5]}
							</p>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="vacationVencidasCount"
								className="flex items-center gap-1.5"
							>
								Períodos de férias que você não tirou
								<HelpTip title="Férias vencidas">
									A cada 12 meses trabalhados nasce um período de 30 dias de
									férias. Conte quantos períodos completos você deixou de tirar.
									Se tirou todos, deixe zero.
								</HelpTip>
							</Label>
							<Input
								id="vacationVencidasCount"
								type="number"
								min={0}
								max={10}
								value={state.vacationVencidasCount}
								onChange={(e) => set("vacationVencidasCount", e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="unpaid13ths" className="flex items-center gap-1.5">
								13º salários que não foram pagos
								<HelpTip title="13º em aberto">
									Conte só os 13º que a empresa deixou de pagar por inteiro. O
									13º proporcional do ano da saída já entra no cálculo
									automaticamente.
								</HelpTip>
							</Label>
							<Input
								id="unpaid13ths"
								type="number"
								min={0}
								max={10}
								value={state.unpaid13ths}
								onChange={(e) => set("unpaid13ths", e.target.value)}
							/>
						</div>
					</div>
				)}

				{step === 6 && (
					<div className="space-y-5">
						<div>
							<h2 className="font-semibold text-foreground text-xl">
								Alguma dessas situações fazia parte do seu dia a dia?
							</h2>
							<p className="text-muted-foreground text-sm">
								{STEP_SUBTITLES[6]}
							</p>
						</div>
						{ADDITIONALS.map((item) => (
							<div key={item.field} className="space-y-2">
								<p className="flex items-center gap-1.5 font-medium text-sm">
									{item.label}
									<HelpTip title={item.label}>{item.help}</HelpTip>
								</p>
								<div className="grid grid-cols-3 gap-2">
									{LAY_OPTIONS.map((option) => (
										<OptionButton
											key={option.value}
											selected={state[item.field] === option.value}
											onClick={() => set(item.field, option.value)}
										>
											{option.label}
										</OptionButton>
									))}
								</div>
							</div>
						))}
						<InfoBanner variant="tip">
							"Não sei" é uma resposta válida: a verba entra no valor mais alto
							da faixa, como algo a apurar com documento.
						</InfoBanner>
					</div>
				)}
			</motion.div>

			{error ? (
				<InfoBanner variant="warning">
					{errorStatus === 429
						? "Você fez muitos cálculos seguidos. Tente de novo daqui a pouco."
						: "Não conseguimos calcular agora. Tente de novo em alguns instantes."}
				</InfoBanner>
			) : null}

			{/* Grudado na base no celular: quem responde com o polegar não deve
			    precisar rolar para achar o botão de avançar. */}
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
							{isPending ? "Calculando..." : "Ver meu cálculo"}
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

	if (embedded) {
		return body;
	}

	return (
		<WizardShell
			title="Quanto você tem a receber?"
			subtitle="Sete perguntas em linguagem simples. Grátis, sem cadastro, cerca de dois minutos."
			rail={
				<StepRail
					labels={STEP_LABELS}
					current={step}
					onSelect={setStep}
					isComplete={(index) => isStepComplete(state, index)}
				/>
			}
		>
			{body}
		</WizardShell>
	);
}
