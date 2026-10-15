import { describe, expect, it } from "vitest";
import {
	INITIAL_VACATION_13TH_STATE,
	isVacation13thComplete,
	toVacation13thPayload,
	type Vacation13thFormState,
} from "./state";

const preenchido: Vacation13thFormState = {
	monthlySalary: "3000",
	startDate: "2021-03-01",
	stillEmployed: true,
	endDate: "",
	vacationVencidasCount: "1",
	unpaid13ths: "0",
};

describe("isVacation13thComplete", () => {
	it("recusa o estado inicial", () => {
		expect(isVacation13thComplete(INITIAL_VACATION_13TH_STATE)).toBe(false);
	});

	it("aceita quem ainda trabalha, sem data de saída", () => {
		expect(isVacation13thComplete(preenchido)).toBe(true);
	});

	it("exige data de saída de quem não trabalha mais lá", () => {
		expect(isVacation13thComplete({ ...preenchido, stillEmployed: false })).toBe(
			false,
		);

		expect(
			isVacation13thComplete({
				...preenchido,
				stillEmployed: false,
				endDate: "2024-01-10",
			}),
		).toBe(true);
	});

	it("recusa saída anterior à admissão", () => {
		expect(
			isVacation13thComplete({
				...preenchido,
				stillEmployed: false,
				endDate: "2020-01-01",
			}),
		).toBe(false);
	});

	it("recusa contagens acima do teto do back", () => {
		expect(
			isVacation13thComplete({ ...preenchido, vacationVencidasCount: "50" }),
		).toBe(false);
		expect(isVacation13thComplete({ ...preenchido, unpaid13ths: "50" })).toBe(
			false,
		);
	});
});

describe("toVacation13thPayload", () => {
	it("omite a data de saída de quem ainda trabalha", () => {
		const payload = toVacation13thPayload(preenchido, "seo:ferias-e-13o");

		expect(payload.endDate).toBeUndefined();
		expect(payload.monthlySalary).toBe(3000);
		expect(payload.vacationVencidasCount).toBe(1);
	});

	it("manda a data de saída de quem já saiu", () => {
		const payload = toVacation13thPayload(
			{ ...preenchido, stillEmployed: false, endDate: "2024-01-10" },
			"site",
		);

		expect(payload.endDate).toBe("2024-01-10");
	});
});
