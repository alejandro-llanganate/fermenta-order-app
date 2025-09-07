# Solución para el problema de visualización de datos en RouteNotebook

## Problema Identificado

Los usuarios auxiliares solo ven nombres de clientes en el cuaderno por rutas cuando filtran por fecha de entrega, mientras que las secretarias ven clientes, categorías, productos y cantidades. Ambos tipos de usuario deberían ver la misma información.

## Causa Raíz

El problema se debe a una inconsistencia en el sistema de autenticación y configuración de la base de datos:

1. **Dos tablas de usuarios diferentes:**
   - `register_users`: Para administradores
   - `usuarios`: Para usuarios regulares (auxiliares y secretarias)

2. **La tabla `usuarios` no estaba definida en `supabase-setup.sql`**
   - Solo se definía `register_users`
   - La tabla `usuarios` debe haberse creado manualmente

3. **Políticas de Row Level Security (RLS) inconsistentes:**
   - Las políticas estaban configuradas para `register_users`
   - La tabla `usuarios` no tenía las políticas RLS correctas

## Solución Implementada

### 1. Archivos Creados/Modificados

- **`create-usuarios-table.sql`**: Script para crear la tabla usuarios desde cero
- **`fix-usuarios-table.sql`**: Script para corregir la tabla usuarios existente
- **`supabase-setup.sql`**: Actualizado para incluir la tabla usuarios
- **`USUARIOS-TABLE-FIX-README.md`**: Este archivo de documentación

### 2. Cambios en la Base de Datos

La tabla `usuarios` ahora incluye:

```sql
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Administrador', 'Auxiliar', 'Secretaria')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Políticas de RLS Configuradas

```sql
-- Permitir lectura de usuarios activos
CREATE POLICY "Anyone can read active usuarios" ON usuarios
  FOR SELECT USING (is_active = true);

-- Permitir gestión completa para usuarios autenticados
CREATE POLICY "Authenticated users can manage usuarios" ON usuarios
  FOR ALL USING (auth.role() = 'authenticated');
```

## Instrucciones de Implementación

### Opción 1: Si la tabla usuarios ya existe
Ejecutar el script `fix-usuarios-table.sql` en la base de datos de Supabase:

```bash
# Conectar a la base de datos y ejecutar:
psql -h [host] -U [user] -d [database] -f fix-usuarios-table.sql
```

### Opción 2: Si la tabla usuarios no existe
Ejecutar el script `create-usuarios-table.sql`:

```bash
psql -h [host] -U [user] -d [database] -f create-usuarios-table.sql
```

### Opción 3: Recrear toda la base de datos
Ejecutar el `supabase-setup.sql` actualizado (incluye la tabla usuarios).

## Verificación

Después de ejecutar los scripts, verificar que:

1. La tabla `usuarios` existe y tiene la estructura correcta
2. Las políticas de RLS están activas
3. Los usuarios auxiliares y secretarias pueden ver los mismos datos en RouteNotebook

### Consultas de Verificación

```sql
-- Verificar estructura de la tabla
\d usuarios

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuarios';

-- Verificar datos de usuarios
SELECT id, user_number, first_name, last_name, email, cedula, role, is_active 
FROM usuarios 
ORDER BY created_at;
```

## Resultado Esperado

Después de implementar esta solución:

- ✅ Los usuarios auxiliares verán clientes, categorías, productos y cantidades
- ✅ Las secretarias seguirán viendo la misma información completa
- ✅ Ambos tipos de usuario tendrán acceso consistente a los datos
- ✅ El sistema de autenticación será consistente entre ambos tipos de usuario

## Notas Adicionales

- La diferencia en visualización no era un problema de permisos en el código de la aplicación
- El problema estaba en la configuración de la base de datos
- Las políticas de RLS ahora permiten que todos los usuarios autenticados vean los mismos datos
- El sistema mantiene la separación entre administradores (`register_users`) y usuarios regulares (`usuarios`)
