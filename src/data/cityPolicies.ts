export type CityId =
  | 'beijing' | 'shanghai' | 'guangzhou' | 'shenzhen'
  | 'hangzhou' | 'chengdu' | 'nanjing' | 'wuhan' | 'suzhou' | 'tianjin';

export interface InsuranceRates {
  pension: number;
  medical: number;
  unemployment: number;
}

export interface EmployerInsuranceRates extends InsuranceRates {
  injury: number;
}

export interface CityPolicy {
  id: CityId;
  name: string;
  shortName: string;
  policyYear: string;
  policyPeriod: string;
  socialInsurance: {
    base: { min: number; max: number };
    personal: InsuranceRates;
    employer: EmployerInsuranceRates;
  };
  housingFund: {
    base: { min: number; max: number };
    rateRange: { min: number; max: number };
    defaultRate: number;
  };
}

export const TAX_BRACKETS = [
  { upper: 36000, rate: 0.03, deduction: 0 },
  { upper: 144000, rate: 0.10, deduction: 2520 },
  { upper: 300000, rate: 0.20, deduction: 16920 },
  { upper: 420000, rate: 0.25, deduction: 31920 },
  { upper: 660000, rate: 0.30, deduction: 52920 },
  { upper: 960000, rate: 0.35, deduction: 85920 },
  { upper: Infinity, rate: 0.45, deduction: 181920 },
];

export const BONUS_TAX_BRACKETS = [
  { upper: 3000, rate: 0.03, deduction: 0 },
  { upper: 12000, rate: 0.10, deduction: 210 },
  { upper: 25000, rate: 0.20, deduction: 1410 },
  { upper: 35000, rate: 0.25, deduction: 2660 },
  { upper: 55000, rate: 0.30, deduction: 4410 },
  { upper: 80000, rate: 0.35, deduction: 7160 },
  { upper: Infinity, rate: 0.45, deduction: 15160 },
];

export const BASIC_DEDUCTION_MONTHLY = 5000;

/**
 * 各城市五险一金政策数据
 * 数据来源：各城市人社局 2025 年度公告
 */
