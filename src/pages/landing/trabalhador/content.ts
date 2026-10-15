/**
 * Conteúdo da landing do trabalhador. Módulo de dados puro, sem JSX: o
 * `scripts/prerender.mjs` o carrega no Node para gerar o HTML estático da rota,
 * pelo mesmo motivo das páginas legais — o que o buscador lê não pode divergir
 * do que a pessoa vê.
 */

export const hero = {
	title: "Descubra quanto você tem a receber",
	subtitle:
		"Você responde sete perguntas em linguagem comum e vê a conta aberta, verba por verba, com o artigo de lei de cada uma. É o mesmo motor de cálculo que advogados trabalhistas usam para instruir processo.",
	reassurances: ["Grátis", "Sem cadastro", "Cerca de dois minutos"],
};

export const steps = [
	{
		step: 1,
		title: "Responda sete perguntas",
		description:
			"Como o trabalho terminou, quanto tempo durou, qual era o salário e o que ficou pendente. Nada de termo jurídico — e “não sei” é resposta válida.",
	},
	{
		step: 2,
		title: "Veja a conta aberta",
		description:
			"Cada verba aparece separada, com o valor e o artigo da CLT ou a súmula que a sustenta. Nada de um número solto que você não consegue conferir.",
	},
	{
		step: 3,
		title: "Leve ao advogado que você escolher",
		description:
			"O resultado fica num link. Você manda por WhatsApp ou e-mail para o advogado de sua confiança, e ele recebe o cálculo pronto com a lista do que ainda falta apurar.",
	},
];

export const verbas = [
	{
		name: "Saldo de salário",
		description: "Os dias que você trabalhou no mês em que saiu.",
	},
	{
		name: "Aviso prévio",
		description:
			"30 dias mais 3 por ano trabalhado, até 90. Se não cumpriu, é pago em dinheiro.",
	},
	{
		name: "13º proporcional",
		description: "Um doze avos por mês trabalhado no ano da saída.",
	},
	{
		name: "Férias e o terço",
		description:
			"As vencidas e as proporcionais, sempre com o acréscimo de um terço.",
	},
	{
		name: "FGTS e multa de 40%",
		description:
			"O que a empresa deveria ter depositado, mais a multa quando a dispensa foi sem justa causa.",
	},
	{
		name: "Horas extras e adicionais",
		description:
			"Hora extra, adicional noturno, insalubridade e periculosidade, com o reflexo em férias, 13º e FGTS.",
	},
];

export const faq = [
	{
		question: "É grátis mesmo? Onde está a pegadinha?",
		answer:
			"É grátis e não pedimos cartão nem cadastro para mostrar o resultado. Quem paga a plataforma são os escritórios de advocacia que a usam para trabalhar. Se você deixar seu contato, é só para reencontrar o cálculo — e apagamos tudo em 90 dias.",
	},
	{
		question: "O cálculo serve como prova no processo?",
		answer:
			"Não. É uma estimativa feita com o que você informou, sem conferência de nenhum documento. No processo, a conta é refeita com contracheque, cartão de ponto e extrato do FGTS, e homologada pelo juízo. O que esta calculadora entrega é a memória de cálculo: quais verbas você tem e sobre qual base.",
	},
	{
		question: "Por que o resultado é uma faixa e não um valor?",
		answer:
			"Porque parte das verbas depende de prova. Saldo de salário e 13º saem do contracheque. Já hora extra habitual, adicional de insalubridade e verba paga por fora só entram no valor final se houver prova nos autos. O valor mais baixo da faixa é o que se sustenta em documento; o mais alto inclui tudo.",
	},
	{
		question: "Preciso de advogado para receber?",
		answer:
			"Para receber o que a empresa reconhece, não — a rescisão é paga direto. Para discutir o que ela não reconhece, sim. Causas acima de 40 salários mínimos exigem advogado na Justiça do Trabalho, e mesmo abaixo disso quem litiga sozinho contra o jurídico de uma empresa costuma perder por falta de técnica processual, não por falta de direito.",
	},
	{
		question: "Quanto tempo tenho para reclamar?",
		answer:
			"Dois anos a partir do fim do contrato para entrar com a ação, e dentro dela discutem-se os últimos cinco anos (CF, art. 7º, XXIX). Quem espera perde o direito, não a razão.",
	},
	{
		question: "Vocês indicam advogados?",
		answer:
			"Não. Não temos lista de advogados, não encaminhamos ninguém e não recebemos por indicação — captação de cliente intermediada é vedada pelo Código de Ética da OAB. Você escolhe para quem mandar o seu cálculo.",
	},
];
