import type { CityId } from '../data/cityPolicies';
import { getAllCityPolicies } from '../data/cityPolicies';

interface Props {
  value: CityId;
  onChange: (city: CityId) => void;
  size?: 'sm' | 'md';
}

const policies = getAllCityPolicies();

export default function CitySelector({ value, onChange, size = 'md' }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {policies.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`rounded-lg transition-all ${
            size === 'sm'
              ? 'px-2.5 py-1.5 text-xs'
              : 'px-3 py-2 sm:py-1.5 text-sm'
          } ${
            value === p.id
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/50'
              : 'bg-elevated text-t3 hover:bg-hover active:bg-hover'
          }`}
        >
          {p.shortName}
        </button>
      ))}
    </div>
  );
}
