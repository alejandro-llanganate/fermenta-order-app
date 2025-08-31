-- Migration script to add missing columns to clients table
-- Add cedula and email columns to clients table

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS cedula VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_clients_cedula ON clients(cedula);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Add unique constraints if needed (optional)
-- ALTER TABLE clients ADD CONSTRAINT unique_cedula UNIQUE (cedula);
-- ALTER TABLE clients ADD CONSTRAINT unique_email UNIQUE (email);
