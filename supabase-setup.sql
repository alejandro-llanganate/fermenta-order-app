-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create register_users table for custom authentication
CREATE TABLE IF NOT EXISTS register_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(20) DEFAULT 'register' NOT NULL,
  role VARCHAR(20) DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_register_users_username ON register_users(username);
CREATE INDEX IF NOT EXISTS idx_register_users_cedula ON register_users(cedula);
CREATE INDEX IF NOT EXISTS idx_register_users_email ON register_users(email);
CREATE INDEX IF NOT EXISTS idx_register_users_type ON register_users(type);
CREATE INDEX IF NOT EXISTS idx_register_users_role ON register_users(role);

-- Enable Row Level Security (RLS)
ALTER TABLE register_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own data
CREATE POLICY "Users can read their own data" ON register_users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Create policy to allow admins to read all data
CREATE POLICY "Admins can read all data" ON register_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM register_users 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Create policy to allow insert for new users
CREATE POLICY "Allow insert for new users" ON register_users
  FOR INSERT WITH CHECK (true);

-- Create policy to allow admins to update any user
CREATE POLICY "Admins can update any user" ON register_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM register_users 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_register_users_updated_at
  BEFORE UPDATE ON register_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample users for testing (replace with actual data)
INSERT INTO register_users (username, cedula, email, type, role) VALUES
  ('admin', '1234567890', 'admin@example.com', 'admin', 'admin'),
  ('vendedor1', '0987654321', 'vendedor1@example.com', 'register', 'user'),
  ('vendedor2', '1122334455', 'vendedor2@example.com', 'register', 'user')
ON CONFLICT (email) DO NOTHING;

-- Create a view for easier user management
CREATE OR REPLACE VIEW user_management AS
SELECT 
  id,
  username,
  cedula,
  email,
  type,
  role,
  created_at,
  updated_at
FROM register_users
ORDER BY created_at DESC;

-- Grant necessary permissions
GRANT SELECT ON user_management TO authenticated;
GRANT ALL ON register_users TO authenticated;

-- Create product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for product_categories
CREATE INDEX IF NOT EXISTS idx_product_categories_name ON product_categories(name);
CREATE INDEX IF NOT EXISTS idx_product_categories_active ON product_categories(is_active);

-- Enable RLS for product_categories
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for product_categories
CREATE POLICY "Anyone can read active categories" ON product_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all categories" ON product_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM register_users 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Create trigger for product_categories updated_at
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create products table with image support
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
  variant VARCHAR(100) NOT NULL,
  price_regular DECIMAL(10,2) NOT NULL CHECK (price_regular >= 0),
  price_page DECIMAL(10,2) CHECK (price_page >= 0),
  description TEXT,
  image_url TEXT, -- URL for the uploaded image
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite unique constraint to prevent duplicate products
  UNIQUE(name, category_id, variant)
);

-- Create indexes for products
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_variant ON products(variant);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price_regular ON products(price_regular);

-- Enable RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Anyone can read active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM register_users 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Create trigger for products updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default product categories
INSERT INTO product_categories (name, description) VALUES
  ('Donut', 'Donuts tradicionales'),
  ('Rellenas', 'Donuts rellenas'),
  ('Mini donut', 'Donuts en tamaño mini'),
  ('Mini rellenas', 'Donuts rellenas en tamaño mini'),
  ('Orejas', 'Orejas de elefante'),
  ('Pizzas', 'Pizzas dulces'),
  ('Pan choco', 'Panes de chocolate'),
  ('Melvas', 'Melvas tradicionales'),
  ('Muffins', 'Muffins variados'),
  ('Panes', 'Panes especiales'),
  ('Pasteles chocolate', 'Pasteles de chocolate'),
  ('Pasteles de naranja', 'Pasteles de naranja')
ON CONFLICT (name) DO NOTHING;

