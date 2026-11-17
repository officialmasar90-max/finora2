import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AssessmentInput, AssessmentMetrics } from '@/lib/financialCalculations';
import type { FinancialReport } from '@/lib/financialReport';

export interface AssessmentReportData {
  metrics: AssessmentMetrics;
  report: FinancialReport;
}

export interface AssessmentRecord {
  id: string;
  user_id: string;
  monthly_income: number;
  essential_expenses: number;
  non_essential_expenses: number;
  debt_balances: number;
  monthly_installments: number;
  savings: number;
  financial_dependents: number;
  emergency_fund: number;
  report: AssessmentReportData;
  created_at: string;
}

export interface AssessmentInsert {
  monthly_income: number;
  essential_expenses: number;
  non_essential_expenses: number;
  debt_balances: number;
  monthly_installments: number;
  savings: number;
  financial_dependents: number;
  emergency_fund: number;
  report: AssessmentReportData;
}

export function useAssessments() {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('financial_assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setAssessments((data ?? []) as AssessmentRecord[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const saveAssessment = useCallback(
    async (
      insert: AssessmentInsert
    ): Promise<{ error: string | null; data: AssessmentRecord | null }> => {
      const { data, error: insertError } = await supabase
        .from('financial_assessments')
        .insert(insert)
        .select()
        .single();

      if (insertError) return { error: insertError.message, data: null };

      const record = data as AssessmentRecord;
      setAssessments((prev) => [record, ...prev]);
      return { error: null, data: record };
    },
    []
  );

  const deleteAssessment = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      const { error: deleteError } = await supabase
        .from('financial_assessments')
        .delete()
        .eq('id', id);

      if (deleteError) return { error: deleteError.message };

      setAssessments((prev) => prev.filter((a) => a.id !== id));
      return { error: null };
    },
    []
  );

  return {
    assessments,
    loading,
    error,
    refetch: fetchAssessments,
    saveAssessment,
    deleteAssessment,
  };
}

export function toInsertRow(
  input: AssessmentInput,
  reportData: AssessmentReportData
): AssessmentInsert {
  return {
    monthly_income: input.monthlyIncome,
    essential_expenses: input.essentialExpenses,
    non_essential_expenses: input.nonEssentialExpenses,
    debt_balances: input.debtBalances,
    monthly_installments: input.monthlyInstallments,
    savings: input.savings,
    financial_dependents: input.financialDependents,
    emergency_fund: input.emergencyFund,
    report: reportData,
  };
}

export function toInput(row: AssessmentRecord): AssessmentInput {
  return {
    monthlyIncome: Number(row.monthly_income),
    essentialExpenses: Number(row.essential_expenses),
    nonEssentialExpenses: Number(row.non_essential_expenses),
    debtBalances: Number(row.debt_balances),
    monthlyInstallments: Number(row.monthly_installments),
    savings: Number(row.savings),
    financialDependents: Number(row.financial_dependents),
    emergencyFund: Number(row.emergency_fund),
  };
}
