import { beforeAll, describe, expect, it } from "vitest";

import methodologyHtml from "./methodology.html?raw";

/**
 * A /metodologia embute um porte manual do motor `calculateLaborV3` para
 * recalcular no navegador. Duas cópias da mesma conta divergem em silêncio: o
 * demonstrativo público mostraria um número e o app, outro.
 *
 * Os valores esperados abaixo saíram do motor de verdade (`labor-calculations-api`,
 * `calculateLaborV3` com a tabela de índices padrão), para o mesmo cenário.
 * Quando o motor mudar e o porte não acompanhar, este teste quebra.
 */

// Primeiro <script> da página: só o motor. O segundo é a ligação com o DOM.
function loadEngine() {
  const source = methodologyHtml.split("<script>")[1].split("</script>")[0];
  new Function(source)();
  return (window as unknown as { LexLaboral: EngineApi }).LexLaboral;
}

type Verba = {
  name: string;
  legalRef?: string;
  bruto: number;
  corrigido: number;
  juros: number;
  total: number;
};

type EngineApi = {
  calculateLaborV3: (
    input: Record<string, unknown>,
    table?: unknown,
    env?: { MINIMUM_WAGE: number; FGTS_RATE: number },
  ) => {
    totalValue: number;
    brutoDevidoReclamante: number;
    liquidoDevidoReclamante: number;
    totalDevidoReclamado: number;
    verbasDetalhadas: Verba[];
  };
};

const ENV = { MINIMUM_WAGE: 1621, FGTS_RATE: 0.08 };

const CENARIO = {
  clientName: "Parity",
  startDate: new Date(Date.UTC(2020, 0, 15)),
  endDate: new Date(Date.UTC(2024, 5, 30)),
  lastSalary: 3500,
  baseSalary: 3500,
  unpaid13ths: 1,
  vacationCount: 1,
  vacationVencidasCount: 0,
  priorNoticeWorked: false,
  extraHours: 20,
  nightHours: 40,
  insalubrityLevel: 20,
  dangerousWork: true,
  lastThreeSalariesAvg: 3500,
  applyArt477Fine: true,
  terminationType: "sem_justa_causa",
  liquidationDate: new Date(Date.UTC(2025, 5, 30)),
  applyDsrOnExtra: true,
  applyArt467: true,
  stabilityMonths: 3,
  intervalIntrajornadaHours: 10,
  transferAdditionalMonths: 6,
  fgtsAlreadyDeposited: 1200,
  amountsAlreadyPaid: 800,
};

// [nome, bruto, corrigido, juros, total] — do motor do backend.
const VERBAS_ESPERADAS: [string, number, number, number, number][] = [
  ["13º Salário", 2041.67, 2141.14, 86.16, 2227.3],
  ["Aviso Prévio", 4900, 5138.73, 206.79, 5345.52],
  ["Férias + 1/3", 4666.67, 4894.03, 196.95, 5090.98],
  ["Multa Art. 477 CLT", 3500, 3670.52, 147.71, 3818.23],
  ["Saldo de Salário", 0, 0, 0, 0],
  ["FGTS 8%", 15675.33, 15819.67, 681.29, 16500.96],
  ["Multa FGTS 40%", 6327.87, 6636.17, 267.05, 6903.22],
  ["Horas Extras 50%", 477.3, 477.3, 0, 477.3],
  ["Adicional Noturno 20%", 763.68, 763.68, 0, 763.68],
  ["Adicional de Insalubridade 20%", 17367.39, 17367.39, 0, 17367.39],
  ["Adicional de Periculosidade 30%", 56248.5, 56248.5, 0, 56248.5],
  ["Reflexos dos Adicionais no 13º", 13.52, 13.52, 0, 13.52],
  ["Reflexos dos Adicionais nas Férias + 1/3", 30.89, 30.89, 0, 30.89],
  ["Reflexos dos Adicionais no FGTS", 99.28, 99.28, 0, 99.28],
  ["Reflexos dos Adicionais na Multa de 40%", 39.71, 39.71, 0, 39.71],
  ["Multa Art. 467 CLT", 9405.04, 9405.04, 0, 9405.04],
  ["Intervalo Intrajornada (Art. 71 §4)", 12784.48, 12784.48, 0, 12784.48],
  ["Adicional de Transferência (Art. 469 §3)", 5250, 5250, 0, 5250],
  ["DSR sobre Horas Extras (Súm. 172)", 225.61, 225.61, 0, 225.61],
  ["Estabilidade Indenizada", 13381.67, 13381.67, 0, 13381.67],
  ["Abatimentos (FGTS depositado / verbas pagas)", -2000, -2000, 0, -2000],
];

const TOTAIS_ESPERADOS = {
  totalValue: 154440.89,
  brutoDevidoReclamante: 153973.28,
  liquidoDevidoReclamante: 153810.71,
  totalDevidoReclamado: 178054.32,
};

describe("motor portado da /metodologia", () => {
  let engine: EngineApi;

  beforeAll(() => {
    engine = loadEngine();
  });

  it("expõe a API usada pela página", () => {
    expect(typeof engine.calculateLaborV3).toBe("function");
  });

  it("bate com o motor do backend nos totais", () => {
    const r = engine.calculateLaborV3(CENARIO, undefined, ENV);

    expect(r.totalValue).toBeCloseTo(TOTAIS_ESPERADOS.totalValue, 2);
    expect(r.brutoDevidoReclamante).toBeCloseTo(
      TOTAIS_ESPERADOS.brutoDevidoReclamante,
      2,
    );
    expect(r.liquidoDevidoReclamante).toBeCloseTo(
      TOTAIS_ESPERADOS.liquidoDevidoReclamante,
      2,
    );
    expect(r.totalDevidoReclamado).toBeCloseTo(
      TOTAIS_ESPERADOS.totalDevidoReclamado,
      2,
    );
  });

  it("bate verba a verba, na mesma ordem", () => {
    const r = engine.calculateLaborV3(CENARIO, undefined, ENV);

    expect(
      r.verbasDetalhadas.map((v) => [
        v.name,
        v.bruto,
        v.corrigido,
        v.juros,
        v.total,
      ]),
    ).toEqual(VERBAS_ESPERADAS);
  });

  it("fecha a soma das linhas com o bruto devido", () => {
    const r = engine.calculateLaborV3(CENARIO, undefined, ENV);
    const soma = r.verbasDetalhadas.reduce((acc, v) => acc + v.total, 0);

    expect(soma).toBeCloseTo(r.brutoDevidoReclamante, 1);
  });

  it("traz fundamento legal em toda linha", () => {
    const r = engine.calculateLaborV3(CENARIO, undefined, ENV);

    expect(
      r.verbasDetalhadas.filter((v) => !v.legalRef).map((v) => v.name),
    ).toEqual([]);
  });
});