-- Create a view for products with category information
CREATE OR REPLACE VIEW products_with_categories AS
SELECT 
  p.id,
  p.name,
  p.category_id,
  pc.name as category_name,
  p.variant,
  p.price_regular,
  p.price_page,
  p.description,
  p.image_url,
  p.is_active,
  p.created_at,
  p.updated_at
FROM products p
JOIN product_categories pc ON p.category_id = pc.id
WHERE p.is_active = true AND pc.is_active = true
ORDER BY pc.name, p.name, p.variant;

-- Grant permissions
GRANT SELECT ON products_with_categories TO authenticated;
GRANT ALL ON product_categories TO authenticated;
GRANT ALL ON products TO authenticated;

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for product images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product images" ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identificador VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for routes
CREATE INDEX IF NOT EXISTS idx_routes_identificador ON routes(identificador);
CREATE INDEX IF NOT EXISTS idx_routes_active ON routes(is_active);

-- Enable RLS for routes
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Create policies for routes
CREATE POLICY "Anyone can read active routes" ON routes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage routes" ON routes
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for routes updated_at
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_nombre ON clients(nombre);
CREATE INDEX IF NOT EXISTS idx_clients_route_id ON clients(route_id);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(is_active);

-- Enable RLS for clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies for clients
CREATE POLICY "Anyone can read active clients" ON clients
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage clients" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for clients updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  order_date DATE NOT NULL,
  delivery_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_route_id ON orders(route_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Enable RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Anyone can read orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage orders" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for orders updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_category VARCHAR(100) NOT NULL,
  product_variant VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Enable RLS for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for order_items
CREATE POLICY "Anyone can read order items" ON order_items
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage order items" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Create views for easier data access
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
  o.notes,
  o.created_at,
  o.updated_at
FROM orders o
LEFT JOIN clients c ON o.client_id = c.id
LEFT JOIN routes r ON o.route_id = r.id
ORDER BY o.order_date DESC, o.created_at DESC;

CREATE OR REPLACE VIEW clients_with_routes AS
SELECT 
  c.id,
  c.nombre,
  c.telefono,
  c.direccion,
  c.route_id,
  r.identificador as route_identifier,
  r.nombre as route_name,
  c.is_active,
  c.created_at,
  c.updated_at
FROM clients c
LEFT JOIN routes r ON c.route_id = r.id
ORDER BY c.nombre;

-- Insert sample data for testing
INSERT INTO routes (identificador, nombre, descripcion) VALUES
  ('RUTA-001', 'Ruta Centro', 'Ruta del centro de la ciudad'),
  ('RUTA-002', 'Ruta Norte', 'Ruta del norte de la ciudad'),
  ('RUTA-003', 'Ruta Sur', 'Ruta del sur de la ciudad'),
  ('RUTA-004', 'Ruta Este', 'Ruta del este de la ciudad'),
  ('RUTA-005', 'Ruta Oeste', 'Ruta del oeste de la ciudad')
ON CONFLICT (identificador) DO NOTHING;

INSERT INTO clients (nombre, telefono, direccion, route_id) VALUES
  ('Juan Pérez', '1234567890', 'Calle Principal 123', (SELECT id FROM routes WHERE identificador = 'RUTA-001')),
  ('María García', '0987654321', 'Avenida Central 456', (SELECT id FROM routes WHERE identificador = 'RUTA-002')),
  ('Carlos López', '1122334455', 'Calle Secundaria 789', (SELECT id FROM routes WHERE identificador = 'RUTA-001')),
  ('Ana Martínez', '5566778899', 'Boulevard Norte 321', (SELECT id FROM routes WHERE identificador = 'RUTA-003')),
  ('Luis Rodríguez', '9988776655', 'Calle Este 654', (SELECT id FROM routes WHERE identificador = 'RUTA-004'))
ON CONFLICT DO NOTHING;

-- Grant permissions for all new tables and views
GRANT SELECT ON orders_with_details TO authenticated;
GRANT SELECT ON clients_with_routes TO authenticated;
GRANT ALL ON routes TO authenticated;
GRANT ALL ON clients TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;

