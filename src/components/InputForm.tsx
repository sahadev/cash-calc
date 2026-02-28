import type { SalaryInput } from '../types/salary';
import type { CityId } from '../data/cityPolicies';
import { getCityPolicy } from '../data/cityPolicies';
import CitySelector from './CitySelector';

interface Props {
  input: SalaryInput;
  onChange: (input: SalaryInput) => void;
}

export default function InputForm({ input, onChange }: Props) {
  const set = <K extends keyof SalaryInput>(key: K, value: SalaryInput[K]) =>
    onChange({ ...input, [key]: value });

  const numChange = (key: keyof SalaryInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    set(key, isNaN(v) ? 0 : v);
  };

  const handleCityChange = (city: CityId) => {
    const newPolicy = getCityPolicy(city);
    onChange({
      ...input,
      city,
      housingFundRate: newPolicy.housingFund.defaultRate,
    });
  };

  const policy = getCityPolicy(input.city);

  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="text-base sm:text-lg font-semibold text-amber-500 tracking-wide">
        薪资参数
      </h2>

      <div>
        <label className="text-xs text-t3 uppercase tracking-widest mb-1.5 block">
          城市
        </label>
        <CitySelector value={input.city} onChange={handleCityChange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="月 Base (元)">
          <input
            type="number"
            value={input.monthlyBase || ''}
            onChange={numChange('monthlyBase')}
            placeholder="例: 10000"
            className="input-field"
          />
        </Field>

        <Field label="年薪月数">
          <input
            type="number"
            min={12}
            max={24}
            step={1}
            value={input.totalMonths || ''}
            onChange={numChange('totalMonths')}
            placeholder="例: 15"
            className="input-field"
          />
          <p className="text-xs text-t4 mt-1">
            12 = 无年终奖，13~24 含年终奖
          </p>
        </Field>

        <Field label="公积金缴存比例">
          <input
            type="range"
            min={policy.housingFund.rateRange.min}
            max={policy.housingFund.rateRange.max}
            step={1}
            value={input.housingFundRate}
            onChange={(e) => set('housingFundRate', parseInt(e.target.value))}
            className="w-full accent-amber-500 h-6"
          />
          <div className="text-center text-amber-500 font-mono font-semibold text-sm mt-1">
            {input.housingFundRate}%
          </div>
        </Field>

        <Field label="专项附加扣除 (元/月)">
          <input
            type="number"
            min={0}
            step={100}
            value={input.additionalDeduction || ''}
            onChange={numChange('additionalDeduction')}
            placeholder="例: 1500"
            className="input-field"
          />
          <p className="text-xs text-t4 mt-1">
            租房1500 / 子女教育2000 / 赡养老人3000 等
          </p>
        </Field>
      </div>

      <details className="group">
        <summary className="cursor-pointer text-sm text-t3 hover:text-amber-500 active:text-amber-500 transition-colors select-none py-1">
          高级选项 ▾
        </summary>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 pl-2 border-l-2 border-b2">
          <Field label="自定义社保基数 (留空自动)">
            <input
              type="number"
              value={input.socialInsuranceBase || ''}
              onChange={numChange('socialInsuranceBase')}
              placeholder="自动取月base夹在上下限"
              className="input-field"
            />
          </Field>
          <Field label="自定义公积金基数 (留空自动)">
            <input
              type="number"
              value={input.housingFundBase || ''}
              onChange={numChange('housingFundBase')}
              placeholder="自动取月base夹在上下限"
              className="input-field"
            />
          </Field>
          <Field label="补充公积金比例 (%)">
            <input
              type="number"
              min={0}
              max={5}
              step={1}
              value={input.supplementHFRate || ''}
              onChange={numChange('supplementHFRate')}
              placeholder="0~5%，无则留空"
              className="input-field"
            />
            <p className="text-xs text-t4 mt-1">双边合计，每月额外存入公积金账户</p>
          </Field>
          <Field label="企业年金比例 (%)">
            <input
              type="number"
              min={0}
              max={8}
              step={1}
              value={input.enterpriseAnnuityRate || ''}
              onChange={numChange('enterpriseAnnuityRate')}
              placeholder="0~8%，无则留空"
              className="input-field"
            />
            <p className="text-xs text-t4 mt-1">个人+企业缴纳比例，国企/事业单位常见</p>
          </Field>
        </div>
      </details>

      <div>
        <label className="text-xs text-t3 uppercase tracking-widest mb-2 block">
          年终奖计税方式
        </label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['auto', '自动最优'],
              ['separate', '单独计税'],
              ['combined', '并入综合'],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => set('bonusTaxMode', mode)}
              className={`px-3 py-2 sm:py-1.5 rounded-lg text-sm transition-all ${
                input.bonusTaxMode === mode
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/50'
                  : 'bg-elevated text-t3 hover:bg-hover active:bg-hover'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-t3 uppercase tracking-widest mb-1.5 block">
        {label}
      </span>
      {children}
    </label>
  );
}
