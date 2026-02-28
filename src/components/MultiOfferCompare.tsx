import { useState, useMemo } from 'react';
import type { SalaryStructure, StructureBreakdown } from '../types/salary';
import { calcStructureBreakdown } from '../utils/converter';
import { getCityPolicy } from '../data/cityPolicies';
import StructureInput from './StructureInput';

const ACCENT_COLORS: ('amber' | 'emerald')[] = ['amber', 'emerald'];
const LABELS = ['Offer A', 'Offer B', 'Offer C', 'Offer D'];

function fmtW(n: number): string {
  return (n / 10000).toFixed(2) + '万';
}

function makeDefault(index: number): SalaryStructure {
  return {
    city: 'beijing',
    monthlyBase: index === 0 ? 25000 : 0,
    months: 15,
    socialInsuranceBaseType: 'full',
    housingFundBaseType: 'full',
    housingFundRate: getCityPolicy('beijing').housingFund.defaultRate,
    altChannelRatio: 0,
    altChannelFeeRate: 0,
    annualStockValue: 0,
    stockDiscount: 70,
    specialDeduction: 0,
  };
}

export default function MultiOfferCompare() {
  const [offerCount, setOfferCount] = useState(2);
  const [offers, setOffers] = useState<SalaryStructure[]>(() =>
    Array.from({ length: 4 }, (_, i) => makeDefault(i))
  );

  const activeOffers = offers.slice(0, offerCount);

  const breakdowns = useMemo(() => {
    return activeOffers.map((offer) => {
      if (offer.monthlyBase <= 0) return null;
      try {
        return calcStructureBreakdown(offer);
      } catch {
        return null;
      }
    });
  }, [activeOffers]);

  const validBreakdowns = breakdowns.filter((b): b is StructureBreakdown => b !== null);
  const bestIdx = validBreakdowns.length > 0
    ? breakdowns.indexOf(validBreakdowns.reduce((best, b) => b.comprehensiveValue > best.comprehensiveValue ? b : best))
    : -1;

  const updateOffer = (index: number, value: Partial<SalaryStructure>) => {
    const next = [...offers];
    next[index] = { ...next[index], ...value } as SalaryStructure;
    setOffers(next);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 控制栏 */}
      <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-amber-500 tracking-wide">
              多 Offer 对比
            </h2>
            <p className="text-xs text-t4 mt-1">并排对比多个 Offer 的综合价值</p>
          </div>
          <div className="flex gap-1.5">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setOfferCount(n)}
                className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs transition-all ${
                  offerCount === n
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/50'
                    : 'bg-elevated text-t3 hover:bg-hover active:bg-hover'
                }`}
              >
                {n} 个
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Offer 输入卡片 */}
      <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${
        offerCount === 2 ? 'lg:grid-cols-2' : offerCount === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2 xl:grid-cols-4'
      }`}>
        {activeOffers.map((offer, i) => (
          <div
            key={i}
            className={`rounded-2xl bg-card border p-4 sm:p-5 card-shadow ${
              i === bestIdx ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-b1'
            }`}
          >
            {i === bestIdx && (
              <div className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded w-fit mb-2">
                综合价值最高
              </div>
            )}
            <StructureInput
              value={offer}
              onChange={(v) => updateOffer(i, v as SalaryStructure)}
              showMonthlyBase={true}
              label={LABELS[i]}
              accentColor={ACCENT_COLORS[i % 2]}
            />
          </div>
        ))}
      </div>

      {/* 结果汇总 */}
      {validBreakdowns.length > 0 && (
        <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
          <h3 className="text-sm font-semibold text-amber-500 tracking-wide mb-4">
            对比结果
          </h3>
          <ResultTable
            labels={LABELS.slice(0, offerCount)}
            breakdowns={breakdowns}
            bestIdx={bestIdx}
          />
        </div>
      )}
    </div>
  );
}

function ResultTable({ labels, breakdowns, bestIdx }: {
  labels: string[];
  breakdowns: (StructureBreakdown | null)[];
  bestIdx: number;
}) {
  const rows: { label: string; getValue: (b: StructureBreakdown) => number; accent?: string; bold?: boolean }[] = [
    { label: '税前年总包', getValue: (b) => b.grossAnnual },
    { label: '年到手现金', getValue: (b) => b.takeHomeCash, accent: 'text-emerald-500', bold: true },
    { label: '五险一金(个人)', getValue: (b) => b.socialInsurancePersonal, accent: 'text-rose-500' },
    { label: '个人所得税', getValue: (b) => b.incomeTax, accent: 'text-orange-500' },
    { label: '公积金(双边)', getValue: (b) => b.housingFundPersonal + b.housingFundEmployer, accent: 'text-violet-500' },
    { label: '养老金(双边)', getValue: (b) => b.pensionPersonal + b.pensionEmployer },
    { label: '股票价值', getValue: (b) => b.stockValue },
    { label: '综合价值', getValue: (b) => b.comprehensiveValue, accent: 'text-amber-500', bold: true },
    { label: '企业总成本', getValue: (b) => b.employerTotalCost },
  ];

  return (
    <div>
      {/* 移动端 */}
      <div className="sm:hidden space-y-2">
        {rows.map((row) => (
          <div key={row.label}>
            <div className={`text-xs mb-1 ${row.bold ? 'font-semibold text-t2' : 'text-t3'}`}>{row.label}</div>
            <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${labels.length}, 1fr)` }}>
              {breakdowns.map((b, i) => (
                <div key={i} className="text-center">
                  <div className="text-[10px] text-t4">{labels[i]}</div>
                  <div className={`text-xs font-mono ${
                    b ? (i === bestIdx && row.bold ? 'text-emerald-500 font-semibold' : (row.accent || 'text-t2')) : 'text-t5'
                  }`}>
                    {b ? fmtW(row.getValue(b)) : '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 桌面端 */}
      <table className="hidden sm:table w-full text-sm">
        <thead>
          <tr className="border-b border-b1">
            <th className="text-left py-2 text-t4 font-medium text-xs">项目</th>
            {labels.map((l, i) => (
              <th key={i} className={`text-right py-2 font-medium text-xs ${i === bestIdx ? 'text-emerald-500' : 'text-t4'}`}>
                {l}{i === bestIdx ? ' ✦' : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-b3">
              <td className={`py-2 text-xs ${row.bold ? 'font-semibold text-t2' : 'text-t3'}`}>{row.label}</td>
              {breakdowns.map((b, i) => (
                <td key={i} className={`py-2 text-right font-mono text-xs ${
                  b ? (i === bestIdx && row.bold ? 'text-emerald-500 font-semibold' : (row.accent || 'text-t2')) : 'text-t5'
                }`}>
                  {b ? fmtW(row.getValue(b)) : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
