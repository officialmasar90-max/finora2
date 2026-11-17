/*
# Fix mutable search_path on profiles updated_at trigger function

## Purpose
The database security advisor flagged `handle_profiles_updated_at()` as having
a mutable `search_path`, which is a security risk. This migration recreates
the function with an explicit, immutable `search_path` set to `public`.

## Changes
- Drops the trigger `profiles_updated_at` first (it depends on the function).
- Drops and recreates `handle_profiles_updated_at()` with `SET search_path = public`.
- Recreates the trigger `profiles_updated_at` on the `profiles` table.

## Security
- No RLS or grant changes. The function is a simple BEFORE UPDATE trigger
  that sets `updated_at = now()` — it never reads other tables.
*/

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;

DROP FUNCTION IF EXISTS public.handle_profiles_updated_at();

CREATE OR REPLACE FUNCTION public.handle_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profiles_updated_at();
