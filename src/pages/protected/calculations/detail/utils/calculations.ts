import type { GetLaborCalculation200 } from "@/http/generated/lexlaboral-server.schemas";

export type CalcGroup = {
  title: string;
  items: { label: string; value: number | null | undefined }[];
};

export const fmt = (v?: number | null) =>
  v != null && v !== 0
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "—";

export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : "—";

export function groups(calc: GetLaborCalculation200): CalcGroup[] {
  return [
    {
      title: "Verbas Salariais",
      items: [
        { label: "Saldo de Salário", value: calc.saldoSalarioValue },
        { label: "Horas Extras", value: calc.extraHoursValue },
        { label: "Adicional Noturno", value: calc.nightAdditionalValue },
        { label: "Insalubridade", value: calc.insalubrityValue },
        { label: "Periculosidade", value: calc.dangerousWorkValue },
      ],
    },
    {
      title: "Verbas Rescisórias",
      items: [
        { label: "13º Salário", value: calc.thirteenthSalaryValue },
        { label: "Férias + 1/3", value: calc.vacationValue },
        { label: "Dobra de Férias", value: calc.doubleVacationValue },
        { label: "Aviso Prévio", value: calc.priorNoticeValue },
        { label: "Seguro Desemprego", value: calc.unemploymentInsuranceValue },
        { label: "Multa Art. 477 CLT", value: calc.art477FineValue },
      ],
    },
    {
      title: "FGTS",
      items: [
        { label: "FGTS (8%)", value: calc.fgtsValue },
        { label: "Multa FGTS (40%)", value: calc.fgtsFineValue },
      ],
    },
    {
      title: "Reflexos",
      items: [
        { label: "Reflexo no 13º", value: calc.reflexo13thValue },
        { label: "Reflexo nas Férias", value: calc.reflexoVacationValue },
        { label: "Reflexo no FGTS", value: calc.reflexoFGTSValue },
        { label: "Reflexo na Multa FGTS", value: calc.reflexoMultaFGTSValue },
      ],
    },
  ];
}

export const subtotal = (g: CalcGroup) =>
  g.items.reduce((acc, i) => acc + (i.value || 0), 0);

export const risk = (c: GetLaborCalculation200) => {
  let s = 0;
  if (c.extraHoursValue) s += 2;
  if (c.fgtsFineValue) s += 2;
  if (c.insalubrityValue) s += 1;
  if (c.dangerousWorkValue) s += 1;
  if (c.unemploymentInsuranceValue) s += 1;
  if (c.art477FineValue) s += 1;
  if (c.reflexo13thValue) s += 1;
  return s >= 6 ? "Alto" : s >= 3 ? "Médio" : "Baixo";
};

export const isV3 = (c: GetLaborCalculation200) =>
  c.calculationVersion === "v3";
