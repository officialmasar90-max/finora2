/*
# Auto-create profile on user signup

## Purpose
When a new user registers via Supabase Auth, a matching `profiles` row should
exist automatically. Previously the frontend tried to insert the profile row
after `signUp()`, which can fail silently (e.g. if the session is not yet
established, the RLS INSERT policy rejects it). A database trigger on
`auth.users` is more reliable: it runs server-side with privileges that bypass
RLS, guaranteeing the profile row is created at signup time.

## Changes
- Creates `public.handle_new_user()` — a SECURITY DEFINER function that inserts
  a `profiles` row from the new auth user's id, email, and `full_name` metadata.
- Attaches it as an AFTER INSERT trigger on `auth.users`.
- Revokes EXECUTE from `PUBLIC` and `anon` so only Supabase Auth (service role)
  can invoke it; authenticated users never call it directly.

## Security
- `handle_new_user()` is SECURITY DEFINER so it can insert into `profiles`
  even though the calling role (service_role during signup) would otherwise
  be subject to RLS. The function only inserts a single row keyed to the
  new user's own `auth.uid()`, so it cannot be abused to create arbitrary rows.
- EXECUTE revoked from PUBLIC and anon; the trigger fires server-side during
  signup, not from the Data API.
- No changes to existing profiles RLS policies or grants.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
