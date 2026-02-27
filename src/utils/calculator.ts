import type {
  SalaryInput,
  InsuranceBreakdown,
  MonthlyBreakdown,
  BonusTaxResult,
  AnnualSummary,
} from '../types/salary';
import {
  SOCIAL_INSURANCE_BASE,
  HOUSING_FUND_BASE,
  PERSONAL_RATES,
  EMPLOYER_RATES,
  BASIC_DEDUCTION_MONTHLY,
  TAX_BRACKETS,
  BONUS_TAX_BRACKETS,
} from './constants';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function calcInsuranceBase(
  monthlyBase: number,
  customBase: number | undefined,
  range: { min: number; max: number }
): number {
  if (customBase !== undefined && customBase > 0) {
    return clamp(customBase, range.min, range.max);
  }
  return clamp(monthlyBase, range.min, range.max);
}

export function calcPersonalInsurance(
  siBase: number,
  hfBase: number,
  hfRate: number
): InsuranceBreakdown {
  const pension = round2(siBase * PERSONAL_RATES.pension);
  const medical = round2(siBase * PERSONAL_RATES.medical);
  const unemployment = round2(siBase * PERSONAL_RATES.unemployment);
  const housingFund = round2(hfBase * (hfRate / 100));
  return {
    pension,
    medical,
    unemployment,
    housingFund,
    total: round2(pension + medical + unemployment + housingFund),
  };
}

export function calcEmployerInsurance(
  siBase: number,
  hfBase: number,
  hfRate: number
) {
  const pension = round2(siBase * EMPLOYER_RATES.pension);
  const medical = round2(siBase * EMPLOYER_RATES.medical);
  const unemployment = round2(siBase * EMPLOYER_RATES.unemployment);
  const injury = round2(siBase * EMPLOYER_RATES.injury);
  const housingFund = round2(hfBase * (hfRate / 100));
  return {
    pension,
    medical,
    unemployment,
    injury,
    housingFund,
    total: round2(pension + medical + unemployment + injury + housingFund),
  };
}

function findTaxBracket(cumulativeIncome: number) {
  for (const bracket of TAX_BRACKETS) {
    if (cumulativeIncome <= bracket.upper) {
      return bracket;
    }
  }
  return TAX_BRACKETS[TAX_BRACKETS.length - 1];
}

function calcCumulativeTax(cumulativeTaxableIncome: number): number {
  if (cumulativeTaxableIncome <= 0) return 0;
  const bracket = findTaxBracket(cumulativeTaxableIncome);
  return round2(cumulativeTaxableIncome * bracket.rate - bracket.deduction);
}

export function calcBonusTaxSeparate(bonus: number): number {
  if (bonus <= 0) return 0;
  const monthlyAvg = bonus / 12;
  for (const bracket of BONUS_TAX_BRACKETS) {
    if (monthlyAvg <= bracket.upper) {
      return round2(bonus * bracket.rate - bracket.deduction);
    }
  }
  const last = BONUS_TAX_BRACKETS[BONUS_TAX_BRACKETS.length - 1];
  return round2(bonus * last.rate - last.deduction);
}

/**
 * Calculate the additional tax if bonus is combined into Dec cumulative income.
 * Returns the extra tax compared to without bonus.
 */
function calcBonusTaxCombined(
  cumulativeTaxableIncomeWithoutBonus: number,
  bonus: number
): number {
  const taxWithout = calcCumulativeTax(cumulativeTaxableIncomeWithoutBonus);
  const taxWith = calcCumulativeTax(
    cumulativeTaxableIncomeWithoutBonus + bonus
  );
  return round2(taxWith - taxWithout);
}

