import type { CityId } from '../data/cityPolicies';

export interface SalaryInput {
  monthlyBase: number;
  totalMonths: number;
  housingFundRate: number;
  additionalDeduction: number;
  socialInsuranceBase?: number;
  housingFundBase?: number;
  bonusTaxMode: 'separate' | 'combined' | 'auto';
  city: CityId;
  supplementHFRate?: number;
  enterpriseAnnuityRate?: number;
}

export interface InsuranceBreakdown {
  pension: number;
  medical: number;
  unemployment: number;
  housingFund: number;
  total: number;
}

export interface MonthlyBreakdown {
  month: number;
  grossSalary: number;
  socialInsuranceBase: number;
  housingFundBase: number;
  personalInsurance: InsuranceBreakdown;
  employerInsurance: InsuranceBreakdown & { injury: number };
  taxableIncome: number;
  cumulativeTaxableIncome: number;
  cumulativeTax: number;
  monthlyTax: number;
  netSalary: number;
}

export interface BonusTaxResult {
  bonusAmount: number;
  separateTax: number;
  combinedTax: number;
  recommendedMode: 'separate' | 'combined';
  separateNetBonus: number;
  combinedNetBonus: number;
}

export interface AnnualSummary {
  totalGrossIncome: number;
  totalSalaryGross: number;
  bonusGross: number;
  totalPersonalInsurance: number;
  totalTax: number;
  salaryTax: number;
  bonusTax: number;
  totalNetCash: number;
  totalPensionPersonal: number;
  totalPensionEmployer: number;
  totalHousingFundPersonal: number;
  totalHousingFundEmployer: number;
  totalPension: number;
  totalHousingFund: number;
  totalValue: number;
  bonusTaxResult: BonusTaxResult;
  monthlyDetails: MonthlyBreakdown[];
  totalSupplementHF?: number;
  totalEnterpriseAnnuity?: number;
}

export interface HistoryRecord {
  id: string;
  createdAt: string;
  input: SalaryInput;
  summary: AnnualSummary;
  label?: string;
}

// ========== 薪资结构转换器类型 ==========

export type SocialInsuranceBaseType = 'full' | 'minimum' | 'custom';

export interface SalaryStructure {
  city: CityId;
  monthlyBase: number;
  months: number;
  socialInsuranceBaseType: SocialInsuranceBaseType;
  customSocialInsuranceBase?: number;
  housingFundBaseType: SocialInsuranceBaseType;
  customHousingFundBase?: number;
  housingFundRate: number;
  altChannelRatio: number;
  altChannelFeeRate: number;
  annualStockValue: number;
  stockDiscount: number;
  specialDeduction: number;
}

/** 综合价值折价系数（系统预设） */
export const VALUE_WEIGHTS = {
  cash: 1.0,
  housingFund: 1.0,
  pension: 0.5,
  medical: 0,
  unemployment: 0,
  workInjury: 0,
} as const;

export interface StructureBreakdown {
  grossAnnual: number;
  officialSalaryAnnual: number;
  altChannelAnnual: number;
  altChannelFee: number;
  socialInsurancePersonal: number;
  housingFundPersonal: number;
  pensionPersonal: number;
  incomeTax: number;
  takeHomeCash: number;
  socialInsuranceEmployer: number;
  housingFundEmployer: number;
  pensionEmployer: number;
  employerTotalCost: number;
  stockFaceValue: number;
  stockValue: number;
  comprehensiveValue: number;
}

export interface ConversionResult {
  targetMonthlyBase: number;
  currentBreakdown: StructureBreakdown;
  targetBreakdown: StructureBreakdown;
  raisePercent: number;
  cashRaisePercent: number;
  employerCostChangePercent: number;
}
