import { describe, expect, it } from "vitest";
import { endpoints, errors, hero, snippets, steps } from "./content";

describe("conteúdo da página de API", () => {
	it("descreve os três passos do quickstart", () => {
		expect(steps).toHaveLength(3);
		expect(steps.every((step) => step.title && step.description)).toBe(true);
	});

	it("tem exemplo nas três linguagens, todos apontando para o endpoint real", () => {
		expect(snippets.map((snippet) => snippet.id)).toEqual([
			"curl",
			"javascript",
			"python",
		]);

		for (const snippet of snippets) {
			expect(snippet.code).toContain("/v1/calculations/liquidacao");
			// O header é o mesmo nos três: errar isso é o primeiro erro de quem
			// integra.
			expect(snippet.code).toContain("Authorization");
		}
	});

	it("documenta os erros que a API realmente devolve", () => {
		expect(errors.map((error) => error.status)).toEqual([400, 401, 402, 429]);
	});

	it("explica os dois endpoints que a API tem", () => {
		expect(endpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`)).toEqual(
			[
				"POST /v1/calculations/liquidacao",
				"GET /v1/calculations/{id}",
			],
		);

		for (const endpoint of endpoints) {
			expect(endpoint.description.length).toBeGreaterThan(60);
			// Quem integra precisa saber o que custa antes de chamar.
			expect(endpoint.billing).toMatch(/[Cc]obra/);
			expect(endpoint.required.length).toBeGreaterThan(0);
			expect(endpoint.returns.length).toBeGreaterThan(0);
		}
	});

	it("todo campo listado diz tipo e o que faz", () => {
		for (const endpoint of endpoints) {
			for (const field of [...endpoint.required, ...endpoint.optional]) {
				expect(field.name).toBeTruthy();
				expect(field.type).toBeTruthy();
				expect(field.note.length).toBeGreaterThan(10);
			}
		}
	});

	it("avisa sobre o campo obrigatório que não muda o resultado", () => {
		const create = endpoints[0];
		const inerte = create.required.find((field) =>
			field.name.includes("vacationCount"),
		);

		// É a pegadinha da API: obrigatório, guardado e ignorado pelo motor.
		expect(inerte?.note).toMatch(/sem efeito no resultado/i);
	});

	it("não promete número que a API não devolve", () => {
		expect(hero.title.length).toBeGreaterThan(0);
		expect(JSON.stringify(hero)).not.toMatch(/\d+%/);
	});
});
