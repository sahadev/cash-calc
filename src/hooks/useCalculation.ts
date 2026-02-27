import { useMemo } from 'react';
import type { SalaryInput, AnnualSummary } from '../types/salary';
import { calculateAll } from '../utils/calculator';

export function useCalculation(input: SalaryInput): AnnualSummary | null {
  return useMemo(() => {
    if (input.monthlyBase <= 0) return null;
    return calculateAll(input);
  }, [
    input.monthlyBase,
    input.totalMonths,
    input.housingFundRate,
    input.additionalDeduction,
    input.socialInsuranceBase,
    input.housingFundBase,
    input.bonusTaxMode,
  ]);
}
