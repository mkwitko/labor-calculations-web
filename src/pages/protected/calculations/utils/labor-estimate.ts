const round = (v: number) => Math.round(v * 100) / 100;

import {
  DANGEROUS_WORK_RATE,
  DEFAULT_FGTS_RATE,
  DEFAULT_MINIMUM_WAGE,
  FGTS_FINE_RATE,
  MONTHLY_WORK_HOURS,
  NIGHT_SHIFT_MULTIPLIER_V2,
  OVERTIME_MULTIPLIER,
  UNEMPLOYMENT_INSURANCE_BRACKETS,
  VACATION_BONUS_RATIO,
} from "./labor-constants";

export type EstimateInput = {
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
};

export function estimateLaborTotal(input: EstimateInput): number {
  const {
    startDate,
    endDate,
    lastSalary,
    baseSalary,
    unpaid13ths,
    vacationCount,
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

  const hourlyRate = round(lastSalary / MONTHLY_WORK_HOURS);
  const extraHoursValue = round(extraHours * hourlyRate * OVERTIME_MULTIPLIER);
  const nightAdditionalValue = round(nightHours * hourlyRate * NIGHT_SHIFT_MULTIPLIER_V2);
  const insalubrityValue = round(minimumWage * (insalubrityLevel / 100) * totalMonths);
  const dangerousWorkValue = dangerousWork ? round(baseSalary * DANGEROUS_WORK_RATE * totalMonths) : 0;

  let priorNoticeValue = 0;
  if (terminationType !== "com_justa_causa" && !priorNoticeWorked) {
    const days = 30 + workedYears * 3;
    priorNoticeValue = round((lastSalary / 30) * days);
  }

  const thirteenthSalaryValue =
    terminationType !== "com_justa_causa" ? round(lastSalary * unpaid13ths) : 0;

  const vacationBase = lastSalary + lastSalary * VACATION_BONUS_RATIO;
  const proportionalVacations =
    terminationType === "com_justa_causa" ? 0 : vacationCount - vacationVencidasCount;
  const vacationValue = round(
    proportionalVacations * vacationBase + vacationVencidasCount * vacationBase * 2,
  );

  const fgtsValue =
    terminationType !== "com_justa_causa"
      ? round(lastSalary * fgtsRate * totalMonths)
      : 0;
  const fgtsFineValue =
    terminationType === "sem_justa_causa" ? round(fgtsValue * FGTS_FINE_RATE) : 0;

  let unemploymentInsuranceValue = 0;
  if (terminationType === "sem_justa_causa") {
    if (lastThreeSalariesAvg <= UNEMPLOYMENT_INSURANCE_BRACKETS.TIER1_LIMIT) {
      unemploymentInsuranceValue = lastThreeSalariesAvg * UNEMPLOYMENT_INSURANCE_BRACKETS.TIER1_RATE;
    } else if (lastThreeSalariesAvg <= UNEMPLOYMENT_INSURANCE_BRACKETS.TIER2_LIMIT) {
      unemploymentInsuranceValue = (lastThreeSalariesAvg - UNEMPLOYMENT_INSURANCE_BRACKETS.TIER1_LIMIT) * UNEMPLOYMENT_INSURANCE_BRACKETS.TIER2_RATE + UNEMPLOYMENT_INSURANCE_BRACKETS.TIER1_BASE;
    } else {
      unemploymentInsuranceValue = UNEMPLOYMENT_INSURANCE_BRACKETS.MAX_VALUE;
    }
    unemploymentInsuranceValue = round(unemploymentInsuranceValue);
  }

  const hoursAdditionalsMonthly =
    totalMonths > 0 ? round((extraHoursValue + nightAdditionalValue) / totalMonths) : 0;
  const reflexo13thValue =
    terminationType !== "com_justa_causa"
      ? round(hoursAdditionalsMonthly * unpaid13ths)
      : 0;
  const paidVacationCount =
    terminationType === "com_justa_causa" ? vacationVencidasCount : vacationCount;
  const reflexoVacationValue = round(hoursAdditionalsMonthly * paidVacationCount * (4 / 3));
  const reflexoFGTSValue =
    terminationType !== "com_justa_causa"
      ? round((extraHoursValue + nightAdditionalValue) * fgtsRate)
      : 0;
  const reflexoMultaFGTSValue =
    terminationType === "sem_justa_causa" ? round(reflexoFGTSValue * FGTS_FINE_RATE) : 0;
  const art477FineValue = applyArt477Fine ? round(baseSalary) : 0;

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
      art477FineValue,
  );
}
