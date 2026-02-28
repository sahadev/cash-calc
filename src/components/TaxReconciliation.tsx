import { useState, useMemo } from 'react';
import type { CityId } from '../data/cityPolicies';
import { getCityPolicy, TAX_BRACKETS, BASIC_DEDUCTION_MONTHLY } from '../data/cityPolicies';
import CitySelector from './CitySelector';

function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

interface TaxReconInput {
  city: CityId;
  monthlyBase: number;
  totalMonths: number;
  housingFundRate: number;
  additionalDeduction: number;
  otherIncome: number;
  laborIncome: number;
  royaltyIncome: number;
  itemizedDeductions: number;
}

interface ReconResult {
  annualGross: number;
  annualInsurance: number;
  annualBasicDeduction: number;
  annualAdditionalDeduction: number;
  annualOtherIncome: number;
  laborAfterDeduction: number;
  royaltyAfterDeduction: number;
  totalTaxableIncome: number;
  annualTaxDue: number;
  withheldSalaryTax: number;
  withheldBonusTax: number;
  totalWithheld: number;
  difference: number;
  bracketName: string;
  effectiveRate: number;
}

function calcAnnualTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= bracket.upper) {
      return round2(taxableIncome * bracket.rate - bracket.deduction);
    }
  }
  const last = TAX_BRACKETS[TAX_BRACKETS.length - 1];
  return round2(taxableIncome * last.rate - last.deduction);
}

function getBracketName(taxableIncome: number): string {
  if (taxableIncome <= 0) return '免税';
  const rates = ['3%', '10%', '20%', '25%', '30%', '35%', '45%'];
  for (let i = 0; i < TAX_BRACKETS.length; i++) {
    if (taxableIncome <= TAX_BRACKETS[i].upper) return rates[i];
  }
  return '45%';
}

