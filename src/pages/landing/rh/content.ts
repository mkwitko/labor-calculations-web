/**
 * Conteúdo da landing de empresas e RH. Módulo de dados puro, sem JSX: o
 * `scripts/prerender.mjs` o carrega no Node para gerar o HTML estático da rota.
 */

export const hero = {
	title: "Quanto custa desligar — e quanto pode custar depois",
	subtitle:
		"Calcule o custo do desligamento com encargos e veja, no mesmo lugar, a exposição em caso de reclamação trabalhista. Seis perguntas, com a folha na mão.",
	reassurances: ["Grátis", "Sem cadastro", "Com fundamento legal por verba"],
};

export const numbers = [
	{
		title: "Custo de desligar hoje",
		description:
			"Verbas rescisórias, FGTS, multa de 40% e encargos patronais (INSS empresa e SAT/RAT). É o cheque que sai do caixa nesta semana.",
	},
	{
		title: "Exposição em reclamação",
		description:
			"O mesmo desligamento somando o que depende de prova — hora extra, adicionais, reflexos — mais custas e honorários de sucumbência.",
	},
	{
		title: "A diferença entre os dois",
		description:
			"É o valor que está em jogo na documentação. Ponto eletrônico guardado, laudo atualizado e adicional em folha reduzem essa conta antes de ela virar processo.",
	},
];

export const risks = [
	{
		title: "Jornada sem controle",
		description:
			"Empresa com mais de 20 empregados é obrigada a registrar a jornada (CLT, art. 74, §2º). Sem os cartões em juízo, presume-se verdadeira a jornada alegada na inicial (Súmula 338 do TST) — e a hora extra entra inteira.",
	},
	{
		title: "Adicional sem laudo",
		description:
			"Insalubridade e periculosidade se provam por perícia. Laudo desatualizado ou EPI sem ficha de entrega assinada transformam uma dúvida técnica em condenação.",
	},
	{
		title: "Pagamento por fora",
		description:
			"Parcela habitual paga fora da folha integra o salário e reflete em 13º, férias, FGTS e na multa de 40%. O reflexo costuma custar mais do que a parcela.",
	},
	{
		title: "Prazo do art. 477",
		description:
			"Dez dias para pagar as verbas e entregar as guias (CLT, art. 477, §6º). Um dia de atraso custa uma remuneração inteira de multa (§8º).",
	},
];

export const faq = [
	{
		question: "Este cálculo substitui a auditoria de folha?",
		answer:
			"Não. É uma estimativa a partir de seis respostas, sem conferência de folha, cartão de ponto ou laudo. Serve para dimensionar a ordem de grandeza antes de decidir e para saber onde vale investigar.\n\nA auditoria olha o que a empresa efetivamente pagou e registrou; aqui olhamos o que a lei manda pagar no cenário descrito.",
	},
	{
		question: "Por que aparecem dois números tão diferentes?",
		answer:
			"Porque as verbas se dividem em duas naturezas. Saldo de salário, aviso, 13º, férias e FGTS são devidos e se provam com documento — a empresa paga de qualquer forma.\n\nHora extra habitual, adicional de insalubridade e verba paga por fora dependem de prova em processo. Se a documentação da empresa está em ordem, esse segundo bloco não vira condenação. Se não está, vira — e ainda com custas e honorários.",
	},
	{
		question: "O cálculo serve para provisionar em balanço?",
		answer:
			"Como ponto de partida, sim; como número final, não. Provisão para contingência trabalhista depende de avaliação de probabilidade (provável, possível, remota) que só um jurídico faz caso a caso, e da política contábil da empresa.\n\nO que esta calculadora entrega é a memória de cálculo aberta, com o fundamento legal de cada verba — que é a base sobre a qual essa avaliação é feita.",
	},
	{
		question: "Vocês guardam os dados do funcionário?",
		answer:
			"O cálculo é anônimo: pedimos datas, remuneração e adicionais, nunca nome ou CPF de quem está sendo desligado. O resultado fica num link por 90 dias e depois é apagado.\n\nSe você deixar seu contato, ele serve para o escritório que você escolher importar o cálculo — nunca o repassamos a terceiros.",
	},
];
