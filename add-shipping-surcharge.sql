-- Agregar campo shipping_surcharge a la tabla orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_surcharge DECIMAL(10,2) DEFAULT 0.00;

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN orders.shipping_surcharge IS 'Recargo de envío aplicado al pedido. Valor mínimo: 1.5, máximo: 5.0, por defecto: 1.5 para nuevos pedidos.';

-- Agregar constraint para validar el rango del recargo de envío
ALTER TABLE orders 
ADD CONSTRAINT check_shipping_surcharge_range 
CHECK (shipping_surcharge >= 0 AND shipping_surcharge <= 5.0);

-- Actualizar pedidos existentes para que tengan recargo de envío en 0
UPDATE orders 
SET shipping_surcharge = 0.00 
WHERE shipping_surcharge IS NULL;

-- Crear índice para mejorar consultas por recargo de envío
CREATE INDEX IF NOT EXISTS idx_orders_shipping_surcharge ON orders(shipping_surcharge);

-- Actualizar la vista orders_with_details para incluir el recargo de envío
DROP VIEW IF EXISTS orders_with_details;

CREATE OR REPLACE VIEW orders_with_details AS
SELECT 
  o.id,
  o.order_number,
  o.client_id,
  c.nombre as client_name,
  o.route_id,
  r.identificador as route_identifier,
  r.nombre as route_name,
  o.order_date,
  o.delivery_date,
  o.status,
  o.total_amount,
  o.shipping_surcharge,
  o.notes,
  o.created_at,
  o.updated_at
FROM orders o
LEFT JOIN clients c ON o.client_id = c.id
LEFT JOIN routes r ON o.route_id = r.id
ORDER BY o.order_date DESC, o.created_at DESC;

-- Actualizar la vista orders_summary para incluir el recargo de envío
DROP VIEW IF EXISTS orders_summary;

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
    o.shipping_surcharge,
    o.status,
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
         o.shipping_surcharge, o.status, o.created_at, o.updated_at
ORDER BY o.order_date DESC, o.created_at DESC;
