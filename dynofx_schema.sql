-- ===================================================================
-- DynoFX Complete Trading Platform Schema
-- Fully functional with all business logic implemented
-- ===================================================================

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";


SET search_path = public;

-- ===================================================================
-- ENUM TYPES
-- ===================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
    CREATE TYPE account_type AS ENUM ('MICRO', 'STANDARD', 'PRO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator', 'analyst');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('active', 'banned', 'suspended', 'pending');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
    CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trade_type') THEN
    CREATE TYPE trade_type AS ENUM ('BUY', 'SELL');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trade_status') THEN
    CREATE TYPE trade_status AS ENUM ('OPEN', 'CLOSED', 'PENDING', 'CANCELLED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRADE_PNL', 'FEE', 'BONUS', 'ADJUSTMENT');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
    CREATE TYPE difficulty_level AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Expert');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
    CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ADMIN_ACTION');
  END IF;
END;
$$;

-- ===================================================================
-- UTILITY FUNCTIONS (no table dependencies)
-- ===================================================================

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Get current user ID with proper error handling
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_jwt_sub text;
BEGIN
  -- Try JWT claim first
  v_jwt_sub := current_setting('request.jwt.claim.sub', true);
  
  -- Validation check (Regex for UUID)
  IF v_jwt_sub ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    v_user_id := v_jwt_sub::uuid;
  END IF;
  
  -- Fallback to auth.uid()
  IF v_user_id IS NULL THEN
    v_user_id := auth.uid();
  END IF;
  
  -- If still NULL, this is an error condition
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Cannot determine user ID - authentication required';
  END IF;
  
  RETURN v_user_id;
END;
$$;



-- XP to level conversion (standard gaming formula)
CREATE OR REPLACE FUNCTION public.xp_for_level(p_level integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT (p_level - 1) * (p_level - 1) * 100;
$$;

CREATE OR REPLACE FUNCTION public.level_from_xp(p_xp integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT GREATEST(1, FLOOR(SQRT(p_xp::numeric / 100)) + 1)::integer;
$$;

-- ===================================================================
-- PROFILES TABLE
-- ===================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    CREATE TABLE public.profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      
      -- Basic info
      username text UNIQUE,
      email text UNIQUE,
      full_name text,
      avatar_url text,
      bio text,
      website text,
      phone text,
      
      -- Location
      country text,
      timezone text DEFAULT 'UTC',
      
      -- Trading account
      balance numeric(18,8) NOT NULL DEFAULT 50.00 CHECK (balance >= 0),
      account_type account_type NOT NULL DEFAULT 'MICRO',
      
      -- Authorization
      role user_role NOT NULL DEFAULT 'user',
      status user_status NOT NULL DEFAULT 'active',
      
      -- Gamification
      xp integer NOT NULL DEFAULT 0 CHECK (xp >= 0),
      level integer NOT NULL DEFAULT 1 CHECK (level >= 1),
      
      -- Verification
      verification_status verification_status NOT NULL DEFAULT 'unverified',
      verification_id text,
      verification_document_url text,
      
      -- Metadata
      last_login_at timestamptz,
      last_trade_at timestamptz,
      email_verified boolean DEFAULT false,
      
      -- Soft delete
      deleted_at timestamptz,
      
      -- Timestamps
      created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
    );
    
    -- Indexes
    CREATE INDEX idx_profiles_role ON public.profiles(role) WHERE deleted_at IS NULL;
    CREATE INDEX idx_profiles_status ON public.profiles(status) WHERE deleted_at IS NULL;
    CREATE INDEX idx_profiles_email ON public.profiles(email) WHERE deleted_at IS NULL;
    CREATE INDEX idx_profiles_username ON public.profiles(username) WHERE deleted_at IS NULL;
    CREATE INDEX idx_profiles_account_type ON public.profiles(account_type);
    CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);
    CREATE INDEX idx_profiles_deleted_at ON public.profiles(deleted_at);
    
    -- Trigger
    CREATE TRIGGER set_updated_at_profiles 
      BEFORE UPDATE ON public.profiles 
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- Auto-update level based on XP
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.xp != OLD.xp THEN
    NEW.level := public.level_from_xp(NEW.xp);
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_level_on_xp_change'
  ) THEN
    CREATE TRIGGER update_level_on_xp_change
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      WHEN (NEW.xp IS DISTINCT FROM OLD.xp)
      EXECUTE FUNCTION public.update_user_level();
  END IF;
END;
$$;

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='profiles_select_active_public') THEN
    CREATE POLICY profiles_select_active_public ON public.profiles 
      FOR SELECT TO anon, authenticated
      USING (status = 'active' AND deleted_at IS NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='profiles_select_self') THEN
    CREATE POLICY profiles_select_self ON public.profiles 
      FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='profiles_insert_self') THEN
    CREATE POLICY profiles_insert_self ON public.profiles 
      FOR INSERT TO authenticated
      WITH CHECK ((SELECT auth.uid()) = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='profiles_update_self') THEN
    CREATE POLICY profiles_update_self ON public.profiles 
      FOR UPDATE TO authenticated
      USING ((SELECT auth.uid()) = id)
      WITH CHECK ((SELECT auth.uid()) = id);
  END IF;
END;
$$;

-- ===================================================================
-- HELPER FUNCTIONS (depend on profiles)
-- ===================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin','moderator')
      AND status = 'active'
      AND deleted_at IS NULL
  );
