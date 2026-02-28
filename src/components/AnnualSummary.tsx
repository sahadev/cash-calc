import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { AnnualSummary as Summary, SalaryInput } from '../types/salary';
import { exportAsImage, exportAsPDF, exportAsExcel, generateShareCard, generateVerticalPoster } from '../utils/exportUtils';
import { generateNaturalLanguageSummary } from '../utils/summaryText';
import { saveRecord, isApiEnabled } from '../utils/api';

interface Props {
  summary: Summary;
  input?: SalaryInput;
  onSave: () => void;
}

function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtW(n: number): string {
  return (n / 10000).toFixed(2) + '万';
}

export default function AnnualSummary({ summary: s, input, onSave }: Props) {
  return (
    <div className="space-y-4 sm:space-y-6" id="annual-summary-content">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-amber-500 tracking-wide shrink-0">
          年度汇总
        </h2>
        <div className="flex flex-wrap justify-end gap-1.5 sm:gap-2">
          <button
            onClick={onSave}
            className="px-3 py-2 sm:py-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs hover:bg-amber-500/30 active:bg-amber-500/30 transition-colors ring-1 ring-amber-500/30"
          >
            存档
          </button>
          {input && (
            <>
              <button
                onClick={() => generateShareCard(s, input)}
                className="px-2.5 py-2 sm:py-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs hover:bg-emerald-500/30 active:bg-emerald-500/30 transition-colors ring-1 ring-emerald-500/30"
              >
                分享
              </button>
              <button
                onClick={() => generateVerticalPoster(s, input)}
                className="px-2.5 py-2 sm:py-1.5 rounded-lg bg-pink-500/20 text-pink-600 dark:text-pink-400 text-xs hover:bg-pink-500/30 active:bg-pink-500/30 transition-colors ring-1 ring-pink-500/30"
              >
                海报
              </button>
              {isApiEnabled() && (
                <ShareLinkButton input={input} summary={s} />
              )}
            </>
          )}
          <button
            onClick={() => exportAsImage('annual-summary-content')}
            className="px-2.5 py-2 sm:py-1.5 rounded-lg bg-elevated text-t3 text-xs hover:bg-hover active:bg-hover transition-colors"
          >
            图片
          </button>
          <button
            onClick={() => exportAsPDF('annual-summary-content')}
            className="px-2.5 py-2 sm:py-1.5 rounded-lg bg-elevated text-t3 text-xs hover:bg-hover active:bg-hover transition-colors"
          >
            PDF
          </button>
          <button
            onClick={() => exportAsExcel(s)}
            className="px-2.5 py-2 sm:py-1.5 rounded-lg bg-elevated text-t3 text-xs hover:bg-hover active:bg-hover transition-colors"
          >
            Excel
          </button>
        </div>
      </div>

      {/* 核心数字卡片 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <BigCard
          label="到手现金"
          value={fmtW(s.totalNetCash)}
          sub={fmt(s.totalNetCash) + ' 元'}
          accent="emerald"
        />
        <BigCard
          label="养老金"
          value={fmtW(s.totalPension)}
          sub={`个人+单位`}
          accent="sky"
        />
        <BigCard
          label="公积金"
          value={fmtW(s.totalHousingFund)}
          sub={`个人+单位`}
          accent="violet"
        />
      </div>

      {/* 综合价值 */}
      <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 p-4 sm:p-5">
        <div className="text-[10px] sm:text-xs text-amber-500/70 uppercase tracking-widest mb-1">
          综合到手价值
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-amber-500 font-mono">
          {fmtW(s.totalValue)}
        </div>
        <div className="text-xs sm:text-sm text-t3 mt-1">{fmt(s.totalValue)} 元</div>
      </div>

      {/* 图表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-xl bg-inset border border-b1 p-3 sm:p-4">
          <h3 className="text-[10px] sm:text-xs text-amber-500/70 uppercase tracking-widest mb-3">
            年收入结构
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={[
                  { name: '到手现金', value: s.totalNetCash },
                  { name: '五险一金', value: s.totalPersonalInsurance },
                  { name: '个税', value: s.totalTax },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                <Cell fill="#10b981" />
                <Cell fill="#f87171" />
                <Cell fill="#fb923c" />
              </Pie>
              <Tooltip formatter={(v: number | undefined) => (v != null ? fmt(v) + ' 元' : '')} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-inset border border-b1 p-3 sm:p-4">
          <h3 className="text-[10px] sm:text-xs text-amber-500/70 uppercase tracking-widest mb-3">
            月度到手趋势
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={s.monthlyDetails.map((m) => ({
              month: `${m.month}月`,
              到手: m.netSalary,
              个税: m.monthlyTax,
            }))}>
              <XAxis dataKey="month" tick={{ fill: 'var(--c-text-4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--c-text-4)', fontSize: 10 }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'} />
              <Tooltip
                contentStyle={{ background: 'var(--c-card)', border: '1px solid var(--c-border-2)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: 'var(--c-text-3)' }}
                formatter={(v: number | undefined) => (v != null ? fmt(v) + ' 元' : '')}
              />
              <Bar dataKey="到手" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="个税" fill="#fb923c" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 补充福利 */}
      {(s.totalSupplementHF || s.totalEnterpriseAnnuity) && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {s.totalSupplementHF ? (
            <div className="rounded-xl bg-inset border border-violet-500/20 p-3">
              <div className="text-[10px] text-t4 mb-1">补充公积金(双边)</div>
              <div className="text-sm sm:text-lg font-bold font-mono text-violet-500">{fmtW(s.totalSupplementHF)}</div>
            </div>
          ) : null}
          {s.totalEnterpriseAnnuity ? (
            <div className="rounded-xl bg-inset border border-indigo-500/20 p-3">
              <div className="text-[10px] text-t4 mb-1">企业年金(双边)</div>
              <div className="text-sm sm:text-lg font-bold font-mono text-indigo-500">{fmtW(s.totalEnterpriseAnnuity)}</div>
            </div>
          ) : null}
        </div>
      )}

      {/* 详细分项 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <DetailCard title="收入构成">
          <Row label="工资总额 (12个月)" value={fmt(s.totalSalaryGross)} />
          <Row label="年终奖" value={fmt(s.bonusGross)} />
          <Row label="税前总收入" value={fmt(s.totalGrossIncome)} bold accent="amber" />
        </DetailCard>

        <DetailCard title="扣除项目">
          <Row label="五险一金(个人/年)" value={fmt(s.totalPersonalInsurance)} accent="rose" />
          <Row label="工资个税 (全年)" value={fmt(s.salaryTax)} accent="orange" />
          <Row label="年终奖个税" value={fmt(s.bonusTax)} accent="orange" />
          <Row label="总扣除" value={fmt(s.totalPersonalInsurance + s.totalTax)} bold accent="rose" />
        </DetailCard>
      </div>

      {/* 年终奖对比 */}
      {s.bonusGross > 0 && (
        <DetailCard title="年终奖计税对比">
          <Row
            label="单独计税 → 税额"
            value={fmt(s.bonusTaxResult.separateTax)}
            accent={s.bonusTaxResult.recommendedMode === 'separate' ? 'emerald' : undefined}
          />
          <Row
            label="单独 → 到手"
            value={fmt(s.bonusTaxResult.separateNetBonus)}
            accent={s.bonusTaxResult.recommendedMode === 'separate' ? 'emerald' : undefined}
          />
          <div className="border-t border-b3 my-1" />
          <Row
            label="并入综合 → 税额"
            value={fmt(s.bonusTaxResult.combinedTax)}
            accent={s.bonusTaxResult.recommendedMode === 'combined' ? 'emerald' : undefined}
          />
          <Row
            label="并入综合 → 到手"
            value={fmt(s.bonusTaxResult.combinedNetBonus)}
            accent={s.bonusTaxResult.recommendedMode === 'combined' ? 'emerald' : undefined}
          />
          <div className="border-t border-b3 my-1" />
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-amber-500">推荐方式</span>
            <span className="text-emerald-500">
              {s.bonusTaxResult.recommendedMode === 'separate'
                ? '✦ 单独计税'
                : '✦ 并入综合所得'}
            </span>
          </div>
        </DetailCard>
      )}

      {/* AI 友好的自然语言摘要 */}
      {input && <NaturalSummary input={input} summary={s} />}
    </div>
  );
}

