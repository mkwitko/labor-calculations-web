import type {
  GetLaborCalculation200,
  GetLaborCalculation200FgtsEntriesItem,
} from "@/http/generated/lexlaboral-server.schemas";

export const CLT_CITATIONS: Record<string, string> = {
  priorNotice: "Art. 487 CLT",
  thirteenth: "Lei 4.090/62",
  vacation: "Arts. 129-148 CLT",
  doubleVacation: "Art. 137 CLT",
  fgts: "Lei 8.036/90",
  fgtsFine: "Art. 18 §1º Lei 8.036/90",
  unemployment: "Lei 7.998/90",
  extraHours: "Art. 59 CLT",
  nightAdditional: "Art. 73 CLT",
  insalubrity: "Art. 192 CLT",
  dangerous: "Art. 193 CLT",
  reflexos: "Súm. 45 TST / OJ 97",
  art477: "Art. 477 §8º CLT",
  art467: "Art. 467 CLT",
  saldoSalario: "Art. 462 CLT",
  salaryDifference: "Art. 461 CLT",
  prescricao: "CF Art. 7º, XXIX",
  inssEmployee: "Art. 195 CLT",
  inssEmployer: "Art. 195 §2º",
  irpf: "Lei 7.713/88",
  custas: "Lei 6.830/80",
  honorarios: "Art. 85 CPC",
  correcaoMonetaria: "Art. 40 Lei 8.177/91",
  jurosMora: "Art. 39 Lei 8.177/91",
};

export type VerbDetalhada = {
  name: string;
  legalRef?: string | null;
  bruto: number;
  juros: number;
  corrigido: number;
  total: number;
};

export type CorrectionEntry = {
  original: number;
  corrected: number;
  correctionAmount: number;
};

export type InterestEntry = {
  original: number;
  corrected: number;
  correctionAmount: number;
  interest: number;
  total: number;
};

export type FgtsEntry = {
  month: string;
  base: number;
  aliquot: number;
  deposit: number;
  corrected: number;
  correctionAmount: number;
  interest: number;
  total: number;
};

export type ResultV3 = {
  priorNoticeValue: number;
  thirteenthSalaryValue: number;
  vacationValue: number;
  doubleVacationValue: number;
  fgtsValue: number;
  fgtsFineValue: number;
  unemploymentInsuranceValue: number;
  extraHoursValue: number;
  nightAdditionalValue: number;
  insalubrityValue: number;
  dangerousWorkValue: number;
  art477FineValue: number;
  saldoSalarioValue: number;
  reflexo13thValue: number;
  reflexoVacationValue: number;
  reflexoFGTSValue: number;
  reflexoMultaFGTSValue: number;
  correctionTotal: number;
  interestTotal: number;
  fgtsEntries: FgtsEntry[];
  inssEmployee: number;
  inssEmployer: number;
  satRat: number;
  irpf: number;
  custasJudiciais: number;
  honorariosSucumbencia: number;
  honorariosIrpf: number;
  honorariosLiquidos: number;
  brutoDevidoReclamante: number;
  totalDescontos: number;
  liquidoDevidoReclamante: number;
  totalDevidoReclamado: number;
  percentualRemuneratorio: number;
  verbasDetalhadas: VerbDetalhada[];
  art467Value: number;
  salaryDifferenceValue: number;
  salaryDifferenceReflexosValue: number;
  outrasVerbasValue: number;
  customVerbasReflexosValue: number;
  prescricao: {
    applied: boolean;
    cutoffDate: string | null;
  };
  salaryDifferenceEntries: {
    month: string;
    due: number;
    received: number;
    diff: number;
    corrected: number;
    correctionAmount: number;
    interest: number;
    total: number;
  }[];
};

function toFgtsEntries(
  items: GetLaborCalculation200FgtsEntriesItem[],
): FgtsEntry[] {
  return items.map((e) => ({
    month: e.month,
    base: e.base,
    aliquot: e.aliquot,
    deposit: e.deposit,
    corrected: e.corrected,
    correctionAmount: e.correctionAmount,
    interest: e.interest,
    total: e.total,
  }));
}

function r2(v: number) {
  return Math.round(v * 100) / 100;
}