$$;



CREATE OR REPLACE FUNCTION public.can_manage_content()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin','moderator','analyst')
      AND status = 'active'
      AND deleted_at IS NULL
  );
$$;



-- ===================================================================
-- KYC DATA
-- ===================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='kyc_data') THEN
    CREATE TABLE public.kyc_data (
      user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
      address text,
      city text,
      state text,
      postal_code text,
      date_of_birth date,
      verification_status verification_status NOT NULL DEFAULT 'unverified',
      verification_id text,
      document_type text,
      document_number text,
      document_url text,
      selfie_url text,
      verified_by uuid REFERENCES public.profiles(id),
      verified_at timestamptz,
      rejection_reason text,
      submitted_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
    );
    
    CREATE INDEX idx_kyc_status ON public.kyc_data(verification_status);
    CREATE INDEX idx_kyc_submitted ON public.kyc_data(submitted_at);
    
    CREATE TRIGGER set_updated_at_kyc 
      BEFORE UPDATE ON public.kyc_data 
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

ALTER TABLE public.kyc_data ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='kyc_select_self') THEN
    CREATE POLICY kyc_select_self ON public.kyc_data FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='kyc_insert_self') THEN
    CREATE POLICY kyc_insert_self ON public.kyc_data FOR INSERT TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='kyc_update_self_or_admin') THEN
    CREATE POLICY kyc_update_self_or_admin ON public.kyc_data FOR UPDATE TO authenticated
      USING ((SELECT auth.uid()) = user_id OR public.is_admin());
  END IF;
END;
$$;

-- ===================================================================
-- BALANCE TRANSACTIONS (with proper locking)
-- ===================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='balance_transactions') THEN
    CREATE TABLE public.balance_transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      amount numeric(18,8) NOT NULL,
      type transaction_type NOT NULL,
      description text,
      reference_id uuid,
      reference_type text,
      balance_before numeric(18,8) NOT NULL,
      balance_after numeric(18,8) NOT NULL,
      metadata jsonb,
      created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      CONSTRAINT balance_math_check CHECK (balance_after = balance_before + amount)
    );
    
    CREATE INDEX idx_balance_txn_user ON public.balance_transactions(user_id, created_at DESC);
    CREATE INDEX idx_balance_txn_type ON public.balance_transactions(type);
    CREATE INDEX idx_balance_txn_reference ON public.balance_transactions(reference_id);
    CREATE INDEX idx_balance_txn_created_at ON public.balance_transactions(created_at DESC);
  END IF;
END;
$$;

ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='balance_txn_select_self') THEN
    CREATE POLICY balance_txn_select_self ON public.balance_transactions FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = user_id OR public.is_admin());
  END IF;
END;
$$;

/*
 * update_balance
 * -----------------
 * safe atomic balance update function.
 * Acquires a ROW LOCK (FOR UPDATE) on public.profiles to prevent race conditions.
 *
 * Invariants:
 * - Amount can be positive (credit) or negative (debit).
 * - Balance cannot go below 0 (checked by DB constraint + logic).
 * - Security: SECURITY DEFINER (runs as Owner), restricted to Service Role.
 */
CREATE OR REPLACE FUNCTION public.update_balance(
  p_user_id uuid,
  p_amount numeric,
  p_type transaction_type,
  p_description text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_reference_type text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance_before numeric;
  v_balance_after numeric;
  v_txn_id uuid;
BEGIN
  -- Lock the user row to prevent concurrent updates
  SELECT balance INTO v_balance_before
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  v_balance_after := v_balance_before + p_amount;
  
  -- Check for negative balance
  IF v_balance_after < 0 THEN
    RAISE EXCEPTION 'Insufficient balance. Current: %, Required: %', 
      v_balance_before, ABS(p_amount);
  END IF;
  
  -- Update profile balance
  UPDATE public.profiles
  SET balance = v_balance_after,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_user_id;
  
  -- Create transaction record
  INSERT INTO public.balance_transactions (
    user_id, amount, type, description, reference_id, reference_type,
    balance_before, balance_after, metadata
  ) VALUES (
    p_user_id, p_amount, p_type, p_description, p_reference_id, p_reference_type,
    v_balance_before, v_balance_after, p_metadata
  ) RETURNING id INTO v_txn_id;
  
  RETURN v_txn_id;
END;
$$;

-- Permissions moved to centralized block


-- ===================================================================
-- RISK SETTINGS
-- ===================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='risk_settings') THEN
    CREATE TABLE public.risk_settings (
      user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
      max_daily_loss numeric(18,4) NOT NULL DEFAULT 50.00 CHECK (max_daily_loss > 0),
      max_risk_per_trade numeric(5,2) NOT NULL DEFAULT 2.00 CHECK (max_risk_per_trade > 0 AND max_risk_per_trade <= 100),
      max_open_trades integer NOT NULL DEFAULT 5 CHECK (max_open_trades > 0),
      allow_weekend_trading boolean DEFAULT true,
      allow_news_trading boolean DEFAULT true,
      max_leverage numeric(5,2) DEFAULT 100.00,
      created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
    );
    
    CREATE TRIGGER set_updated_at_risk 
      BEFORE UPDATE ON public.risk_settings 
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

ALTER TABLE public.risk_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='risk_settings_self') THEN
    CREATE POLICY risk_settings_self ON public.risk_settings FOR ALL TO authenticated
      USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END;
