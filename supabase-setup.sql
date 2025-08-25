-- Create register_users table for custom authentication
CREATE TABLE IF NOT EXISTS register_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  type VARCHAR(20) DEFAULT 'register' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_register_users_username ON register_users(username);
CREATE INDEX IF NOT EXISTS idx_register_users_cedula ON register_users(cedula);
CREATE INDEX IF NOT EXISTS idx_register_users_type ON register_users(type);

-- Enable Row Level Security (RLS)
ALTER TABLE register_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own data
CREATE POLICY "Users can read their own data" ON register_users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Create policy to allow insert for new users (you might want to restrict this)
CREATE POLICY "Allow insert for new users" ON register_users
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_register_users_updated_at
  BEFORE UPDATE ON register_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample users for testing
INSERT INTO register_users (username, cedula, type) VALUES
  ('admin', '1234567890', 'register'),
  ('vendedor1', '0987654321', 'register'),
  ('vendedor2', '1122334455', 'register')
ON CONFLICT (username, cedula) DO NOTHING;

