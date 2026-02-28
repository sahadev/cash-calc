import { useState } from 'react';
import type { MonthlyBreakdown } from '../types/salary';

interface Props {
  months: MonthlyBreakdown[];
}

function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtShort(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

export default function MonthlyDetail({ months }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-2 sm:space-y-3">
      <h2 className="text-base sm:text-lg font-semibold text-amber-500 tracking-wide">
        逐月明细
      </h2>

      {/* 表头 (桌面端) */}
      <div className="hidden lg:grid grid-cols-7 gap-2 text-xs text-t4 uppercase tracking-wider px-4 pb-1 border-b border-b1">
        <span>月份</span>
        <span>应发工资</span>
        <span>五险一金(个人)</span>
        <span>累计应税所得</span>
        <span>当月个税</span>
        <span>到手现金</span>
        <span></span>
      </div>

      {months.map((m) => (
        <div key={m.month}>
          {/* 移动端摘要行 */}
          <button
            onClick={() => setExpanded(expanded === m.month ? null : m.month)}
            className="w-full lg:hidden flex items-center justify-between px-3 py-3 rounded-lg bg-inset hover:bg-elevated active:bg-elevated transition-colors text-sm"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-t3 w-7 shrink-0">{m.month}月</span>
              <div className="text-left">
                <div className="text-emerald-500 font-semibold font-mono">{fmtShort(m.netSalary)}</div>
                <div className="text-[10px] text-t4 mt-0.5">
                  税 -{fmtShort(m.monthlyTax)} · 社保 -{fmtShort(m.personalInsurance.total)}
                </div>
              </div>
            </div>
            <span className="text-t5 text-xs">
              {expanded === m.month ? '▴' : '▾'}
            </span>
          </button>

          {/* 桌面端摘要行 */}
          <button
            onClick={() => setExpanded(expanded === m.month ? null : m.month)}
            className="hidden lg:grid w-full grid-cols-7 gap-2 items-center px-4 py-3 rounded-lg bg-inset hover:bg-elevated transition-colors text-sm"
          >
            <span className="font-mono text-t2">{m.month}月</span>
            <span className="text-t2">{fmt(m.grossSalary)}</span>
            <span className="text-rose-500">-{fmt(m.personalInsurance.total)}</span>
            <span className="text-t3">{fmt(m.cumulativeTaxableIncome)}</span>
            <span className="text-orange-500">-{fmt(m.monthlyTax)}</span>
            <span className="text-emerald-500 font-semibold">{fmt(m.netSalary)}</span>
            <span className="text-t4 text-right text-xs">
              {expanded === m.month ? '收起 ▴' : '展开 ▾'}
            </span>
          </button>

          {expanded === m.month && (
            <div className="mt-1 mx-1 sm:mx-4 p-3 sm:p-4 rounded-lg bg-card border border-b1 space-y-3 text-sm animate-in card-shadow-sm">
              <Section title="第一步: 确定基数">
                <Row label="社保基数" value={fmt(m.socialInsuranceBase)} />
                <Row label="公积金基数" value={fmt(m.housingFundBase)} />
              </Section>

              <Section title="第二步: 五险一金 (个人)">
                <Row label="养老保险 (8%)" value={fmt(m.personalInsurance.pension)} accent="rose" />
                <Row label="医疗保险 (2%)" value={fmt(m.personalInsurance.medical)} accent="rose" />
                <Row label="失业保险 (0.5%)" value={fmt(m.personalInsurance.unemployment)} accent="rose" />
                <Row label="住房公积金" value={fmt(m.personalInsurance.housingFund)} accent="rose" />
                <Row label="合计" value={fmt(m.personalInsurance.total)} accent="rose" bold />
              </Section>

              <Section title="第二步(单位): 五险一金">
                <Row label="养老 (16%)" value={fmt(m.employerInsurance.pension)} accent="blue" />
                <Row label="医疗 (10.37%)" value={fmt(m.employerInsurance.medical)} accent="blue" />
                <Row label="失业 (0.5%)" value={fmt(m.employerInsurance.unemployment)} accent="blue" />
                <Row label="工伤 (0.2%)" value={fmt(m.employerInsurance.injury)} accent="blue" />
                <Row label="公积金" value={fmt(m.employerInsurance.housingFund)} accent="blue" />
                <Row label="合计" value={fmt(m.employerInsurance.total)} accent="blue" bold />
              </Section>

              <Section title="第三步: 个税 (累计预扣法)">
                <Row label="月应发工资" value={fmt(m.grossSalary)} />
                <Row label="- 基本扣除" value="5,000.00" />
                <Row label="- 专项扣除" value={fmt(m.personalInsurance.total)} />
                <Row label="= 当月应税所得" value={fmt(m.taxableIncome)} />
                <div className="border-t border-b2 my-1"></div>
                <Row label="累计应纳税所得额" value={fmt(m.cumulativeTaxableIncome)} accent="amber" />
                <Row label="累计应纳税额" value={fmt(m.cumulativeTax)} accent="orange" />
                <Row label="当月个税" value={fmt(m.monthlyTax)} accent="orange" bold />
              </Section>

              <Section title="第四步: 计算到手">
                <Row label="应发工资" value={fmt(m.grossSalary)} />
                <Row label="- 五险一金" value={fmt(m.personalInsurance.total)} accent="rose" />
                <Row label="- 个税" value={fmt(m.monthlyTax)} accent="orange" />
                <Row label="= 到手现金" value={fmt(m.netSalary)} accent="emerald" bold />
              </Section>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-[10px] sm:text-xs text-amber-500/70 uppercase tracking-wider mb-1.5">
        {title}
      </h4>
      <div className="space-y-0.5">{children}</div>
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
    blue: 'text-sky-500',
  };
  const valColor = accent ? colorMap[accent] || 'text-t2' : 'text-t2';
  return (
    <div className={`flex justify-between gap-2 text-xs sm:text-sm ${bold ? 'font-semibold' : ''}`}>
      <span className="text-t3 truncate">{label}</span>
      <span className={`font-mono shrink-0 ${valColor}`}>{value}</span>
    </div>
  );
}
