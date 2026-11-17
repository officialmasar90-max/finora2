/*
# Create transactions table for user financial records

## Purpose
Stores individual income and expense transactions for each authenticated user.
Each transaction records the amount, type (income/expense), category, description,
and the date the transaction occurred. All data is scoped to the owning user
via Row Level Security — a user can only ever see or modify their own records.

## New Tables
- `transactions`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users on delete cascade)
  - `amount` (numeric(15,2), not null, must be > 0)
  - `type` (text, not null, CHECK constraint limits to 'income' or 'expense')
  - `category` (text, not null — the Indonesian category label, e.g. 'Gaji', 'Makanan')
  - `description` (text, not null — a short user-provided description of the transaction)
  - `transaction_date` (date, not null, defaults to today — when the transaction occurred)
  - `created_at` (timestamptz, defaults to now())
  - `updated_at` (timestamptz, defaults to now(), auto-updated via trigger)

## Security
- RLS enabled on `transactions`.
- GRANT SELECT, INSERT, UPDATE, DELETE to `authenticated` only (no anon — app requires sign-in).
- 4 owner-scoped policies (select/insert/update/delete), all checking `auth.uid() = user_id`.
- `user_id` defaults to `auth.uid()` so inserts that omit it still satisfy the INSERT WITH CHECK.
- `updated_at` auto-set via a BEFORE UPDATE trigger with an explicit search_path (security).
- Amount must be positive (CHECK constraint `amount > 0`).
- An index on `user_id` for fast per-user queries, and a composite index on `(user_id, transaction_date)` for filtered/sorted queries.
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  description text NOT NULL,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON transactions TO authenticated;

-- SELECT: users can read only their own transactions
DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: users can create only their own transactions
DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: users can update only their own transactions
DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
CREATE POLICY "update_own_transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: users can delete only their own transactions
DROP POLICY IF EXISTS "delete_own_transactions" ON transactions;
CREATE POLICY "delete_own_transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);

-- Auto-update updated_at on row change
DROP TRIGGER IF EXISTS transactions_updated_at ON transactions;
CREATE OR REPLACE FUNCTION public.handle_transactions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_transactions_updated_at();
