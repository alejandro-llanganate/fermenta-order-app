# RF-16: Actualización y Persistencia del Estado del Pedido

## Descripción del Problema
Al cambiar el Estado de un pedido desde la vista Gestión de pedidos, el nuevo estado debe guardarse y reflejarse visualmente de inmediato en la tabla (no debe quedar en "Pendiente").

## Solución Implementada

### 1. Corrección de la Vista de Base de Datos
**Archivo**: `fix-orders-summary-view.sql`

La vista `orders_summary` no incluía el campo `status`, lo que causaba que los cambios de estado no se reflejaran inmediatamente.

**Ejecutar el script SQL**:
```sql
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
```

### 2. Mejoras en el Frontend

#### Actualización Inmediata del Estado Local
- **Función**: `handleUpdateStatus`
- **Mejora**: Actualiza el estado local inmediatamente antes de enviar a la base de datos
- **Beneficio**: Feedback visual instantáneo para el usuario

#### Indicador de Carga
- **Estado**: `updatingStatus` - Set que rastrea pedidos siendo actualizados
- **Visual**: Spinner de carga junto al select de estado
- **UX**: El select se deshabilita durante la actualización

#### Manejo de Errores
- **Rollback**: Si hay error en la base de datos, se revierte el cambio local
- **Feedback**: Mensajes de error claros para el usuario

### 3. Cambios en el Código

#### Archivo: `src/components/OrdersManagement.tsx`

1. **Nuevo estado para tracking de actualizaciones**:
```typescript
const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
```

2. **Función `handleUpdateStatus` mejorada**:
```typescript
const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
        // Marcar como actualizando
        setUpdatingStatus(prev => new Set(prev).add(orderId));

        // Actualizar el estado local inmediatamente
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId 
                    ? { ...order, status: newStatus }
                    : order
            )
        );

        // Actualizar en la base de datos
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            // Revertir cambio local si hay error
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId 
                        ? { ...order, status: order.status }
                        : order
                )
            );
            throw error;
        }
    } catch (error) {
        handleError(error, 'actualizar el estado del pedido');
    } finally {
        // Remover del estado de actualización
        setUpdatingStatus(prev => {
            const newSet = new Set(prev);
            newSet.delete(orderId);
            return newSet;
        });
    }
};
```

3. **UI mejorada para el select de estado**:
```typescript
<div className="flex items-center space-x-2">
    <select
        value={order.status}
        onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])}
        disabled={updatingStatus.has(order.id)}
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-none ${getStatusColor(order.status)} ${updatingStatus.has(order.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <option value="pending">Pendiente</option>
        <option value="ready">Listo</option>
        <option value="delivered">Entregado</option>
        <option value="cancelled">Cancelado</option>
    </select>
    {updatingStatus.has(order.id) && (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
    )}
</div>
```

## Instrucciones de Implementación

### Paso 1: Actualizar la Base de Datos
1. Conectar a la base de datos Supabase
2. Ejecutar el script `fix-orders-summary-view.sql`
3. Verificar que la vista `orders_summary` incluya el campo `status`

### Paso 2: Verificar el Frontend
1. El código ya está actualizado en `src/components/OrdersManagement.tsx`
2. Ejecutar `npm run build` para verificar que no hay errores
3. Probar el cambio de estado en la interfaz

## Resultados Esperados

✅ **Actualización Inmediata**: El estado cambia visualmente al instante
✅ **Persistencia**: Los cambios se guardan correctamente en la base de datos
✅ **Feedback Visual**: Indicador de carga durante la actualización
✅ **Manejo de Errores**: Rollback automático si hay problemas
✅ **UX Mejorada**: No más estados "Pendiente" que no se actualizan

## Estados de Pedido Soportados
- **Pendiente** (`pending`)
- **Listo** (`ready`)
- **Entregado** (`delivered`)
- **Cancelado** (`cancelled`)