function ShareLinkButton({ input, summary }: { input: SalaryInput; summary: Summary }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    setDone(false);
    const res = await saveRecord(input as unknown as Record<string, unknown>, summary as unknown as Record<string, unknown>);
    setLoading(false);
    if (res?.url) {
      await navigator.clipboard.writeText(res.url);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-2.5 py-2 sm:py-1.5 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs hover:bg-sky-500/30 active:bg-sky-500/30 transition-colors ring-1 ring-sky-500/30 disabled:opacity-50"
    >
      {loading ? '...' : done ? '已复制' : '链接'}
    </button>
  );
}

function NaturalSummary({ input, summary }: { input: SalaryInput; summary: Summary }) {
  const text = useMemo(() => generateNaturalLanguageSummary(input, summary), [input, summary]);
  const [expanded, setExpanded] = useState(false);

  return (
    <details
      className="group"
      open={expanded}
      onToggle={(e) => setExpanded((e.target as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer text-xs text-t4 hover:text-amber-500 active:text-amber-500 transition-colors select-none py-1">
        查看文字摘要 ▾
      </summary>
      <div className="mt-2 rounded-xl bg-inset border border-b1 p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-t3 whitespace-pre-line leading-relaxed">{text}</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
          }}
          className="mt-2 text-[10px] text-t4 hover:text-amber-500 active:text-amber-500 transition-colors"
        >
          复制文字
        </button>
      </div>
    </details>
  );
}

function BigCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  const borderMap: Record<string, string> = {
    emerald: 'border-emerald-500/30',
    sky: 'border-sky-500/30',
    violet: 'border-violet-500/30',
  };
  const textMap: Record<string, string> = {
    emerald: 'text-emerald-500',
    sky: 'text-sky-500',
    violet: 'text-violet-500',
  };
  return (
    <div className={`rounded-xl bg-inset border ${borderMap[accent]} p-3 sm:p-4`}>
      <div className="text-[10px] sm:text-xs text-t4 uppercase tracking-widest mb-1 sm:mb-2">
        {label}
      </div>
      <div className={`text-lg sm:text-2xl font-bold font-mono ${textMap[accent]}`}>
        {value}
      </div>
      <div className="text-[10px] sm:text-xs text-t4 mt-0.5 sm:mt-1">{sub}</div>
    </div>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-inset border border-b1 p-3 sm:p-4 space-y-1.5">
      <h3 className="text-[10px] sm:text-xs text-amber-500/70 uppercase tracking-widest mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  bold,
}: {
  label: string;
  value: string;
  accent?: string;
  bold?: boolean;
}) {
  const colorMap: Record<string, string> = {
    rose: 'text-rose-500',
    orange: 'text-orange-500',
    amber: 'text-amber-500',
    emerald: 'text-emerald-500',
  };
  const valColor = accent ? colorMap[accent] || 'text-t2' : 'text-t2';
  return (
    <div className={`flex justify-between text-xs sm:text-sm gap-2 ${bold ? 'font-semibold' : ''}`}>
      <span className="text-t3 truncate">{label}</span>
      <span className={`font-mono shrink-0 ${valColor}`}>{value}</span>
    </div>
  );
}