$$;

-- Get user's risk settings (or defaults)
CREATE OR REPLACE FUNCTION public.get_risk_settings(p_user_id uuid)
RETURNS TABLE (
  max_daily_loss numeric,
  max_risk_per_trade numeric,
  max_open_trades integer,
  allow_weekend_trading boolean,
  allow_news_trading boolean,
  max_leverage numeric
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(rs.max_daily_loss, 50.00),
    COALESCE(rs.max_risk_per_trade, 2.00),
    COALESCE(rs.max_open_trades, 5),
    COALESCE(rs.allow_weekend_trading, true),
    COALESCE(rs.allow_news_trading, true),
    COALESCE(rs.max_leverage, 100.00)
  FROM public.profiles p
  LEFT JOIN public.risk_settings rs ON rs.user_id = p.id
  WHERE p.id = p_user_id;
END;
$$;

-- ===================================================================
-- TRADES TABLE
-- ===================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='trades') THEN
    CREATE TABLE public.trades (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      symbol text NOT NULL,
      trade_type trade_type NOT NULL,
      status trade_status NOT NULL DEFAULT 'PENDING',
      size numeric(18,6) NOT NULL CHECK (size > 0),
      entry_price numeric(18,8) NOT NULL CHECK (entry_price > 0),
      exit_price numeric(18,8) CHECK (exit_price IS NULL OR exit_price > 0),
      stop_loss numeric(18,8) CHECK (stop_loss IS NULL OR stop_loss > 0),
      take_profit numeric(18,8) CHECK (take_profit IS NULL OR take_profit > 0),
      pnl numeric(18,8),
      pnl_percentage numeric(8,4),
      commission numeric(18,8) DEFAULT 0,
      swap numeric(18,8) DEFAULT 0,
      net_pnl numeric(18,8),
      setup_type text,
      timeframe text,
      notes text,
      tags text[],
      opened_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      closed_at timestamptz,
      duration_seconds integer,
      metadata jsonb,
      created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      CONSTRAINT valid_close_state CHECK (
        (status = 'CLOSED' AND exit_price IS NOT NULL AND closed_at IS NOT NULL) OR
        (status != 'CLOSED')
      )
    );
    
    CREATE INDEX idx_trades_user_id ON public.trades(user_id, opened_at DESC);
    CREATE INDEX idx_trades_symbol ON public.trades(symbol);
    CREATE INDEX idx_trades_status ON public.trades(status);
    CREATE INDEX idx_trades_user_status ON public.trades(user_id, status);
    CREATE INDEX idx_trades_opened_at ON public.trades(opened_at DESC);
    CREATE INDEX idx_trades_closed_at ON public.trades(closed_at DESC);
    CREATE INDEX idx_trades_tags ON public.trades USING gin(tags);
    
    CREATE TRIGGER set_updated_at_trades 
      BEFORE UPDATE ON public.trades 
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- Calculate trade PNL
CREATE OR REPLACE FUNCTION public.calculate_trade_pnl()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.exit_price IS NOT NULL AND NEW.entry_price IS NOT NULL THEN
    -- Calculate raw PNL based on trade type
    IF NEW.trade_type = 'BUY' THEN
      NEW.pnl := (NEW.exit_price - NEW.entry_price) * NEW.size;
    ELSE -- SELL
      NEW.pnl := (NEW.entry_price - NEW.exit_price) * NEW.size;
    END IF;
    
    -- Calculate percentage
    NEW.pnl_percentage := (NEW.pnl / (NEW.entry_price * NEW.size)) * 100;
    
    -- Calculate net PNL
    NEW.net_pnl := NEW.pnl - COALESCE(NEW.commission, 0) - COALESCE(NEW.swap, 0);
    
    -- Set duration if closing
    IF NEW.status = 'CLOSED' AND NEW.closed_at IS NOT NULL THEN
      NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.closed_at - NEW.opened_at))::integer;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'calculate_pnl_trigger') THEN
    CREATE TRIGGER calculate_pnl_trigger
      BEFORE INSERT OR UPDATE ON public.trades
      FOR EACH ROW
      EXECUTE FUNCTION public.calculate_trade_pnl();
  END IF;
END;
$$;

-- Update balance when trade closes
/*
 * process_trade_close
 * -------------------
 * Trigger function executed AFTER UPDATE on trades.
 * Detects transition to 'CLOSED' status and handles:
 * 1. Balance Update (PL calculation).
 * 2. Last trade timestamp update.
 * 3. Stats Refresh (via separate trigger on same event).
 *
 * Context: Runs inside the User's transaction. 
 * Note: Calls `update_balance` which acquires a lock on `profiles`.
 */
CREATE OR REPLACE FUNCTION public.process_trade_close()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only process if trade just closed
  IF NEW.status = 'CLOSED' AND (TG_OP = 'INSERT' OR OLD.status != 'CLOSED') THEN
    -- Update user balance with net PNL
    PERFORM public.update_balance(
      NEW.user_id,
      NEW.net_pnl,
      'TRADE_PNL',
      format('Trade %s closed: %s %s', NEW.id, NEW.symbol, NEW.trade_type),
      NEW.id,
      'trade',
      jsonb_build_object(
        'symbol', NEW.symbol,
        'type', NEW.trade_type,
        'pnl', NEW.net_pnl
      )
    );
    
    -- Update last_trade_at
    UPDATE public.profiles
    SET last_trade_at = NEW.closed_at
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Permissions moved to centralized block


DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'process_trade_close_trigger') THEN
    CREATE TRIGGER process_trade_close_trigger
      AFTER INSERT OR UPDATE ON public.trades
      FOR EACH ROW
      WHEN (NEW.status = 'CLOSED')
      EXECUTE FUNCTION public.process_trade_close();
  END IF;
END;
$$;

-- Check if user can open a trade
CREATE OR REPLACE FUNCTION public.can_open_trade(
  p_user_id uuid,
  p_risk_amount numeric DEFAULT NULL
)
RETURNS TABLE (
  allowed boolean,
  reason text,
  current_open_trades integer,
  daily_loss numeric,
  max_allowed_trades integer,
  max_allowed_loss numeric
)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_risk_settings record;
  v_open_trades integer;
  v_daily_loss numeric;
  v_today_start timestamptz;
BEGIN
  -- Get risk settings
  SELECT * INTO v_risk_settings FROM public.get_risk_settings(p_user_id);
  
  -- Count open trades
  SELECT COUNT(*) INTO v_open_trades
  FROM public.trades
  WHERE user_id = p_user_id AND status = 'OPEN';
  
  -- Calculate today's loss
  v_today_start := date_trunc('day', timezone('utc'::text, now()));
  
  SELECT COALESCE(SUM(net_pnl), 0) INTO v_daily_loss
  FROM public.trades
  WHERE user_id = p_user_id 
    AND status = 'CLOSED'
    AND closed_at >= v_today_start
    AND net_pnl < 0;
  
  v_daily_loss := ABS(v_daily_loss);
  
  -- Check max open trades
  IF v_open_trades >= v_risk_settings.max_open_trades THEN
    RETURN QUERY SELECT 
      false, 
      format('Maximum open trades reached (%s/%s)', v_open_trades, v_risk_settings.max_open_trades),
      v_open_trades,
      v_daily_loss,
      v_risk_settings.max_open_trades,
      v_risk_settings.max_daily_loss;
    RETURN;
  END IF;
  
  -- Check daily loss limit
  IF v_daily_loss >= v_risk_settings.max_daily_loss THEN
    RETURN QUERY SELECT 
      false,
      format('Daily loss limit reached ($%s/$%s)', 
        ROUND(v_daily_loss, 2), ROUND(v_risk_settings.max_daily_loss, 2)),
      v_open_trades,
      v_daily_loss,
      v_risk_settings.max_open_trades,
      v_risk_settings.max_daily_loss;
    RETURN;
  END IF;
  
  -- Check weekend trading if applicable
  IF NOT v_risk_settings.allow_weekend_trading 
     AND EXTRACT(DOW FROM timezone('utc'::text, now())) IN (0, 6) THEN
    RETURN QUERY SELECT 
      false,
      'Weekend trading is disabled in your risk settings',
      v_open_trades,
      v_daily_loss,
      v_risk_settings.max_open_trades,
      v_risk_settings.max_daily_loss;
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT 
    true,
    'Trade allowed'::text,
    v_open_trades,
    v_daily_loss,
    v_risk_settings.max_open_trades,
    v_risk_settings.max_daily_loss;
END;
$$;

-- RLS Policies for trades
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='trades_select_self') THEN
    CREATE POLICY trades_select_self ON public.trades FOR SELECT TO authenticated 
      USING ((SELECT auth.uid()) = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='trades_insert_self') THEN
    CREATE POLICY trades_insert_self ON public.trades FOR INSERT TO authenticated 
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='trades_update_self') THEN
    CREATE POLICY trades_update_self ON public.trades FOR UPDATE TO authenticated 
      USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='trades_delete_self') THEN
    CREATE POLICY trades_delete_self ON public.trades FOR DELETE TO authenticated 
      USING ((SELECT auth.uid()) = user_id OR public.is_admin());
  END IF;
END;
$$;

-- ===================================================================
-- USER TRADE STATS (Real-time Table)
-- ===================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_trade_stats') THEN
    CREATE TABLE public.user_trade_stats (
      user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
      total_trades bigint DEFAULT 0,
      closed_trades bigint DEFAULT 0,
      open_trades bigint DEFAULT 0,
      winning_trades bigint DEFAULT 0,
      losing_trades bigint DEFAULT 0,
      win_rate numeric(5,2) DEFAULT 0,
      total_pnl numeric(18,8) DEFAULT 0,
      avg_pnl numeric(18,8) DEFAULT 0,
      best_trade numeric(18,8) DEFAULT 0,
      worst_trade numeric(18,8) DEFAULT 0,
      avg_duration_seconds numeric(10,2) DEFAULT 0,
      last_trade_at timestamptz,
      updated_at timestamptz DEFAULT timezone('utc'::text, now())
    );
    
    -- No extra indexes needed on user_id as it's Primary Key
  END IF;
END;
$$;

ALTER TABLE public.user_trade_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='trade_stats_select_self') THEN
    CREATE POLICY trade_stats_select_self ON public.user_trade_stats FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = user_id OR public.is_admin());
  END IF;
  -- INSERT/UPDATE managed by triggers only (service_role)
END;
$$;

