-- Agregar campo special_price a la tabla products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS special_price DECIMAL(10,2) DEFAULT NULL;

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN products.special_price IS 'Precio especial opcional para el producto. Si es NULL, se usa el precio normal.';

-- Crear índice para mejorar consultas por precio especial
CREATE INDEX IF NOT EXISTS idx_products_special_price ON products(special_price) WHERE special_price IS NOT NULL;

-- Agregar campo uses_special_price a la tabla order_items
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS uses_special_price BOOLEAN DEFAULT FALSE;

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN order_items.uses_special_price IS 'Indica si el item del pedido usa precio especial (TRUE) o precio normal (FALSE).';

-- Eliminar la vista existente y recrearla
DROP VIEW IF EXISTS orders_with_details;

-- Crear la vista orders_with_details con el precio especial (para detalles de productos)
CREATE VIEW orders_with_details AS
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
    o.created_at,
    oi.product_id,
    p.name as product_name,
    p.price_regular as product_price,
    p.special_price as product_special_price,
    p.category_id,
    pc.name as category_name,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    oi.uses_special_price
FROM orders o
JOIN clients c ON o.client_id = c.id
JOIN routes r ON o.route_id = r.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
JOIN product_categories pc ON p.category_id = pc.id;

-- Crear una nueva vista orders_summary que NO duplique los pedidos
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
         o.created_at, o.updated_at
ORDER BY o.order_date DESC, o.created_at DESC;
