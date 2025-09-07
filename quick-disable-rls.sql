-- Script rápido para deshabilitar RLS en todas las tablas
-- Ejecuta esto primero para resolver el problema inmediatamente

-- Deshabilitar RLS en todas las tablas
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE register_users DISABLE ROW LEVEL SECURITY;

-- Otorgar permisos completos
GRANT ALL ON usuarios TO anon, authenticated;
GRANT ALL ON orders TO anon, authenticated;
GRANT ALL ON order_items TO anon, authenticated;
GRANT ALL ON clients TO anon, authenticated;
GRANT ALL ON products TO anon, authenticated;
GRANT ALL ON routes TO anon, authenticated;
GRANT ALL ON product_categories TO anon, authenticated;
GRANT ALL ON register_users TO anon, authenticated;

-- Verificar que está deshabilitado
SELECT tablename, rowsecurity as rls_enabled 
FROM pg_tables 
WHERE tablename IN ('usuarios', 'orders', 'order_items', 'clients', 'products', 'routes', 'product_categories', 'register_users');