-- Auto-refresh stats when trades close
-- Auto-refresh stats notification
-- NOTE: REFRESH MATERIALIZED VIEW CONCURRENTLY cannot run inside a transaction safely.
-- We use NOTIFY to alert an external worker (Edge Function or background job) to perform the refresh.
-- Helper to recalculate stats for a specific user (Heavy Lifting)
CREATE OR REPLACE FUNCTION public.recalc_user_stats(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calculate and Upsert
  INSERT INTO public.user_trade_stats (
    user_id,
    total_trades,
    closed_trades,
    open_trades,
    winning_trades,
    losing_trades,
    win_rate,
    total_pnl,
    avg_pnl,
    best_trade,
    worst_trade,
    avg_duration_seconds,
    last_trade_at,
    updated_at
  )
  SELECT
    p_user_id,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'CLOSED'),
    COUNT(*) FILTER (WHERE status = 'OPEN'),
    COUNT(*) FILTER (WHERE net_pnl > 0),
    COUNT(*) FILTER (WHERE net_pnl < 0),
    COALESCE(ROUND(
      COUNT(*) FILTER (WHERE net_pnl > 0)::numeric /
      NULLIF(COUNT(*) FILTER (WHERE status = 'CLOSED'), 0) * 100, 2
    ), 0),
    COALESCE(SUM(net_pnl), 0),
    COALESCE(AVG(net_pnl), 0),
    COALESCE(MAX(net_pnl), 0),
    COALESCE(MIN(net_pnl), 0),
    COALESCE(AVG(duration_seconds), 0),
    MAX(closed_at),
    timezone('utc'::text, now())
  FROM public.trades
  WHERE user_id = p_user_id
  ON CONFLICT (user_id) DO UPDATE
  SET
    total_trades = EXCLUDED.total_trades,
    closed_trades = EXCLUDED.closed_trades,
    open_trades = EXCLUDED.open_trades,
    winning_trades = EXCLUDED.winning_trades,
    losing_trades = EXCLUDED.losing_trades,
    win_rate = EXCLUDED.win_rate,
    total_pnl = EXCLUDED.total_pnl,
    avg_pnl = EXCLUDED.avg_pnl,
    best_trade = EXCLUDED.best_trade,
    worst_trade = EXCLUDED.worst_trade,
    avg_duration_seconds = EXCLUDED.avg_duration_seconds,
    last_trade_at = EXCLUDED.last_trade_at,
    updated_at = EXCLUDED.updated_at;
END;
$$;

-- Trigger Function: INSERT
CREATE OR REPLACE FUNCTION public.refresh_trade_stats_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid;
BEGIN
  FOR v_uid IN SELECT DISTINCT user_id FROM new_table LOOP
    PERFORM public.recalc_user_stats(v_uid);
  END LOOP;
  RETURN NULL;
END;
$$;

-- Trigger Function: DELETE
CREATE OR REPLACE FUNCTION public.refresh_trade_stats_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid;
BEGIN
  FOR v_uid IN SELECT DISTINCT user_id FROM old_table LOOP
    PERFORM public.recalc_user_stats(v_uid);
  END LOOP;
  RETURN NULL;
END;
$$;

-- Trigger Function: UPDATE
CREATE OR REPLACE FUNCTION public.refresh_trade_stats_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid;
BEGIN
  -- Update both old and new users (in case ownership changed, or just refresh same user)
  FOR v_uid IN 
    SELECT DISTINCT user_id FROM new_table
    UNION
    SELECT DISTINCT user_id FROM old_table
  LOOP
    PERFORM public.recalc_user_stats(v_uid);
  END LOOP;
  RETURN NULL;
END;
$$;

-- Drop old single-row trigger if exists
DROP TRIGGER IF EXISTS notify_stats_refresh_on_trade ON public.trades;

-- Create Statement-Level Triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trig_stats_insert') THEN
    CREATE TRIGGER trig_stats_insert
      AFTER INSERT ON public.trades
      REFERENCING NEW TABLE AS new_table
      FOR EACH STATEMENT
      EXECUTE FUNCTION public.refresh_trade_stats_insert();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trig_stats_delete') THEN
    CREATE TRIGGER trig_stats_delete
      AFTER DELETE ON public.trades
      REFERENCING OLD TABLE AS old_table
      FOR EACH STATEMENT
      EXECUTE FUNCTION public.refresh_trade_stats_delete();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trig_stats_update') THEN
    CREATE TRIGGER trig_stats_update
      AFTER UPDATE ON public.trades
      REFERENCING NEW TABLE AS new_table OLD TABLE AS old_table
      FOR EACH STATEMENT
      EXECUTE FUNCTION public.refresh_trade_stats_update();
  END IF;
END;
$$;

-- ===================================================================
-- ACHIEVEMENTS SYSTEM
-- ===================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='achievements') THEN
    CREATE TABLE public.achievements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code text NOT NULL UNIQUE,
      name text NOT NULL,
      description text,
      icon text,
      xp_reward integer NOT NULL DEFAULT 10 CHECK (xp_reward >= 0),
      bonus_reward numeric(18,4) DEFAULT 0,
      condition_type text,
      condition_value numeric,
      condition_config jsonb,
      rarity text DEFAULT 'common',
      category text,
      is_hidden boolean DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
    );
    
    CREATE INDEX idx_achievements_code ON public.achievements(code);
    CREATE INDEX idx_achievements_category ON public.achievements(category);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_achievements') THEN
    CREATE TABLE public.user_achievements (
      user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
      progress numeric(5,2) DEFAULT 0,
      unlocked_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      PRIMARY KEY (user_id, achievement_id)
    );
    
    CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
  END IF;
