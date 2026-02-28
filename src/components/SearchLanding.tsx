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

const CITY_NAME_MAP: Record<string, CityId> = {
  beijing: 'beijing', '北京': 'beijing',
  shanghai: 'shanghai', '上海': 'shanghai',
  guangzhou: 'guangzhou', '广州': 'guangzhou',
  shenzhen: 'shenzhen', '深圳': 'shenzhen',
  hangzhou: 'hangzhou', '杭州': 'hangzhou',
  chengdu: 'chengdu', '成都': 'chengdu',
  nanjing: 'nanjing', '南京': 'nanjing',
  wuhan: 'wuhan', '武汉': 'wuhan',
  suzhou: 'suzhou', '苏州': 'suzhou',
  tianjin: 'tianjin', '天津': 'tianjin',
};

function parseQuery(query: string): { cityId: CityId; salary: number } | null {
  const decoded = decodeURIComponent(query);
  const match = decoded.match(/^([a-z\u4e00-\u9fa5]+)[_\-](\d+)$/i);
  if (!match) return null;

  const cityId = CITY_NAME_MAP[match[1].toLowerCase()];
  const salary = parseInt(match[2]);
  if (!cityId || salary < 1000 || salary > 500000) return null;

  return { cityId, salary };
}

const COMMON_QUERIES = [
  { city: 'beijing' as CityId, salary: 10000 },
  { city: 'beijing' as CityId, salary: 20000 },
  { city: 'beijing' as CityId, salary: 30000 },
  { city: 'shanghai' as CityId, salary: 15000 },
  { city: 'shanghai' as CityId, salary: 25000 },
  { city: 'guangzhou' as CityId, salary: 12000 },
  { city: 'shenzhen' as CityId, salary: 20000 },
  { city: 'hangzhou' as CityId, salary: 18000 },
  { city: 'chengdu' as CityId, salary: 15000 },
  { city: 'nanjing' as CityId, salary: 15000 },
  { city: 'wuhan' as CityId, salary: 12000 },
  { city: 'suzhou' as CityId, salary: 15000 },
];

export default function SearchLanding() {
  const { query } = useParams<{ query: string }>();
  const parsed = query ? parseQuery(query) : null;

  if (!parsed) {
    return <QueryIndex />;
  }

  return <ResultPage cityId={parsed.cityId} salary={parsed.salary} />;
}

