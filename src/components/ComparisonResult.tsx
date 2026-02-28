import type { StructureBreakdown } from '../types/salary';

interface Props {
  current: StructureBreakdown;
  target: StructureBreakdown;
  raisePercent: number;
  cashRaisePercent: number;
  employerCostChangePercent: number;
}

function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

function fmtWan(n: number): string {
  return (n / 10000).toFixed(2) + '万';
}

function pctColor(pct: number): string {
  if (pct > 0) return 'text-emerald-500';
  if (pct < 0) return 'text-rose-500';
  return 'text-t3';
}

function pctStr(pct: number): string {
  return (pct > 0 ? '+' : '') + pct.toFixed(1) + '%';
}

export default function ComparisonResult({
  current,
  target,
  raisePercent,
  cashRaisePercent,
  employerCostChangePercent,
}: Props) {
  const rows: {
    label: string;
    shortLabel?: string;
    currentVal: number;
    targetVal: number;
    weight?: string;
    highlight?: boolean;
    indent?: boolean;
    separator?: boolean;
  }[] = [
    { label: '税前年总包', currentVal: current.grossAnnual, targetVal: target.grossAnnual },
    { label: '正规渠道到手', shortLabel: '正规到手', currentVal: current.officialSalaryAnnual - current.socialInsurancePersonal - current.incomeTax, targetVal: target.officialSalaryAnnual - target.socialInsurancePersonal - target.incomeTax, indent: true },
    { label: '其它渠道到手', shortLabel: '其它到手', currentVal: current.altChannelAnnual - current.altChannelFee, targetVal: target.altChannelAnnual - target.altChannelFee, indent: true },
    { label: '年到手现金', shortLabel: '到手现金', currentVal: current.takeHomeCash, targetVal: target.takeHomeCash, weight: '×100%', highlight: true },
    { label: '公积金 (双边)', shortLabel: '公积金', currentVal: current.housingFundPersonal + current.housingFundEmployer, targetVal: target.housingFundPersonal + target.housingFundEmployer, weight: '×100%' },
    { label: '养老金 (双边)', shortLabel: '养老金', currentVal: current.pensionPersonal + current.pensionEmployer, targetVal: target.pensionPersonal + target.pensionEmployer, weight: '×50%' },
    { label: '股票', currentVal: current.stockFaceValue, targetVal: target.stockFaceValue, weight: target.stockFaceValue > 0 ? `×${Math.round(target.stockValue / target.stockFaceValue * 100)}%` : '-' },
    { label: '综合价值', currentVal: current.comprehensiveValue, targetVal: target.comprehensiveValue, highlight: true, separator: true },
    { label: '企业总成本', shortLabel: '企业成本', currentVal: current.employerTotalCost, targetVal: target.employerTotalCost, separator: true },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <h3 className="text-sm font-semibold text-amber-500 tracking-wide">
        对比结果
      </h3>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <MetricCard
          label="综合价值涨幅"
          shortLabel="综合涨幅"
          value={pctStr(raisePercent)}
          color={pctColor(raisePercent)}
          note="转换基准"
        />
        <MetricCard
          label="到手现金涨幅"
          shortLabel="现金涨幅"
          value={pctStr(cashRaisePercent)}
          color={pctColor(cashRaisePercent)}
          note="实际现金流"
        />
        <MetricCard
          label="企业成本变化"
          shortLabel="企业成本"
          value={pctStr(employerCostChangePercent)}
          color={pctColor(employerCostChangePercent)}
          note="议价参考"
        />
      </div>

      {/* 明细表格 - 移动端使用卡片列表 */}
      <div className="sm:hidden space-y-1">
        {rows.map((row) => {
          const diff = row.targetVal - row.currentVal;
          return (
            <div key={row.label}>
              {row.separator && <div className="border-t border-b2 my-1.5" />}
              <div className={`flex items-baseline justify-between gap-2 py-1 ${row.indent ? 'pl-3' : ''}`}>
                <span className={`text-xs truncate ${row.highlight ? 'font-semibold text-amber-500' : row.indent ? 'text-t4' : 'text-t2'}`}>
                  {row.shortLabel || row.label}
                  {row.weight && <span className="text-t5 ml-1">{row.weight}</span>}
                </span>
                <div className="flex items-baseline gap-2 shrink-0 font-mono text-xs">
                  <span className="text-t4">{fmtWan(row.currentVal)}</span>
                  <span className="text-t5">→</span>
                  <span className={row.highlight ? 'text-amber-500 font-semibold' : diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-rose-500' : 'text-t3'}>
                    {fmtWan(row.targetVal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 明细表格 - 桌面端使用 grid */}
      <div className="hidden sm:block rounded-xl bg-inset border border-b2 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] text-xs">
          <div className="px-3 py-2.5 text-t4 font-medium border-b border-b2">项目</div>
          <div className="px-3 py-2.5 text-t4 font-medium text-right border-b border-b2">当前 A</div>
          <div className="px-3 py-2.5 text-t4 font-medium text-right border-b border-b2">目标 B</div>
          <div className="px-3 py-2.5 text-t4 font-medium text-right border-b border-b2">折价</div>

          {rows.map((row) => {
            const diff = row.targetVal - row.currentVal;
            return (
              <div key={row.label} className="contents">
                {row.separator && <div className="col-span-4 border-t border-b2" />}
                <div className={`px-3 py-2 ${row.indent ? 'pl-6 text-t4' : ''} ${row.highlight ? 'font-semibold text-amber-500' : 'text-t2'}`}>
                  {row.label}
                </div>
                <div className={`px-3 py-2 text-right font-mono ${row.highlight ? 'text-t1' : 'text-t3'}`}>
                  {fmtWan(row.currentVal)}
                </div>
                <div className={`px-3 py-2 text-right font-mono ${row.highlight ? 'text-amber-500 font-semibold' : diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-rose-500' : 'text-t3'}`}>
                  {fmtWan(row.targetVal)}
                </div>
                <div className="px-3 py-2 text-right text-t5">
                  {row.weight || ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 扣除项细目 */}
      <details className="group">
        <summary className="cursor-pointer text-xs text-t4 hover:text-amber-500 active:text-amber-500 transition-colors select-none py-1">
          查看扣除项明细 ▾
        </summary>
        <div className="mt-3 rounded-xl bg-inset border border-b3 p-3 space-y-1.5 text-xs">
          <DetailRow label="五险一金(个人)" currentVal={current.socialInsurancePersonal} targetVal={target.socialInsurancePersonal} />
          <DetailRow label="个人所得税" currentVal={current.incomeTax} targetVal={target.incomeTax} />
          <DetailRow label="渠道手续费" currentVal={current.altChannelFee} targetVal={target.altChannelFee} />
          <DetailRow label="五险一金(单位)" currentVal={current.socialInsuranceEmployer} targetVal={target.socialInsuranceEmployer} />
        </div>
      </details>
    </div>
  );
}

function MetricCard({
  label,
  shortLabel,
  value,
  color,
  note,
}: {
  label: string;
  shortLabel?: string;
  value: string;
  color: string;
  note: string;
}) {
  return (
    <div className="rounded-xl bg-inset border border-b2 p-2 sm:p-3 text-center">
      <div className="text-[9px] sm:text-[10px] text-t4 mb-0.5 sm:mb-1">
        <span className="sm:hidden">{shortLabel || label}</span>
        <span className="hidden sm:inline">{label}</span>
      </div>
      <div className={`text-base sm:text-lg font-bold font-mono ${color}`}>{value}</div>
      <div className="text-[9px] sm:text-[10px] text-t5 mt-0.5">{note}</div>
    </div>
  );
}

function DetailRow({ label, currentVal, targetVal }: { label: string; currentVal: number; targetVal: number }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-t4 truncate">{label}</span>
      <div className="flex gap-2 sm:gap-4 font-mono shrink-0">
        <span className="text-t3 w-16 sm:w-20 text-right">{fmt(currentVal)}</span>
        <span className="text-t4">→</span>
        <span className="text-t2 w-16 sm:w-20 text-right">{fmt(targetVal)}</span>
      </div>
    </div>
  );
}
