-- Eliminar tabla si existe y crear desde cero
DROP TABLE IF EXISTS settings CASCADE;

-- Crear tabla settings para almacenar configuraciones del sistema
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_settings_key ON settings(setting_key);
CREATE INDEX idx_settings_created_at ON settings(created_at);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Eliminar trigger si existe y crear uno nuevo
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- DESHABILITAR COMPLETAMENTE RLS (Row Level Security) - SIN SEGURIDAD
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Otorgar permisos completos a anon y authenticated
GRANT ALL ON settings TO anon, authenticated;
