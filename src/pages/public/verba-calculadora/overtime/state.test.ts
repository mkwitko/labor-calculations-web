import { describe, expect, it } from "vitest";
import {
	INITIAL_OVERTIME_STATE,
	isOvertimeComplete,
	type OvertimeFormState,
	toOvertimePayload,
} from "./state";

const preenchido: OvertimeFormState = {
	monthlySalary: "3000",
	weeklySchedule: "44",
	extraHoursPerWeek: "5",
	startDate: "2021-01-01",
	endDate: "2024-12-31",
};

describe("isOvertimeComplete", () => {
	it("recusa o estado inicial", () => {
		expect(isOvertimeComplete(INITIAL_OVERTIME_STATE)).toBe(false);
	});

	it("aceita o formulário preenchido", () => {
		expect(isOvertimeComplete(preenchido)).toBe(true);
	});

	it("recusa salário zero ou negativo", () => {
		expect(isOvertimeComplete({ ...preenchido, monthlySalary: "0" })).toBe(
			false,
		);
		expect(isOvertimeComplete({ ...preenchido, monthlySalary: "-100" })).toBe(
			false,
		);
	});

	it("recusa período invertido", () => {
		expect(
			isOvertimeComplete({
				...preenchido,
				startDate: "2024-12-31",
				endDate: "2021-01-01",
			}),
		).toBe(false);
	});

	it("recusa horas extras acima do teto do back", () => {
		expect(isOvertimeComplete({ ...preenchido, extraHoursPerWeek: "80" })).toBe(
			false,
		);
	});
});

describe("toOvertimePayload", () => {
	it("converte texto em número e mantém a origem", () => {
		const payload = toOvertimePayload(preenchido, "seo:horas-extras");

		expect(payload.monthlySalary).toBe(3000);
		expect(payload.weeklySchedule).toBe(44);
		expect(payload.extraHoursPerWeek).toBe(5);
		expect(payload.source).toBe("seo:horas-extras");
	});

	it("inclui a chave do widget quando o cálculo nasce em site de terceiro", () => {
		const payload = toOvertimePayload(preenchido, "widget", {
			widgetKey: "chave-de-teste-longa",
			hostSite: "escritorio.com.br",
		});

		expect(payload.widgetKey).toBe("chave-de-teste-longa");
		expect(payload.hostSite).toBe("escritorio.com.br");
	});
});
