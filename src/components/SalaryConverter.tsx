import { useState, useMemo } from 'react';
import type { SalaryStructure } from '../types/salary';
import { convertSalaryStructure } from '../utils/converter';
import StructureInput from './StructureInput';
import ComparisonResult from './ComparisonResult';
import AdSlot from './AdSlot';
import AD_SLOTS from '../config/adSlots';

type StructureWithOptionalBase = Omit<SalaryStructure, 'monthlyBase'> & { monthlyBase?: number };

const defaultCurrent: SalaryStructure = {
  city: 'beijing',
  monthlyBase: 25000,
  months: 15,
  socialInsuranceBaseType: 'full',
  housingFundBaseType: 'full',
  housingFundRate: 12,
  altChannelRatio: 0,
  altChannelFeeRate: 0,
  annualStockValue: 0,
  stockDiscount: 70,
  specialDeduction: 0,
};

const defaultTarget: StructureWithOptionalBase = {
  city: 'beijing',
  months: 14,
  socialInsuranceBaseType: 'minimum',
  housingFundBaseType: 'minimum',
  housingFundRate: 5,
  altChannelRatio: 30,
  altChannelFeeRate: 15,
  annualStockValue: 0,
  stockDiscount: 70,
  specialDeduction: 0,
};

export default function SalaryConverter() {
  const [current, setCurrent] = useState<SalaryStructure>(defaultCurrent);
  const [target, setTarget] = useState<StructureWithOptionalBase>(defaultTarget);
  const [raisePercent, setRaisePercent] = useState(20);

  const result = useMemo(() => {
    if (current.monthlyBase <= 0) return null;
    try {
      const { monthlyBase: _, ...targetWithoutBase } = target;
      return convertSalaryStructure(
        current,
        targetWithoutBase as Omit<SalaryStructure, 'monthlyBase'>,
        raisePercent
      );
    } catch {
      return null;
    }
  }, [current, target, raisePercent]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 涨幅控制 */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-card to-emerald-500/10 border border-b1 p-4 sm:p-5 card-shadow">
        <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:gap-4">
          <div className="text-sm text-t3 shrink-0">期望综合价值涨幅</div>
          <div className="flex items-center gap-3 flex-1">
            <input
              type="range"
              min={-50}
              max={200}
              step={5}
              value={raisePercent}
              onChange={(e) => setRaisePercent(parseInt(e.target.value))}
              className="flex-1 accent-amber-500 h-6"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min={-50}
                max={200}
                step={5}
                value={raisePercent}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v)) setRaisePercent(Math.max(-50, Math.min(200, v)));
                }}
                className="w-14 sm:w-16 input-field text-center !py-1.5"
              />
              <span className="text-amber-500 font-semibold">%</span>
            </div>
            {raisePercent > 0 && (
              <span className="text-emerald-500 text-sm shrink-0">涨薪</span>
            )}
            {raisePercent < 0 && (
              <span className="text-rose-500 text-sm shrink-0">降薪</span>
            )}
            {raisePercent === 0 && (
              <span className="text-t4 text-sm shrink-0">平薪</span>
            )}
          </div>
        </div>
      </div>

      {/* 左右对比输入 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
          <StructureInput
            value={current}
            onChange={(v) => setCurrent(v as SalaryStructure)}
            showMonthlyBase={true}
            label="当前薪资 A"
            accentColor="amber"
          />
        </div>

        <div className="rounded-2xl bg-card border border-emerald-500/20 p-4 sm:p-5 card-shadow">
          <StructureInput
            value={target}
            onChange={(v) => setTarget(v)}
            showMonthlyBase={false}
            solvedMonthlyBase={result?.targetMonthlyBase}
            label="目标 Offer B"
            accentColor="emerald"
          />
        </div>
      </div>

      {/* 对比结果 */}
      {result && (
        <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
          <ComparisonResult
            current={result.currentBreakdown}
            target={result.targetBreakdown}
            raisePercent={result.raisePercent}
            cashRaisePercent={result.cashRaisePercent}
            employerCostChangePercent={result.employerCostChangePercent}
          />
        </div>
      )}

      {!result && (
        <div className="rounded-2xl bg-card border border-b1 p-6 sm:p-8 text-center card-shadow">
          <div className="text-4xl mb-3 opacity-30">⚖️</div>
          <p className="text-t4 text-sm">输入当前薪资，系统将自动反推目标 Offer 的月 Base</p>
          <p className="text-t5 text-[10px] sm:text-xs mt-2">综合价值 = 到手现金 + 公积金双边(×100%) + 养老金双边(×50%) + 股票(×折价)</p>
        </div>
      )}

      <AdSlot {...AD_SLOTS.converterBottom} />
    </div>
  );
}