export function calculateAll(input: SalaryInput): AnnualSummary {
  const {
    monthlyBase,
    totalMonths,
    housingFundRate,
    additionalDeduction,
    bonusTaxMode,
  } = input;

  const siBase = calcInsuranceBase(
    monthlyBase,
    input.socialInsuranceBase,
    SOCIAL_INSURANCE_BASE
  );
  const hfBase = calcInsuranceBase(
    monthlyBase,
    input.housingFundBase,
    HOUSING_FUND_BASE
  );

  const personalIns = calcPersonalInsurance(siBase, hfBase, housingFundRate);
  const employerIns = calcEmployerInsurance(siBase, hfBase, housingFundRate);

  const monthlyDetails: MonthlyBreakdown[] = [];
  let cumulativeTaxableIncome = 0;
  let cumulativeTaxPaid = 0;

  for (let m = 1; m <= 12; m++) {
    const grossSalary = monthlyBase;
    const specialDeduction = personalIns.total;
    const monthTaxableIncome =
      grossSalary - BASIC_DEDUCTION_MONTHLY - specialDeduction - additionalDeduction;

    cumulativeTaxableIncome += monthTaxableIncome;
    const effectiveCumulative = Math.max(0, cumulativeTaxableIncome);

    const cumulativeTax = calcCumulativeTax(effectiveCumulative);
    const monthlyTax = round2(Math.max(0, cumulativeTax - cumulativeTaxPaid));
    cumulativeTaxPaid = cumulativeTaxPaid + monthlyTax;

    const netSalary = round2(grossSalary - personalIns.total - monthlyTax);

    monthlyDetails.push({
      month: m,
      grossSalary,
      socialInsuranceBase: siBase,
      housingFundBase: hfBase,
      personalInsurance: { ...personalIns },
      employerInsurance: { ...employerIns },
      taxableIncome: round2(monthTaxableIncome),
      cumulativeTaxableIncome: round2(effectiveCumulative),
      cumulativeTax: round2(cumulativeTaxPaid),
      monthlyTax,
      netSalary,
    });
  }

  const bonusAmount = round2(monthlyBase * (totalMonths - 12));
  const separateTax = calcBonusTaxSeparate(bonusAmount);
  const combinedTax = calcBonusTaxCombined(
    Math.max(0, cumulativeTaxableIncome),
    bonusAmount
  );

  const recommendedMode =
    separateTax <= combinedTax ? 'separate' : 'combined';

  const bonusTaxResult: BonusTaxResult = {
    bonusAmount,
    separateTax,
    combinedTax,
    recommendedMode,
    separateNetBonus: round2(bonusAmount - separateTax),
    combinedNetBonus: round2(bonusAmount - combinedTax),
  };

  let effectiveBonusTax: number;
  if (bonusTaxMode === 'auto') {
    effectiveBonusTax =
      recommendedMode === 'separate' ? separateTax : combinedTax;
  } else if (bonusTaxMode === 'separate') {
    effectiveBonusTax = separateTax;
  } else {
    effectiveBonusTax = combinedTax;
  }

  const totalSalaryGross = round2(monthlyBase * 12);
  const totalGrossIncome = round2(totalSalaryGross + bonusAmount);
  const totalPersonalInsurance = round2(personalIns.total * 12);
  const salaryTax = round2(cumulativeTaxPaid);
  const totalTax = round2(salaryTax + effectiveBonusTax);
  const salaryNetCash = monthlyDetails.reduce((s, m) => s + m.netSalary, 0);
  const bonusNetCash = round2(bonusAmount - effectiveBonusTax);
  const totalNetCash = round2(salaryNetCash + bonusNetCash);

  const totalPensionPersonal = round2(personalIns.pension * 12);
  const totalPensionEmployer = round2(employerIns.pension * 12);
  const totalHousingFundPersonal = round2(personalIns.housingFund * 12);
  const totalHousingFundEmployer = round2(employerIns.housingFund * 12);
  const totalPension = round2(totalPensionPersonal + totalPensionEmployer);
  const totalHousingFund = round2(
    totalHousingFundPersonal + totalHousingFundEmployer
  );
  const totalValue = round2(totalNetCash + totalPension + totalHousingFund);

  return {
    totalGrossIncome,
    totalSalaryGross,
    bonusGross: bonusAmount,
    totalPersonalInsurance,
    totalTax,
    salaryTax,
    bonusTax: effectiveBonusTax,
    totalNetCash,
    totalPensionPersonal,
    totalPensionEmployer,
    totalHousingFundPersonal,
    totalHousingFundEmployer,
    totalPension,
    totalHousingFund,
    totalValue,
    bonusTaxResult,
    monthlyDetails,
  };
}