function QueryIndex() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-6 card-shadow">
        <h1 className="text-lg sm:text-2xl font-bold text-t1 mb-2">薪资到手速算</h1>
        <p className="text-xs sm:text-sm text-t4 mb-4">
          选择城市和月薪，立即查看到手金额、个税、五险一金明细
        </p>
      </div>

      <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
        <h2 className="text-sm font-semibold text-amber-500 mb-3">热门查询</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COMMON_QUERIES.map(({ city, salary }) => {
            const p = getCityPolicy(city);
            return (
              <Link
                key={`${city}-${salary}`}
                to={`/q/${city}-${salary}`}
                className="rounded-lg bg-inset border border-b1 p-3 hover:border-amber-500/50 transition-colors group"
              >
                <div className="text-xs text-t4 group-hover:text-amber-500 transition-colors">
                  {p.shortName}月薪{fmt(salary)}
                </div>
                <div className="text-sm font-semibold text-t1 mt-0.5">到手多少？</div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Link to="/" className="text-xs text-t4 hover:text-amber-500 transition-colors">自定义计算 →</Link>
        <Link to="/city" className="text-xs text-t4 hover:text-amber-500 transition-colors">城市速查表 →</Link>
        <Link to="/guide" className="text-xs text-t4 hover:text-amber-500 transition-colors">实用攻略 →</Link>
      </div>
    </div>
  );
}

function ResultPage({ cityId, salary }: { cityId: CityId; salary: number }) {
  const policy = getCityPolicy(cityId);

  const results = useMemo(() => {
    const rates = [5, 7, 8, 10, 12].filter(
      (r) => r >= policy.housingFund.rateRange.min && r <= policy.housingFund.rateRange.max
    );
    if (!rates.includes(policy.housingFund.defaultRate)) {
      rates.push(policy.housingFund.defaultRate);
      rates.sort((a, b) => a - b);
    }

    return rates.map((rate) => {
      const input = {
        monthlyBase: salary,
        totalMonths: 13,
        housingFundRate: rate,
        additionalDeduction: 0,
        bonusTaxMode: 'auto' as const,
        city: cityId,
      };
      const summary = calculateAll(input);
      return {
        rate,
        isDefault: rate === policy.housingFund.defaultRate,
        monthlyNet: Math.round(summary.totalNetCash / 12),
        annualNet: summary.totalNetCash,
        annualTax: summary.totalTax,
        annualInsurance: summary.totalPersonalInsurance,
        annualHF: summary.totalHousingFund,
        annualPension: summary.totalPension,
        annualValue: summary.totalValue,
        summary,
      };
    });
  }, [cityId, salary, policy]);

  const defaultResult = results.find((r) => r.isDefault) || results[0];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
      {/* 核心答案 */}
      <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-6 card-shadow">
        <Link to="/q" className="text-xs text-t4 hover:text-amber-500 transition-colors">← 更多查询</Link>

        <h1 className="text-lg sm:text-2xl font-bold text-t1 mt-3 mb-1 leading-tight">
          {policy.shortName}月薪{fmt(salary)}元到手多少？
        </h1>
        <p className="text-xs sm:text-sm text-t4 mb-4">
          {policy.policyYear} 年度政策 · 公积金 {policy.housingFund.defaultRate}% · 13 薪 · 无专项扣除
        </p>

        {/* 核心数字 */}
        <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/20 p-4 sm:p-5 mb-4">
          <div className="text-[10px] sm:text-xs text-emerald-500/70 uppercase tracking-widest mb-1">
            月均到手
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-emerald-500 font-mono">
            {fmt(defaultResult.monthlyNet)} 元
          </div>
          <div className="text-xs sm:text-sm text-t3 mt-1">
            全年到手 {fmtW(defaultResult.annualNet)} 万 · 综合价值 {fmtW(defaultResult.annualValue)} 万
          </div>
        </div>

        {/* 关键指标 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <MetricCard label="全年个税" value={`${fmtW(defaultResult.annualTax)}万`} color="text-orange-500" />
          <MetricCard label="五险一金(个人)" value={`${fmtW(defaultResult.annualInsurance)}万`} color="text-rose-500" />
          <MetricCard label="公积金(双边)" value={`${fmtW(defaultResult.annualHF)}万`} color="text-violet-500" />
          <MetricCard label="养老金(双边)" value={`${fmtW(defaultResult.annualPension)}万`} color="text-sky-500" />
        </div>
      </div>

      {/* 不同公积金比例对比 */}
      <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
        <h2 className="text-sm font-semibold text-amber-500 mb-1">
          不同公积金比例对比
        </h2>
        <p className="text-[10px] sm:text-xs text-t4 mb-3">
          公积金比例越高，到手现金越少，但公积金账户越多
        </p>

        {/* 移动端 */}
        <div className="sm:hidden space-y-2">
          {results.map((r) => (
            <div key={r.rate} className={`rounded-lg border p-3 ${r.isDefault ? 'border-amber-500/50 bg-amber-500/5' : 'border-b1 bg-inset'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-t1">
                  公积金 {r.rate}%
                  {r.isDefault && <span className="ml-1.5 text-[10px] text-amber-500">(默认)</span>}
                </span>
                <span className="text-sm font-bold font-mono text-emerald-500">月到手 {fmt(r.monthlyNet)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div><span className="text-t4">年到手</span><div className="font-mono text-t2">{fmtW(r.annualNet)}万</div></div>
                <div><span className="text-t4">公积金</span><div className="font-mono text-violet-500">{fmtW(r.annualHF)}万</div></div>
                <div><span className="text-t4">综合值</span><div className="font-mono text-amber-500">{fmtW(r.annualValue)}万</div></div>
              </div>
            </div>
          ))}
        </div>

        {/* 桌面端 */}
        <table className="hidden sm:table w-full text-sm">
          <thead>
            <tr className="border-b border-b1">
              <th className="text-left py-2 text-t4 text-xs font-medium">公积金比例</th>
              <th className="text-right py-2 text-t4 text-xs font-medium">月到手</th>
              <th className="text-right py-2 text-t4 text-xs font-medium">年到手</th>
              <th className="text-right py-2 text-t4 text-xs font-medium">公积金(双边)</th>
              <th className="text-right py-2 text-t4 text-xs font-medium">综合价值</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={r.rate} className={`border-b border-b3 ${r.isDefault ? 'bg-amber-500/5' : i % 2 === 0 ? '' : 'bg-inset/50'}`}>
                <td className="py-2 font-semibold text-t1">
                  {r.rate}%
                  {r.isDefault && <span className="ml-1.5 text-[10px] text-amber-500 font-normal">(默认)</span>}
                </td>
                <td className="py-2 text-right font-mono text-emerald-500 font-semibold">{fmt(r.monthlyNet)}</td>
                <td className="py-2 text-right font-mono text-t2">{fmtW(r.annualNet)}万</td>
                <td className="py-2 text-right font-mono text-violet-500">{fmtW(r.annualHF)}万</td>
                <td className="py-2 text-right font-mono text-amber-500 font-semibold">{fmtW(r.annualValue)}万</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdSlot {...AD_SLOTS.resultBottom} />

      {/* SEO 自然语言段落 */}
      <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-6 card-shadow">
        <h2 className="text-sm font-semibold text-amber-500 mb-3">详细说明</h2>
        <div className="text-xs sm:text-sm text-t2 leading-relaxed space-y-3">
          <p>
            在{policy.name}，月薪 {fmt(salary)} 元（税前），按 {policy.policyYear} 年度社保公积金政策、
            公积金缴存比例 {policy.housingFund.defaultRate}%、13 薪计算：
          </p>
          <p>
            <strong className="text-t1">到手现金：</strong>月均到手约 {fmt(defaultResult.monthlyNet)} 元，
            全年到手现金约 {fmtW(defaultResult.annualNet)} 万元（含1个月年终奖）。
          </p>
          <p>
            <strong className="text-t1">五险一金：</strong>个人每月缴纳五险一金约{' '}
            {fmt(Math.round(defaultResult.annualInsurance / 12))} 元，
            其中公积金个人 {fmt(Math.round(defaultResult.annualHF / 24))} 元/月（双边合计{' '}
            {fmt(Math.round(defaultResult.annualHF / 12))} 元/月）。
          </p>
          <p>
            <strong className="text-t1">个税：</strong>全年个税约 {fmtW(defaultResult.annualTax)} 万元。
            个税按累计预扣法计算，前几个月税率较低，后几个月逐步升高。
          </p>
          <p>
            <strong className="text-t1">综合价值：</strong>考虑到手现金 + 公积金双边 + 养老金双边(×50%)，
            综合年薪价值约 {fmtW(defaultResult.annualValue)} 万元。
          </p>
          <p className="text-t4 text-[10px] sm:text-xs">
            以上为参考值。实际金额可能因专项附加扣除（租房、子女教育、赡养老人等）、
            自定义社保基数等因素而有所不同。
          </p>
        </div>
      </div>

      {/* 相关查询 */}
      <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
        <h2 className="text-sm font-semibold text-amber-500 mb-3">相关查询</h2>
        <div className="flex flex-wrap gap-2">
          {getRelatedQueries(cityId, salary).map(({ city, sal }) => {
            const p = getCityPolicy(city);
            return (
              <Link
                key={`${city}-${sal}`}
                to={`/q/${city}-${sal}`}
                className="text-xs px-3 py-1.5 rounded-lg bg-inset border border-b1 text-t3 hover:text-amber-500 hover:border-amber-500/50 transition-colors"
              >
                {p.shortName}月薪{fmt(sal)}
              </Link>
            );
          })}
          <Link
            to={`/city/${cityId}`}
            className="text-xs px-3 py-1.5 rounded-lg bg-inset border border-b1 text-t3 hover:text-amber-500 hover:border-amber-500/50 transition-colors"
          >
            {policy.shortName}全部薪资表 →
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 p-4 sm:p-5 text-center">
        <p className="text-xs sm:text-sm text-t3 mb-3">需要更精确的计算？可自定义专项扣除、社保基数等参数</p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          打开完整计算器
        </Link>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-inset border border-b1 p-2.5 sm:p-3">
      <div className="text-[10px] text-t4 mb-0.5">{label}</div>
      <div className={`text-sm sm:text-base font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}

function getRelatedQueries(cityId: CityId, salary: number): { city: CityId; sal: number }[] {
  const related: { city: CityId; sal: number }[] = [];

  const nearSalaries = [
    salary - 5000,
    salary + 5000,
    salary + 10000,
    Math.round(salary * 1.2),
  ].filter((s) => s >= 5000 && s <= 100000 && s !== salary);

  for (const s of nearSalaries.slice(0, 2)) {
    related.push({ city: cityId, sal: s });
  }

  const otherCities = CITY_LIST.filter((c) => c !== cityId).slice(0, 3);
  for (const c of otherCities) {
    related.push({ city: c, sal: salary });
  }

  return related;
}
