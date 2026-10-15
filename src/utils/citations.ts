export type Citation = {
  article: string
  basis: string
}

export type CalculationCitations = Record<string, Citation>

export const CITATION_LABELS: Record<string, string> = {
  priorNoticeValue: 'Aviso Prévio',
  thirteenthSalaryValue: '13º Salário',
  vacationValue: 'Férias Proporcionais',
  fgtsValue: 'FGTS',
  fgtsFineValue: 'Multa FGTS (40%)',
  unemploymentInsuranceValue: 'Seguro Desemprego',
  extraHoursValue: 'Horas Extras',
  nightAdditionalValue: 'Adicional Noturno',
  insalubrityValue: 'Insalubridade',
  dangerousWorkValue: 'Periculosidade',
}

export function getCalculationCitations(calc: {
  priorNoticeWorked: boolean
  priorNoticeValue: number
  thirteenthSalaryValue: number
  vacationValue: number
  fgtsValue: number
  fgtsFineValue: number
  unemploymentInsuranceValue: number
  extraHoursValue: number
  nightAdditionalValue: number
  insalubrityValue: number
  insalubrityLevel: number
  dangerousWorkValue: number
}): CalculationCitations {
  const c: CalculationCitations = {}

  if (!calc.priorNoticeWorked && calc.priorNoticeValue > 0) {
    c.priorNoticeValue = {
      article: 'CLT, Art. 487, §1º',
      basis: 'Aviso prévio indenizado proporcional: 30 dias + 3 dias por ano trabalhado (TST Súmula 441)',
    }
  }

  if (calc.thirteenthSalaryValue > 0) {
    c.thirteenthSalaryValue = {
      article: 'Lei 4.090/62, Art. 1º',
      basis: 'Gratificação natalina proporcional aos meses trabalhados no exercício',
    }
  }

  if (calc.vacationValue > 0) {
    c.vacationValue = {
      article: 'CLT, Art. 146 e 148; CF/88, Art. 7º, XVII',
      basis: 'Férias proporcionais com acréscimo de 1/3 constitucional (TST Súmula 328)',
    }
  }

  if (calc.fgtsValue > 0) {
    c.fgtsValue = {
      article: 'Lei 8.036/90, Art. 15',
      basis: 'Depósito mensal sobre a remuneração bruta do empregado',
    }
  }

  if (calc.fgtsFineValue > 0) {
    c.fgtsFineValue = {
      article: 'Lei 8.036/90, Art. 18, §1º; CF/88, Art. 7º, III',
      basis: 'Multa rescisória de 40% sobre o saldo do FGTS em dispensa sem justa causa',
    }
  }

  if (calc.unemploymentInsuranceValue > 0) {
    c.unemploymentInsuranceValue = {
      article: 'Lei 7.998/90; Res. CODEFAT 857/2017',
      basis: 'Benefício calculado por faixa salarial sobre a média dos últimos 3 salários',
    }
  }

  if (calc.extraHoursValue > 0) {
    c.extraHoursValue = {
      article: 'CLT, Art. 59, §1º; CF/88, Art. 7º, XVI',
      basis: 'Adicional mínimo de 50% sobre a hora normal (divisor 220h — TST Súmula 124)',
    }
  }

  if (calc.nightAdditionalValue > 0) {
    c.nightAdditionalValue = {
      article: 'CLT, Art. 73',
      basis: 'Adicional noturno de 20% para trabalho realizado entre 22h e 5h (TST OJ SDI-1 97)',
    }
  }

  if (calc.insalubrityValue > 0) {
    const grau =
      calc.insalubrityLevel === 10
        ? 'mínimo (10%)'
        : calc.insalubrityLevel === 20
          ? 'médio (20%)'
          : 'máximo (40%)'
    c.insalubrityValue = {
      article: 'CLT, Art. 192; NR-15 (Portaria MTE 3.214/78)',
      basis: `Adicional de insalubridade grau ${grau} sobre o salário mínimo federal`,
    }
  }

  if (calc.dangerousWorkValue > 0) {
    c.dangerousWorkValue = {
      article: 'CLT, Art. 193; NR-16 (Portaria MTE 3.214/78)',
      basis: 'Adicional de periculosidade de 30% sobre o salário base contratual (TST Súmula 191)',
    }
  }

  return c
}
