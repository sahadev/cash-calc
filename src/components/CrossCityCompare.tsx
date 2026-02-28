import { useState, useMemo } from 'react';
import { CITY_LIST, getCityPolicy, type CityId } from '../data/cityPolicies';
import { calculateAll } from '../utils/calculator';
import type { SalaryInput, AnnualSummary } from '../types/salary';

function fmtW(n: number): string {
  return (n / 10000).toFixed(2) + '万';
}

function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

const DEFAULT_SELECTED: CityId[] = ['beijing', 'shanghai', 'guangzhou', 'shenzhen'];

const defaultInput = {
  monthlyBase: 20000,
  totalMonths: 15,
  housingFundRate: 12,
  additionalDeduction: 0,
  bonusTaxMode: 'auto' as const,
};

export default function CrossCityCompare() {
  const [base, setBase] = useState(defaultInput);
  const [selectedCities, setSelectedCities] = useState<CityId[]>(DEFAULT_SELECTED);

  const toggleCity = (cityId: CityId) => {
    setSelectedCities((prev) =>
      prev.includes(cityId)
        ? prev.length > 2 ? prev.filter((c) => c !== cityId) : prev
        : prev.length < 6 ? [...prev, cityId] : prev
    );
  };

  const results = useMemo(() => {
    if (base.monthlyBase <= 0) return null;
    return selectedCities.map((cityId) => {
      const policy = getCityPolicy(cityId);
      const hfRate = Math.min(base.housingFundRate, policy.housingFund.rateRange.max);
      const input: SalaryInput = { ...base, city: cityId, housingFundRate: hfRate };
      const summary = calculateAll(input);
      return { cityId, policy, summary, hfRate };
    });
  }, [base, selectedCities]);

  const bestCity = results
    ? results.reduce((best, r) => r.summary.totalNetCash > best.summary.totalNetCash ? r : best)
    : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
        <h2 className="text-base sm:text-lg font-semibold text-amber-500 tracking-wide mb-4">
          跨城对比
        </h2>
        <p className="text-xs text-t4 mb-4">
          输入同一薪资方案，对比各城市到手差异（选择 2~6 城）
        </p>

        {/* 城市多选 */}
        <div className="mb-4">
          <span className="text-xs text-t3 uppercase tracking-widest mb-1.5 block">对比城市</span>
          <div className="flex flex-wrap gap-1.5">
            {CITY_LIST.map((id) => {
              const p = getCityPolicy(id);
              const active = selectedCities.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleCity(id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    active
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/50'
                      : 'bg-elevated text-t3 hover:bg-hover active:bg-hover'
                  }`}
                >
                  {p.shortName}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="block">
            <span className="text-xs text-t3 uppercase tracking-widest mb-1.5 block">月 Base</span>
            <input
              type="number"
              value={base.monthlyBase || ''}
              onChange={(e) => setBase({ ...base, monthlyBase: parseFloat(e.target.value) || 0 })}
              className="input-field"
              placeholder="例: 20000"
            />
          </label>
          <label className="block">
            <span className="text-xs text-t3 uppercase tracking-widest mb-1.5 block">年薪月数</span>
            <input
              type="number"
              min={12} max={24}
              value={base.totalMonths || ''}
              onChange={(e) => setBase({ ...base, totalMonths: parseFloat(e.target.value) || 12 })}
              className="input-field"
              placeholder="例: 15"
            />
          </label>
          <label className="block">
            <span className="text-xs text-t3 uppercase tracking-widest mb-1.5 block">公积金比例</span>
            <input
              type="number"
              min={5} max={12}
              value={base.housingFundRate || ''}
              onChange={(e) => setBase({ ...base, housingFundRate: parseInt(e.target.value) || 12 })}
              className="input-field"
              placeholder="例: 12"
            />
          </label>
          <label className="block">
            <span className="text-xs text-t3 uppercase tracking-widest mb-1.5 block">专项扣除/月</span>
            <input
              type="number"
              min={0} step={100}
              value={base.additionalDeduction || ''}
              onChange={(e) => setBase({ ...base, additionalDeduction: parseFloat(e.target.value) || 0 })}
              className="input-field"
              placeholder="例: 1500"
            />
          </label>
        </div>
      </div>

      {results && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {results.map((r) => (
              <CityCard
                key={r.cityId}
                name={r.policy.shortName}
                summary={r.summary}
                hfRate={r.hfRate}
                isBest={r.cityId === bestCity?.cityId}
              />
            ))}
          </div>

          <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow overflow-x-auto">
            <h3 className="text-sm font-semibold text-amber-500 tracking-wide mb-4">
              详细对比
            </h3>
            <CompareTable results={results} />
          </div>
        </>
      )}

      {(!results || base.monthlyBase <= 0) && (
        <div className="rounded-2xl bg-card border border-b1 p-8 text-center card-shadow">
          <div className="text-4xl mb-3 opacity-30">🏙️</div>
          <p className="text-t4 text-sm">输入月 Base 开始跨城对比</p>
        </div>
      )}
    </div>
  );
}

function CityCard({ name, summary, hfRate, isBest }: {
  name: string;
  summary: AnnualSummary;
  hfRate: number;
  isBest: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 sm:p-4 ${isBest ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-b1 bg-inset'}`}>
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <span className="text-sm sm:text-base font-semibold text-t1">{name}</span>
        {isBest && <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">到手最多</span>}
      </div>
      <div className="space-y-1.5">
        <div>
          <div className="text-[10px] text-t4">年到手现金</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-500">{fmtW(summary.totalNetCash)}</div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div>
            <span className="text-t4">月均到手</span>
            <div className="font-mono text-t2">{fmt(summary.totalNetCash / 12)}</div>
          </div>
          <div>
            <span className="text-t4">综合价值</span>
            <div className="font-mono text-amber-500">{fmtW(summary.totalValue)}</div>
          </div>
          <div>
            <span className="text-t4">全年个税</span>
            <div className="font-mono text-orange-500">{fmtW(summary.totalTax)}</div>
          </div>
          <div>
            <span className="text-t4">公积金{hfRate}%</span>
            <div className="font-mono text-violet-500">{fmtW(summary.totalHousingFund)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareTable({ results }: { results: { cityId: CityId; policy: ReturnType<typeof getCityPolicy>; summary: AnnualSummary; hfRate: number }[] }) {
  const rows: { label: string; getValue: (s: AnnualSummary) => number; accent?: string }[] = [
    { label: '税前总收入', getValue: (s) => s.totalGrossIncome },
    { label: '五险一金(个人/年)', getValue: (s) => s.totalPersonalInsurance, accent: 'text-rose-500' },
    { label: '全年个税', getValue: (s) => s.totalTax, accent: 'text-orange-500' },
    { label: '年到手现金', getValue: (s) => s.totalNetCash, accent: 'text-emerald-500' },
    { label: '养老金(双边)', getValue: (s) => s.totalPension },
    { label: '公积金(双边)', getValue: (s) => s.totalHousingFund, accent: 'text-violet-500' },
    { label: '综合价值', getValue: (s) => s.totalValue, accent: 'text-amber-500' },
  ];

  return (
    <div className="min-w-0">
      {/* 移动端: 每项指标单独一行，各城市横排 */}
      <div className="sm:hidden space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="text-xs text-t3 font-medium mb-1">{row.label}</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {results.map((r) => (
                <div key={r.cityId} className="flex items-baseline gap-1">
                  <span className="text-[10px] text-t4 w-6 shrink-0">{r.policy.shortName}</span>
                  <span className={`text-xs font-mono ${row.accent || 'text-t2'}`}>
                    {fmtW(row.getValue(r.summary))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 桌面端: 表格 */}
      <table className="hidden sm:table w-full text-sm">
        <thead>
          <tr className="border-b border-b1">
            <th className="text-left py-2 text-t4 font-medium text-xs">项目</th>
            {results.map((r) => (
              <th key={r.cityId} className="text-right py-2 text-t4 font-medium text-xs">{r.policy.shortName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-b3">
              <td className="py-2 text-t3 text-xs">{row.label}</td>
              {results.map((r) => (
                <td key={r.cityId} className={`py-2 text-right font-mono text-xs ${row.accent || 'text-t2'}`}>
                  {fmtW(row.getValue(r.summary))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
