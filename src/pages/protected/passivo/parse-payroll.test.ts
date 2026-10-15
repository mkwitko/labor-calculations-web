import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { parsePayrollFile, TEMPLATE_EXAMPLE_ROWS } from "./parse-payroll";

/** Monta um arquivo em memória com o mesmo formato que o usuário sobe. */
function fileFrom(rows: Record<string, unknown>[]): File {
	const sheet = XLSX.utils.json_to_sheet(rows);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, sheet, "folha");
	const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
	return new File([buffer], "folha.xlsx");
}

const valid = {
	referencia: "001",
	admissao: "2020-01-10",
	desligamento: "2024-06-20",
	remuneracao: 3500,
	motivo: "sem_justa_causa",
	aviso_trabalhado: "nao",
	ferias_vencidas: 1,
	decimos_terceiros_em_aberto: 0,
	hora_extra: "sim",
	noturno: "nao",
	insalubridade: "nao",
	periculosidade: "nao",
};

describe("parsePayrollFile", () => {
	it("conta todas as linhas encontradas, válidas ou não", async () => {
		const result = await parsePayrollFile(
			fileFrom([valid, { ...valid, referencia: "002", remuneracao: 0 }]),
		);

		expect(result.total).toBe(2);
		expect(result.rows).toHaveLength(1);
		expect(result.problems).toHaveLength(1);
	});

	it("aceita cabeçalho com acento e maiúscula", async () => {
		const result = await parsePayrollFile(
			fileFrom([
				{
					Referência: "001",
					Admissão: "2020-01-10",
					Desligamento: "2024-06-20",
					Remuneração: 3500,
					Motivo: "sem justa causa",
				},
			]),
		);

		expect(result.rows).toHaveLength(1);
		expect(result.rows[0].terminationType).toBe("sem_justa_causa");
	});

	it("aceita data brasileira e valor com vírgula", async () => {
		const result = await parsePayrollFile(
			fileFrom([
				{
					...valid,
					admissao: "10/01/2020",
					desligamento: "20/06/2024",
					remuneracao: "3.500,50",
				},
			]),
		);

		expect(result.rows[0].startDate).toBe("2020-01-10");
		expect(result.rows[0].endDate).toBe("2024-06-20");
		expect(result.rows[0].lastSalary).toBeCloseTo(3500.5, 2);
	});

	it("aponta a linha do arquivo no problema", async () => {
		const result = await parsePayrollFile(
			fileFrom([valid, { ...valid, referencia: "002", motivo: "inventado" }]),
		);

		// Linha 3: cabeçalho é a 1, o primeiro registro é a 2.
		expect(result.problems[0].line).toBe(3);
		expect(result.problems[0].reason).toContain("Motivo");
	});

	it("recusa data que casa com o formato mas não existe no calendário", async () => {
		const result = await parsePayrollFile(
			fileFrom([
				{ ...valid, admissao: "32/13/2020" },
				{ ...valid, referencia: "002", desligamento: "2024-02-30" },
			]),
		);

		expect(result.rows).toHaveLength(0);
		expect(result.problems[0].reason).toContain("admissão");
		expect(result.problems[1].reason).toContain("desligamento");
	});

	it("recusa desligamento anterior à admissão", async () => {
		const result = await parsePayrollFile(
			fileFrom([
				{ ...valid, admissao: "2024-06-20", desligamento: "2020-01-10" },
			]),
		);

		expect(result.rows).toHaveLength(0);
		expect(result.problems[0].reason).toContain("anterior");
	});

	it("lê sim e não em variações", async () => {
		const result = await parsePayrollFile(
			fileFrom([
				{ ...valid, hora_extra: "S", noturno: 1, insalubridade: "x" },
			]),
		);

		expect(result.rows[0].extraHours).toBe("sim");
		expect(result.rows[0].nightWork).toBe("sim");
		expect(result.rows[0].insalubrity).toBe("sim");
		expect(result.rows[0].dangerousWork).toBe("nao");
	});

	it("aceita todas as linhas de exemplo da planilha modelo", async () => {
		// O modelo é a documentação do formato: exemplo que o parser rejeita é
		// documentação errada. As linhas cobrem os quatro motivos e misturam os
		// formatos aceitos (data ISO e brasileira, número e texto com vírgula).
		const result = await parsePayrollFile(
			fileFrom(TEMPLATE_EXAMPLE_ROWS.map((row) => ({ ...row }))),
		);

		expect(result.problems).toEqual([]);
		expect(result.rows).toHaveLength(TEMPLATE_EXAMPLE_ROWS.length);
		expect(result.rows.map((row) => row.terminationType).sort()).toEqual([
			"com_justa_causa",
			"pedido_demissao",
			"rescisao_indireta",
			"sem_justa_causa",
		]);
	});
});
