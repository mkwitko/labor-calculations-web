export type LayAnswer = "sim" | "nao" | "nao_sei";

export type TerminationType =
	| "sem_justa_causa"
	| "com_justa_causa"
	| "pedido_demissao"
	| "rescisao_indireta";

// Campos numéricos ficam como string enquanto estão em input controlado: quem
// digita "3" para chegar em "30" não pode ver o valor virar 3 e voltar.
export type WizardState = {
	terminationType: TerminationType | "";
	startDate: string;
	endDate: string;
	lastSalary: string;
	registeredContract: boolean;
	priorNoticeWorked: boolean;
	unpaid13ths: string;
	vacationVencidasCount: string;
	extraHours: LayAnswer | "";
	nightWork: LayAnswer | "";
	insalubrity: LayAnswer | "";
	dangerousWork: LayAnswer | "";
};

export const INITIAL_STATE: WizardState = {
	terminationType: "",
	startDate: "",
	endDate: "",
	lastSalary: "",
	registeredContract: true,
	priorNoticeWorked: false,
	unpaid13ths: "0",
	vacationVencidasCount: "0",
	extraHours: "",
	nightWork: "",
	insalubrity: "",
	dangerousWork: "",
};

export const STEP_COUNT = 7;

/** Rótulos curtos da trilha lateral — na ordem dos passos. */
export const STEP_LABELS = [
	"Motivo da saída",
	"Período trabalhado",
	"Salário",
	"Registro em carteira",
	"Aviso prévio",
	"Férias e 13º",
	"Adicionais",
];

export function isStepComplete(state: WizardState, step: number): boolean {
	switch (step) {
		case 0:
			return state.terminationType !== "";
		case 1:
			return (
				state.startDate !== "" &&
				state.endDate !== "" &&
				state.startDate <= state.endDate
			);
		case 2: {
			const salary = Number(state.lastSalary);
			return Number.isFinite(salary) && salary > 0;
		}
		// Carteira assinada e aviso prévio são booleanos: já nascem respondidos.
		case 3:
			return true;
		case 4:
			return true;
		case 5:
			return (
				Number.isFinite(Number(state.unpaid13ths)) &&
				Number.isFinite(Number(state.vacationVencidasCount))
			);
		case 6:
			return (
				state.extraHours !== "" &&
				state.nightWork !== "" &&
				state.insalubrity !== "" &&
				state.dangerousWork !== ""
			);
		default:
			return false;
	}
}

/**
 * `widget` só existe quando o wizard roda dentro do site de um escritório: a
 * chave é o que faz o cálculo cair na fila dele, e o host é o que ajuda o
 * escritório a se localizar quando tem mais de um site.
 */
export function toPayload(
	state: WizardState,
	source: string,
	widget?: { widgetKey: string; hostSite?: string },
) {
	return {
		...(widget
			? { widgetKey: widget.widgetKey, hostSite: widget.hostSite }
			: {}),
		terminationType: state.terminationType as TerminationType,
		startDate: state.startDate,
		endDate: state.endDate,
		lastSalary: Number(state.lastSalary),
		registeredContract: state.registeredContract,
		priorNoticeWorked: state.priorNoticeWorked,
		unpaid13ths: Number(state.unpaid13ths),
		vacationVencidasCount: Number(state.vacationVencidasCount),
		extraHours: state.extraHours as LayAnswer,
		nightWork: state.nightWork as LayAnswer,
		insalubrity: state.insalubrity as LayAnswer,
		dangerousWork: state.dangerousWork as LayAnswer,
		source,
	};
}
