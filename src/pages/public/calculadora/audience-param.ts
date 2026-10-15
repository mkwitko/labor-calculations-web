/**
 * Quem o link está endereçando.
 *
 * O mesmo cálculo tem dois leitores com necessidades opostas: quem calculou
 * quer saber quanto tem a receber, e o advogado que recebeu quer saber o que
 * conferir antes de assumir o caso. O parâmetro carrega essa intenção no
 * próprio link — quando o consumidor compartilha, o destinatário abre já na
 * versão dele, sem depender de estar logado.
 */
export type ResultAudience = "trabalhador" | "advogado";

export const AUDIENCE_PARAM = "para";

export function parseResultAudience(
	value: string | null,
): ResultAudience | null {
	return value === "advogado" || value === "trabalhador" ? value : null;
}

/** URL desta página endereçada a um público. */
export function buildResultUrl(
	token: string,
	audience: ResultAudience,
): string {
	const url = new URL(`/calculadora/r/${token}`, window.location.origin);
	url.searchParams.set(AUDIENCE_PARAM, audience);
	return url.toString();
}
