/**
 * Destinos internos que login e cadastro aceitam retomar depois de autenticar.
 * A lista é fechada de propósito: um `next` livre viraria redirect aberto —
 * bastaria mandar `?next=https://sitefalso` para levar quem acabou de digitar a
 * senha para fora.
 */
const ALLOWED_PREFIXES = [
	"/convite/", // convite de organização
	"/calculadora/r/", // advogado que recebeu o link de um cálculo público
];

export function safeNextPath(value: string | null | undefined): string | null {
	if (!value) return null;
	return ALLOWED_PREFIXES.some((prefix) => value.startsWith(prefix))
		? value
		: null;
}
