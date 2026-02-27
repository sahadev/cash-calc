import { useState, useCallback, useEffect } from 'react';
import type { HistoryRecord, SalaryInput, AnnualSummary } from '../types/salary';

const STORAGE_KEY = 'cash-calc-history';

function loadHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(records: HistoryRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function useHistory() {
  const [records, setRecords] = useState<HistoryRecord[]>(loadHistory);

  useEffect(() => {
    saveHistory(records);
  }, [records]);

  const addRecord = useCallback(
    (input: SalaryInput, summary: AnnualSummary, label?: string) => {
      const record: HistoryRecord = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        input,
        summary,
        label:
          label ||
          `${summary.totalGrossIncome.toLocaleString()}元/年 (${input.monthlyBase}×${input.totalMonths})`,
      };
      setRecords((prev) => [record, ...prev]);
      return record;
    },
    []
  );

  const removeRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setRecords([]);
  }, []);

  return { records, addRecord, removeRecord, clearAll };
}