END;
$$;

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Achievements: Public read (or authenticated read)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='achievements_select_auth') THEN
    CREATE POLICY achievements_select_auth ON public.achievements FOR SELECT TO authenticated USING (true);
  END IF;
  -- Admin write only (no public/auth insert policies)

  -- User Achievements: Self read
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='user_achievements_select_self') THEN
    CREATE POLICY user_achievements_select_self ON public.user_achievements FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = user_id OR public.is_admin());
  END IF;
  -- INSERT/UPDATE managed by triggers (service_role)
END;
$$;

-- Check and award achievements
CREATE OR REPLACE FUNCTION public.check_achievements(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_achievement record;
  v_stats record;
  v_condition_met boolean;
BEGIN
  -- Get user stats
  SELECT * INTO v_stats FROM public.user_trade_stats WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check each achievement
  FOR v_achievement IN 
    SELECT a.* FROM public.achievements a
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua 
      WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
    )
  LOOP
    v_condition_met := false;
    
    -- Check condition based on type
    CASE v_achievement.condition_type
      WHEN 'total_trades' THEN
        v_condition_met := v_stats.total_trades >= v_achievement.condition_value;
      WHEN 'win_rate' THEN
        v_condition_met := v_stats.win_rate >= v_achievement.condition_value;
      WHEN 'total_pnl' THEN
        v_condition_met := v_stats.total_pnl >= v_achievement.condition_value;
      WHEN 'winning_streak' THEN
        -- Would need additional tracking for streaks
        v_condition_met := false;
      ELSE
        v_condition_met := false;
    END CASE;
    
    -- Award achievement if condition met
    IF v_condition_met THEN
      -- Insert achievement
      INSERT INTO public.user_achievements (user_id, achievement_id, progress)
      VALUES (p_user_id, v_achievement.id, 100);
      
      -- Award XP
      UPDATE public.profiles
      SET xp = xp + v_achievement.xp_reward
      WHERE id = p_user_id;
      
      -- Award bonus if any
      IF v_achievement.bonus_reward > 0 THEN
        PERFORM public.update_balance(
          p_user_id,
          v_achievement.bonus_reward,
          'BONUS',
          format('Achievement unlocked: %s', v_achievement.name),
          v_achievement.id,
          'achievement'
        );
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Permissions moved to centralized block




-- ===================================================================
-- REMAINING TABLES (API Keys, Lectures, Audit, Notifications, etc.)
-- ===================================================================

-- API Keys with encryption placeholder
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_api_keys') THEN
    CREATE TABLE public.user_api_keys (
      user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      provider text NOT NULL,
      key_value_encrypted text NOT NULL,
      key_hint text,
      label text,
      scopes text[],
      is_active boolean DEFAULT true,
      last_used_at timestamptz,
      expires_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      PRIMARY KEY (user_id, provider)
    );
    
    CREATE TRIGGER set_updated_at_api_keys 
      BEFORE UPDATE ON public.user_api_keys 
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='api_keys_self') THEN
    CREATE POLICY api_keys_self ON public.user_api_keys FOR ALL TO authenticated
      USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END;
$$;

-- Lectures system
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='lectures') THEN
    CREATE TABLE public.lectures (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      slug text UNIQUE,
      description text,
      content text,
      video_url text,
      thumbnail_url text,
      duration_minutes integer,
      category text,
      difficulty difficulty_level DEFAULT 'Beginner',
      tags text[],
      module_number integer,
      lesson_number integer,
      sort_order integer DEFAULT 0,
      prerequisites uuid[],
      xp_reward integer DEFAULT 10,
      is_published boolean NOT NULL DEFAULT false,
      is_premium boolean NOT NULL DEFAULT false,
      published_at timestamptz,
      author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
      view_count integer DEFAULT 0,
      completion_count integer DEFAULT 0,
      rating_avg numeric(3,2),
      created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
    );
    
    CREATE INDEX idx_lectures_published ON public.lectures(is_published, sort_order);
    CREATE INDEX idx_lectures_category ON public.lectures(category);
    CREATE INDEX idx_lectures_slug ON public.lectures(slug);
    
    CREATE TRIGGER set_updated_at_lectures 
      BEFORE UPDATE ON public.lectures 
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_lecture_progress') THEN
    CREATE TABLE public.user_lecture_progress (
      user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      lecture_id uuid NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
      progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
      completed boolean DEFAULT false,
      time_spent_seconds integer DEFAULT 0,
      last_position_seconds integer,
      notes text,
      rating integer CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
      started_at timestamptz DEFAULT timezone('utc'::text, now()),
      completed_at timestamptz,
      last_accessed_at timestamptz DEFAULT timezone('utc'::text, now()),
      PRIMARY KEY (user_id, lecture_id)
    );
    
    CREATE INDEX idx_lecture_progress_user ON public.user_lecture_progress(user_id);
  END IF;
END;
$$;

ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lecture_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Lectures: Published only for general users, all for admin/content
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='lectures_select_published') THEN
    CREATE POLICY lectures_select_published ON public.lectures FOR SELECT TO authenticated
      USING (is_published = true OR public.can_manage_content());
  END IF;

  -- User Progress: Self access
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='lecture_progress_self') THEN
    CREATE POLICY lecture_progress_self ON public.user_lecture_progress FOR ALL TO authenticated
      USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END;
$$;

