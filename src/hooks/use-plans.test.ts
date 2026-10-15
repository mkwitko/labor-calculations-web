import { describe, expect, it } from "vitest";
import { describePlan, formatBRL, type Plan, seatLabel } from "./use-plans";

function plan(overrides: Partial<Plan> = {}): Plan {
  return {
    code: "banca",
    name: "Banca",
    maxMembers: 5,
    rank: 2,
    currency: "brl",
    allowsExtraMembers: false,
    monthly: { priceId: "price_m", amountCents: 19_700 },
    yearly: { priceId: "price_y", amountCents: 177_300 },
    ...overrides,
  };
}

describe("formatBRL", () => {
  it("omite centavos quando o valor é redondo", () => {
    expect(formatBRL(19_700)).toBe("R$\u00a0197");
  });

  it("mostra centavos quando existem", () => {
    expect(formatBRL(19_750)).toBe("R$\u00a0197,50");
  });
});

describe("seatLabel", () => {
  it("fala no singular no plano de uma pessoa", () => {
    expect(seatLabel(1)).toBe("1 pessoa");
  });

  it("diz que o teto é um limite, não uma cota exata", () => {
    expect(seatLabel(15)).toBe("até 15 pessoas");
  });
});

describe("describePlan", () => {
  it("o mensal aparece pelo valor cobrado", () => {
    const display = describePlan(plan(), "monthly");

    expect(display?.headline).toBe("R$\u00a0197");
    expect(display?.footnote).toBeNull();
  });

  it("o anual aparece no equivalente mensal, com o total do ano na nota", () => {
    // Esconder o total cobrado faria a tela prometer um valor e a fatura
    // apresentar outro.
    const display = describePlan(plan(), "yearly");

    expect(display?.headline).toBe("R$\u00a0147,75");
    expect(display?.footnote).toBe("R$\u00a01.773 cobrados por ano");
  });

  it("a economia do anual sai da diferença contra doze meses", () => {
    const display = describePlan(plan(), "yearly");

    // 197 × 12 = 2364; 2364 − 1773 = 591.
    expect(display?.savingsBadge).toBe("Economize R$\u00a0591");
  });

  it("sem economia não inventa selo", () => {
    const display = describePlan(
      plan({ yearly: { priceId: "price_y", amountCents: 236_400 } }),
      "yearly",
    );

    expect(display?.savingsBadge).toBeNull();
  });

  it("intervalo sem preço publicado devolve null, e a tela diz 'sob consulta'", () => {
    expect(describePlan(plan({ yearly: null }), "yearly")).toBeNull();
  });
});
