/*
# Create financial_assessments table for guided financial assessment history

## Purpose
Stores the results of the guided financial assessment form. Each row captures
the user's raw inputs and the computed financial metrics + generated report
at the time the assessment was submitted. Users can review their assessment
history and track how their financial health changes over time.

## New Tables
- `financial_assessments`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users on delete cascade)
  - `monthly_income` (numeric(15,2), not null — gross monthly income)
  - `essential_expenses` (numeric(15,2), not null — must-have monthly spending: housing, food, utilities, transport)
  - `non_essential_expenses` (numeric(15,2), not null — discretionary monthly spending)
  - `debt_balances` (numeric(15,2), not null — total outstanding debt)
  - `monthly_installments` (numeric(15,2), not null — total monthly debt payments)
  - `savings` (numeric(15,2), not null — current total savings)
  - `financial_dependents` (integer, not null, default 0 — number of people financially dependent)
  - `emergency_fund` (numeric(15,2), not null — current emergency fund balance)
  - `report` (jsonb, not null, default '{}' — the full generated report: metrics, strengths, problems, risks, recommendations)
  - `created_at` (timestamptz, defaults to now())

## Security
- RLS enabled on `financial_assessments`.
- GRANT SELECT, INSERT, DELETE to `authenticated` only (no anon — app requires sign-in).
  No UPDATE: assessments are immutable once saved (historical record).
- 3 owner-scoped policies (select/insert/delete), all checking `auth.uid() = user_id`.
- `user_id` defaults to `auth.uid()` so inserts that omit it still satisfy the INSERT WITH CHECK.
- Index on `user_id` for fast per-user queries, ordered by created_at desc.
*/

CREATE TABLE IF NOT EXISTS financial_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_income numeric(15,2) NOT NULL CHECK (monthly_income >= 0),
  essential_expenses numeric(15,2) NOT NULL CHECK (essential_expenses >= 0),
  non_essential_expenses numeric(15,2) NOT NULL CHECK (non_essential_expenses >= 0),
  debt_balances numeric(15,2) NOT NULL CHECK (debt_balances >= 0),
  monthly_installments numeric(15,2) NOT NULL CHECK (monthly_installments >= 0),
  savings numeric(15,2) NOT NULL CHECK (savings >= 0),
  financial_dependents integer NOT NULL DEFAULT 0 CHECK (financial_dependents >= 0),
  emergency_fund numeric(15,2) NOT NULL CHECK (emergency_fund >= 0),
  report jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE financial_assessments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON financial_assessments TO authenticated;

-- SELECT: users can read only their own assessments
DROP POLICY IF EXISTS "select_own_assessments" ON financial_assessments;
CREATE POLICY "select_own_assessments"
  ON financial_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: users can create only their own assessments
DROP POLICY IF EXISTS "insert_own_assessments" ON financial_assessments;
CREATE POLICY "insert_own_assessments"
  ON financial_assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- DELETE: users can delete only their own assessments
DROP POLICY IF EXISTS "delete_own_assessments" ON financial_assessments;
CREATE POLICY "delete_own_assessments"
  ON financial_assessments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for listing assessments by user, newest first
CREATE INDEX IF NOT EXISTS idx_assessments_user_created
  ON financial_assessments(user_id, created_at DESC);
