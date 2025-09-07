-- Script para deshabilitar completamente RLS en todas las tablas
-- Esto permitirá acceso completo sin restricciones de seguridad

-- 1. Deshabilitar RLS en todas las tablas principales
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE register_users DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Anyone can read active usuarios" ON usuarios;
DROP POLICY IF EXISTS "Authenticated users can manage usuarios" ON usuarios;
DROP POLICY IF EXISTS "Users can read their own data" ON register_users;
DROP POLICY IF EXISTS "Admins can read all data" ON register_users;
DROP POLICY IF EXISTS "Allow insert for new users" ON register_users;
DROP POLICY IF EXISTS "Admins can update any user" ON register_users;
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON orders;
DROP POLICY IF EXISTS "Anyone can read order items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can manage order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can read active clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can manage clients" ON clients;
DROP POLICY IF EXISTS "Anyone can read active products" ON products;
DROP POLICY IF EXISTS "Admins can manage all products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
DROP POLICY IF EXISTS "Anyone can read active routes" ON routes;
DROP POLICY IF EXISTS "Authenticated users can manage routes" ON routes;
DROP POLICY IF EXISTS "Anyone can read active categories" ON product_categories;
DROP POLICY IF EXISTS "Admins can manage all categories" ON product_categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON product_categories;

-- 3. Otorgar permisos completos a todos los roles
GRANT ALL ON usuarios TO anon, authenticated;
GRANT ALL ON orders TO anon, authenticated;
GRANT ALL ON order_items TO anon, authenticated;
GRANT ALL ON clients TO anon, authenticated;
GRANT ALL ON products TO anon, authenticated;
GRANT ALL ON routes TO anon, authenticated;
GRANT ALL ON product_categories TO anon, authenticated;
GRANT ALL ON register_users TO anon, authenticated;

-- 4. Otorgar permisos en las secuencias (para auto-increment)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 5. Verificar que RLS esté deshabilitado
SELECT 
    'RLS Status' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('usuarios', 'orders', 'order_items', 'clients', 'products', 'routes', 'product_categories', 'register_users')
ORDER BY tablename;

-- 6. Verificar que no hay políticas activas
SELECT 
    'Policies Status' as status,
    schemaname, 
    tablename, 
    policyname
FROM pg_policies 
WHERE tablename IN ('usuarios', 'orders', 'order_items', 'clients', 'products', 'routes', 'product_categories', 'register_users')
ORDER BY tablename, policyname;

-- 7. Test de acceso a la tabla usuarios
SELECT 
    'Test Access' as test_type,
    COUNT(*) as accessible_records
FROM usuarios
WHERE is_active = true;

-- 8. Test de acceso a órdenes
SELECT 
    'Test Orders Access' as test_type,
    COUNT(*) as accessible_orders
FROM orders
WHERE delivery_date = '2025-09-08';

-- 9. Test de acceso a order_items
SELECT 
    'Test Order Items Access' as test_type,
    COUNT(*) as accessible_items
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.delivery_date = '2025-09-08';
