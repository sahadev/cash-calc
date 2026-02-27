import type { HistoryRecord, SalaryInput } from '../types/salary';

interface Props {
  records: HistoryRecord[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onLoad: (input: SalaryInput) => void;
}

function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtW(n: number): string {
  return (n / 10000).toFixed(2) + '万';
}

export default function History({ records, onRemove, onClear, onLoad }: Props) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-600">
        <div className="text-4xl mb-3 opacity-40">📋</div>
        <p className="text-sm">暂无历史记录</p>
        <p className="text-xs text-zinc-700 mt-1">计算后点击"存档"即可保存</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-amber-400 tracking-wide">
          历史存档
        </h2>
        <button
          onClick={onClear}
          className="text-xs text-zinc-500 hover:text-rose-400 transition-colors"
        >
          清空全部
        </button>
      </div>

      <div className="space-y-2">
        {records.map((r) => (
          <div
            key={r.id}
            className="rounded-xl bg-zinc-800/40 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-zinc-300 font-medium truncate">
                  {r.label}
                </div>
                <div className="text-xs text-zinc-600 mt-0.5">
                  {new Date(r.createdAt).toLocaleString('zh-CN')}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <MiniStat
                    label="到手现金"
                    value={fmtW(r.summary.totalNetCash)}
                    color="text-emerald-400"
                  />
                  <MiniStat
                    label="公积金"
                    value={fmtW(r.summary.totalHousingFund)}
                    color="text-violet-400"
                  />
                  <MiniStat
                    label="综合价值"
                    value={fmtW(r.summary.totalValue)}
                    color="text-amber-400"
                  />
                </div>

                <div className="mt-2 text-xs text-zinc-600">
                  月base {fmt(r.input.monthlyBase)} · {r.input.totalMonths}薪 ·
                  公积金{r.input.housingFundRate}%
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => onLoad(r.input)}
                  className="px-3 py-1 rounded-lg bg-zinc-700/50 text-zinc-400 text-xs hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                >
                  加载
                </button>
                <button
                  onClick={() => onRemove(r.id)}
                  className="px-3 py-1 rounded-lg bg-zinc-700/50 text-zinc-500 text-xs hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <div className="text-zinc-600">{label}</div>
      <div className={`font-mono font-semibold ${color}`}>{value}</div>
    </div>
  );
}
