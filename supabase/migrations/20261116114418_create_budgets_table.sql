/*
# Create budgets table for Budget Planner

## Purpose
Stores monthly spending budgets per expense category for each authenticated user.
Users set a spending limit for a specific category in a specific month (YYYY-MM).
The frontend compares the budget limit against actual transaction spending for
that category/month to show progress, remaining budget, and warnings.

## New Table
### budgets
- `id` (uuid, primary key)
- `user_id` (uuid, not null, defaults to auth.uid(), references auth.users on delete cascade)
- `category` (text, not null — must match an expense category label from config)
- `month` (text, not null — format YYYY-MM, e.g. "2026-11")
- `limit_amount` (numeric, not null, check > 0 — the spending limit in IDR)
- `created_at` (timestamptz, defaults to now())
- `updated_at` (timestamptz, defaults to now(), auto-updated via trigger)

## Constraints
- Unique constraint on (user_id, category, month) — one budget per category per month per user.
- CHECK on limit_amount > 0.

## Security
- RLS enabled.
- GRANT SELECT, INSERT, UPDATE, DELETE to `authenticated` only.
- 4 owner-scoped policies (select/insert/update/delete) checking `auth.uid() = user_id`.
- The frontend (authenticated session) can only access the user's own budget rows.

## Indexes
- `idx_budgets_user_month` on budgets(user_id, month) — fast lookup by user + month.

## Triggers
- `budgets_updated_at` — auto-updates `updated_at` on row update (explicit search_path).
*/

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  month text NOT NULL,
  limit_amount numeric NOT NULL CHECK (limit_amount > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON budgets TO authenticated;

-- Unique constraint: one budget per category per month per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_budgets_user_category_month'
  ) THEN
    ALTER TABLE budgets ADD CONSTRAINT uq_budgets_user_category_month
      UNIQUE (user_id, category, month);
  END IF;
END $$;

-- Index for fast lookup by user + month
CREATE INDEX IF NOT EXISTS idx_budgets_user_month
  ON budgets(user_id, month);

-- RLS Policies
DROP POLICY IF EXISTS "select_own_budgets" ON budgets;
CREATE POLICY "select_own_budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_budgets" ON budgets;
CREATE POLICY "insert_own_budgets"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_budgets" ON budgets;
CREATE POLICY "update_own_budgets"
  ON budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_budgets" ON budgets;
CREATE POLICY "delete_own_budgets"
  ON budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS budgets_updated_at ON budgets;
CREATE OR REPLACE FUNCTION public.handle_budgets_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_budgets_updated_at();