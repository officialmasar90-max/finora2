/*
# Create debts table for Debt Management

## Purpose
Stores user debt records — each row represents a single debt instrument (loan, credit card,
KTA, KPR, etc.) with its creditor name, outstanding principal, annual interest rate,
monthly installment, minimum payment, and due date. The frontend uses deterministic
TypeScript functions to calculate snowball and avalanche repayment scenarios from
these records. No calculations are stored server-side — only the raw user inputs.

## New Table
### debts
- `id` (uuid, primary key)
- `user_id` (uuid, not null, defaults to auth.uid(), references auth.users on delete cascade)
- `name` (text, not null — creditor name or debt label, e.g. "Bank BCA KPR")
- `principal` (numeric, not null, check > 0 — outstanding principal in IDR)
- `interest_rate` (numeric, not null, check >= 0 — annual interest rate as percentage, e.g. 12.5)
- `monthly_installment` (numeric, not null, check > 0 — agreed monthly payment in IDR)
- `minimum_payment` (numeric, not null, check >= 0 — minimum required payment in IDR, can be 0)
- `due_date` (date, not null — next payment due date)
- `is_paid_off` (boolean, not null, default false — marks debt as fully repaid)
- `notes` (text, nullable — optional user notes)
- `created_at` (timestamptz, defaults to now())
- `updated_at` (timestamptz, defaults to now(), auto-updated via trigger)

## Security
- RLS enabled.
- GRANT SELECT, INSERT, UPDATE, DELETE to `authenticated` only.
- 4 owner-scoped policies (select/insert/update/delete) checking `auth.uid() = user_id`.
- The frontend (authenticated session) can only access the user's own debt records.

## Indexes
- `idx_debts_user` on debts(user_id) — fast lookup by user.

## Triggers
- `debts_updated_at` — auto-updates `updated_at` on row update (explicit search_path).
*/

CREATE TABLE IF NOT EXISTS debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  principal numeric NOT NULL CHECK (principal > 0),
  interest_rate numeric NOT NULL CHECK (interest_rate >= 0),
  monthly_installment numeric NOT NULL CHECK (monthly_installment > 0),
  minimum_payment numeric NOT NULL DEFAULT 0 CHECK (minimum_payment >= 0),
  due_date date NOT NULL,
  is_paid_off boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON debts TO authenticated;

CREATE INDEX IF NOT EXISTS idx_debts_user ON debts(user_id);

-- RLS Policies
DROP POLICY IF EXISTS "select_own_debts" ON debts;
CREATE POLICY "select_own_debts"
  ON debts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_debts" ON debts;
CREATE POLICY "insert_own_debts"
  ON debts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_debts" ON debts;
CREATE POLICY "update_own_debts"
  ON debts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_debts" ON debts;
CREATE POLICY "delete_own_debts"
  ON debts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS debts_updated_at ON debts;
CREATE OR REPLACE FUNCTION public.handle_debts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_debts_updated_at();