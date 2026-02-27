// 北京市 2025 年度（2025.7 ~ 2026.6）五险一金参数

export const SOCIAL_INSURANCE_BASE = {
  min: 7162,
  max: 35811,
};

export const HOUSING_FUND_BASE = {
  min: 2540,
  max: 35811,
};

// 个人缴纳比例
export const PERSONAL_RATES = {
  pension: 0.08,
  medical: 0.02,
  unemployment: 0.005,
};

// 单位缴纳比例
export const EMPLOYER_RATES = {
  pension: 0.16,
  medical: 0.1037,
  unemployment: 0.005,
  injury: 0.002,
};

export const HOUSING_FUND_RATE_RANGE = { min: 5, max: 12 };
export const DEFAULT_HOUSING_FUND_RATE = 12;

// 个税基本扣除 5000 元/月
export const BASIC_DEDUCTION_MONTHLY = 5000;

// 累计预扣预缴七级税率表
export const TAX_BRACKETS = [
  { upper: 36000, rate: 0.03, deduction: 0 },
  { upper: 144000, rate: 0.10, deduction: 2520 },
  { upper: 300000, rate: 0.20, deduction: 16920 },
  { upper: 420000, rate: 0.25, deduction: 31920 },
  { upper: 660000, rate: 0.30, deduction: 52920 },
  { upper: 960000, rate: 0.35, deduction: 85920 },
  { upper: Infinity, rate: 0.45, deduction: 181920 },
];

// 年终奖按月换算税率表（与上面税率相同，但 upper 为月额）
export const BONUS_TAX_BRACKETS = [
  { upper: 3000, rate: 0.03, deduction: 0 },
  { upper: 12000, rate: 0.10, deduction: 210 },
  { upper: 25000, rate: 0.20, deduction: 1410 },
  { upper: 35000, rate: 0.25, deduction: 2660 },
  { upper: 55000, rate: 0.30, deduction: 4410 },
  { upper: 80000, rate: 0.35, deduction: 7160 },
  { upper: Infinity, rate: 0.45, deduction: 15160 },
];
