const round = (v: number) => Math.round(v * 100) / 100;

import {
  DANGEROUS_WORK_RATE,
  DEFAULT_FGTS_RATE,
  DEFAULT_MINIMUM_WAGE,
  FGTS_FINE_RATE,
  MONTHLY_WORK_HOURS,
  NIGHT_SHIFT_MULTIPLIER_V3,
  OVERTIME_MULTIPLIER,
  UNEMPLOYMENT_INSURANCE_BRACKETS,
  VACATION_BONUS_RATIO,
} from "./labor-constants";

export type EstimateV3Input = {
  startDate: string;
  endDate: string;
  lastSalary: number;
  baseSalary: number;
  unpaid13ths: number;
  vacationCount: number;
  vacationVencidasCount: number;
  priorNoticeWorked: boolean;
  extraHours: number;
  nightHours: number;
  insalubrityLevel: number;
  dangerousWork: boolean;
  lastThreeSalariesAvg: number;
  terminationType: string;
  applyArt477Fine: boolean;
  fgtsRate?: number;
  minimumWage?: number;
  applyArt467?: boolean;
  applyPrescricaoQuinquenal?: boolean;
  salaryDifferencePeriods?: {
    startMonth: string;
    endMonth: string;
    monthly: number;
  }[];
  salaryDifferenceApplyReflexos?: boolean;
  customVerbas?: {
    startMonth: string;
    endMonth: string;
    monthly: number;
    nature: "indenizatoria" | "salarial";
  }[];
  unpaidSalaryDays?: number;
  intervalIntrajornadaHours?: number;
  transferAdditionalMonths?: number;
  applyDsrOnExtra?: boolean;
  stabilityMonths?: number;
  deductions?: number;
};

// Inclusive month count between two 'YYYY-MM' keys (0 when invalid/reversed)
function monthsBetween(startMonth: string, endMonth: string): number {
  const [sy, sm] = startMonth.split("-").map(Number);
  const [ey, em] = endMonth.split("-").map(Number);
  if (!sy || !sm || !ey || !em) return 0;
  return Math.max(0, (ey - sy) * 12 + (em - sm) + 1);
}

