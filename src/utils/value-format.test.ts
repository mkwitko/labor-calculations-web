import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  getTerminationTypeLabel,
} from "./value-format";

describe("formatCurrency", () => {
  it("formats a positive number as BRL currency", () => {
    expect(formatCurrency(1500)).toMatch(/1\.500,00/);
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toMatch(/0,00/);
  });

  it("formats negative values", () => {
    expect(formatCurrency(-200)).toMatch(/200,00/);
  });

  it("includes the BRL symbol", () => {
    expect(formatCurrency(100)).toMatch(/R\$/);
  });
});

describe("formatDate", () => {
  it("formats a date string as dd/mm/yyyy", () => {
    expect(formatDate("2024-01-15")).toBe("15/01/2024");
  });

  it("accepts a Date object", () => {
    expect(formatDate(new Date("2024-06-01"))).toBe("01/06/2024");
  });
});

describe("getTerminationTypeLabel", () => {
  it("maps sem_justa_causa", () => {
    expect(getTerminationTypeLabel("sem_justa_causa")).toBe("Sem justa causa");
  });

  it("maps com_justa_causa", () => {
    expect(getTerminationTypeLabel("com_justa_causa")).toBe("Com justa causa");
  });

  it("maps pedido_demissao", () => {
    expect(getTerminationTypeLabel("pedido_demissao")).toBe(
      "Pedido de demissão"
    );
  });

  it("returns the raw value for unknown types", () => {
    expect(getTerminationTypeLabel("unknown_type")).toBe("unknown_type");
  });

  it("handles an empty string key", () => {
    expect(getTerminationTypeLabel("")).toBe("");
  });
});