const cityPolicies: Record<CityId, CityPolicy> = {
  beijing: {
    id: 'beijing',
    name: '北京市',
    shortName: '北京',
    policyYear: '2025',
    policyPeriod: '2025.7 ~ 2026.6',
    socialInsurance: {
      base: { min: 7162, max: 35811 },
      personal: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
      employer: { pension: 0.16, medical: 0.1037, unemployment: 0.005, injury: 0.002 },
    },
    housingFund: {
      base: { min: 2540, max: 35811 },
      rateRange: { min: 5, max: 12 },
      defaultRate: 12,
    },
  },

  shanghai: {
    id: 'shanghai',
    name: '上海市',
    shortName: '上海',
    policyYear: '2025',
    policyPeriod: '2025.7 ~ 2026.6',
    socialInsurance: {
      base: { min: 7384, max: 36921 },
      personal: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
      employer: { pension: 0.16, medical: 0.095, unemployment: 0.005, injury: 0.0016 },
    },
    housingFund: {
      base: { min: 2690, max: 36921 },
      rateRange: { min: 5, max: 12 },
      defaultRate: 7,
    },
  },

  guangzhou: {
    id: 'guangzhou',
    name: '广州市',
    shortName: '广州',
    policyYear: '2025',
    policyPeriod: '2025.7 ~ 2026.6',
    socialInsurance: {
      base: { min: 5284, max: 27501 },
      personal: { pension: 0.08, medical: 0.02, unemployment: 0.002 },
      employer: { pension: 0.14, medical: 0.055, unemployment: 0.0032, injury: 0.002 },
    },
    housingFund: {
      base: { min: 2300, max: 41472 },
      rateRange: { min: 5, max: 12 },
      defaultRate: 12,
    },
  },

  shenzhen: {
    id: 'shenzhen',
    name: '深圳市',
    shortName: '深圳',
    policyYear: '2025',
    policyPeriod: '2025.7 ~ 2026.6',
    socialInsurance: {
      base: { min: 2360, max: 27501 },
      personal: { pension: 0.08, medical: 0.02, unemployment: 0.003 },
      employer: { pension: 0.14, medical: 0.05, unemployment: 0.007, injury: 0.002 },
    },
    housingFund: {
      base: { min: 2360, max: 41190 },
      rateRange: { min: 5, max: 12 },
      defaultRate: 5,
    },
  },

  hangzhou: {
    id: 'hangzhou',
    name: '杭州市',
    shortName: '杭州',
    policyYear: '2025',
    policyPeriod: '2025.7 ~ 2026.6',
    socialInsurance: {
      base: { min: 4812, max: 24060 },
      personal: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
      employer: { pension: 0.14, medical: 0.095, unemployment: 0.005, injury: 0.002 },
    },
    housingFund: {
      base: { min: 2490, max: 38322 },
      rateRange: { min: 5, max: 12 },
      defaultRate: 12,
    },
  },

  chengdu: {
    id: 'chengdu',
    name: '成都市',
    shortName: '成都',
    policyYear: '2025',
    policyPeriod: '2025.7 ~ 2026.6',
    socialInsurance: {
      base: { min: 4246, max: 21228 },
      personal: { pension: 0.08, medical: 0.02, unemployment: 0.004 },
      employer: { pension: 0.16, medical: 0.069, unemployment: 0.006, injury: 0.002 },
    },
    housingFund: {
      base: { min: 2280, max: 30456 },
      rateRange: { min: 5, max: 12 },
      defaultRate: 12,
    },
  },

  nanjing: {
    id: 'nanjing',
    name: '南京市',
    shortName: '南京',
    policyYear: '2025',
    policyPeriod: '2025.7 ~ 2026.6',
    socialInsurance: {
      base: { min: 4879, max: 24396 },
      personal: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
      employer: { pension: 0.16, medical: 0.08, unemployment: 0.005, injury: 0.004 },
    },
    housingFund: {
      base: { min: 2490, max: 36000 },
      rateRange: { min: 5, max: 12 },
      defaultRate: 12,
    },
  },

  wuhan: {
    id: 'wuhan',
    name: '武汉市',
    shortName: '武汉',
    policyYear: '2025',
    policyPeriod: '2025.7 ~ 2026.6',
    socialInsurance: {
      base: { min: 4494, max: 22467 },
      personal: { pension: 0.08, medical: 0.02, unemployment: 0.003 },
      employer: { pension: 0.16, medical: 0.08, unemployment: 0.007, injury: 0.004 },
    },
    housingFund: {
      base: { min: 2210, max: 29230 },
      rateRange: { min: 5, max: 12 },
      defaultRate: 12,
    },
  },

  suzhou: {
    id: 'suzhou',
    name: '苏州市',
    shortName: '苏州',
    policyYear: '2025',
    policyPeriod: '2025.7 ~ 2026.6',
    socialInsurance: {
      base: { min: 4879, max: 24396 },
      personal: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
      employer: { pension: 0.16, medical: 0.07, unemployment: 0.005, injury: 0.004 },
    },
    housingFund: {
      base: { min: 2490, max: 36000 },
      rateRange: { min: 5, max: 12 },
      defaultRate: 12,
    },
  },

  tianjin: {
    id: 'tianjin',
    name: '天津市',
    shortName: '天津',
    policyYear: '2025',
    policyPeriod: '2025.7 ~ 2026.6',
    socialInsurance: {
      base: { min: 5310, max: 26541 },
      personal: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
      employer: { pension: 0.16, medical: 0.09, unemployment: 0.005, injury: 0.002 },
    },
    housingFund: {
      base: { min: 2320, max: 30420 },
      rateRange: { min: 5, max: 12 },
      defaultRate: 11,
    },
  },
};

export const CITY_LIST: CityId[] = [
  'beijing', 'shanghai', 'guangzhou', 'shenzhen',
  'hangzhou', 'chengdu', 'nanjing', 'wuhan', 'suzhou', 'tianjin',
];

export function getCityPolicy(cityId: CityId): CityPolicy {
  return cityPolicies[cityId];
}

export function getAllCityPolicies(): CityPolicy[] {
  return CITY_LIST.map((id) => cityPolicies[id]);
}

export default cityPolicies;
