/**
 * Todo o texto e os exemplos da página de API moram aqui.
 *
 * Um arquivo só porque o corpo da requisição vai mudar: espalhado pela página,
 * um campo novo apareceria em dois exemplos e faltaria no terceiro.
 */

export const hero = {
	badge: "Para desenvolvedores",
	title: "A liquidação trabalhista do LexLaboral, na sua aplicação",
	subtitle:
		"O mesmo motor de cálculo do produto, com índices oficiais e memória de cálculo verba por verba, atrás de uma chamada HTTP.",
	reassurances: [
		"Índices atualizados no servidor",
		"Fundamento legal em cada verba",
		"Ambiente de teste que não cobra",
	],
};

export const steps = [
	{
		title: "Crie uma chave",
		description:
			"Em Configurações, no LexLaboral, escolha o ambiente e crie a chave. O token aparece uma única vez — guarde-o num gerenciador de segredos.",
	},
	{
		title: "Chame o endpoint",
		description:
			"Um POST com os dados do contrato e da rescisão. O token vai no header Authorization, como Bearer.",
	},
	{
		title: "Leia a resposta",
		description:
			"Volta o total bruto e líquido, a lista de verbas com correção e juros, a versão do motor e o hash do conjunto de índices usado.",
	},
];

export const REQUEST_BODY = {
	clientName: "Fulano de Tal",
	terminationType: "sem_justa_causa",
	startDate: "2020-01-10",
	endDate: "2024-03-15",
	lastSalary: 3000,
	baseSalary: 3000,
	unpaid13ths: 0,
	vacationCount: 1,
	priorNoticeWorked: false,
	extraHours: 0,
	nightHours: 0,
	insalubrityLevel: 0,
	dangerousWork: false,
	lastThreeSalariesAvg: 3000,
};

const BODY_JSON = JSON.stringify(REQUEST_BODY, null, 2);

export const BASE_URL = "https://api.lexlaboral.com.br";

export const snippets = [
	{
		id: "curl" as const,
		label: "curl",
		code: `curl -X POST ${BASE_URL}/v1/calculations/liquidacao \\
  -H "Authorization: Bearer $LEXLABORAL_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${BODY_JSON}'`,
	},
	{
		id: "javascript" as const,
		label: "JavaScript",
		code: `const response = await fetch(
  "${BASE_URL}/v1/calculations/liquidacao",
  {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.LEXLABORAL_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(${BODY_JSON}),
  },
);

if (!response.ok) throw new Error(await response.text());

const calculation = await response.json();`,
	},
	{
		id: "python" as const,
		label: "Python",
		code: `import os
import requests

response = requests.post(
    "${BASE_URL}/v1/calculations/liquidacao",
    headers={
        "Authorization": f"Bearer {os.environ['LEXLABORAL_API_KEY']}",
        "Content-Type": "application/json",
    },
    json=${BODY_JSON.replaceAll("false", "False").replaceAll("true", "True")},
    timeout=30,
)
response.raise_for_status()
calculation = response.json()`,
	},
];

/**
 * Os dois endpoints, explicados. A referência em `/docs/api` continua sendo a
 * fonte campo por campo — aqui fica o que ela não diz bem: o que cada endpoint
 * serve, o que cobra e quais campos importam de verdade.
 */
