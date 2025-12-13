-- ===================================================================
-- SEED DATA FOR DYNOFX VERIFICATION
-- Usage: Run this in the Supabase SQL Editor AFTER applying dynofx_schema.sql
-- ===================================================================

-- 1. Create a fake user for testing (Bypassing Auth for pure DB logic testing)
-- NOTE: In a real scenario, you would sign up via the app. 
-- This section assumes you are running as an admin/postgres role who can bypass FKs or insert into auth.users.
-- If this fails, manually replace '00000000-0000-0000-0000-000000000001' with your real User ID.

DO $$
DECLARE
  v_user_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Attempt to insert into auth.users if it doesn't exist (Only works if you have permissions)
  -- If you are using Supabase, you might not have permission to write to auth.users directly.
  -- In that case, we will insert directly into public.profiles and assume the FK constraint is deferred or we are just testing logic.
  
  -- 1a. Create Auth User (If permissions allow - requires Postgres role)
  -- This sets the password to 'Rach@4806595' using bcrypt
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES (
    v_user_id,
    'rkutalian@gmail.com',
    crypt('Rach@4806595', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Adewunmi Oladele"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  -- 1b. Create Profile
  INSERT INTO public.profiles (id, email, username, full_name, role, status, account_type, balance)
  VALUES (
    v_user_id,
    'rkutalian@gmail.com',
    'Rachamv',
    'Adewunmi Oladele',
    'admin',
    'active',
    'PRO',
    10000.00 -- Admin starting balance
  ) ON CONFLICT (id) DO UPDATE
  SET role = 'admin', username = 'Rachamv', full_name = 'Adewunmi Oladele';

  -- 2. Configure Risk Settings
  INSERT INTO public.risk_settings (user_id, max_daily_loss, max_risk_per_trade, max_open_trades)
  VALUES (v_user_id, 100.00, 5.00, 10)
  ON CONFLICT (user_id) DO UPDATE 
  SET max_daily_loss = 100.00;

  -- 3. Deposit Funds (Test update_balance function)
  PERFORM public.update_balance(
    v_user_id,
    5000.00,
    'DEPOSIT',
    'Initial Funding',
    NULL,
    NULL,
    '{"method": "wire"}'::jsonb
  );

  -- 4. Open a Winning Trade (BUY EURUSD)
  -- Entry: 1.1000, Size: 10000 units (0.1 lot)
  INSERT INTO public.trades (
    id, user_id, symbol, trade_type, status, size, entry_price, setup_type, opened_at
  ) VALUES (
    '11111111-1111-1111-1111-111111111111',
    v_user_id,
    'EURUSD',
    'BUY',
    'OPEN',
    10000,
    1.10000,
    'Trend Following',
    now() - interval '1 hour'
  );

  -- 5. Close the Trade (Test PNL calculation and Trigger)
  -- Exit: 1.1050 (50 pips profit) -> $50 profit
  UPDATE public.trades
  SET status = 'CLOSED',
      exit_price = 1.10500,
      closed_at = now()
  WHERE id = '11111111-1111-1111-1111-111111111111';

  -- 6. Open a Losing Trade (SELL GBPUSD)
  INSERT INTO public.trades (
    id, user_id, symbol, trade_type, status, size, entry_price, exit_price, closed_at
  ) VALUES (
    '22222222-2222-2222-2222-222222222222',
    v_user_id,
    'GBPUSD',
    'SELL',
    'CLOSED',
    10000,
    1.25000,
    1.25200, -- Exit higher on sell = Loss of 20 pips ($20)
    now()
  );

  -- 7. Grant an Achievement manually (to test system)
  -- Usually happens via trigger, let's trigger the check
  PERFORM public.check_achievements(v_user_id);

END $$;
