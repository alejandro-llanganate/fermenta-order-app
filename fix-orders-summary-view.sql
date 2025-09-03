-- Actualizar la vista orders_summary para incluir el campo status
-- Este script corrige el problema donde el estado del pedido no se reflejaba inmediatamente

-- Eliminar la vista existente
DROP VIEW IF EXISTS orders_summary;

-- Crear la vista orders_summary actualizada con el campo status
CREATE OR REPLACE VIEW orders_summary AS
SELECT 
    o.id,
    o.client_id,
    c.nombre as client_name,
    c.direccion as client_address,
    c.telefono as client_phone,
    o.route_id,
    r.nombre as route_name,
    o.order_date,
    o.delivery_date,
    o.payment_method,
    o.notes,
    o.total_amount,
    o.status,  -- Agregar el campo status que faltaba
    o.created_at,
    o.updated_at,
    -- Contar productos en el pedido
    COUNT(oi.id) as total_items,
    -- Lista de productos (opcional, para referencia)
    STRING_AGG(p.name || ' x' || oi.quantity, ', ' ORDER BY p.name) as products_summary
FROM orders o
LEFT JOIN clients c ON o.client_id = c.id
LEFT JOIN routes r ON o.route_id = r.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
GROUP BY o.id, o.client_id, c.nombre, c.direccion, c.telefono, o.route_id, r.nombre, 
         o.order_date, o.delivery_date, o.payment_method, o.notes, o.total_amount, 
         o.status, o.created_at, o.updated_at
ORDER BY o.order_date DESC, o.created_at DESC;