export default function TaxReconciliation() {
  const [input, setInput] = useState<TaxReconInput>({
    city: 'beijing',
    monthlyBase: 20000,
    totalMonths: 15,
    housingFundRate: 12,
    additionalDeduction: 0,
    otherIncome: 0,
    laborIncome: 0,
    royaltyIncome: 0,
    itemizedDeductions: 0,
  });

  const set = <K extends keyof TaxReconInput>(key: K, val: TaxReconInput[K]) =>
    setInput({ ...input, [key]: val });

  const numChange = (key: keyof TaxReconInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    set(key, (isNaN(v) ? 0 : v) as TaxReconInput[typeof key]);
  };

  const result = useMemo((): ReconResult | null => {
    if (input.monthlyBase <= 0) return null;
    const policy = getCityPolicy(input.city);

    const siBase = clamp(input.monthlyBase, policy.socialInsurance.base.min, policy.socialInsurance.base.max);
    const hfBase = clamp(input.monthlyBase, policy.housingFund.base.min, policy.housingFund.base.max);
    const hfRate = Math.min(input.housingFundRate, policy.housingFund.rateRange.max);

    const monthlyInsurance =
      round2(siBase * policy.socialInsurance.personal.pension) +
      round2(siBase * policy.socialInsurance.personal.medical) +
      round2(siBase * policy.socialInsurance.personal.unemployment) +
      round2(hfBase * (hfRate / 100));
    const annualInsurance = round2(monthlyInsurance * 12);

    // Withheld salary tax (cumulative withholding)
    let cumTaxable = 0;
    let cumTaxPaid = 0;
    for (let m = 1; m <= 12; m++) {
      const monthTaxable = input.monthlyBase - BASIC_DEDUCTION_MONTHLY - monthlyInsurance - input.additionalDeduction;
      cumTaxable += monthTaxable;
      const cumTax = calcAnnualTax(Math.max(0, cumTaxable));
      const monthTax = round2(Math.max(0, cumTax - cumTaxPaid));
      cumTaxPaid += monthTax;
    }
    const withheldSalaryTax = round2(cumTaxPaid);

    // Bonus (separate taxation)
    const bonusAmount = round2(input.monthlyBase * Math.max(0, input.totalMonths - 12));
    let withheldBonusTax = 0;
    if (bonusAmount > 0) {
      const monthlyAvg = bonusAmount / 12;
      for (const b of TAX_BRACKETS) {
        if (monthlyAvg <= b.upper) {
          withheldBonusTax = round2(bonusAmount * b.rate - b.deduction);
          break;
        }
      }
    }

    // Annual reconciliation
    const annualSalaryGross = round2(input.monthlyBase * 12);
    const annualGross = round2(annualSalaryGross + bonusAmount);
    const annualBasicDeduction = BASIC_DEDUCTION_MONTHLY * 12;
    const annualAdditionalDeduction = round2(input.additionalDeduction * 12);

    // Other comprehensive income
    const laborAfterDeduction = input.laborIncome > 0
      ? round2(input.laborIncome * 0.8)
      : 0;
    const royaltyAfterDeduction = input.royaltyIncome > 0
      ? round2(input.royaltyIncome * 0.8 * 0.7)
      : 0;
    const annualOtherIncome = round2(input.otherIncome);

    const totalTaxableIncome = round2(Math.max(0,
      annualGross +
      annualOtherIncome +
      laborAfterDeduction +
      royaltyAfterDeduction -
      annualInsurance -
      annualBasicDeduction -
      annualAdditionalDeduction -
      input.itemizedDeductions
    ));

    const annualTaxDue = calcAnnualTax(totalTaxableIncome);
    const totalWithheld = round2(withheldSalaryTax + withheldBonusTax);
    const difference = round2(annualTaxDue - totalWithheld);

    const effectiveRate = annualGross > 0 ? round2(annualTaxDue / annualGross * 100) : 0;

    return {
      annualGross,
      annualInsurance,
      annualBasicDeduction,
      annualAdditionalDeduction,
      annualOtherIncome: round2(annualOtherIncome + laborAfterDeduction + royaltyAfterDeduction),
      laborAfterDeduction,
      royaltyAfterDeduction,
      totalTaxableIncome,
      annualTaxDue,
      withheldSalaryTax,
      withheldBonusTax,
      totalWithheld,
      difference,
      bracketName: getBracketName(totalTaxableIncome),
      effectiveRate,
    };
  }, [input]);

  const handleCityChange = (city: CityId) => {
    const newPolicy = getCityPolicy(city);
    setInput({
      ...input,
      city,
      housingFundRate: Math.min(input.housingFundRate, newPolicy.housingFund.rateRange.max),
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 输入区 */}
      <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
        <h2 className="text-base sm:text-lg font-semibold text-amber-500 tracking-wide mb-1">
          年度汇算模拟
        </h2>
        <p className="text-xs text-t4 mb-4">
          模拟个税年度汇算清缴，预估需要补税或可退税的金额
        </p>

        <div className="space-y-4">
          <div>
            <FieldLabel>城市</FieldLabel>
            <CitySelector value={input.city} onChange={handleCityChange} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <FieldLabel>月 Base (元)</FieldLabel>
              <input type="number" value={input.monthlyBase || ''} onChange={numChange('monthlyBase')} className="input-field" placeholder="例: 20000" />
            </div>
            <div>
              <FieldLabel>年薪月数</FieldLabel>
              <input type="number" min={12} max={24} value={input.totalMonths || ''} onChange={numChange('totalMonths')} className="input-field" placeholder="例: 15" />
            </div>
            <div>
              <FieldLabel>公积金比例 (%)</FieldLabel>
              <input type="number" min={5} max={12} value={input.housingFundRate || ''} onChange={numChange('housingFundRate')} className="input-field" placeholder="例: 12" />
            </div>
            <div>
              <FieldLabel>专项扣除 (元/月)</FieldLabel>
              <input type="number" min={0} value={input.additionalDeduction || ''} onChange={numChange('additionalDeduction')} className="input-field" placeholder="例: 1500" />
            </div>
          </div>

          <details className="group">
            <summary className="cursor-pointer text-xs text-t4 hover:text-amber-500 active:text-amber-500 transition-colors select-none py-1">
              其它综合所得 & 专项扣除 ▾
            </summary>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 pl-2 border-l-2 border-b2">
              <div>
                <FieldLabel>稿酬所得 (年)</FieldLabel>
                <input type="number" min={0} value={input.otherIncome || ''} onChange={numChange('otherIncome')} className="input-field" placeholder="0" />
              </div>
              <div>
                <FieldLabel>劳务报酬 (年)</FieldLabel>
                <input type="number" min={0} value={input.laborIncome || ''} onChange={numChange('laborIncome')} className="input-field" placeholder="0" />
              </div>
              <div>
                <FieldLabel>特许权使用费 (年)</FieldLabel>
                <input type="number" min={0} value={input.royaltyIncome || ''} onChange={numChange('royaltyIncome')} className="input-field" placeholder="0" />
              </div>
              <div>
                <FieldLabel>其他扣除项 (年)</FieldLabel>
                <input type="number" min={0} value={input.itemizedDeductions || ''} onChange={numChange('itemizedDeductions')} className="input-field" placeholder="大病医疗等" />
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* 结果 */}
      {result && (
        <div className="space-y-4 sm:space-y-6">
          {/* 核心结论 */}
          <div className={`rounded-2xl border p-4 sm:p-6 card-shadow text-center ${
            result.difference > 0
              ? 'bg-orange-500/5 border-orange-500/30'
              : result.difference < 0
              ? 'bg-emerald-500/5 border-emerald-500/30'
              : 'bg-card border-b1'
          }`}>
            <div className="text-xs text-t4 mb-1">
              {result.difference > 0 ? '需要补税' : result.difference < 0 ? '可以退税' : '不补不退'}
            </div>
            <div className={`text-3xl sm:text-4xl font-bold font-mono ${
              result.difference > 0 ? 'text-orange-500' : result.difference < 0 ? 'text-emerald-500' : 'text-t3'
            }`}>
              {result.difference > 0 ? '+' : ''}{fmt(result.difference)} 元
            </div>
            <div className="mt-2 text-xs text-t4">
              适用税率 {result.bracketName} · 实际税负 {result.effectiveRate}%
            </div>
            {result.difference <= -400 && (
              <p className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400">
                退税金额 ≥ 400 元，记得在次年 3-6 月通过「个人所得税 APP」申请退税
              </p>
            )}
            {result.difference > 0 && result.difference <= 400 && (
              <p className="mt-2 text-[10px] text-t4">
                补税金额 ≤ 400 元，按政策可免于补缴
              </p>
            )}
          </div>

          {/* 计算过程 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-inset border border-b1 p-3 sm:p-4 space-y-1.5">
              <h3 className="text-[10px] sm:text-xs text-amber-500/70 uppercase tracking-widest mb-2">
                年度应纳税额
              </h3>
              <Row label="工资+年终奖总收入" value={fmt(result.annualGross)} />
              {result.annualOtherIncome > 0 && (
                <Row label="其它综合所得(折算后)" value={fmt(result.annualOtherIncome)} />
              )}
              <Row label="- 五险一金(个人)" value={fmt(result.annualInsurance)} accent="rose" />
              <Row label="- 基本减除(6万)" value={fmt(result.annualBasicDeduction)} />
              {result.annualAdditionalDeduction > 0 && (
                <Row label="- 专项附加扣除" value={fmt(result.annualAdditionalDeduction)} />
              )}
              <div className="border-t border-b2 my-1" />
              <Row label="= 全年应纳税所得额" value={fmt(result.totalTaxableIncome)} accent="amber" bold />
              <Row label="= 全年应纳税额" value={fmt(result.annualTaxDue)} accent="orange" bold />
            </div>

            <div className="rounded-xl bg-inset border border-b1 p-3 sm:p-4 space-y-1.5">
              <h3 className="text-[10px] sm:text-xs text-amber-500/70 uppercase tracking-widest mb-2">
                已预扣税额 vs 应纳税额
              </h3>
              <Row label="工资已预扣个税" value={fmt(result.withheldSalaryTax)} />
              <Row label="年终奖已预扣个税" value={fmt(result.withheldBonusTax)} />
              <Row label="合计已预扣" value={fmt(result.totalWithheld)} bold />
              <div className="border-t border-b2 my-1" />
              <Row label="全年应纳税额" value={fmt(result.annualTaxDue)} accent="amber" />
              <Row label="已预扣税额" value={`-${fmt(result.totalWithheld)}`} />
              <div className="border-t border-b2 my-1" />
              <Row
                label={result.difference > 0 ? '需补税' : '可退税'}
                value={fmt(Math.abs(result.difference))}
                accent={result.difference > 0 ? 'orange' : 'emerald'}
                bold
              />
            </div>
          </div>

          {/* 说明 */}
          <div className="rounded-xl bg-inset border border-b1 p-3 sm:p-4">
            <h3 className="text-[10px] sm:text-xs text-amber-500/70 uppercase tracking-widest mb-2">
              说明
            </h3>
            <ul className="text-xs text-t4 space-y-1 list-disc pl-4">
              <li>年度汇算将工资薪金、年终奖、劳务报酬、稿酬、特许权使用费合并为「综合所得」，按年度税率表统一计税</li>
              <li>年终奖若选择「单独计税」，汇算时不并入综合所得（本模拟默认单独计税）</li>
              <li>劳务报酬按 80% 计入，稿酬按 80%×70% 计入</li>
              <li>汇算期为次年 3 月 1 日 ~ 6 月 30 日</li>
            </ul>
          </div>
        </div>
      )}

      {!result && (
        <div className="rounded-2xl bg-card border border-b1 p-8 text-center card-shadow">
          <div className="text-4xl mb-3 opacity-30">🧾</div>
          <p className="text-t4 text-sm">输入收入信息，模拟年度汇算结果</p>
        </div>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-t3 uppercase tracking-widest mb-1.5 block">{children}</span>;
}

function Row({ label, value, accent, bold }: { label: string; value: string; accent?: string; bold?: boolean }) {
  const colorMap: Record<string, string> = {
    rose: 'text-rose-500', orange: 'text-orange-500', amber: 'text-amber-500', emerald: 'text-emerald-500',
  };
  const valColor = accent ? colorMap[accent] || 'text-t2' : 'text-t2';
  return (
    <div className={`flex justify-between gap-2 text-xs sm:text-sm ${bold ? 'font-semibold' : ''}`}>
      <span className="text-t3 truncate">{label}</span>
      <span className={`font-mono shrink-0 ${valColor}`}>{value}</span>
    </div>
  );
}
