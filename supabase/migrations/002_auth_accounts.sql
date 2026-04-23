-- Migration 002: Auth Accounts
CREATE TABLE auth_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_auth_accounts_email ON auth_accounts(email);

ALTER TABLE auth_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only" ON auth_accounts
  USING (false) WITH CHECK (false);

-- Seed data for test users
-- 1. Insert into users table
INSERT INTO users (id, email, full_name, role)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'test@golfdraw.com', 'Test User', 'subscriber'),
  ('f6e5d4c3-b2a1-4d5e-8f9c-0a1b2c3d4e5f', 'admin@golfdraw.com', 'Admin User', 'admin')
ON CONFLICT (email) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 2. Insert into auth_accounts table
INSERT INTO auth_accounts (user_id, email, password_hash)
VALUES 
  ((SELECT id FROM users WHERE email = 'test@golfdraw.com'), 'test@golfdraw.com', '$2b$12$M2mIKk17pZfB9DZKKOb1x.be8TxgH9VPNZ.A502Rdnr6qrTr9Zt/.'),
  ((SELECT id FROM users WHERE email = 'admin@golfdraw.com'), 'admin@golfdraw.com', '$2b$12$Nfu2uY4svj6OcJNtHnOHy.WY6KbC8BOEbu/WK7Umas/ajLHY70csG')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash;
