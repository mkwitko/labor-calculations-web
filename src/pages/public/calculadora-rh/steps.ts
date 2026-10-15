import type {
	LayAnswer,
	TerminationType,
	WizardState,
} from "../calculadora/steps";

/**
 * O RH responde com a folha na mão, então aqui não existe "não sei": as
 * respostas de adicional são sim ou não. O estado reaproveita o do wizard do
 * trabalhador para que o corpo enviado à API continue sendo um só.
 */
export type RhState = Omit<
	WizardState,
	"registeredContract" | "extraHours" | "nightWork" | "insalubrity" | "dangerousWork"
> & {
	extraHours: boolean;
	nightWork: boolean;
	insalubrity: boolean;
	dangerousWork: boolean;
};

export const RH_INITIAL_STATE: RhState = {
	terminationType: "",
	startDate: "",
	endDate: "",
	lastSalary: "",
	priorNoticeWorked: false,
	unpaid13ths: "0",
	vacationVencidasCount: "0",
	extraHours: false,
	nightWork: false,
	insalubrity: false,
	dangerousWork: false,
};

export const RH_STEP_COUNT = 6;

export const RH_STEP_LABELS = [
	"Motivo do desligamento",
	"Período do contrato",
	"Remuneração",
	"Aviso prévio",
	"Verbas em aberto",
	"Adicionais na folha",
];

export function isRhStepComplete(state: RhState, step: number): boolean {
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
		case 3:
			return true;
		case 4:
			return (
				Number.isFinite(Number(state.unpaid13ths)) &&
				Number.isFinite(Number(state.vacationVencidasCount))
			);
		case 5:
			return true;
		default:
			return false;
	}
}

function answer(value: boolean): LayAnswer {
	return value ? "sim" : "nao";
}

export function toRhPayload(state: RhState, source: string) {
	return {
		terminationType: state.terminationType as TerminationType,
		startDate: state.startDate,
		endDate: state.endDate,
		lastSalary: Number(state.lastSalary),
		// Quem tem folha de pagamento tem registro — a pergunta não se faz aqui.
		registeredContract: true,
		priorNoticeWorked: state.priorNoticeWorked,
		unpaid13ths: Number(state.unpaid13ths),
		vacationVencidasCount: Number(state.vacationVencidasCount),
		extraHours: answer(state.extraHours),
		nightWork: answer(state.nightWork),
		insalubrity: answer(state.insalubrity),
		dangerousWork: answer(state.dangerousWork),
		source,
		perspective: "empresa" as const,
	};
}