export const endpoints = [
	{
		method: "POST",
		path: "/v1/calculations/liquidacao",
		title: "Calcular liquidação",
		description:
			"Calcula verbas rescisórias, adicionais, FGTS, correção monetária pelos índices oficiais, juros, INSS e IRPF. O cálculo é guardado na organização e devolve a memória verba por verba com o fundamento legal de cada uma.",
		billing: "Cobra: cada resposta 201 com chave de produção.",
		required: [
			{
				name: "clientName",
				type: "string",
				note: "Nome do reclamante.",
			},
			{
				name: "terminationType",
				type: "enum",
				note: "sem_justa_causa, com_justa_causa, pedido_demissao ou rescisao_indireta.",
			},
			{
				name: "startDate / endDate",
				type: "date",
				note: "Admissão e término, em ISO 8601. endDate tem de ser posterior.",
			},
			{
				name: "lastSalary / baseSalary",
				type: "number",
				note: "Última remuneração e salário base contratual, em reais.",
			},
			{
				name: "extraHours / nightHours",
				type: "number",
				note: "Totais do contrato inteiro, não médias mensais.",
			},
			{
				name: "insalubrityLevel",
				type: "0 | 10 | 20 | 40",
				note: "Grau de insalubridade, sobre o salário mínimo.",
			},
			{
				name: "dangerousWork",
				type: "boolean",
				note: "Periculosidade: 30% do salário base por mês.",
			},
			{
				name: "lastThreeSalariesAvg",
				type: "number",
				note: "Média das três últimas remunerações — só para o seguro-desemprego.",
			},
			{
				name: "priorNoticeWorked",
				type: "boolean",
				note: "Aviso prévio cumprido trabalhando (true) ou indenizado (false).",
			},
			{
				name: "vacationCount / unpaid13ths",
				type: "number",
				note: "Obrigatórios por compatibilidade e guardados no cálculo, mas sem efeito no resultado: o 13º e as férias proporcionais saem dos avos do período.",
			},
		],
		optional: [
			{
				name: "vacationVencidasCount",
				type: "number",
				note: "Períodos aquisitivos completos não gozados, pagos em dobro.",
			},
			{
				name: "filingDate",
				type: "date",
				note: "Ajuizamento. É dele que sai o corte da prescrição quinquenal.",
			},
			{
				name: "liquidationDate",
				type: "date",
				note: "Data até a qual corrigir e contar juros. Ausente é hoje.",
			},
			{
				name: "applyPrescricaoQuinquenal",
				type: "boolean",
				note: "Corta parcelas anteriores a cinco anos do ajuizamento.",
			},
			{
				name: "applyArt467 / applyArt477Fine",
				type: "boolean",
				note: "Acréscimo de 50% sobre incontroversas e multa de uma remuneração por atraso.",
			},
			{
				name: "salaryDifference",
				type: "object",
				note: "Equiparação, desvio ou acúmulo de função, por períodos, com ou sem reflexos.",
			},
			{
				name: "customVerbas",
				type: "array",
				note: "Até 20 verbas próprias, com valor mensal, intervalo e natureza.",
			},
			{
				name: "intervalIntrajornadaHours",
				type: "number",
				note: "Intervalo suprimido por mês (não total), pago com 50%.",
			},
			{
				name: "stabilityMonths / transferAdditionalMonths",
				type: "number",
				note: "Meses de estabilidade a indenizar e meses com adicional de transferência de 25%.",
			},
			{
				name: "salaryHistory / unpaidSalaries",
				type: "array",
				note: "Evolução salarial por mês e meses em atraso com dias trabalhados.",
			},
			{
				name: "fgtsAlreadyDeposited / amountsAlreadyPaid",
				type: "number",
				note: "Abatimentos do total devido.",
			},
			{
				name: "satRate / employerInssRate / honorariosRate / nightAdditionalPercent",
				type: "number",
				note: "Percentuais, não frações: 15 significa 15%. Defaults 3, 20, 15 e 20.",
			},
		],
		returns: [
			"id — use em GET /v1/calculations/{id}",
			"totals.brutoDevidoReclamante e totals.liquidoDevidoReclamante, em reais",
			"verbas[] — nome, fundamento legal, bruto, corrigido, juros e total",
			"engineVersion e indexSnapshotHash — a procedência do resultado",
		],
	},
	{
		method: "GET",
		path: "/v1/calculations/{id}",
		title: "Ler um cálculo",
		description:
			"Relê um cálculo da própria organização, sem recalcular: os valores são os que foram gravados, com os índices vigentes naquele momento. Serve para o seu sistema guardar só o id.",
		billing: "Não cobra, em nenhum ambiente.",
		required: [
			{
				name: "id",
				type: "path",
				note: "O id devolvido na criação.",
			},
		],
		optional: [],
		returns: ["O mesmo corpo da criação."],
	},
];

export const environments = [
	{
		prefix: "jp_live_",
		title: "Produção",
		description:
			"Cada cálculo que responde 2xx entra na sua fatura. Leitura e erro não são cobrados.",
	},
	{
		prefix: "jp_test_",
		title: "Teste",
		description:
			"Calcula igual à produção e não gera cobrança. É a chave para escrever e depurar a integração.",
	},
];

export const errors = [
	{
		status: 400,
		title: "Dados inválidos",
		description:
			"Algum campo do corpo não passou na validação. A mensagem diz qual. Corrija e repita — não é cobrado.",
	},
	{
		status: 401,
		title: "Chave inválida",
		description:
			"Token ausente, malformado ou revogado. Confira o header Authorization e se a chave ainda está ativa.",
	},
	{
		status: 402,
		title: "Assinatura inativa",
		description:
			"A organização não tem assinatura ativa. A API pública é do plano Max.",
	},
	{
		status: 429,
		title: "Limite de requisições",
		description:
			"São 60 chamadas por minuto por chave. Espere a janela virar e tente de novo, com espera progressiva.",
	},
];

export const billing = {
	title: "Como a cobrança funciona",
	bullets: [
		"Só cálculo que responde 2xx é cobrado. Erro de validação, 401, 402, 429 e leitura não entram.",
		"O consumo é agregado por dia e enviado ao medidor de cobrança — o valor fecha na sua fatura.",
		"Chave de teste nunca é cobrada.",
		"O consumo do ciclo aparece em Configurações, dentro do LexLaboral.",
	],
};

export const faq = [
	{
		question: "Preciso de conta para ler esta documentação?",
		answer:
			"Não. Para criar a chave, sim: ela é emitida por quem administra o escritório, em Configurações.",
	},
	{
		question: "O cálculo feito pela API aparece no app?",
		answer:
			"Sim. Ele fica na lista de cálculos da organização, sob a pessoa que emitiu a chave.",
	},
	{
		question: "Como eu revogo uma chave?",
		answer:
			"Em Configurações, no card de chaves. A revogação vale na hora e não pode ser desfeita — crie uma chave nova.",
	},
];
