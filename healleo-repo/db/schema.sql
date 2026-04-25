-- ═══════════════════════════════════════════════════════
-- HEALLEO — DATABASE SCHEMA (Phase 1)
-- Platform: Supabase (PostgreSQL 15+)
-- Strategy: Encrypted JSON blobs per user for fast migration,
--           with RLS ensuring user-only access.
-- ═══════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────
-- 1. USER HEALTH DATA (encrypted JSON blob)
-- Mirrors the current localStorage structure.
-- The "data" column holds AES-256-GCM encrypted JSON
-- containing: profile, logs, labs, symptoms, timeline,
-- medications, chat histories, AI memory, etc.
-- ─────────────────────────────────────
CREATE TABLE public.user_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_key TEXT NOT NULL,                -- 'health-state' for main blob
  encrypted_data TEXT NOT NULL,          -- AES-256-GCM encrypted JSON
  version INTEGER DEFAULT 1,            -- schema version for migrations
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, data_key)
);

-- ─────────────────────────────────────
-- 2. AUDIT LOG
-- Tracks every data access for compliance
-- ─────────────────────────────────────
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,               -- 'login','save','load','delete','export'
  resource_type TEXT,                 -- 'health_data','profile','session'
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────
-- ROW LEVEL SECURITY
-- Users can ONLY access their own data
-- ─────────────────────────────────────
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- user_data: full CRUD on own data only
CREATE POLICY user_data_select ON public.user_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_data_insert ON public.user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_data_update ON public.user_data
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY user_data_delete ON public.user_data
  FOR DELETE USING (auth.uid() = user_id);

-- audit_log: insert only (users can log but not read/modify)
CREATE POLICY audit_insert ON public.audit_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────
CREATE INDEX idx_user_data_lookup ON public.user_data(user_id, data_key);
CREATE INDEX idx_audit_user_time ON public.audit_log(user_id, created_at DESC);

-- ─────────────────────────────────────
-- AUTO-UPDATE TIMESTAMPS
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_data_updated
  BEFORE UPDATE ON public.user_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────
-- HELPER: Export all user data (right of access)
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot access another user''s data';
  END IF;

  SELECT jsonb_build_object(
    'user_data', (SELECT jsonb_agg(row_to_json(d)) FROM public.user_data d WHERE d.user_id = target_user_id),
    'exported_at', now()
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────
-- HELPER: Delete all user data (right of deletion)
-- ─────────────────────────────────────
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot delete another user''s data';
  END IF;

  INSERT INTO public.audit_log(user_id, action, resource_type, metadata)
  VALUES (target_user_id, 'delete_account', 'all', jsonb_build_object('timestamp', now()));

  DELETE FROM public.user_data WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
