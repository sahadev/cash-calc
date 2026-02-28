import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCityPolicy, CITY_LIST, type CityId } from '../data/cityPolicies';
import { calculateAll } from '../utils/calculator';
import AdSlot from './AdSlot';
import AD_SLOTS from '../config/adSlots';

function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

function fmtW(n: number): string {
  return (n / 10000).toFixed(2);
}

const SALARY_LEVELS = [5000, 8000, 10000, 12000, 15000, 18000, 20000, 25000, 30000, 35000, 40000, 50000, 60000, 80000];

export default function CityLanding() {
  const { cityId } = useParams<{ cityId: string }>();

  const validCityId = CITY_LIST.includes(cityId as CityId) ? (cityId as CityId) : null;

  if (!validCityId) {
    return (
      <div className="space-y-6">
        <h2 className="text-base sm:text-lg font-semibold text-amber-500">城市薪资速查</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CITY_LIST.map((id) => {
            const p = getCityPolicy(id);
            return (
              <Link
                key={id}
                to={`/city/${id}`}
                className="rounded-xl bg-card border border-b1 p-4 sm:p-5 card-shadow hover:border-amber-500/50 transition-colors text-center"
              >
                <div className="text-lg sm:text-xl font-bold text-t1 mb-1">{p.shortName}</div>
                <div className="text-xs text-t4">
                  社保 {fmt(p.socialInsurance.base.min)}~{fmt(p.socialInsurance.base.max)}
                </div>
                <div className="text-xs text-t4 mt-0.5">
                  公积金 {p.housingFund.rateRange.min}%~{p.housingFund.rateRange.max}%
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  const policy = getCityPolicy(validCityId);

  return <CityDetail cityId={validCityId} policy={policy} />;
}

function CityDetail({ cityId, policy }: { cityId: CityId; policy: ReturnType<typeof getCityPolicy> }) {
  const table = useMemo(() => {
    return SALARY_LEVELS.map((base) => {
      const input = {
        monthlyBase: base,
        totalMonths: 13,
        housingFundRate: policy.housingFund.defaultRate,
        additionalDeduction: 0,
        bonusTaxMode: 'auto' as const,
        city: cityId,
      };
      const s = calculateAll(input);
      return {
        base,
        monthlyNet: Math.round(s.totalNetCash / 12),
        annualNet: s.totalNetCash,
        annualTax: s.totalTax,
        annualInsurance: s.totalPersonalInsurance,
        annualHF: s.totalHousingFund,
        annualPension: s.totalPension,
        annualValue: s.totalValue,
      };
    });
  }, [cityId, policy]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 城市概览 */}
      <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/city" className="text-t4 hover:text-amber-500 text-xs">← 全部城市</Link>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-t1 mb-1">
          {policy.name}薪资速查表
        </h1>
        <p className="text-xs sm:text-sm text-t4">
          {policy.policyYear} 年度政策（{policy.policyPeriod}）· 13 薪 · 公积金 {policy.housingFund.defaultRate}% · 无专项扣除
        </p>
      </div>

      {/* 政策参数 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <PolicyCard label="社保基数范围" value={`${fmt(policy.socialInsurance.base.min)} ~ ${fmt(policy.socialInsurance.base.max)}`} />
        <PolicyCard label="公积金基数范围" value={`${fmt(policy.housingFund.base.min)} ~ ${fmt(policy.housingFund.base.max)}`} />
        <PolicyCard label="公积金比例" value={`${policy.housingFund.rateRange.min}% ~ ${policy.housingFund.rateRange.max}%`} />
        <PolicyCard label="养老+医疗+失业(个人)" value={`${(policy.socialInsurance.personal.pension * 100).toFixed(0)}% + ${(policy.socialInsurance.personal.medical * 100).toFixed(0)}% + ${(policy.socialInsurance.personal.unemployment * 100).toFixed(1)}%`} />
      </div>

      {/* 速查表 */}
      <div className="rounded-2xl bg-card border border-b1 card-shadow overflow-hidden">
        <div className="p-4 sm:p-5 pb-0">
          <h2 className="text-sm font-semibold text-amber-500 tracking-wide mb-1">
            月薪到手速查表
          </h2>
          <p className="text-[10px] sm:text-xs text-t4 mb-3">
            基于 13 薪、公积金 {policy.housingFund.defaultRate}%、全额社保、无专项扣除
          </p>
        </div>

        {/* 移动端卡片 */}
        <div className="sm:hidden p-3 space-y-2">
          {table.map((r) => (
            <div key={r.base} className="rounded-lg bg-inset border border-b1 p-3">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm font-semibold text-t1">月薪 {fmt(r.base)}</span>
                <span className="text-sm font-bold font-mono text-emerald-500">到手 {fmt(r.monthlyNet)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div><span className="text-t4">年到手</span><div className="font-mono text-t2">{fmtW(r.annualNet)}万</div></div>
                <div><span className="text-t4">年个税</span><div className="font-mono text-orange-500">{fmtW(r.annualTax)}万</div></div>
                <div><span className="text-t4">综合值</span><div className="font-mono text-amber-500">{fmtW(r.annualValue)}万</div></div>
              </div>
            </div>
          ))}
        </div>

        {/* 桌面端表格 */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-b1 bg-inset">
                <th className="text-left px-4 py-2.5 text-t4 text-xs font-medium">月薪</th>
                <th className="text-right px-4 py-2.5 text-t4 text-xs font-medium">月到手</th>
                <th className="text-right px-4 py-2.5 text-t4 text-xs font-medium">年到手</th>
                <th className="text-right px-4 py-2.5 text-t4 text-xs font-medium">年个税</th>
                <th className="text-right px-4 py-2.5 text-t4 text-xs font-medium">五险一金/年</th>
                <th className="text-right px-4 py-2.5 text-t4 text-xs font-medium">公积金(双边)</th>
                <th className="text-right px-4 py-2.5 text-t4 text-xs font-medium">综合价值</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r, i) => (
                <tr key={r.base} className={`border-b border-b3 ${i % 2 === 0 ? '' : 'bg-inset/50'}`}>
                  <td className="px-4 py-2 font-semibold text-t1">{fmt(r.base)}</td>
                  <td className="px-4 py-2 text-right font-mono text-emerald-500 font-semibold">{fmt(r.monthlyNet)}</td>
                  <td className="px-4 py-2 text-right font-mono text-t2">{fmtW(r.annualNet)}万</td>
                  <td className="px-4 py-2 text-right font-mono text-orange-500">{fmtW(r.annualTax)}万</td>
                  <td className="px-4 py-2 text-right font-mono text-rose-500">{fmtW(r.annualInsurance)}万</td>
                  <td className="px-4 py-2 text-right font-mono text-violet-500">{fmtW(r.annualHF)}万</td>
                  <td className="px-4 py-2 text-right font-mono text-amber-500 font-semibold">{fmtW(r.annualValue)}万</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdSlot {...AD_SLOTS.cityTableBottom} />

      {/* SEO 友好文字 */}
      <div className="rounded-xl bg-inset border border-b1 p-3 sm:p-4">
        <h3 className="text-xs text-amber-500/70 uppercase tracking-widest mb-2">
          {policy.name}薪资计算说明
        </h3>
        <div className="text-xs sm:text-sm text-t3 space-y-2 leading-relaxed">
          <p>
            以上数据基于{policy.name} {policy.policyYear} 年度社保公积金政策计算。
            社保缴费基数范围 {fmt(policy.socialInsurance.base.min)}~{fmt(policy.socialInsurance.base.max)} 元，
            公积金缴存基数范围 {fmt(policy.housingFund.base.min)}~{fmt(policy.housingFund.base.max)} 元。
          </p>
          <p>
            个人缴纳比例：养老 {(policy.socialInsurance.personal.pension * 100).toFixed(0)}% + 医疗 {(policy.socialInsurance.personal.medical * 100).toFixed(0)}% + 失业 {(policy.socialInsurance.personal.unemployment * 100).toFixed(1)}% + 公积金 {policy.housingFund.defaultRate}%。
            个税按累计预扣法计算，起征点 5000 元/月。
          </p>
          <p>
            计算结果为参考值，实际到手金额可能因专项附加扣除、补充公积金、社保基数取整规则等因素略有不同。
            如需精确计算，请使用 <Link to="/" className="text-amber-500 hover:underline">CashCalc 薪资计算器</Link>。
          </p>
        </div>
      </div>
    </div>
  );
}

function PolicyCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-inset border border-b1 p-3">
      <div className="text-[10px] text-t4 mb-1">{label}</div>
      <div className="text-xs sm:text-sm font-mono text-t1 font-medium">{value}</div>
    </div>
  );
}
