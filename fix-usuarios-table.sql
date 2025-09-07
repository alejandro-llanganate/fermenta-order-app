-- Script para corregir la tabla usuarios y sus políticas de RLS
-- Este script debe ejecutarse en la base de datos de Supabase

-- 1. Crear la tabla usuarios si no existe
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Administrador', 'Auxiliar', 'Secretaria')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_usuarios_cedula ON usuarios(cedula);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_active ON usuarios(is_active);
CREATE INDEX IF NOT EXISTS idx_usuarios_user_number ON usuarios(user_number);

-- 3. Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas existentes si existen (para evitar conflictos)
DROP POLICY IF EXISTS "Anyone can read active usuarios" ON usuarios;
DROP POLICY IF EXISTS "Authenticated users can manage usuarios" ON usuarios;

-- 5. Crear nuevas políticas de RLS
CREATE POLICY "Anyone can read active usuarios" ON usuarios
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage usuarios" ON usuarios
  FOR ALL USING (auth.role() = 'authenticated');

-- 6. Crear trigger para updated_at si no existe
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Otorgar permisos
GRANT ALL ON usuarios TO authenticated;

-- 8. Verificar que las políticas estén funcionando
-- Esta consulta debería mostrar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuarios';

-- 9. Insertar usuarios de ejemplo si no existen
INSERT INTO usuarios (user_number, first_name, last_name, email, cedula, role, is_active) VALUES
  ('USR001', 'María', 'González', 'maria.gonzalez@example.com', '1234567890', 'Secretaria', true),
  ('USR002', 'Juan', 'Pérez', 'juan.perez@example.com', '0987654321', 'Auxiliar', true),
  ('USR003', 'Ana', 'Martínez', 'ana.martinez@example.com', '1122334455', 'Secretaria', true),
  ('USR004', 'Carlos', 'López', 'carlos.lopez@example.com', '5566778899', 'Auxiliar', true)
ON CONFLICT (email) DO NOTHING;

-- 10. Verificar que los datos se insertaron correctamente
SELECT id, user_number, first_name, last_name, email, cedula, role, is_active 
FROM usuarios 
ORDER BY created_at;
