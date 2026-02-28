import type { AnnualSummary, SalaryInput } from '../types/salary';
import { getCityPolicy } from '../data/cityPolicies';

function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

function fmtW(n: number): string {
  return (n / 10000).toFixed(2);
}

export function generateNaturalLanguageSummary(input: SalaryInput, summary: AnnualSummary): string {
  const policy = getCityPolicy(input.city);
  const cityName = policy.shortName;
  const monthlyNet = Math.round(summary.totalNetCash / 12);
  const bonusMonths = input.totalMonths - 12;
  const bonusText = bonusMonths > 0 ? `，含${bonusMonths}个月年终奖` : '';

  const lines = [
    `在${cityName}，月薪 ${fmt(input.monthlyBase)} 元、${input.totalMonths} 薪${bonusText}的情况下：`,
    ``,
    `每月到手约 ${fmt(monthlyNet)} 元，全年到手现金 ${fmtW(summary.totalNetCash)} 万元。`,
    `全年个税 ${fmtW(summary.totalTax)} 万元（工资个税 ${fmtW(summary.salaryTax)} 万 + 年终奖个税 ${fmtW(summary.bonusTax)} 万）。`,
    `五险一金个人缴纳 ${fmtW(summary.totalPersonalInsurance)} 万元/年。`,
    `公积金双边（个人+单位）${fmtW(summary.totalHousingFund)} 万元/年，养老金双边 ${fmtW(summary.totalPension)} 万元/年。`,
    `综合到手价值（含公积金和养老金折算）${fmtW(summary.totalValue)} 万元。`,
  ];

  if (summary.bonusGross > 0) {
    const mode = summary.bonusTaxResult.recommendedMode === 'separate' ? '单独计税' : '并入综合所得';
    const saving = Math.abs(summary.bonusTaxResult.separateTax - summary.bonusTaxResult.combinedTax);
    if (saving > 0) {
      lines.push(`年终奖推荐${mode}方式，可节省个税 ${fmt(saving)} 元。`);
    }
  }

  return lines.join('\n');
}