export function mapResultV3(calc: GetLaborCalculation200): ResultV3 {
  const fgts = toFgtsEntries(calc.fgtsEntries);

  const fgtsCorrigido = r2(fgts.reduce((s, e) => s + e.corrected, 0));
  const fgtsJuros = r2(fgts.reduce((s, e) => s + e.interest, 0));
  const fgtsTotal = r2(fgts.reduce((s, e) => s + e.total, 0));

  // A memória de cálculo persistida é a fonte certa: traz correção, juros e
  // fundamento de cada verba, como o motor emitiu. A reconstrução abaixo é
  // fallback para cálculo anterior ao rastreio, que não tem linhas gravadas —
  // ali a maioria das verbas aparece sem juros, porque o dado não existe.
  const verbasDetalhadas: VerbDetalhada[] = [];

  function addVerb(name: string, bruto: number) {
    if (bruto > 0) {
      verbasDetalhadas.push({ name, bruto, corrigido: bruto, juros: 0, total: bruto });
    }
  }

  addVerb("13º Salário", calc.thirteenthSalaryValue);
  addVerb("Aviso Prévio", calc.priorNoticeValue);
  addVerb("Férias + 1/3", r2((calc.vacationValue ?? 0) - (calc.doubleVacationValue ?? 0)));
  addVerb("Férias em Dobro", calc.doubleVacationValue ?? 0);
  addVerb("Multa Art. 477 CLT", calc.art477FineValue);
  addVerb("Saldo de Salário", calc.saldoSalarioValue);
  addVerb("Horas Extras", calc.extraHoursValue);
  addVerb("Adicional Noturno", calc.nightAdditionalValue);
  addVerb("Insalubridade", calc.insalubrityValue);
  addVerb("Periculosidade", calc.dangerousWorkValue);
  addVerb("Reflexos (13º)", calc.reflexo13thValue);
  addVerb("Reflexos (Férias)", calc.reflexoVacationValue);
  addVerb("Reflexos (FGTS)", calc.reflexoFGTSValue);
  addVerb("Reflexos (Multa FGTS)", calc.reflexoMultaFGTSValue);
  addVerb("Seguro-Desemprego", calc.unemploymentInsuranceValue);

  if (calc.fgtsValue > 0) {
    verbasDetalhadas.push({
      name: "FGTS 8%",
      bruto: calc.fgtsValue,
      corrigido: fgtsCorrigido,
      juros: fgtsJuros,
      total: fgtsTotal,
    });
  }
  if (calc.fgtsFineValue > 0) {
    verbasDetalhadas.push({
      name: "Multa FGTS 40%",
      bruto: calc.fgtsFineValue,
      corrigido: calc.fgtsFineValue,
      juros: 0,
      total: calc.fgtsFineValue,
    });
  }

  // Diferenças salariais: persisted monthly entries carry real correction/interest
  const diffEntries = (calc.salaryDifferenceEntries ?? []).map((e) => ({
    month: e.month,
    due: e.due,
    received: e.received,
    diff: e.diff,
    corrected: e.corrected,
    correctionAmount: e.correctionAmount,
    interest: e.interest,
    total: e.total,
  }));
  if ((calc.salaryDifferenceValue ?? 0) > 0) {
    const diffCorrigido = r2(diffEntries.reduce((s, e) => s + e.corrected, 0));
    const diffJuros = r2(diffEntries.reduce((s, e) => s + e.interest, 0));
    verbasDetalhadas.push({
      name:
        calc.salaryDifferenceType === "desvio_funcao"
          ? "Diferenças Salariais (Desvio de Função)"
          : "Diferenças Salariais (Equiparação Art. 461)",
      bruto: calc.salaryDifferenceValue,
      corrigido: diffCorrigido || calc.salaryDifferenceValue,
      juros: diffJuros,
      total: r2(
        (diffCorrigido || calc.salaryDifferenceValue) + diffJuros,
      ),
    });
  }
  addVerb(
    "Reflexos das Diferenças Salariais",
    calc.salaryDifferenceReflexosValue ?? 0,
  );

  for (const verba of calc.customVerbas ?? []) {
    if (verba.brutoValue > 0) {
      verbasDetalhadas.push({
        name: `Outras Verbas — ${verba.name}`,
        bruto: verba.brutoValue,
        corrigido: verba.correctedValue,
        juros: verba.interestValue,
        total: verba.totalValue,
      });
    }
  }
  addVerb("Reflexos de Outras Verbas", calc.customVerbasReflexosValue ?? 0);
  addVerb("Multa Art. 467 CLT", calc.art467Value ?? 0);
  addVerb(
    "Intervalo Intrajornada (Art. 71 §4)",
    calc.intervalIntrajornadaValue ?? 0,
  );
  addVerb(
    "Adicional de Transferência (Art. 469 §3)",
    calc.transferAdditionalValue ?? 0,
  );
  addVerb("DSR sobre Horas Extras (Súm. 172)", calc.dsrValue ?? 0);
  addVerb("Estabilidade Indenizada", calc.stabilityValue ?? 0);
  if ((calc.deductionsValue ?? 0) > 0) {
    verbasDetalhadas.push({
      name: "Abatimentos (FGTS depositado / verbas pagas)",
      bruto: -(calc.deductionsValue ?? 0),
      corrigido: -(calc.deductionsValue ?? 0),
      juros: 0,
      total: -(calc.deductionsValue ?? 0),
    });
  }

  // A memória de cálculo persistida é a fonte certa: traz correção, juros e
  // fundamento legal de cada verba, exatamente como o motor emitiu, e a soma
  // fecha com o bruto devido. A reconstrução acima só vale para cálculo
  // anterior ao rastreio, que não tem linhas gravadas — ali a maioria das
  // verbas aparece sem juros porque o dado nunca foi salvo.
  const persistedLines = calc.verbaLines ?? [];
  const linhas: VerbDetalhada[] =
    persistedLines.length > 0
      ? [...persistedLines]
          .sort((a, b) => a.order - b.order)
          .map((line) => ({
            name: line.name,
            legalRef: line.legalRef,
            bruto: line.bruto,
            corrigido: line.corrigido,
            juros: line.juros,
            total: line.total,
          }))
      : verbasDetalhadas;

  return {
    priorNoticeValue: calc.priorNoticeValue,
    thirteenthSalaryValue: calc.thirteenthSalaryValue,
    vacationValue: calc.vacationValue,
    doubleVacationValue: calc.doubleVacationValue ?? 0,
    fgtsValue: calc.fgtsValue,
    fgtsFineValue: calc.fgtsFineValue,
    unemploymentInsuranceValue: calc.unemploymentInsuranceValue,
    extraHoursValue: calc.extraHoursValue,
    nightAdditionalValue: calc.nightAdditionalValue,
    insalubrityValue: calc.insalubrityValue,
    dangerousWorkValue: calc.dangerousWorkValue,
    art477FineValue: calc.art477FineValue,
    saldoSalarioValue: calc.saldoSalarioValue,
    reflexo13thValue: calc.reflexo13thValue,
    reflexoVacationValue: calc.reflexoVacationValue,
    reflexoFGTSValue: calc.reflexoFGTSValue,
    reflexoMultaFGTSValue: calc.reflexoMultaFGTSValue,
    correctionTotal: calc.correctionTotal,
    interestTotal: calc.interestTotal,
    fgtsEntries: fgts,
    inssEmployee: calc.inssEmployeeValue,
    inssEmployer: calc.inssEmployerValue,
    satRat: calc.satRatValue,
    irpf: calc.irpfValue,
    custasJudiciais: calc.custasJudiciaisValue,
    honorariosSucumbencia: calc.honorariosSucumbenciaValue,
    honorariosIrpf: calc.honorariosIrpfValue,
    honorariosLiquidos: calc.honorariosLiquidosValue,
    brutoDevidoReclamante: calc.brutoDevidoReclamante,
    totalDescontos: calc.totalDescontos,
    liquidoDevidoReclamante: calc.liquidoDevidoReclamante,
    totalDevidoReclamado: calc.totalDevidoReclamado,
    percentualRemuneratorio: calc.percentualRemuneratorio,
    verbasDetalhadas: linhas,
    art467Value: calc.art467Value ?? 0,
    salaryDifferenceValue: calc.salaryDifferenceValue ?? 0,
    salaryDifferenceReflexosValue: calc.salaryDifferenceReflexosValue ?? 0,
    outrasVerbasValue: calc.outrasVerbasValue ?? 0,
    customVerbasReflexosValue: calc.customVerbasReflexosValue ?? 0,
    prescricao: {
      applied: calc.applyPrescricaoQuinquenal ?? false,
      cutoffDate: calc.prescricaoCutoff ?? null,
    },
    salaryDifferenceEntries: diffEntries,
  };
}
