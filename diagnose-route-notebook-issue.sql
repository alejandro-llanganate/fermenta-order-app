-- Script específico para diagnosticar el problema del RouteNotebook
-- Fecha específica: 08/09/2025

-- 1. Verificar órdenes para la fecha 08/09/2025
SELECT 
    'Órdenes para 08/09/2025' as check_type,
    COUNT(*) as count,
    STRING_AGG(order_number, ', ') as order_numbers
FROM orders 
WHERE delivery_date = '2025-09-08';

-- 2. Verificar items de órdenes para esa fecha
SELECT 
    'Items de órdenes para 08/09/2025' as check_type,
    COUNT(*) as count,
    COUNT(DISTINCT product_name) as unique_products,
    COUNT(DISTINCT product_category) as unique_categories
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.delivery_date = '2025-09-08';

-- 3. Verificar productos activos
SELECT 
    'Productos activos' as check_type,
    COUNT(*) as count,
    COUNT(DISTINCT category_id) as unique_categories
FROM products 
WHERE is_active = true;

-- 4. Verificar categorías activas
SELECT 
    'Categorías activas' as check_type,
    COUNT(*) as count,
    STRING_AGG(name, ', ') as category_names
FROM product_categories 
WHERE is_active = true;

-- 5. Verificar clientes activos
SELECT 
    'Clientes activos' as check_type,
    COUNT(*) as count,
    COUNT(DISTINCT route_id) as unique_routes
FROM clients 
WHERE is_active = true;

-- 6. Verificar rutas activas
SELECT 
    'Rutas activas' as check_type,
    COUNT(*) as count,
    STRING_AGG(identificador, ', ') as route_identifiers
FROM routes 
WHERE is_active = true;

-- 7. Verificar datos específicos de órdenes para 08/09/2025 con detalles
SELECT 
    o.id as order_id,
    o.order_number,
    o.delivery_date,
    c.nombre as client_name,
    r.identificador as route_identifier,
    r.nombre as route_name,
    o.total_amount,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN clients c ON o.client_id = c.id
LEFT JOIN routes r ON o.route_id = r.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.delivery_date = '2025-09-08'
GROUP BY o.id, o.order_number, o.delivery_date, c.nombre, r.identificador, r.nombre, o.total_amount
ORDER BY o.order_number;

-- 8. Verificar items específicos con categorías y productos
SELECT 
    oi.id as item_id,
    o.order_number,
    oi.product_name,
    oi.product_category,
    oi.product_variant,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    c.nombre as client_name,
    r.identificador as route_identifier
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
LEFT JOIN clients c ON o.client_id = c.id
LEFT JOIN routes r ON o.route_id = r.id
WHERE o.delivery_date = '2025-09-08'
ORDER BY o.order_number, oi.product_category, oi.product_name;

-- 9. Verificar si hay problemas con las políticas de RLS
-- Simular consulta que hace la aplicación
SELECT 
    'Test de acceso a órdenes' as test_type,
    COUNT(*) as accessible_orders
FROM orders
WHERE delivery_date = '2025-09-08';

-- 10. Verificar si hay problemas con las políticas de RLS para order_items
SELECT 
    'Test de acceso a order_items' as test_type,
    COUNT(*) as accessible_items
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.delivery_date = '2025-09-08';

-- 11. Verificar usuarios y sus roles
SELECT 
    'Usuarios activos' as check_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'Auxiliar' THEN 1 END) as auxiliares,
    COUNT(CASE WHEN role = 'Secretaria' THEN 1 END) as secretarias,
    COUNT(CASE WHEN role = 'Administrador' THEN 1 END) as administradores
FROM usuarios
WHERE is_active = true;
