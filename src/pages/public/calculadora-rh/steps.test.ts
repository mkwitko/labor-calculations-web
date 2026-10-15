import { describe, expect, it } from "vitest";
import {
	isRhStepComplete,
	RH_INITIAL_STATE,
	type RhState,
	toRhPayload,
} from "./steps";

const filled: RhState = {
	terminationType: "sem_justa_causa",
	startDate: "2020-01-10",
	endDate: "2024-06-20",
	lastSalary: "5000",
	priorNoticeWorked: true,
	unpaid13ths: "0",
	vacationVencidasCount: "1",
	extraHours: true,
	nightWork: false,
	insalubrity: false,
	dangerousWork: true,
};

describe("isRhStepComplete", () => {
	it("barra avanço sem motivo do desligamento", () => {
		expect(isRhStepComplete(RH_INITIAL_STATE, 0)).toBe(false);
		expect(isRhStepComplete(filled, 0)).toBe(true);
	});

	it("recusa saída anterior à entrada", () => {
		expect(
			isRhStepComplete(
				{ ...filled, startDate: "2024-01-01", endDate: "2020-01-01" },
				1,
			),
		).toBe(false);
	});

	it("recusa remuneração zerada", () => {
		expect(isRhStepComplete({ ...filled, lastSalary: "0" }, 2)).toBe(false);
	});
});

describe("toRhPayload", () => {
	it("manda a perspectiva de empresa", () => {
		expect(toRhPayload(filled, "rh").perspective).toBe("empresa");
	});

	it("converte sim e não do RH para as respostas da API", () => {
		const payload = toRhPayload(filled, "rh");

		expect(payload.extraHours).toBe("sim");
		expect(payload.nightWork).toBe("nao");
		expect(payload.dangerousWork).toBe("sim");
		// Quem tem folha tem registro: o wizard do RH não faz essa pergunta.
		expect(payload.registeredContract).toBe(true);
	});
});
