/*
# Revoke EXECUTE on handle_new_user from authenticated role

## Purpose
The security advisor flagged that `authenticated` can still execute the
`handle_new_user()` SECURITY DEFINER function via the Data API. This function
should only be called by the database trigger on `auth.users` during signup —
never directly by any client.

## Security
- Revoke EXECUTE from `authenticated` so no client role can call it.
- The trigger on `auth.users` fires server-side as the service role, which is
  not affected by EXECUTE grants.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
