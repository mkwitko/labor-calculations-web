import { describe, expect, it } from "vitest";
import { safeNextPath } from "./next-path";

describe("safeNextPath", () => {
	it("aceita os destinos internos da allowlist", () => {
		expect(safeNextPath("/convite/abc123")).toBe("/convite/abc123");
		expect(safeNextPath("/calculadora/r/tok3n")).toBe("/calculadora/r/tok3n");
	});

	it("recusa destino externo", () => {
		expect(safeNextPath("https://sitefalso.com")).toBeNull();
		expect(safeNextPath("//sitefalso.com")).toBeNull();
	});

	it("recusa caminho interno fora da allowlist", () => {
		expect(safeNextPath("/home")).toBeNull();
		expect(safeNextPath("/calculations")).toBeNull();
	});

	it("recusa vazio e ausente", () => {
		expect(safeNextPath(null)).toBeNull();
		expect(safeNextPath("")).toBeNull();
	});
});
