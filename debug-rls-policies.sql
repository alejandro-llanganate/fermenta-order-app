-- Script para debuggear las políticas de RLS y verificar el acceso a datos

-- 1. Verificar todas las políticas de RLS activas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'usuarios', 'clients', 'products', 'routes')
ORDER BY tablename, policyname;

-- 2. Verificar si RLS está habilitado en las tablas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('orders', 'order_items', 'usuarios', 'clients', 'products', 'routes')
ORDER BY tablename;

-- 3. Verificar el usuario actual autenticado
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    auth.email() as current_email;

-- 4. Verificar si hay datos en las tablas principales
SELECT 'orders' as table_name, COUNT(*) as record_count FROM orders
UNION ALL
SELECT 'order_items' as table_name, COUNT(*) as record_count FROM order_items
UNION ALL
SELECT 'usuarios' as table_name, COUNT(*) as record_count FROM usuarios
UNION ALL
SELECT 'clients' as table_name, COUNT(*) as record_count FROM clients
UNION ALL
SELECT 'products' as table_name, COUNT(*) as record_count FROM products
UNION ALL
SELECT 'routes' as table_name, COUNT(*) as record_count FROM routes;

-- 5. Verificar órdenes para la fecha específica (08/09/2025)
SELECT 
    o.id,
    o.order_number,
    o.delivery_date,
    c.nombre as client_name,
    r.nombre as route_name,
    o.total_amount
FROM orders o
LEFT JOIN clients c ON o.client_id = c.id
LEFT JOIN routes r ON o.route_id = r.id
WHERE o.delivery_date = '2025-09-08'
ORDER BY o.order_number;

-- 6. Verificar items de órdenes para esas órdenes
SELECT 
    oi.id,
    oi.order_id,
    o.order_number,
    oi.product_name,
    oi.product_category,
    oi.quantity,
    oi.unit_price,
    oi.total_price
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.delivery_date = '2025-09-08'
ORDER BY o.order_number, oi.product_name;

-- 7. Verificar usuarios activos
SELECT 
    id,
    user_number,
    first_name,
    last_name,
    email,
    cedula,
    role,
    is_active
FROM usuarios
WHERE is_active = true
ORDER BY role, first_name;

-- 8. Verificar si hay políticas específicas que puedan estar bloqueando el acceso
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders' 
   OR tablename = 'order_items'
ORDER BY tablename, policyname;
