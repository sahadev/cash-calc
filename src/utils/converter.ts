import type { SalaryStructure, StructureBreakdown } from '../types/salary';
import { VALUE_WEIGHTS } from '../types/salary';
import { getCityPolicy, BASIC_DEDUCTION_MONTHLY, TAX_BRACKETS, BONUS_TAX_BRACKETS } from '../data/cityPolicies';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function calcCumulativeTax(cumulativeTaxableIncome: number): number {
  if (cumulativeTaxableIncome <= 0) return 0;
  for (const bracket of TAX_BRACKETS) {
    if (cumulativeTaxableIncome <= bracket.upper) {
      return round2(cumulativeTaxableIncome * bracket.rate - bracket.deduction);
    }
  }
  const last = TAX_BRACKETS[TAX_BRACKETS.length - 1];
  return round2(cumulativeTaxableIncome * last.rate - last.deduction);
}

function calcBonusTaxSeparate(bonus: number): number {
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
 * 计算某个薪资结构的年度明细（支持非标结构）
 */
export function calcStructureBreakdown(structure: SalaryStructure): StructureBreakdown {
  const policy = getCityPolicy(structure.city);
  const { monthlyBase, months, altChannelRatio, altChannelFeeRate, housingFundRate } = structure;

  // 1. 确定社保/公积金基数
  let siBase: number;
  if (structure.socialInsuranceBaseType === 'minimum') {
    siBase = policy.socialInsurance.base.min;
  } else if (structure.socialInsuranceBaseType === 'custom' && structure.customSocialInsuranceBase) {
    siBase = clamp(structure.customSocialInsuranceBase, policy.socialInsurance.base.min, policy.socialInsurance.base.max);
  } else {
    siBase = clamp(monthlyBase, policy.socialInsurance.base.min, policy.socialInsurance.base.max);
  }

  let hfBase: number;
  if (structure.housingFundBaseType === 'minimum') {
    hfBase = policy.housingFund.base.min;
  } else if (structure.housingFundBaseType === 'custom' && structure.customHousingFundBase) {
    hfBase = clamp(structure.customHousingFundBase, policy.housingFund.base.min, policy.housingFund.base.max);
  } else {
    hfBase = clamp(monthlyBase, policy.housingFund.base.min, policy.housingFund.base.max);
  }

  // 2. 计算五险一金
  const pensionPersonal = round2(siBase * policy.socialInsurance.personal.pension);
  const medicalPersonal = round2(siBase * policy.socialInsurance.personal.medical);
  const unemploymentPersonal = round2(siBase * policy.socialInsurance.personal.unemployment);
  const housingFundPersonal = round2(hfBase * (housingFundRate / 100));
  const socialInsurancePersonal = round2(pensionPersonal + medicalPersonal + unemploymentPersonal + housingFundPersonal);

  const pensionEmployer = round2(siBase * policy.socialInsurance.employer.pension);
  const medicalEmployer = round2(siBase * policy.socialInsurance.employer.medical);
  const unemploymentEmployer = round2(siBase * policy.socialInsurance.employer.unemployment);
  const injuryEmployer = round2(siBase * policy.socialInsurance.employer.injury);
  const housingFundEmployer = round2(hfBase * (housingFundRate / 100));
  const socialInsuranceEmployer = round2(pensionEmployer + medicalEmployer + unemploymentEmployer + injuryEmployer + housingFundEmployer);

  // 3. 计算正规渠道收入（用于计税）
  const officialMonthly = round2(monthlyBase * (1 - altChannelRatio / 100));
  const officialAnnual = round2(officialMonthly * months);
  const officialSalaryPart = round2(officialMonthly * 12);
  const officialBonusPart = round2(officialMonthly * Math.max(0, months - 12));

  // 4. 累计预扣法计算 12 个月工资个税
  let cumulativeTaxableIncome = 0;
  let cumulativeTaxPaid = 0;
  const monthlyDeduction = socialInsurancePersonal;

  for (let m = 1; m <= 12; m++) {
    const monthTaxableIncome = officialMonthly - BASIC_DEDUCTION_MONTHLY - monthlyDeduction - structure.specialDeduction;
    cumulativeTaxableIncome += monthTaxableIncome;
    const effectiveCumulative = Math.max(0, cumulativeTaxableIncome);
    const cumulativeTax = calcCumulativeTax(effectiveCumulative);
    const monthlyTax = round2(Math.max(0, cumulativeTax - cumulativeTaxPaid));
    cumulativeTaxPaid += monthlyTax;
  }

  // 5. 年终奖个税（自动选择最优方式）
  const separateTax = calcBonusTaxSeparate(officialBonusPart);
  const combinedExtraTax = round2(
    calcCumulativeTax(Math.max(0, cumulativeTaxableIncome) + officialBonusPart) -
    calcCumulativeTax(Math.max(0, cumulativeTaxableIncome))
  );
  const bonusTax = Math.min(separateTax, combinedExtraTax);

  const incomeTax = round2(cumulativeTaxPaid + bonusTax);

  // 6. 正规渠道到手
  const officialTakeHome = round2(officialAnnual - socialInsurancePersonal * 12 - incomeTax);

  // 7. 其它渠道到手
  const altChannelAnnual = round2(monthlyBase * (altChannelRatio / 100) * months);
  const altChannelFee = round2(altChannelAnnual * (altChannelFeeRate / 100));
  const altChannelTakeHome = round2(altChannelAnnual - altChannelFee);

  // 8. 合计
  const takeHomeCash = round2(officialTakeHome + altChannelTakeHome);
  const grossAnnual = round2(monthlyBase * months);

  // 9. 股票
  const stockFaceValue = structure.annualStockValue;
  const stockValue = round2(stockFaceValue * (structure.stockDiscount / 100));

  // 10. 综合价值
  const comprehensiveValue = round2(
    takeHomeCash * VALUE_WEIGHTS.cash +
    (housingFundPersonal + housingFundEmployer) * 12 * VALUE_WEIGHTS.housingFund +
    (pensionPersonal + pensionEmployer) * 12 * VALUE_WEIGHTS.pension +
    stockValue
  );

  // 11. 企业总成本
  const employerTotalCost = round2(grossAnnual + socialInsuranceEmployer * 12);

  return {
    grossAnnual,
    officialSalaryAnnual: officialAnnual,
    altChannelAnnual,
    altChannelFee,
    socialInsurancePersonal: round2(socialInsurancePersonal * 12),
    housingFundPersonal: round2(housingFundPersonal * 12),
    pensionPersonal: round2(pensionPersonal * 12),
    incomeTax,
    takeHomeCash,
    socialInsuranceEmployer: round2(socialInsuranceEmployer * 12),
    housingFundEmployer: round2(housingFundEmployer * 12),
    pensionEmployer: round2(pensionEmployer * 12),
    employerTotalCost,
    stockFaceValue,
    stockValue,
    comprehensiveValue,
  };
}

/**
 * 二分搜索反推月 Base
 * 给定目标综合价值和目标结构参数，反推出满足条件的月 Base
 */
export function solveMonthlyBase(
  targetStructureWithoutBase: Omit<SalaryStructure, 'monthlyBase'>,
  targetComprehensiveValue: number
): number {
  let lo = 0;
  let hi = 500000;
  const maxIterations = 50;

  for (let i = 0; i < maxIterations; i++) {
    const mid = Math.round((lo + hi) / 2);
    if (mid === lo) break;

    const structure: SalaryStructure = { ...targetStructureWithoutBase, monthlyBase: mid };
    const breakdown = calcStructureBreakdown(structure);

    if (breakdown.comprehensiveValue < targetComprehensiveValue) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return hi;
}

/**
 * 完整的薪资结构转换
 */
export function convertSalaryStructure(
  current: SalaryStructure,
  targetWithoutBase: Omit<SalaryStructure, 'monthlyBase'>,
  raisePercent: number
) {
  const currentBreakdown = calcStructureBreakdown(current);
  const targetComprehensiveValue = round2(
    currentBreakdown.comprehensiveValue * (1 + raisePercent / 100)
  );

  const targetMonthlyBase = solveMonthlyBase(targetWithoutBase, targetComprehensiveValue);

  const targetStructure: SalaryStructure = {
    ...targetWithoutBase,
    monthlyBase: targetMonthlyBase,
  };
  const targetBreakdown = calcStructureBreakdown(targetStructure);

  const cashRaisePercent = currentBreakdown.takeHomeCash > 0
    ? round2((targetBreakdown.takeHomeCash - currentBreakdown.takeHomeCash) / currentBreakdown.takeHomeCash * 100)
    : 0;

  const employerCostChangePercent = currentBreakdown.employerTotalCost > 0
    ? round2((targetBreakdown.employerTotalCost - currentBreakdown.employerTotalCost) / currentBreakdown.employerTotalCost * 100)
    : 0;

  return {
    targetMonthlyBase,
    currentBreakdown,
    targetBreakdown,
    raisePercent,
    cashRaisePercent,
    employerCostChangePercent,
  };
}
