import type { AnnualSummary as Summary } from '../types/salary';

interface Props {
  summary: Summary;
  onSave: () => void;
}

function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtW(n: number): string {
  return (n / 10000).toFixed(2) + '万';
}

export default function AnnualSummary({ summary: s, onSave }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-amber-400 tracking-wide">
          年度汇总
        </h2>
        <button
          onClick={onSave}
          className="px-4 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/30 transition-colors ring-1 ring-amber-500/30"
        >
          存档本次计算
        </button>
      </div>

      {/* 核心数字卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <BigCard
          label="全年到手现金"
          value={fmtW(s.totalNetCash)}
          sub={fmt(s.totalNetCash) + ' 元'}
          accent="emerald"
        />
        <BigCard
          label="养老金累计"
          value={fmtW(s.totalPension)}
          sub={`个人 ${fmt(s.totalPensionPersonal)} + 单位 ${fmt(s.totalPensionEmployer)}`}
          accent="sky"
        />
        <BigCard
          label="公积金累计"
          value={fmtW(s.totalHousingFund)}
          sub={`个人 ${fmt(s.totalHousingFundPersonal)} + 单位 ${fmt(s.totalHousingFundEmployer)}`}
          accent="violet"
        />
      </div>

      {/* 综合价值 */}
      <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 p-5">
        <div className="text-xs text-amber-500/70 uppercase tracking-widest mb-1">
          综合到手价值 (现金+养老金+公积金)
        </div>
        <div className="text-3xl font-bold text-amber-400 font-mono">
          {fmtW(s.totalValue)}
        </div>
        <div className="text-sm text-zinc-400 mt-1">{fmt(s.totalValue)} 元</div>
      </div>

      {/* 详细分项 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailCard title="收入构成">
          <Row label="工资总额 (12个月)" value={fmt(s.totalSalaryGross)} />
          <Row label="年终奖" value={fmt(s.bonusGross)} />
          <Row label="税前总收入" value={fmt(s.totalGrossIncome)} bold accent="amber" />
        </DetailCard>

        <DetailCard title="扣除项目">
          <Row label="五险一金个人缴纳 (全年)" value={fmt(s.totalPersonalInsurance)} accent="rose" />
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
            label="单独计税 → 到手"
            value={fmt(s.bonusTaxResult.separateNetBonus)}
            accent={s.bonusTaxResult.recommendedMode === 'separate' ? 'emerald' : undefined}
          />
          <div className="border-t border-zinc-700/50 my-1" />
          <Row
            label="并入综合所得 → 税额"
            value={fmt(s.bonusTaxResult.combinedTax)}
            accent={s.bonusTaxResult.recommendedMode === 'combined' ? 'emerald' : undefined}
          />
          <Row
            label="并入综合所得 → 到手"
            value={fmt(s.bonusTaxResult.combinedNetBonus)}
            accent={s.bonusTaxResult.recommendedMode === 'combined' ? 'emerald' : undefined}
          />
          <div className="border-t border-zinc-700/50 my-1" />
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-amber-400">推荐方式</span>
            <span className="text-emerald-400">
              {s.bonusTaxResult.recommendedMode === 'separate'
                ? '✦ 单独计税'
                : '✦ 并入综合所得'}
            </span>
          </div>
        </DetailCard>
      )}
    </div>
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
    emerald: 'text-emerald-400',
    sky: 'text-sky-400',
    violet: 'text-violet-400',
  };
  return (
    <div
      className={`rounded-xl bg-zinc-800/60 border ${borderMap[accent]} p-4`}
    >
      <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className={`text-2xl font-bold font-mono ${textMap[accent]}`}>
        {value}
      </div>
      <div className="text-xs text-zinc-500 mt-1">{sub}</div>
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
    <div className="rounded-xl bg-zinc-800/40 border border-zinc-800 p-4 space-y-1.5">
      <h3 className="text-xs text-amber-500/70 uppercase tracking-widest mb-2">
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
    rose: 'text-rose-400',
    orange: 'text-orange-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
  };
  const valColor = accent ? colorMap[accent] || 'text-zinc-300' : 'text-zinc-300';
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-semibold' : ''}`}>
      <span className="text-zinc-400">{label}</span>
      <span className={`font-mono ${valColor}`}>{value}</span>
    </div>
  );
}
