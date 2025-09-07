-- Script completo para corregir todas las políticas de RLS
-- Este script asegura que auxiliares y secretarias tengan el mismo acceso a los datos

-- 1. Corregir políticas de la tabla usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active usuarios" ON usuarios;
DROP POLICY IF EXISTS "Authenticated users can manage usuarios" ON usuarios;

CREATE POLICY "Anyone can read active usuarios" ON usuarios
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage usuarios" ON usuarios
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Corregir políticas de la tabla orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON orders;

CREATE POLICY "Anyone can read orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage orders" ON orders
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Corregir políticas de la tabla order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read order items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can manage order items" ON order_items;

CREATE POLICY "Anyone can read order items" ON order_items
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage order items" ON order_items
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Corregir políticas de la tabla clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can manage clients" ON clients;

CREATE POLICY "Anyone can read active clients" ON clients
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage clients" ON clients
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Corregir políticas de la tabla products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active products" ON products;
DROP POLICY IF EXISTS "Admins can manage all products" ON products;

CREATE POLICY "Anyone can read active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Corregir políticas de la tabla routes
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active routes" ON routes;
DROP POLICY IF EXISTS "Authenticated users can manage routes" ON routes;

CREATE POLICY "Anyone can read active routes" ON routes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage routes" ON routes
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 7. Corregir políticas de la tabla product_categories
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active categories" ON product_categories;
DROP POLICY IF EXISTS "Admins can manage all categories" ON product_categories;

CREATE POLICY "Anyone can read active categories" ON product_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories" ON product_categories
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 8. Otorgar permisos completos a todos los usuarios autenticados
GRANT ALL ON usuarios TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT ALL ON clients TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON routes TO authenticated;
GRANT ALL ON product_categories TO authenticated;

-- 9. Verificar que las políticas estén funcionando
SELECT 
    'Políticas creadas' as status,
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename IN ('usuarios', 'orders', 'order_items', 'clients', 'products', 'routes', 'product_categories')
ORDER BY tablename, policyname;

-- 10. Verificar que RLS esté habilitado
SELECT 
    'RLS habilitado' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('usuarios', 'orders', 'order_items', 'clients', 'products', 'routes', 'product_categories')
ORDER BY tablename;
