/**
 * Leitura da folha no browser: CSV ou XLSX, com o `xlsx` que já é dependência
 * (carregado sob demanda, como em `export-liquidation-xlsx.ts`).
 *
 * Ler aqui em vez de no servidor tem uma razão de produto: a pessoa vê quantos
 * funcionários foram encontrados e o que deu problema **antes** de esperar o
 * cálculo. Descobrir que o arquivo estava errado depois de um minuto de espera
 * é o pior momento possível.
 */

export type ParsedRow = {
	reference: string;
	terminationType:
		| "sem_justa_causa"
		| "com_justa_causa"
		| "pedido_demissao"
		| "rescisao_indireta";
	startDate: string;
	endDate: string;
	lastSalary: number;
	priorNoticeWorked: boolean;
	unpaid13ths: number;
	vacationVencidasCount: number;
	extraHours: "sim" | "nao";
	nightWork: "sim" | "nao";
	insalubrity: "sim" | "nao";
	dangerousWork: "sim" | "nao";
};

export type ParseProblem = { line: number; reference: string; reason: string };

export type ParseResult = {
	rows: ParsedRow[];
	problems: ParseProblem[];
	/** Total de linhas encontradas no arquivo, válidas ou não. */
	total: number;
};

export const TEMPLATE_COLUMNS = [
	"referencia",
	"admissao",
	"desligamento",
	"remuneracao",
	"motivo",
	"aviso_trabalhado",
	"ferias_vencidas",
	"decimos_terceiros_em_aberto",
	"hora_extra",
	"noturno",
	"insalubridade",
	"periculosidade",
] as const;

const MOTIVOS: Record<string, ParsedRow["terminationType"]> = {
	sem_justa_causa: "sem_justa_causa",
	"sem justa causa": "sem_justa_causa",
	dispensa: "sem_justa_causa",
	com_justa_causa: "com_justa_causa",
	"justa causa": "com_justa_causa",
	pedido_demissao: "pedido_demissao",
	"pedido de demissao": "pedido_demissao",
	"pedido de demissão": "pedido_demissao",
	rescisao_indireta: "rescisao_indireta",
	"rescisao indireta": "rescisao_indireta",
	"rescisão indireta": "rescisao_indireta",
};

/** Cabeçalho vem como a empresa exportou: acento, maiúscula e espaço. */
function normalizeKey(key: string): string {
	return key
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/\s+/g, "_");
}

function toBoolean(value: unknown): boolean {
	const text = String(value ?? "")
		.trim()
		.toLowerCase();
	return ["sim", "s", "1", "true", "verdadeiro", "x"].includes(text);
}

function toNumber(value: unknown): number {
	if (typeof value === "number") return value;
	const text = String(value ?? "").trim();
	if (text === "") return Number.NaN;
	// Aceita 1.234,56 e 1234.56 — planilha brasileira exporta os dois.
	const normalized = text.includes(",")
		? text.replace(/\./g, "").replace(",", ".")
		: text;
	return Number(normalized.replace(/[^0-9.-]/g, ""));
}

/**
 * Bater no formato não basta: `32/13/2020` casa com o regex brasileiro e
 * viraria `2020-13-32`. Só é data se o calendário devolver o mesmo dia.
 */
