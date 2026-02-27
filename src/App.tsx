import { useState } from 'react';
import type { SalaryInput } from './types/salary';
import { DEFAULT_HOUSING_FUND_RATE } from './utils/constants';
import { useCalculation } from './hooks/useCalculation';
import { useHistory } from './hooks/useHistory';
import InputForm from './components/InputForm';
import MonthlyDetail from './components/MonthlyDetail';
import AnnualSummary from './components/AnnualSummary';
import History from './components/History';

const defaultInput: SalaryInput = {
  monthlyBase: 10000,
  totalMonths: 15,
  housingFundRate: DEFAULT_HOUSING_FUND_RATE,
  additionalDeduction: 0,
  bonusTaxMode: 'auto',
};

type Tab = 'result' | 'history';

export default function App() {
  const [input, setInput] = useState<SalaryInput>(defaultInput);
  const [activeTab, setActiveTab] = useState<Tab>('result');
  const summary = useCalculation(input);
  const { records, addRecord, removeRecord, clearAll } = useHistory();

  const handleSave = () => {
    if (summary) {
      addRecord(input, summary);
    }
  };

  const handleLoad = (savedInput: SalaryInput) => {
    setInput(savedInput);
    setActiveTab('result');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* 顶部装饰条 */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 标题 */}
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="text-amber-400">Cash</span>
            <span className="text-zinc-400">Calc</span>
            <span className="text-zinc-600 text-sm font-normal ml-3">
              北京薪资计算器
            </span>
          </h1>
          <p className="text-zinc-600 text-sm mt-1">
            五险一金 · 个税 · 年终奖 · 到手明细
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧: 输入面板 */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
                <InputForm input={input} onChange={setInput} />
              </div>

              {/* 快速预览 */}
              {summary && (
                <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 p-5 space-y-3">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest">
                    快速预览
                  </h3>
                  <div className="space-y-2">
                    <QuickStat
                      label="月到手 (平均)"
                      value={`${(summary.totalNetCash / 12).toLocaleString('zh-CN', { maximumFractionDigits: 0 })} 元`}
                      color="text-emerald-400"
                    />
                    <QuickStat
                      label="年到手现金"
                      value={`${(summary.totalNetCash / 10000).toFixed(2)}万`}
                      color="text-emerald-400"
                    />
                    <QuickStat
                      label="综合价值"
                      value={`${(summary.totalValue / 10000).toFixed(2)}万`}
                      color="text-amber-400"
                    />
                    <QuickStat
                      label="全年个税"
                      value={`${(summary.totalTax / 10000).toFixed(2)}万`}
                      color="text-orange-400"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧: 结果面板 */}
          <div className="lg:col-span-8">
            {/* Tab 切换 */}
            <div className="flex gap-1 mb-6 bg-zinc-900/60 rounded-xl p-1 w-fit">
              {([
                ['result', '计算结果'],
                ['history', `历史存档 (${records.length})`],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    activeTab === tab
                      ? 'bg-zinc-800 text-amber-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'result' && summary && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
                  <AnnualSummary summary={summary} onSave={handleSave} />
                </div>
                <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
                  <MonthlyDetail months={summary.monthlyDetails} />
                </div>
              </div>
            )}

            {activeTab === 'result' && !summary && (
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-12 text-center">
                <div className="text-5xl mb-4 opacity-30">💰</div>
                <p className="text-zinc-500">输入月 Base 开始计算</p>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
                <History
                  records={records}
                  onRemove={removeRecord}
                  onClear={clearAll}
                  onLoad={handleLoad}
                />
              </div>
            )}
          </div>
        </div>

        {/* 页脚 */}
        <footer className="mt-12 pt-6 border-t border-zinc-900 text-center text-xs text-zinc-700">
          <p>
            数据基于北京市 2025 年度社保/公积金政策 (2025.7~2026.6)
          </p>
          <p className="mt-1">
            社保基数 7,162~35,811 元 · 公积金基数 2,540~35,811 元 · 个税起征点 5,000 元/月
          </p>
        </footer>
      </div>
    </div>
  );
}

function QuickStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className={`font-mono font-semibold text-sm ${color}`}>{value}</span>
    </div>
  );
}
