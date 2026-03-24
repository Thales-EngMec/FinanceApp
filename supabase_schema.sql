-- FinanceApp - Execute no SQL Editor do Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT, nickname TEXT, email TEXT, cpf TEXT, phone TEXT,
  birth_date DATE, occupation TEXT, onboarding_completed BOOLEAN DEFAULT FALSE,
  investor_profile TEXT DEFAULT 'moderate',
  monthly_income NUMERIC DEFAULT 0, monthly_expenses NUMERIC DEFAULT 0,
  goals TEXT[] DEFAULT '{}', interests TEXT[] DEFAULT '{}',
  risk_tolerance INTEGER DEFAULT 5, avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL, category TEXT NOT NULL, description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  is_recurring BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL, amount NUMERIC NOT NULL, category TEXT,
  due_day INTEGER DEFAULT 5, is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL, name TEXT, amount_invested NUMERIC DEFAULT 0,
  quantity NUMERIC DEFAULT 1, purchase_price NUMERIC DEFAULT 0,
  current_price NUMERIC DEFAULT 0, type TEXT DEFAULT 'stock',
  broker TEXT, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, description TEXT, target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0, deadline DATE, category TEXT DEFAULT 'outro',
  emoji TEXT DEFAULT '🎯', is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_policy" ON profiles;
DROP POLICY IF EXISTS "transactions_policy" ON transactions;
DROP POLICY IF EXISTS "recurring_policy" ON recurring_expenses;
DROP POLICY IF EXISTS "investments_policy" ON investments;
DROP POLICY IF EXISTS "goals_policy" ON goals;

CREATE POLICY "profiles_policy" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "transactions_policy" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "recurring_policy" ON recurring_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "investments_policy" ON investments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "goals_policy" ON goals FOR ALL USING (auth.uid() = user_id);

-- Trigger: criar perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_user ON recurring_expenses(user_id);
