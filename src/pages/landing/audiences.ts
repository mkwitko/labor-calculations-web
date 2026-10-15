/**
 * Os públicos que a landing atende, cada um com página própria.
 *
 * A lista existe para que a barra de público e o rodapé não precisem saber
 * quais páginas existem: acrescentar RH ou sindicato é uma linha aqui mais a
 * página. `soon` marca o que já anunciamos mas ainda não construímos — o link
 * fica inerte em vez de levar a uma rota morta.
 */
export type Audience = {
	id: "advogado" | "trabalhador" | "rh";
	path: string;
	navLabel: string;
	/** Chamada usada na barra de público, na voz de quem está chegando. */
	prompt: string;
	soon?: boolean;
};

export const AUDIENCES: Audience[] = [
	{
		id: "advogado",
		path: "/",
		navLabel: "Advogados",
		prompt: "Sou advogado",
	},
	{
		id: "trabalhador",
		path: "/trabalhador",
		navLabel: "Trabalhadores",
		prompt: "Fui demitido",
	},
	{
		id: "rh",
		path: "/rh",
		navLabel: "Empresas e RH",
		prompt: "Sou empresa ou RH",
	},
];
