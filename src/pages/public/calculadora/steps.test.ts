import { describe, expect, it } from "vitest";
import {
	INITIAL_STATE,
	isStepComplete,
	toPayload,
	type WizardState,
} from "./steps";

const filled: WizardState = {
	terminationType: "sem_justa_causa",
	startDate: "2020-01-10",
	endDate: "2024-06-20",
	lastSalary: "3000",
	registeredContract: true,
	priorNoticeWorked: false,
	unpaid13ths: "1",
	vacationVencidasCount: "1",
	extraHours: "nao",
	nightWork: "nao",
	insalubrity: "nao",
	dangerousWork: "nao",
};

describe("isStepComplete", () => {
	it("barra avanço enquanto o passo não foi respondido", () => {
		expect(isStepComplete(INITIAL_STATE, 0)).toBe(false);
		expect(isStepComplete(filled, 0)).toBe(true);
	});

	it("exige as duas datas no passo de período", () => {
		expect(isStepComplete({ ...filled, endDate: "" }, 1)).toBe(false);
		expect(isStepComplete(filled, 1)).toBe(true);
	});

	it("recusa saída anterior à entrada", () => {
		expect(
			isStepComplete(
				{ ...filled, startDate: "2024-01-01", endDate: "2020-01-01" },
				1,
			),
		).toBe(false);
	});

	it("recusa salário zerado ou não numérico", () => {
		expect(isStepComplete({ ...filled, lastSalary: "0" }, 2)).toBe(false);
		expect(isStepComplete({ ...filled, lastSalary: "abc" }, 2)).toBe(false);
	});

	it("exige as quatro respostas do passo de adicionais", () => {
		expect(isStepComplete({ ...filled, insalubrity: "" }, 6)).toBe(false);
		expect(isStepComplete(filled, 6)).toBe(true);
	});
});

describe("toPayload", () => {
	it("converte os campos de texto em número", () => {
		const payload = toPayload(filled, "site");

		expect(payload.lastSalary).toBe(3000);
		expect(payload.unpaid13ths).toBe(1);
		expect(payload.vacationVencidasCount).toBe(1);
		expect(payload.source).toBe("site");
		expect(payload.terminationType).toBe("sem_justa_causa");
	});
});
