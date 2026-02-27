import { useState } from 'react';
import type { MonthlyBreakdown } from '../types/salary';

interface Props {
  months: MonthlyBreakdown[];
}

function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MonthlyDetail({ months }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-amber-400 tracking-wide">
        逐月明细
      </h2>

      {/* 表头 */}
      <div className="hidden lg:grid grid-cols-7 gap-2 text-xs text-zinc-500 uppercase tracking-wider px-4 pb-1 border-b border-zinc-800">
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
          {/* 摘要行 */}
          <button
            onClick={() => setExpanded(expanded === m.month ? null : m.month)}
            className="w-full grid grid-cols-3 lg:grid-cols-7 gap-2 items-center px-4 py-3 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 transition-colors text-sm"
          >
            <span className="font-mono text-zinc-300">{m.month}月</span>
            <span className="text-zinc-300 hidden lg:block">{fmt(m.grossSalary)}</span>
            <span className="text-rose-400 hidden lg:block">-{fmt(m.personalInsurance.total)}</span>
            <span className="text-zinc-400 hidden lg:block">{fmt(m.cumulativeTaxableIncome)}</span>
            <span className="text-orange-400">-{fmt(m.monthlyTax)}</span>
            <span className="text-emerald-400 font-semibold">{fmt(m.netSalary)}</span>
            <span className="text-zinc-500 text-right text-xs">
              {expanded === m.month ? '收起 ▴' : '展开 ▾'}
            </span>
          </button>

          {/* 展开详情 */}
          {expanded === m.month && (
            <div className="mt-1 ml-4 mr-4 p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-3 text-sm animate-in">
              <Section title="第一步: 确定基数">
                <Row label="社保基数" value={fmt(m.socialInsuranceBase)} />
                <Row label="公积金基数" value={fmt(m.housingFundBase)} />
              </Section>

              <Section title="第二步: 计算五险一金 (个人)">
                <Row label="养老保险 (8%)" value={fmt(m.personalInsurance.pension)} accent="rose" />
                <Row label="医疗保险 (2%)" value={fmt(m.personalInsurance.medical)} accent="rose" />
                <Row label="失业保险 (0.5%)" value={fmt(m.personalInsurance.unemployment)} accent="rose" />
                <Row label="住房公积金" value={fmt(m.personalInsurance.housingFund)} accent="rose" />
                <Row label="合计" value={fmt(m.personalInsurance.total)} accent="rose" bold />
              </Section>

              <Section title="第二步(单位): 五险一金 (单位缴纳)">
                <Row label="养老保险 (16%)" value={fmt(m.employerInsurance.pension)} accent="blue" />
                <Row label="医疗保险 (10.37%)" value={fmt(m.employerInsurance.medical)} accent="blue" />
                <Row label="失业保险 (0.5%)" value={fmt(m.employerInsurance.unemployment)} accent="blue" />
                <Row label="工伤保险 (0.2%)" value={fmt(m.employerInsurance.injury)} accent="blue" />
                <Row label="住房公积金" value={fmt(m.employerInsurance.housingFund)} accent="blue" />
                <Row label="合计" value={fmt(m.employerInsurance.total)} accent="blue" bold />
              </Section>

              <Section title="第三步: 计算个税 (累计预扣法)">
                <Row label="月应发工资" value={fmt(m.grossSalary)} />
                <Row label="- 基本扣除 (5000)" value="5,000.00" />
                <Row label="- 专项扣除 (五险一金)" value={fmt(m.personalInsurance.total)} />
                <Row label="= 当月应税所得" value={fmt(m.taxableIncome)} />
                <div className="border-t border-zinc-700 my-1"></div>
                <Row label="累计应纳税所得额" value={fmt(m.cumulativeTaxableIncome)} accent="amber" />
                <Row label="累计应纳税额" value={fmt(m.cumulativeTax)} accent="orange" />
                <Row label="当月个税" value={fmt(m.monthlyTax)} accent="orange" bold />
              </Section>

              <Section title="第四步: 计算到手">
                <Row label="应发工资" value={fmt(m.grossSalary)} />
                <Row label="- 五险一金个人" value={fmt(m.personalInsurance.total)} accent="rose" />
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
      <h4 className="text-xs text-amber-500/70 uppercase tracking-wider mb-1.5">
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
    rose: 'text-rose-400',
    orange: 'text-orange-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    blue: 'text-sky-400',
  };
  const valColor = accent ? colorMap[accent] || 'text-zinc-300' : 'text-zinc-300';
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold' : ''}`}>
      <span className="text-zinc-400">{label}</span>
      <span className={`font-mono ${valColor}`}>{value}</span>
    </div>
  );
}
