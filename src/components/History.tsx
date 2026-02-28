import type { HistoryRecord, SalaryInput } from '../types/salary';

interface Props {
  records: HistoryRecord[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onLoad: (input: SalaryInput) => void;
}

function fmtW(n: number): string {
  return (n / 10000).toFixed(2) + '万';
}

export default function History({ records, onRemove, onClear, onLoad }: Props) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-t5">
        <div className="text-4xl mb-3 opacity-40">📋</div>
        <p className="text-sm">暂无历史记录</p>
        <p className="text-xs text-t6 mt-1">计算后点击"存档"即可保存</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-amber-500 tracking-wide">
          历史存档
        </h2>
        <button
          onClick={onClear}
          className="text-xs py-1.5 px-2 text-t4 hover:text-rose-500 active:text-rose-500 transition-colors rounded"
        >
          清空全部
        </button>
      </div>

      <div className="space-y-2">
        {records.map((r) => (
          <div
            key={r.id}
            className="rounded-xl bg-inset border border-b1 p-3 sm:p-4 hover:border-b2 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-t2 font-medium truncate">
                  {r.label}
                </div>
                <div className="text-[10px] sm:text-xs text-t5 mt-0.5">
                  {new Date(r.createdAt).toLocaleString('zh-CN')}
                </div>

                <div className="mt-2 sm:mt-3 grid grid-cols-3 gap-2 text-xs">
                  <MiniStat
                    label="到手"
                    value={fmtW(r.summary.totalNetCash)}
                    color="text-emerald-500"
                  />
                  <MiniStat
                    label="公积金"
                    value={fmtW(r.summary.totalHousingFund)}
                    color="text-violet-500"
                  />
                  <MiniStat
                    label="综合值"
                    value={fmtW(r.summary.totalValue)}
                    color="text-amber-500"
                  />
                </div>

                <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-t5">
                  base {(r.input.monthlyBase / 1000).toFixed(0)}k · {r.input.totalMonths}薪 · 公积金{r.input.housingFundRate}%
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => onLoad(r.input)}
                  className="px-3 py-2 sm:py-1.5 rounded-lg bg-elevated text-t3 text-xs hover:bg-hover active:bg-hover hover:text-t1 transition-colors"
                >
                  加载
                </button>
                <button
                  onClick={() => onRemove(r.id)}
                  className="px-3 py-2 sm:py-1.5 rounded-lg bg-elevated text-t4 text-xs hover:bg-rose-500/20 active:bg-rose-500/20 hover:text-rose-500 transition-colors"
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
      <div className="text-[10px] sm:text-xs text-t5">{label}</div>
      <div className={`font-mono font-semibold text-xs sm:text-sm ${color}`}>{value}</div>
    </div>
  );
}
