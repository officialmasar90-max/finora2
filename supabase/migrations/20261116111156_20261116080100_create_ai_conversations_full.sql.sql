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

CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Percakapan Baru',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_conversations TO authenticated;

DROP POLICY IF EXISTS "select_own_conversations" ON ai_conversations;
CREATE POLICY "select_own_conversations"
  ON ai_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_conversations" ON ai_conversations;
CREATE POLICY "insert_own_conversations"
  ON ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_conversations" ON ai_conversations;
CREATE POLICY "update_own_conversations"
  ON ai_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_conversations" ON ai_conversations;
CREATE POLICY "delete_own_conversations"
  ON ai_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ai_messages table
CREATE TABLE IF NOT EXISTS ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON ai_messages TO authenticated;

DROP POLICY IF EXISTS "select_own_messages" ON ai_messages;
CREATE POLICY "select_own_messages"
  ON ai_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_messages" ON ai_messages;
CREATE POLICY "insert_own_messages"
  ON ai_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_messages" ON ai_messages;
CREATE POLICY "delete_own_messages"
  ON ai_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user
  ON ai_conversations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation
  ON ai_messages(conversation_id, created_at ASC);

-- Auto-update updated_at trigger for ai_conversations
DROP TRIGGER IF EXISTS ai_conversations_updated_at ON ai_conversations;
CREATE OR REPLACE FUNCTION public.handle_ai_conversations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ai_conversations_updated_at();