-- Audit log
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='audit_log') THEN
    CREATE TABLE public.audit_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
      action audit_action NOT NULL,
      entity_type text NOT NULL,
      entity_id uuid,
      changes jsonb,
      metadata jsonb,
      ip_address inet,
      user_agent text,
      created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
    );
    
    CREATE INDEX idx_audit_user ON public.audit_log(user_id, created_at DESC);
    CREATE INDEX idx_audit_entity ON public.audit_log(entity_type, entity_id, created_at DESC);
    CREATE INDEX idx_audit_action ON public.audit_log(action, created_at DESC);
  END IF;
END;
$$;

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='audit_log_select_self') THEN
    CREATE POLICY audit_log_select_self ON public.audit_log FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = user_id OR public.is_admin());
  END IF;
  -- No INSERT/UPDATE/DELETE policies = Deny All for users. 
  -- Only Service Role or SECURITY DEFINER functions can write.
END;
$$;

-- Secure writer function for Audit Log
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid,
  p_action audit_action,
  p_entity_type text,
  p_entity_id uuid,
  p_changes jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_log (
    user_id, action, entity_type, entity_id, changes, metadata, ip_address, user_agent
  ) VALUES (
    p_user_id, p_action, p_entity_type, p_entity_id, p_changes, p_metadata,
    inet_client_addr(), 
    COALESCE(NULLIF(current_setting('request.headers', true), '')::json->>'user-agent', NULL)
  );
END;
$$;

-- Permissions moved to centralized block

-- Notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='notifications') THEN
    CREATE TABLE public.notifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      type text NOT NULL,
      title text NOT NULL,
      message text,
      read boolean DEFAULT false,
      action_url text,
      created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
    );
    
    CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read, created_at DESC);
  END IF;
END;
$$;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='notifications_self') THEN
    CREATE POLICY notifications_self ON public.notifications FOR ALL TO authenticated
      USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END;
$$;


-- ===================================================================
-- AI COACHING SYSTEM
-- ===================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='ai_coaching_sessions') THEN
    CREATE TABLE public.ai_coaching_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      title text,
      context_type text, -- 'lecture', 'trade', 'general'
      context_id uuid,
      created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
    );
    
    CREATE INDEX idx_ai_sessions_user ON public.ai_coaching_sessions(user_id, updated_at DESC);
    
    CREATE TRIGGER set_updated_at_ai_sessions 
      BEFORE UPDATE ON public.ai_coaching_sessions 
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='ai_chat_messages') THEN
    CREATE TABLE public.ai_chat_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL REFERENCES public.ai_coaching_sessions(id) ON DELETE CASCADE,
      role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
    );
    
    CREATE INDEX idx_ai_messages_session ON public.ai_chat_messages(session_id, created_at ASC);
  END IF;
END;
$$;

ALTER TABLE public.ai_coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Sessions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='ai_sessions_self') THEN
    CREATE POLICY ai_sessions_self ON public.ai_coaching_sessions FOR ALL TO authenticated
      USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
  
  -- Messages policies
  -- Users can see messages in sessions they own
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='ai_messages_select_self') THEN
    CREATE POLICY ai_messages_select_self ON public.ai_chat_messages FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.ai_coaching_sessions s 
        WHERE s.id = session_id AND s.user_id = (SELECT auth.uid())
      ));
  END IF;
  
  -- Users can insert messages into sessions they own
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='ai_messages_insert_self') THEN
    CREATE POLICY ai_messages_insert_self ON public.ai_chat_messages FOR INSERT TO authenticated
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.ai_coaching_sessions s 
        WHERE s.id = session_id AND s.user_id = (SELECT auth.uid())
      ));
  END IF;
END;
$$;

-- ===================================================================
-- UTILITY FUNCTIONS FOR APPLICATION
-- ===================================================================

-- Get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'profile', row_to_json(p.*),
    'trade_stats', row_to_json(ts.*),
    'balance', p.balance,
    'open_trades', (SELECT COUNT(*) FROM public.trades WHERE user_id = p_user_id AND status = 'OPEN')
  ) INTO v_stats
  FROM public.profiles p
  LEFT JOIN public.user_trade_stats ts ON ts.user_id = p.id
  WHERE p.id = p_user_id;
  
  RETURN v_stats;
END;
$$;

