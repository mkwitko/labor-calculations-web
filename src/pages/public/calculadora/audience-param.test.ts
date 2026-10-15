import { describe, expect, it } from "vitest";
import { buildResultUrl, parseResultAudience } from "./audience-param";

describe("parseResultAudience", () => {
	it("aceita os dois públicos conhecidos", () => {
		expect(parseResultAudience("advogado")).toBe("advogado");
		expect(parseResultAudience("trabalhador")).toBe("trabalhador");
	});

	it("ignora valor desconhecido e ausente", () => {
		expect(parseResultAudience("juiz")).toBeNull();
		expect(parseResultAudience("")).toBeNull();
		expect(parseResultAudience(null)).toBeNull();
	});
});

describe("buildResultUrl", () => {
	it("endereça o link ao público", () => {
		const url = new URL(buildResultUrl("tok3n", "advogado"));
		expect(url.pathname).toBe("/calculadora/r/tok3n");
		expect(url.searchParams.get("para")).toBe("advogado");
	});
});