export function estimateLaborV3(input: EstimateV3Input): number {
  const {
    startDate,
    endDate,
  lastSalary,
  baseSalary,
  vacationVencidasCount,
    applyArt477Fine,
    priorNoticeWorked,
    extraHours,
    nightHours,
    insalubrityLevel,
    dangerousWork,
    lastThreeSalariesAvg,
    terminationType,
    fgtsRate = DEFAULT_FGTS_RATE,
    minimumWage = DEFAULT_MINIMUM_WAGE,
    applyArt467 = false,
    applyPrescricaoQuinquenal = false,
    salaryDifferencePeriods = [],
    salaryDifferenceApplyReflexos = true,
    customVerbas = [],
    unpaidSalaryDays = 0,
    intervalIntrajornadaHours = 0,
    transferAdditionalMonths = 0,
    applyDsrOnExtra = false,
    stabilityMonths = 0,
    deductions = 0,
  } = input;

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return 0;

  const totalDays = diffMs / (1000 * 60 * 60 * 24);
  const workedYears = Math.floor(totalDays / 365);
  const workedMonths = Math.floor((totalDays % 365) / 30);
  const workedDays = Math.floor((totalDays % 365) % 30);
  const totalMonths = round(workedYears * 12 + workedMonths + workedDays / 30);

  const isSemJustaCausa =
    terminationType === "sem_justa_causa" ||
    terminationType === "rescisao_indireta";
  const isComJustaCausa = terminationType === "com_justa_causa";

  const hourlyRate = round(lastSalary / MONTHLY_WORK_HOURS);
  const extraHoursValue = round(extraHours * hourlyRate * OVERTIME_MULTIPLIER);
  const nightAdditionalValue = round(nightHours * hourlyRate * NIGHT_SHIFT_MULTIPLIER_V3);
  const insalubrityValue = round(
    minimumWage * (insalubrityLevel / 100) * totalMonths,
  );
  const dangerousWorkValue = dangerousWork
    ? round(baseSalary * DANGEROUS_WORK_RATE * totalMonths)
    : 0;

  let priorNoticeValue = 0;
  if (!isComJustaCausa && !priorNoticeWorked) {
    const days = 30 + workedYears * 3;
    priorNoticeValue = round((lastSalary / 30) * days);
  }

  const startMonth = start.getMonth() + 1;
  const startYear = start.getFullYear();
  const endMonth = end.getMonth() + 1;
  const endYear = end.getFullYear();
  const baseAvos = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  const avisoDays =
    !isComJustaCausa && !priorNoticeWorked ? 30 + workedYears * 3 : 0;
  const projectedAvos =
    avisoDays > 0 ? baseAvos + Math.ceil(avisoDays / 30) : baseAvos;

  const thirteenthSalaryValue = !isComJustaCausa
    ? round((lastSalary / 12) * projectedAvos)
    : 0;

  const vacationBase = lastSalary + lastSalary * VACATION_BONUS_RATIO;
  const proportionalVacations = isComJustaCausa ? 0 : projectedAvos;
  const vacationValueProportional = round(
    (vacationBase / 12) * proportionalVacations,
  );
  const doubleVacationValue = round(vacationVencidasCount * vacationBase);
  const vacationValue = round(vacationValueProportional + doubleVacationValue);

  // Prescrição quinquenal: caps monthly streams at 60 months (nominal estimate)
  const fgtsMonths = applyPrescricaoQuinquenal
    ? Math.min(totalMonths, 60)
    : totalMonths;
  const fgtsValue = !isComJustaCausa
    ? round(lastSalary * fgtsRate * fgtsMonths)
    : 0;
  const fgtsFineValue = isSemJustaCausa ? round(fgtsValue * FGTS_FINE_RATE) : 0;

  let unemploymentInsuranceValue = 0;
  if (isSemJustaCausa) {
    if (lastThreeSalariesAvg <= UNEMPLOYMENT_INSURANCE_BRACKETS.TIER1_LIMIT) {
      unemploymentInsuranceValue = lastThreeSalariesAvg * UNEMPLOYMENT_INSURANCE_BRACKETS.TIER1_RATE;
    } else if (lastThreeSalariesAvg <= UNEMPLOYMENT_INSURANCE_BRACKETS.TIER2_LIMIT) {
      unemploymentInsuranceValue =
        (lastThreeSalariesAvg - UNEMPLOYMENT_INSURANCE_BRACKETS.TIER1_LIMIT) * UNEMPLOYMENT_INSURANCE_BRACKETS.TIER2_RATE + UNEMPLOYMENT_INSURANCE_BRACKETS.TIER1_BASE;
    } else {
      unemploymentInsuranceValue = UNEMPLOYMENT_INSURANCE_BRACKETS.MAX_VALUE;
    }
    unemploymentInsuranceValue = round(unemploymentInsuranceValue);
  }

  const hoursAdditionalsMonthly =
    totalMonths > 0
      ? round((extraHoursValue + nightAdditionalValue) / totalMonths)
      : 0;
  const reflexo13thValue = !isComJustaCausa
    ? round(hoursAdditionalsMonthly * (projectedAvos / 12))
    : 0;
  const paidVacationCount = isComJustaCausa
    ? vacationVencidasCount
    : projectedAvos;
  const reflexoVacationValue = round(
    hoursAdditionalsMonthly * (paidVacationCount / 12) * (4 / 3),
  );
  const reflexoFGTSValue = !isComJustaCausa
    ? round((extraHoursValue + nightAdditionalValue) * fgtsRate)
    : 0;
  const reflexoMultaFGTSValue = isSemJustaCausa
    ? round(reflexoFGTSValue * FGTS_FINE_RATE)
    : 0;
  const art477FineValue = applyArt477Fine ? round(lastSalary) : 0;

  // Saldo de salário (dias trabalhados e não pagos)
  const saldoSalarioValue = round((lastSalary / 30) * unpaidSalaryDays);

  // Diferenças salariais (equiparação/desvio): monthly diff × months (capped at 60
  // by prescription) + reflexos (13º, férias+1/3, FGTS+40%) as rough estimates
  let salaryDiffValue = 0;
  let salaryDiffMonths = 0;
  for (const p of salaryDifferencePeriods) {
    const months = applyPrescricaoQuinquenal
      ? Math.min(monthsBetween(p.startMonth, p.endMonth), 60)
      : monthsBetween(p.startMonth, p.endMonth);
    salaryDiffValue += p.monthly * months;
    salaryDiffMonths += months;
  }
  salaryDiffValue = round(salaryDiffValue);
  let salaryDiffReflexos = 0;
  if (salaryDiffValue > 0 && salaryDifferenceApplyReflexos) {
    const avgDiff = salaryDiffValue / Math.max(salaryDiffMonths, 1);
    const reflexo13 = !isComJustaCausa ? avgDiff * (projectedAvos / 12) : 0;
    const reflexoFerias = avgDiff * (paidVacationCount / 12) * (4 / 3);
    const reflexoFgtsDiff = !isComJustaCausa ? salaryDiffValue * fgtsRate : 0;
    const reflexoMultaDiff = isSemJustaCausa
      ? reflexoFgtsDiff * FGTS_FINE_RATE
      : 0;
    salaryDiffReflexos = round(
      reflexo13 + reflexoFerias + reflexoFgtsDiff + reflexoMultaDiff,
    );
  }

  // Outras verbas: monthly value × months; salarial nature adds FGTS (+40%)
  let customVerbasValue = 0;
  let customVerbasReflexos = 0;
  for (const verba of customVerbas) {
    const months = applyPrescricaoQuinquenal
      ? Math.min(monthsBetween(verba.startMonth, verba.endMonth), 60)
      : monthsBetween(verba.startMonth, verba.endMonth);
    const total = verba.monthly * months;
    customVerbasValue += total;
    if (verba.nature === "salarial" && !isComJustaCausa) {
      const fgtsOnVerba = total * fgtsRate;
      customVerbasReflexos +=
        fgtsOnVerba + (isSemJustaCausa ? fgtsOnVerba * FGTS_FINE_RATE : 0);
    }
  }
  customVerbasValue = round(customVerbasValue);
  customVerbasReflexos = round(customVerbasReflexos);

  // Intervalo intrajornada (art. 71 §4) e adicional de transferência (art. 469 §3)
  const intervalIntrajornadaValue = round(
    intervalIntrajornadaHours * (lastSalary / MONTHLY_WORK_HOURS) * 1.5 * totalMonths,
  );
  const transferAdditionalValue = round(
    baseSalary * 0.25 * transferAdditionalMonths,
  );
  const dsrValue = applyDsrOnExtra
    ? round((extraHoursValue + nightAdditionalValue) * 0.1818)
    : 0;
  const stabilityValue =
    stabilityMonths > 0
      ? round(
          lastSalary * stabilityMonths +
            (lastSalary * stabilityMonths) / 12 +
            ((lastSalary * stabilityMonths) / 12) * (4 / 3) +
            lastSalary * stabilityMonths * fgtsRate,
        )
      : 0;

  // Art. 467: +50% over férias, 13º, aviso prévio and 40% FGTS fine
  const art467Value = applyArt467
    ? round(
        0.5 *
          (vacationValue +
            thirteenthSalaryValue +
            priorNoticeValue +
            fgtsFineValue),
      )
    : 0;

  return round(
    priorNoticeValue +
      thirteenthSalaryValue +
      vacationValue +
      fgtsValue +
      fgtsFineValue +
      unemploymentInsuranceValue +
      extraHoursValue +
      nightAdditionalValue +
      insalubrityValue +
      dangerousWorkValue +
      reflexo13thValue +
      reflexoVacationValue +
      reflexoFGTSValue +
      reflexoMultaFGTSValue +
      art477FineValue +
      saldoSalarioValue +
      salaryDiffValue +
      salaryDiffReflexos +
      customVerbasValue +
      customVerbasReflexos +
      art467Value +
      intervalIntrajornadaValue +
      transferAdditionalValue +
      dsrValue +
      stabilityValue -
      deductions,
  );
}
