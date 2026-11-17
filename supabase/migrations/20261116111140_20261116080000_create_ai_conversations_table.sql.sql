/*
# Create ai_conversations and ai_messages tables for AI consultant chat history

## Purpose
Stores conversation sessions and individual messages between each authenticated
user and the AI financial consultant. Each user sees only their own conversations.
The edge function reads prior messages to maintain conversation context, and
saves new messages after each AI response.

## New Tables

### ai_conversations
- `id` (uuid, primary key)
- `user_id` (uuid, not null, defaults to auth.uid(), references auth.users on delete cascade)
- `title` (text, not null — auto-generated from the first user message)
- `created_at` (timestamptz, defaults to now())
- `updated_at` (timestamptz, defaults to now(), auto-updated via trigger)

### ai_messages
- `id` (uuid, primary key)
- `conversation_id` (uuid, not null, references ai_conversations on delete cascade)
- `user_id` (uuid, not null, defaults to auth.uid(), references auth.users on delete cascade)
- `role` (text, not null, CHECK in 'user' or 'assistant')
- `content` (text, not null — the message text)
- `created_at` (timestamptz, defaults to now())

## Security

### ai_conversations
- RLS enabled.
- GRANT SELECT, INSERT, UPDATE, DELETE to `authenticated` only.
- 4 owner-scoped policies (select/insert/update/delete) checking `auth.uid() = user_id`.

### ai_messages
- RLS enabled.
- GRANT SELECT, INSERT, DELETE to `authenticated` only (no UPDATE — messages are immutable).
- 3 policies: select (ownership via user_id), insert (owner check), delete (owner check).
- The edge function uses the service role key which bypasses RLS, so it can read/write
  messages for any user — but the frontend (anon key + authenticated session) can only
  access the user's own rows.

## Indexes
- `idx_ai_conversations_user` on ai_conversations(user_id, created_at desc)
- `idx_ai_messages_conversation` on ai_messages(conversation_id, created_at asc)

## Triggers
- `ai_conversations_updated_at` — auto-updates `updated_at` on row update (explicit search_path).
*/
