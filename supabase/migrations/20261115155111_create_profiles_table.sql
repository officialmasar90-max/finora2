/*
# Create profiles table for user profile data

## Purpose
Stores extended user profile information (display name, avatar initials)
linked to Supabase Auth users. This table is separate from auth.users
and is protected by Row Level Security so each user can only access
their own profile row.

## New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users on delete cascade)
  - `email` (text, the user's email from auth)
  - `full_name` (text, display name the user can edit)
  - `created_at` (timestamptz, defaults to now())
  - `updated_at` (timestamptz, defaults to now())

## Security
- RLS enabled on `profiles`.
- GRANT SELECT, INSERT, UPDATE to `authenticated` only (no anon — app requires sign-in).
- 3 policies: select own, insert own, update own — all scoped to `auth.uid() = id`.
- No DELETE policy: profiles are removed via cascade when auth.users row is deleted.
- `updated_at` auto-set via trigger on row update.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- SELECT: users can read only their own profile
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- INSERT: users can create only their own profile row
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: users can update only their own profile row
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-update updated_at on row change
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE OR REPLACE FUNCTION handle_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profiles_updated_at();
