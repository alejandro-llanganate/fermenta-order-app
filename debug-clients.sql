-- Script para verificar datos de clientes
SELECT 
    id,
    nombre,
    telefono,
    direccion,
    cedula,
    email,
    is_active,
    created_at
FROM public.clients 
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;