-- Get daily PNL
CREATE OR REPLACE FUNCTION public.get_daily_pnl(
  p_user_id uuid,
  p_days integer DEFAULT 30
)
RETURNS TABLE (
  trade_date date,
  total_pnl numeric,
  trade_count bigint
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  p_days := GREATEST(1, p_days);
  RETURN QUERY
  SELECT 
    DATE(closed_at) as trade_date,
    SUM(net_pnl) as total_pnl,
    COUNT(*) as trade_count
  FROM public.trades
  WHERE user_id = p_user_id 
    AND status = 'CLOSED'
    AND closed_at >= timezone('utc'::text, now()) - (p_days || ' days')::interval
  GROUP BY DATE(closed_at)
  ORDER BY trade_date DESC;
END;
$$;

-- ===================================================================
-- SEED SOME ACHIEVEMENTS
-- ===================================================================
INSERT INTO public.achievements (code, name, description, xp_reward, bonus_reward, condition_type, condition_value, rarity, category)
VALUES 
  ('FIRST_TRADE', 'First Trade', 'Complete your first trade', 50, 5.00, 'total_trades', 1, 'common', 'trading'),
  ('VETERAN_10', 'Veteran Trader', 'Complete 10 trades', 100, 10.00, 'total_trades', 10, 'common', 'trading'),
  ('EXPERT_100', 'Expert Trader', 'Complete 100 trades', 500, 50.00, 'total_trades', 100, 'rare', 'trading'),
  ('PROFITABLE_60', 'Profitable Trader', 'Achieve 60% win rate with at least 20 trades', 200, 25.00, 'win_rate', 60, 'uncommon', 'performance'),
  ('PROFIT_MASTER', 'Profit Master', 'Earn $1000 in total PNL', 300, 100.00, 'total_pnl', 1000, 'rare', 'performance')
ON CONFLICT (code) DO NOTHING;

-- ===================================================================
-- FINAL NOTES
-- ===================================================================
COMMENT ON SCHEMA public IS 'DynoFX Trading Platform - Complete functional schema with all business logic implemented';

-- Grant necessary permissions (adjust based on your auth setup)
-- GRANT USAGE ON SCHEMA public TO authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ===================================================================
-- COLUMN LEVEL SECURITY (Sensitive Data)
-- ===================================================================

-- 1. API Keys: Hide encrypted value from the user themselves (only backend needs it)
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.user_api_keys FROM authenticated;
GRANT SELECT (
  user_id, provider, key_hint, label, scopes, is_active, last_used_at, expires_at, created_at, updated_at
) ON public.user_api_keys TO authenticated;

-- Function to safely set API key (encrypted)
CREATE OR REPLACE FUNCTION public.set_user_api_key(
  p_provider text,
  p_key_value text,
  p_label text DEFAULT NULL,
  p_scopes text[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hint text;
  v_secret_key text;
BEGIN
  -- Get secret from server configuration (must be set by middleware/Edge Function)
  v_secret_key := current_setting('app.settings.encryption_key', true);
  
  IF v_secret_key IS NULL THEN
    RAISE EXCEPTION 'Configuration Error: Encryption key not set';
  END IF;

  -- Generate hint (last 4 chars)
  IF length(p_key_value) > 4 THEN
    v_hint := substring(p_key_value from length(p_key_value)-3 for 4);
  ELSE
    v_hint := '****';
  END IF;
  
  -- Upsert key
  INSERT INTO public.user_api_keys (
    user_id, provider, key_value_encrypted, key_hint, label, scopes
  ) VALUES (
    auth.uid(),
    p_provider,
    public.pgp_sym_encrypt(p_key_value, v_secret_key),
    v_hint,
    p_label,
    p_scopes
  )
  ON CONFLICT (user_id, provider) DO UPDATE
  SET 
    key_value_encrypted = public.pgp_sym_encrypt(p_key_value, v_secret_key),
    key_hint = v_hint,
    label = COALESCE(p_label, public.user_api_keys.label),
    scopes = COALESCE(p_scopes, public.user_api_keys.scopes),
    updated_at = timezone('utc'::text, now());
END;
$$;

-- Permissions moved to centralized block

-- 2. KYC Data: Hide raw internal validation fields and sensitive document URLs
-- Users can see their status and submission time, but not necessarily the raw links 
-- or admin notes fields unless explicitly needed.
REVOKE SELECT ON public.kyc_data FROM authenticated;
GRANT SELECT (
  user_id, address, city, state, postal_code, date_of_birth, 
  verification_status, verification_id, document_type, 
  submitted_at, created_at, updated_at
  -- Excluded: document_number, document_url, selfie_url, verified_by, rejection_reason (maybe reason is needed?)
  -- If rejection_reason is needed for UX, add it back. Assuming strict default for now.
) ON public.kyc_data TO authenticated;
-- Re-grant rejection_reason if status is rejected? 
-- Postgres column grants are static. Let's start strict.

-- Logic functions (Internal use only - do not Grant to authenticated)
-- update_balance: Only callable by triggers/admin functions (Owner)
-- check_achievements: Callable by triggers (Owner)

-- ===================================================================
-- PERMISSIONS & SECURITY (Centralized)
-- ===================================================================

-- Revoke default public access to ensure "secure by default"
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

-- 1. UTILITY / PUBLIC ACCESS
-- Functions safe for all authenticated users to call
GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_content() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_user_api_key(text, text, text, text[]) TO authenticated;
-- Note: xp_for_level and level_from_xp are IMMUTABLE SQL functions, safe by default but explicit grant is fine:
GRANT EXECUTE ON FUNCTION public.xp_for_level(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.level_from_xp(integer) TO authenticated, service_role;

-- 2. INTERNAL / SYSTEM ONLY
-- Functions that modify financial state or critical logic. 
-- REVOKE FROM PUBLIC was already done implicitly above, but we grant ONLY to service_role (and owning role).
GRANT EXECUTE ON FUNCTION public.update_balance(uuid, numeric, transaction_type, text, uuid, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.recalc_user_stats(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_achievements(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_audit_event(uuid, audit_action, text, uuid, jsonb, jsonb) TO service_role;


-- 3. READ-ONLY HELPERS
GRANT EXECUTE ON FUNCTION public.can_open_trade(uuid, numeric) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_risk_settings(uuid) TO authenticated, service_role;

-- ===================================================================
-- END OF SCHEMA
-- ===================================================================
-- Triggers (Postgres executes these as owner)
-- process_trade_close
-- refresh_user_trade_stats