import { getStatusLabel, getTerminationTypeLabel } from "@/utils/value-format";

export const STATUS_COLORS: Record<string, string> = {
  em_andamento: "bg-blue-500",
  proposta_enviada: "bg-amber-500",
  ajuizado: "bg-orange-500",
  acordo_fechado: "bg-emerald-500",
};

export const TERM_COLORS: Record<string, string> = {
  sem_justa_causa: "bg-red-500",
  com_justa_causa: "bg-slate-500",
  pedido_demissao: "bg-violet-500",
  rescisao_indireta: "bg-pink-500",
};

export type DistributionEntry = {
  key: string;
  label: string;
  count: number;
  color: string;
};

export function buildStatusDistribution(
  data: { status: string; count: number }[],
): DistributionEntry[] {
  const countMap = Object.fromEntries(data.map((d) => [d.status, d.count]));
  return Object.keys(STATUS_COLORS).map((key) => ({
    key,
    label: getStatusLabel(key),
    count: countMap[key] ?? 0,
    color: STATUS_COLORS[key],
  }));
}

export function buildTermDistribution(
  data: { terminationType: string; count: number }[],
): DistributionEntry[] {
  const countMap = Object.fromEntries(data.map((d) => [d.terminationType, d.count]));
  return Object.keys(TERM_COLORS).map((key) => ({
    key,
    label: getTerminationTypeLabel(key),
    count: countMap[key] ?? 0,
    color: TERM_COLORS[key],
  }));
}
