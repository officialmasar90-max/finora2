/*
# Create goals table for Financial Goals Planner

## Purpose
Stores user financial goals — each row is one savings goal (e.g. emergency fund, education,
marriage, house purchase, travel). The user sets a target amount, current saved amount, and
a deadline date. The frontend computes the required monthly contribution deterministically
from remaining amount and months until the deadline, and tracks progress as
(current_savings / target_amount).

## New Table
### goals
- `id` (uuid, primary key)
- `user_id` (uuid, not null, defaults to auth.uid(), references auth.users on delete cascade)
- `name` (text, not null — goal label, e.g. "Dana Darurat", "DP Rumah")
- `category` (text, not null — one of: Dana Darurat, Pendidikan, Pernikahan, Rumah, Liburan, Lainnya)
- `target_amount` (numeric, not null, check > 0 — the goal target in IDR)
- `current_savings` (numeric, not null, check >= 0 — amount already saved in IDR)
- `deadline` (date, not null — target completion date)
- `is_achieved` (boolean, not null, default false — marks goal as reached)
- `notes` (text, nullable — optional user notes)
- `created_at` (timestamptz, defaults to now())
- `updated_at` (timestamptz, defaults to now(), auto-updated via trigger)

## Constraints
- CHECK target_amount > 0, current_savings >= 0.
- Category is free-form text validated in the UI against the fixed list.

## Security
- RLS enabled.
- GRANT SELECT, INSERT, UPDATE, DELETE to `authenticated` only.
- 4 owner-scoped policies (select/insert/update/delete) checking `auth.uid() = user_id`.
- The frontend (authenticated session) can only access the user's own goals.

## Indexes
- `idx_goals_user` on goals(user_id) — fast lookup by user.

## Triggers
- `goals_updated_at` — auto-updates `updated_at` on row update (explicit search_path).
*/

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  target_amount numeric NOT NULL CHECK (target_amount > 0),
  current_savings numeric NOT NULL DEFAULT 0 CHECK (current_savings >= 0),
  deadline date NOT NULL,
  is_achieved boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON goals TO authenticated;

CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);

-- RLS Policies
DROP POLICY IF EXISTS "select_own_goals" ON goals;
CREATE POLICY "select_own_goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_goals" ON goals;
CREATE POLICY "insert_own_goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_goals" ON goals;
CREATE POLICY "update_own_goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_goals" ON goals;
CREATE POLICY "delete_own_goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS goals_updated_at ON goals;
CREATE OR REPLACE FUNCTION public.handle_goals_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_goals_updated_at();