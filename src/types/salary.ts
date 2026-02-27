export interface SalaryInput {
  monthlyBase: number;
  totalMonths: number; // e.g. 13, 14, 15
  housingFundRate: number; // 5~12, default 12
  additionalDeduction: number; // 专项附加扣除 月额
  socialInsuranceBase?: number; // 自定义社保基数，留空则按月base夹在上下限内
  housingFundBase?: number; // 自定义公积金基数
  bonusTaxMode: 'separate' | 'combined' | 'auto'; // 年终奖计税方式
}

export interface InsuranceBreakdown {
  pension: number; // 养老保险
  medical: number; // 医疗保险
  unemployment: number; // 失业保险
  housingFund: number; // 住房公积金
  total: number;
}

export interface MonthlyBreakdown {
  month: number; // 1~12
  grossSalary: number; // 月应发工资
  socialInsuranceBase: number;
  housingFundBase: number;
  personalInsurance: InsuranceBreakdown;
  employerInsurance: InsuranceBreakdown & { injury: number };
  taxableIncome: number; // 当月应纳税所得额
  cumulativeTaxableIncome: number; // 累计应纳税所得额
  cumulativeTax: number; // 累计应纳税额
  monthlyTax: number; // 当月个税
  netSalary: number; // 当月到手现金
}

export interface BonusTaxResult {
  bonusAmount: number;
  separateTax: number; // 单独计税税额
  combinedTax: number; // 并入综合所得额外税额
  recommendedMode: 'separate' | 'combined';
  separateNetBonus: number;
  combinedNetBonus: number;
}

export interface AnnualSummary {
  totalGrossIncome: number; // 全年税前总收入（含年终奖）
  totalSalaryGross: number; // 全年工资税前
  bonusGross: number; // 年终奖税前
  totalPersonalInsurance: number; // 全年五险一金个人缴纳
  totalTax: number; // 全年个税（工资+年终奖）
  salaryTax: number; // 工资个税
  bonusTax: number; // 年终奖个税
  totalNetCash: number; // 全年到手现金
  totalPensionPersonal: number; // 养老金个人账户（个人部分）
  totalPensionEmployer: number; // 养老金单位划入
  totalHousingFundPersonal: number; // 公积金个人
  totalHousingFundEmployer: number; // 公积金单位
  totalPension: number; // 养老金合计
  totalHousingFund: number; // 公积金合计
  totalValue: number; // 综合到手价值
  bonusTaxResult: BonusTaxResult;
  monthlyDetails: MonthlyBreakdown[];
}

export interface HistoryRecord {
  id: string;
  createdAt: string;
  input: SalaryInput;
  summary: AnnualSummary;
  label?: string;
}