function isRealIsoDate(iso: string): boolean {
	const date = new Date(`${iso}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso;
}

/** Datas chegam como texto, serial do Excel ou objeto Date. */
function toIsoDate(value: unknown): string | null {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime())
			? null
			: value.toISOString().slice(0, 10);
	}

	const text = String(value ?? "").trim();
	if (text === "") return null;

	if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
		return isRealIsoDate(text) ? text : null;
	}

	const brazilian = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (brazilian) {
		const iso = `${brazilian[3]}-${brazilian[2]}-${brazilian[1]}`;
		return isRealIsoDate(iso) ? iso : null;
	}

	const parsed = new Date(text);
	return Number.isNaN(parsed.getTime())
		? null
		: parsed.toISOString().slice(0, 10);
}

export async function parsePayrollFile(file: File): Promise<ParseResult> {
	const XLSX = await import("xlsx");
	const buffer = await file.arrayBuffer();
	const workbook = XLSX.read(buffer, { cellDates: true });
	const sheet = workbook.Sheets[workbook.SheetNames[0]];
	const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
		defval: "",
	});

	const rows: ParsedRow[] = [];
	const problems: ParseProblem[] = [];

	raw.forEach((original, index) => {
		// +2: a primeira linha da planilha é o cabeçalho, e a contagem humana
		// começa em 1. O número que aparece na tela precisa bater com o que a
		// pessoa vê ao abrir o arquivo.
		const line = index + 2;

		const row: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(original)) {
			row[normalizeKey(key)] = value;
		}

		const reference = String(row.referencia ?? "").trim();
		const startDate = toIsoDate(row.admissao);
		const endDate = toIsoDate(row.desligamento);
		const lastSalary = toNumber(row.remuneracao);
		const motivo = MOTIVOS[String(row.motivo ?? "").trim().toLowerCase()];

		const reject = (reason: string) => {
			problems.push({ line, reference: reference || `linha ${line}`, reason });
		};

		if (!reference) return reject("Sem referência (matrícula ou nome)");
		if (!startDate) return reject("Data de admissão inválida");
		if (!endDate) return reject("Data de desligamento inválida");
		if (endDate < startDate) return reject("Desligamento anterior à admissão");
		if (!Number.isFinite(lastSalary) || lastSalary <= 0) {
			return reject("Remuneração inválida");
		}
		if (!motivo) return reject("Motivo do desligamento não reconhecido");

		rows.push({
			reference,
			terminationType: motivo,
			startDate,
			endDate,
			lastSalary,
			priorNoticeWorked: toBoolean(row.aviso_trabalhado),
			unpaid13ths: Math.max(0, toNumber(row.decimos_terceiros_em_aberto) || 0),
			vacationVencidasCount: Math.max(0, toNumber(row.ferias_vencidas) || 0),
			extraHours: toBoolean(row.hora_extra) ? "sim" : "nao",
			nightWork: toBoolean(row.noturno) ? "sim" : "nao",
			insalubrity: toBoolean(row.insalubridade) ? "sim" : "nao",
			dangerousWork: toBoolean(row.periculosidade) ? "sim" : "nao",
		});
	});

	return { rows, problems, total: raw.length };
}

/**
 * Linhas de exemplo do modelo. Uma por motivo de desligamento, misturando de
 * propósito os formatos que o parser aceita (data ISO e brasileira, número e
 * texto com vírgula, sim/não em variações) — o exemplo é a documentação de que
 * a planilha da empresa não precisa ser reformatada. O teste garante que todas
 * passam no parser sem problema.
 */
export const TEMPLATE_EXAMPLE_ROWS = [
	{
		referencia: "001 — Maria Silva",
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
	},
	{
		referencia: "002 — João Souza",
		admissao: "15/03/2021",
		desligamento: "30/11/2025",
		remuneracao: "4.250,00",
		motivo: "pedido de demissão",
		aviso_trabalhado: "sim",
		ferias_vencidas: 0,
		decimos_terceiros_em_aberto: 0,
		hora_extra: "não",
		noturno: "sim",
		insalubridade: "nao",
		periculosidade: "nao",
	},
	{
		referencia: "003 — Ana Pereira",
		admissao: "01/02/2019",
		desligamento: "10/01/2026",
		remuneracao: 2800,
		motivo: "justa causa",
		aviso_trabalhado: "nao",
		ferias_vencidas: 2,
		decimos_terceiros_em_aberto: 1,
		hora_extra: "nao",
		noturno: "nao",
		insalubridade: "sim",
		periculosidade: "nao",
	},
	{
		referencia: "004 — Carlos Lima",
		admissao: "2022-07-01",
		desligamento: "2025-12-15",
		remuneracao: "6200",
		motivo: "rescisao indireta",
		aviso_trabalhado: "nao",
		ferias_vencidas: 0,
		decimos_terceiros_em_aberto: 0,
		hora_extra: "sim",
		noturno: "nao",
		insalubridade: "nao",
		periculosidade: "sim",
	},
] as const;

/** Aba de instruções do modelo: uma linha por coluna, sem depender de estilo. */
const TEMPLATE_INSTRUCTIONS = [
	{
		coluna: "referencia",
		obrigatoria: "sim",
		descricao: "Matrícula ou nome do funcionário, só para você identificar",
		valores: "Texto livre",
	},
	{
		coluna: "admissao",
		obrigatoria: "sim",
		descricao: "Data de admissão",
		valores: "dd/mm/aaaa ou aaaa-mm-dd (ou célula de data do Excel)",
	},
	{
		coluna: "desligamento",
		obrigatoria: "sim",
		descricao: "Data do desligamento",
		valores: "dd/mm/aaaa ou aaaa-mm-dd (ou célula de data do Excel)",
	},
	{
		coluna: "remuneracao",
		obrigatoria: "sim",
		descricao: "Último salário mensal",
		valores: "Número — 3500, 3500.50 ou 3.500,50",
	},
	{
		coluna: "motivo",
		obrigatoria: "sim",
		descricao: "Motivo do desligamento",
		valores:
			"sem justa causa · justa causa · pedido de demissão · rescisão indireta",
	},
	{
		coluna: "aviso_trabalhado",
		obrigatoria: "não",
		descricao: "Aviso prévio foi trabalhado?",
		valores: "sim ou não (vazio = não)",
	},
	{
		coluna: "ferias_vencidas",
		obrigatoria: "não",
		descricao: "Quantos períodos de férias vencidas e não gozadas",
		valores: "Número inteiro (vazio = 0)",
	},
	{
		coluna: "decimos_terceiros_em_aberto",
		obrigatoria: "não",
		descricao: "Quantos 13º salários não pagos",
		valores: "Número inteiro (vazio = 0)",
	},
	{
		coluna: "hora_extra",
		obrigatoria: "não",
		descricao: "Fazia horas extras habituais?",
		valores: "sim ou não (vazio = não)",
	},
	{
		coluna: "noturno",
		obrigatoria: "não",
		descricao: "Trabalhava em horário noturno (22h–5h)?",
		valores: "sim ou não (vazio = não)",
	},
	{
		coluna: "insalubridade",
		obrigatoria: "não",
		descricao: "Atividade insalubre?",
		valores: "sim ou não (vazio = não)",
	},
	{
		coluna: "periculosidade",
		obrigatoria: "não",
		descricao: "Atividade perigosa?",
		valores: "sim ou não (vazio = não)",
	},
];

/** Planilha modelo, para a pessoa não precisar adivinhar o formato. */
export async function downloadPayrollTemplate(): Promise<void> {
	const XLSX = await import("xlsx");

	const sheet = XLSX.utils.json_to_sheet(
		TEMPLATE_EXAMPLE_ROWS.map((row) => ({ ...row })),
		{ header: [...TEMPLATE_COLUMNS] },
	);
	// Largura por coluna: sem isso o Excel corta o cabeçalho e a pessoa não vê
	// o que cada campo é.
	sheet["!cols"] = TEMPLATE_COLUMNS.map((column) => ({
		wch: Math.max(column.length + 2, 14),
	}));

	const instructions = XLSX.utils.json_to_sheet(TEMPLATE_INSTRUCTIONS, {
		header: ["coluna", "obrigatoria", "descricao", "valores"],
	});
	instructions["!cols"] = [
		{ wch: 30 },
		{ wch: 12 },
		{ wch: 55 },
		{ wch: 55 },
	];

	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, sheet, "folha");
	XLSX.utils.book_append_sheet(workbook, instructions, "instruções");
	XLSX.writeFile(workbook, "modelo-folha-passivo.xlsx");
}
