import type { SalaryInput } from '../types/salary';

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

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-amber-400 tracking-wide">
        薪资参数
      </h2>

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
          <p className="text-xs text-zinc-500 mt-1">
            12 = 无年终奖，13~24 含年终奖
          </p>
        </Field>

        <Field label="公积金缴存比例 (%)">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={12}
              step={1}
              value={input.housingFundRate}
              onChange={(e) => set('housingFundRate', parseInt(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <span className="text-amber-400 font-mono w-10 text-right">
              {input.housingFundRate}%
            </span>
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
          <p className="text-xs text-zinc-500 mt-1">
            租房1500 / 子女教育2000 / 赡养老人3000 等
          </p>
        </Field>
      </div>

      <details className="group">
        <summary className="cursor-pointer text-sm text-zinc-400 hover:text-amber-400 transition-colors select-none">
          高级选项 ▾
        </summary>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 pl-2 border-l-2 border-zinc-700">
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
        </div>
      </details>

      <div>
        <label className="text-xs text-zinc-400 uppercase tracking-widest mb-2 block">
          年终奖计税方式
        </label>
        <div className="flex gap-2">
          {(
            [
              ['auto', '自动最优'],
              ['separate', '单独计税'],
              ['combined', '并入综合所得'],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => set('bonusTaxMode', mode)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                input.bonusTaxMode === mode
                  ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
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
      <span className="text-xs text-zinc-400 uppercase tracking-widest mb-1.5 block">
        {label}
      </span>
      {children}
    </label>
  );
}
