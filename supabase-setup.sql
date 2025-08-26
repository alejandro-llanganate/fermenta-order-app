-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create register_users table for custom authentication
CREATE TABLE IF NOT EXISTS register_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(20) DEFAULT 'register' NOT NULL,
  role VARCHAR(20) DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_register_users_username ON register_users(username);
CREATE INDEX IF NOT EXISTS idx_register_users_cedula ON register_users(cedula);
CREATE INDEX IF NOT EXISTS idx_register_users_email ON register_users(email);
CREATE INDEX IF NOT EXISTS idx_register_users_type ON register_users(type);
CREATE INDEX IF NOT EXISTS idx_register_users_role ON register_users(role);

-- Enable Row Level Security (RLS)
ALTER TABLE register_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own data
CREATE POLICY "Users can read their own data" ON register_users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Create policy to allow admins to read all data
CREATE POLICY "Admins can read all data" ON register_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM register_users 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Create policy to allow insert for new users
CREATE POLICY "Allow insert for new users" ON register_users
  FOR INSERT WITH CHECK (true);

-- Create policy to allow admins to update any user
CREATE POLICY "Admins can update any user" ON register_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM register_users 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

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

-- Insert sample users for testing (replace with actual data)
INSERT INTO register_users (username, cedula, email, type, role) VALUES
  ('admin', '1234567890', 'admin@example.com', 'admin', 'admin'),
  ('vendedor1', '0987654321', 'vendedor1@example.com', 'register', 'user'),
  ('vendedor2', '1122334455', 'vendedor2@example.com', 'register', 'user')
ON CONFLICT (email) DO NOTHING;

-- Create a view for easier user management
CREATE OR REPLACE VIEW user_management AS
SELECT 
  id,
  username,
  cedula,
  email,
  type,
  role,
  created_at,
  updated_at
FROM register_users
ORDER BY created_at DESC;

-- Grant necessary permissions
GRANT SELECT ON user_management TO authenticated;
GRANT ALL ON register_users TO authenticated;

