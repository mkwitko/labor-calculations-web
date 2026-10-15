export type Vacation13thFormState = {
	monthlySalary: string;
	startDate: string;
	/** Quem ainda trabalha lá não tem data de saída — a referência é hoje. */
	stillEmployed: boolean;
	endDate: string;
	vacationVencidasCount: string;
	unpaid13ths: string;
};

export const INITIAL_VACATION_13TH_STATE: Vacation13thFormState = {
	monthlySalary: "",
	startDate: "",
	stillEmployed: true,
	endDate: "",
	vacationVencidasCount: "0",
	unpaid13ths: "0",
};

/** Mesmos tetos do schema do back: acima disso a resposta seria 400. */
const MAX_COUNT = 10;
const MAX_SALARY = 1_000_000;

function isValidCount(value: string): boolean {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed >= 0 && parsed <= MAX_COUNT;
}

export function isVacation13thComplete(state: Vacation13thFormState): boolean {
	const salary = Number(state.monthlySalary);

	if (!Number.isFinite(salary) || salary <= 0 || salary > MAX_SALARY) {
		return false;
	}

	if (state.startDate === "") return false;

	if (!state.stillEmployed) {
		if (state.endDate === "") return false;
		if (state.endDate < state.startDate) return false;
	}

	return (
		isValidCount(state.vacationVencidasCount) && isValidCount(state.unpaid13ths)
	);
}

export function toVacation13thPayload(
	state: Vacation13thFormState,
	source: string,
	widget?: { widgetKey: string; hostSite?: string },
) {
	return {
		...(widget
			? { widgetKey: widget.widgetKey, hostSite: widget.hostSite }
			: {}),
		monthlySalary: Number(state.monthlySalary),
		startDate: state.startDate,
		endDate: state.stillEmployed ? undefined : state.endDate,
		vacationVencidasCount: Number(state.vacationVencidasCount),
		unpaid13ths: Number(state.unpaid13ths),
		source,
	};
}
