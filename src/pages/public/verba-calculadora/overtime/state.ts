// Campos numéricos ficam como string enquanto estão em input controlado: quem
// digita "3" para chegar em "30" não pode ver o valor virar 3 e voltar. Mesma
// convenção do wizard de rescisão (`calculadora/steps.ts`).
export type OvertimeFormState = {
	monthlySalary: string;
	weeklySchedule: "44" | "40";
	extraHoursPerWeek: string;
	startDate: string;
	endDate: string;
};

export const INITIAL_OVERTIME_STATE: OvertimeFormState = {
	monthlySalary: "",
	weeklySchedule: "44",
	extraHoursPerWeek: "",
	startDate: "",
	endDate: "",
};

/** Mesmos tetos do schema do back: acima disso a resposta seria 400. */
const MAX_EXTRA_HOURS_PER_WEEK = 40;
const MAX_SALARY = 1_000_000;

export function isOvertimeComplete(state: OvertimeFormState): boolean {
	const salary = Number(state.monthlySalary);
	const hours = Number(state.extraHoursPerWeek);

	if (!Number.isFinite(salary) || salary <= 0 || salary > MAX_SALARY) {
		return false;
	}

	if (
		!Number.isFinite(hours) ||
		hours <= 0 ||
		hours > MAX_EXTRA_HOURS_PER_WEEK
	) {
		return false;
	}

	if (state.startDate === "" || state.endDate === "") return false;

	return state.startDate <= state.endDate;
}

export function toOvertimePayload(
	state: OvertimeFormState,
	source: string,
	widget?: { widgetKey: string; hostSite?: string },
) {
	return {
		...(widget
			? { widgetKey: widget.widgetKey, hostSite: widget.hostSite }
			: {}),
		monthlySalary: Number(state.monthlySalary),
		weeklySchedule: Number(state.weeklySchedule) as 44 | 40,
		extraHoursPerWeek: Number(state.extraHoursPerWeek),
		startDate: state.startDate,
		endDate: state.endDate,
		source,
	};
}
