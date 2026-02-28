import type { SalaryStructure, SocialInsuranceBaseType } from '../types/salary';
import type { CityId } from '../data/cityPolicies';
import { getCityPolicy } from '../data/cityPolicies';
import CitySelector from './CitySelector';

interface Props {
  value: Omit<SalaryStructure, 'monthlyBase'> & { monthlyBase?: number };
  onChange: (value: Omit<SalaryStructure, 'monthlyBase'> & { monthlyBase?: number }) => void;
  showMonthlyBase?: boolean;
  solvedMonthlyBase?: number;
  label: string;
  accentColor: 'amber' | 'emerald';
}

const accentStyles = {
  amber: {
    title: 'text-amber-500',
    resultBg: 'bg-amber-500/10',
    resultText: 'text-amber-500',
    resultBorder: 'border-amber-500/30',
    btnActive: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/50',
  },
  emerald: {
    title: 'text-emerald-500',
    resultBg: 'bg-emerald-500/10',
    resultText: 'text-emerald-500',
    resultBorder: 'border-emerald-500/30',
    btnActive: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/50',
  },
};

export default function StructureInput({
  value,
  onChange,
  showMonthlyBase = true,
  solvedMonthlyBase,
  label,
  accentColor,
}: Props) {
  const policy = getCityPolicy(value.city);
  const styles = accentStyles[accentColor];

  const set = <K extends keyof SalaryStructure>(key: K, val: SalaryStructure[K]) => {
    onChange({ ...value, [key]: val });
  };

  const numChange = (key: keyof SalaryStructure) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    set(key, isNaN(v) ? 0 : v);
  };

  const handleCityChange = (city: CityId) => {
    const newPolicy = getCityPolicy(city);
    onChange({
      ...value,
      city,
      housingFundRate: newPolicy.housingFund.defaultRate,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className={`text-sm font-semibold tracking-wide ${styles.title}`}>
        {label}
      </h3>

      <div>
        <FieldLabel>城市</FieldLabel>
        <CitySelector value={value.city} onChange={handleCityChange} size="sm" />
      </div>

      {showMonthlyBase && (
        <div>
          <FieldLabel>月 Base (元)</FieldLabel>
          <input
            type="number"
            value={value.monthlyBase || ''}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              onChange({ ...value, monthlyBase: isNaN(v) ? 0 : v });
            }}
            placeholder="例: 25000"
            className="input-field"
          />
        </div>
      )}

      {!showMonthlyBase && solvedMonthlyBase !== undefined && (
        <div>
          <FieldLabel>月 Base (反推结果)</FieldLabel>
          <div className={`text-xl sm:text-2xl font-bold font-mono rounded-xl px-3 sm:px-4 py-3 text-center border ${styles.resultBg} ${styles.resultText} ${styles.resultBorder}`}>
            {solvedMonthlyBase.toLocaleString('zh-CN')} 元
          </div>
        </div>
      )}

      <div>
        <FieldLabel>年薪月数</FieldLabel>
        <input
          type="number"
          min={12}
          max={24}
          step={1}
          value={value.months || ''}
          onChange={numChange('months')}
          placeholder="例: 15"
          className="input-field"
        />
      </div>

      <div>
        <FieldLabel>社保基数</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {([
            ['full', '全额'],
            ['minimum', '最低'],
            ['custom', '自定义'],
          ] as [SocialInsuranceBaseType, string][]).map(([mode, text]) => (
            <button
              key={mode}
              onClick={() => set('socialInsuranceBaseType', mode)}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                value.socialInsuranceBaseType === mode
                  ? styles.btnActive
                  : 'bg-elevated text-t3 hover:bg-hover active:bg-hover'
              }`}
            >
              {text}
            </button>
          ))}
        </div>
        {value.socialInsuranceBaseType === 'minimum' && (
          <p className="text-[10px] sm:text-xs text-t4 mt-1">
            最低基数: {policy.socialInsurance.base.min.toLocaleString()} 元
          </p>
        )}
        {value.socialInsuranceBaseType === 'custom' && (
          <input
            type="number"
            value={value.customSocialInsuranceBase || ''}
            onChange={numChange('customSocialInsuranceBase')}
            placeholder={`${policy.socialInsurance.base.min} ~ ${policy.socialInsurance.base.max}`}
            className="input-field mt-2"
          />
        )}
      </div>

      <div>
        <FieldLabel>公积金基数</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {([
            ['full', '全额'],
            ['minimum', '最低'],
            ['custom', '自定义'],
          ] as [SocialInsuranceBaseType, string][]).map(([mode, text]) => (
            <button
              key={mode}
              onClick={() => set('housingFundBaseType', mode)}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                value.housingFundBaseType === mode
                  ? styles.btnActive
                  : 'bg-elevated text-t3 hover:bg-hover active:bg-hover'
              }`}
            >
              {text}
            </button>
          ))}
        </div>
        {value.housingFundBaseType === 'minimum' && (
          <p className="text-[10px] sm:text-xs text-t4 mt-1">
            最低基数: {policy.housingFund.base.min.toLocaleString()} 元
          </p>
        )}
        {value.housingFundBaseType === 'custom' && (
          <input
            type="number"
            value={value.customHousingFundBase || ''}
            onChange={numChange('customHousingFundBase')}
            placeholder={`${policy.housingFund.base.min} ~ ${policy.housingFund.base.max}`}
            className="input-field mt-2"
          />
        )}
      </div>

      <div>
        <FieldLabel>公积金比例 ({value.housingFundRate}%)</FieldLabel>
        <input
          type="range"
          min={policy.housingFund.rateRange.min}
          max={policy.housingFund.rateRange.max}
          step={1}
          value={value.housingFundRate}
          onChange={(e) => set('housingFundRate', parseInt(e.target.value))}
          className="w-full accent-amber-500 h-6"
        />
      </div>

      <div>
        <FieldLabel>专项附加扣除 (元/月)</FieldLabel>
        <input
          type="number"
          min={0}
          step={100}
          value={value.specialDeduction || ''}
          onChange={numChange('specialDeduction')}
          placeholder="例: 1500"
          className="input-field"
        />
      </div>

      <details className="group">
        <summary className="cursor-pointer text-xs text-t4 hover:text-amber-500 active:text-amber-500 transition-colors select-none py-1">
          其它渠道 & 股票 ▾
        </summary>
        <div className="mt-3 space-y-3 pl-2 border-l-2 border-b2">
          <div>
            <FieldLabel>其它渠道占比 (%)</FieldLabel>
            <input
              type="number"
              min={0}
              max={100}
              step={5}
              value={value.altChannelRatio || ''}
              onChange={numChange('altChannelRatio')}
              placeholder="0 = 全额正规发放"
              className="input-field"
            />
            <p className="text-[10px] sm:text-xs text-t5 mt-1">
              通过第三方/避税渠道发放的比例
            </p>
          </div>

          {value.altChannelRatio > 0 && (
            <div>
              <FieldLabel>渠道手续费 (%)</FieldLabel>
              <input
                type="number"
                min={0}
                max={30}
                step={1}
                value={value.altChannelFeeRate || ''}
                onChange={numChange('altChannelFeeRate')}
                placeholder="例: 15"
                className="input-field"
              />
            </div>
          )}

          <div>
            <FieldLabel>年度股票/期权面值 (元)</FieldLabel>
            <input
              type="number"
              min={0}
              step={10000}
              value={value.annualStockValue || ''}
              onChange={numChange('annualStockValue')}
              placeholder="0 = 无股票"
              className="input-field"
            />
          </div>

          {value.annualStockValue > 0 && (
            <div>
              <FieldLabel>股票折价系数 ({value.stockDiscount}%)</FieldLabel>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={value.stockDiscount}
                onChange={(e) => set('stockDiscount', parseInt(e.target.value))}
                className="w-full accent-amber-500 h-6"
              />
              <p className="text-[10px] sm:text-xs text-t5 mt-1">
                你认为股票实际可兑现的价值比例
              </p>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs text-t3 uppercase tracking-widest mb-1.5 block">
      {children}
    </span>
  );
}
