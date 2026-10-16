import type { GetLaborCalculation200 } from "@/http/generated/labor-calculations-api.schemas";
import type { ResultV3 } from "./types";

function fmtDate(v: string | null | undefined): string {
  if (!v) return "";
  return new Date(v).toLocaleDateString("pt-BR");
}

const TERMINATION_LABELS: Record<string, string> = {
  sem_justa_causa: "Rescisão sem justa causa",
  com_justa_causa: "Rescisão com justa causa",
  pedido_demissao: "Pedido de demissão",
  rescisao_indireta: "Rescisão indireta",
};

// Builds a TRT-style liquidation spreadsheet (planilha de cálculo) as .xlsx:
// header identifying the parties/contract, a verb-by-verb table with principal
// / correction / interest / total, then discounts and final totals.
export async function exportLiquidationXlsx(
  calc: GetLaborCalculation200,
  result: ResultV3,
) {
  // Lazy-load SheetJS (~large) only when the user actually exports a sheet.
  const XLSX = await import("xlsx");
  const money = (n: number) => Math.round(n * 100) / 100;
  const rows: (string | number)[][] = [];

  rows.push(["PLANILHA DE CÁLCULO DE LIQUIDAÇÃO"]);
  rows.push([]);
  rows.push(["Reclamante", calc.clientName]);
  if (calc.clientDocument) rows.push(["CPF", calc.clientDocument]);
  rows.push([
    "Tipo de rescisão",
    TERMINATION_LABELS[calc.terminationType] ?? calc.terminationType,
  ]);
  rows.push([
    "Período contratual",
    `${fmtDate(calc.startDate)} a ${fmtDate(calc.endDate)}`,
  ]);
  if (calc.filingDate) rows.push(["Ajuizamento", fmtDate(calc.filingDate)]);
  if (calc.liquidationDate)
    rows.push(["Data da liquidação", fmtDate(calc.liquidationDate)]);
  rows.push([]);

  // Verbas table
  rows.push(["VERBAS", "Principal", "Correção", "Juros", "Total"]);
  for (const v of result.verbasDetalhadas) {
    const correction = money(v.corrigido - v.bruto);
    rows.push([v.name, money(v.bruto), money(correction), money(v.juros), money(v.total)]);
  }
  const totalBruto = result.verbasDetalhadas.reduce((s, v) => s + v.bruto, 0);
  const totalJuros = result.verbasDetalhadas.reduce((s, v) => s + v.juros, 0);
  const totalVerbas = result.verbasDetalhadas.reduce((s, v) => s + v.total, 0);
  rows.push([
    "SUBTOTAL",
    money(totalBruto),
    money(result.correctionTotal),
    money(totalJuros),
    money(totalVerbas),
  ]);
  rows.push([]);

  // Discounts and totals
  rows.push(["DESCONTOS / TOTAIS", "Valor"]);
  rows.push(["Bruto devido ao reclamante", money(result.brutoDevidoReclamante)]);
  rows.push(["INSS (empregado)", money(result.inssEmployee)]);
  rows.push(["IRPF", money(result.irpf)]);
  rows.push(["Total de descontos", money(result.totalDescontos)]);
  rows.push(["Líquido devido ao reclamante", money(result.liquidoDevidoReclamante)]);
  rows.push([]);
  rows.push(["ENCARGOS DO RECLAMADO", "Valor"]);
  rows.push(["INSS patronal", money(result.inssEmployer)]);
  rows.push(["SAT/RAT", money(result.satRat)]);
  rows.push(["Honorários sucumbenciais", money(result.honorariosSucumbencia)]);
  rows.push(["Custas judiciais", money(result.custasJudiciais)]);
  rows.push(["TOTAL DEVIDO PELO RECLAMADO", money(result.totalDevidoReclamado)]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 42 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 16 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Liquidação");

  const slug = calc.clientName.toLowerCase().replace(/\s+/g, "-");
  XLSX.writeFile(wb, `liquidacao-${slug}.xlsx`);
}
