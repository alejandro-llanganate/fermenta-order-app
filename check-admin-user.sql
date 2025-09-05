-- Verificar si el usuario administrador existe en auth.users
SELECT 
  id,
  email,
  created_at,
  updated_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'julissaencarnacion@gmail.com';

-- Si no existe, crear el usuario administrador
-- Ejecuta esto solo si el usuario no existe:

-- SELECT auth.create_user(
--   email := 'julissaencarnacion@gmail.com',
--   password := 'Julis1093$',
--   email_confirm := true,
--   user_metadata := '{"role": "admin", "username": "julissaencarnacion"}'::jsonb
-- );
