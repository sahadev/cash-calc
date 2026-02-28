import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadRecord, isApiEnabled } from '../utils/api';
import type { SalaryInput, AnnualSummary as Summary } from '../types/salary';

function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

function fmtW(n: number): string {
  return (n / 10000).toFixed(2) + '万';
}

export default function SharedRecordViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<{ input: SalaryInput; summary: Summary; label?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }
    loadRecord(id).then((res) => {
      setLoading(false);
      if (res && res.input && res.summary) {
        setData({
          input: res.input as unknown as SalaryInput,
          summary: res.summary as unknown as Summary,
          label: res.label,
        });
      } else {
        setError(true);
      }
    });
  }, [id]);

  const handleOpenInCalc = () => {
    if (!data) return;
    navigate('/', { state: { loadShared: data } });
  };

  if (!isApiEnabled()) {
    return (
      <div className="rounded-2xl bg-card border border-b1 p-6 sm:p-8 text-center card-shadow">
        <p className="text-t4 text-sm">云端分享功能未配置</p>
        <Link to="/" className="mt-3 inline-block text-amber-500 text-sm hover:underline">返回计算器</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-card border border-b1 p-6 sm:p-8 text-center card-shadow">
        <div className="text-4xl mb-3 opacity-30">🔗</div>
        <p className="text-t4 text-sm">链接无效或已过期</p>
        <Link to="/" className="mt-3 inline-block text-amber-500 text-sm hover:underline">返回计算器</Link>
      </div>
    );
  }

  const { input, summary: s } = data;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-xl mx-auto">
      <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-6 card-shadow">
        <h1 className="text-base sm:text-lg font-semibold text-amber-500 mb-1">
          分享的薪资计算结果
        </h1>
        {data.label && (
          <p className="text-xs text-t4 mb-3">{data.label}</p>
        )}

        <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 p-4 mb-4">
          <div className="text-[10px] text-emerald-500/70 uppercase tracking-widest mb-1">年到手现金</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-500 font-mono">{fmtW(s.totalNetCash)}</div>
          <div className="text-xs text-t3 mt-1">
            月Base {fmt(input.monthlyBase)} · {input.totalMonths}薪 · 公积金{input.housingFundRate}% · {input.city}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="rounded-lg bg-inset border border-b1 p-2">
            <div className="text-[10px] text-t4">综合价值</div>
            <div className="text-sm font-bold text-amber-500 font-mono">{fmtW(s.totalValue)}</div>
          </div>
          <div className="rounded-lg bg-inset border border-b1 p-2">
            <div className="text-[10px] text-t4">全年个税</div>
            <div className="text-sm font-bold text-orange-500 font-mono">{fmtW(s.totalTax)}</div>
          </div>
          <div className="rounded-lg bg-inset border border-b1 p-2">
            <div className="text-[10px] text-t4">公积金</div>
            <div className="text-sm font-bold text-violet-500 font-mono">{fmtW(s.totalHousingFund)}</div>
          </div>
          <div className="rounded-lg bg-inset border border-b1 p-2">
            <div className="text-[10px] text-t4">月均到手</div>
            <div className="text-sm font-bold text-emerald-500 font-mono">{fmt(s.totalNetCash / 12)}</div>
          </div>
        </div>

        <button
          onClick={handleOpenInCalc}
          className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
        >
          在计算器中打开
        </button>
      </div>

      <div className="text-center">
        <Link to="/" className="text-xs text-t4 hover:text-amber-500 transition-colors">← 返回首页</Link>
      </div>
    </div>
  );
}
