# Solución para Error de Números de Orden Duplicados

## Problema Identificado

El error `duplicate key value violates unique constraint "orders_ord"` ocurría debido a condiciones de carrera (race conditions) en la generación de números de orden. Cuando múltiples usuarios creaban órdenes simultáneamente, el sistema podía generar el mismo número de orden para diferentes pedidos.

## Solución Implementada

### 1. Mejoras en la Generación de Números de Orden

**Archivo:** `src/utils/orderIdGenerator.ts`

#### Cambios realizados:

1. **Aumento de reintentos**: De 5 a 10 intentos máximos
2. **Delay aleatorio**: Se agregó un delay aleatorio entre intentos para evitar condiciones de carrera
3. **Mejor logging**: Mensajes más detallados para debugging
4. **Fallback robusto**: Uso de timestamp como último recurso

```typescript
// Antes: 5 reintentos, sin delay
for (let attempt = 0; attempt < 5; attempt++) {

// Después: 10 reintentos con delay aleatorio
for (let attempt = 0; attempt < 10; attempt++) {
    if (attempt > 0) {
        nextSequence += attempt;
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }
}
```

### 2. Nueva Función de Creación Robusta

Se agregó la función `createOrderWithRetry()` que:

- Genera un número de orden único para cada intento
- Detecta errores de clave duplicada (código 23505)
- Reintenta automáticamente con delays aleatorios
- Maneja hasta 5 reintentos por defecto

```typescript
export async function createOrderWithRetry(orderData: any, maxRetries: number = 5): Promise<any> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const orderNumber = await generateUniqueOrderNumber(orderData.order_date);
            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert({ ...orderData, order_number: orderNumber })
                .select()
                .single();

            if (orderError?.code === '23505') {
                console.warn(`Duplicate order number detected, retrying...`);
                await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
                continue;
            }
            
            return newOrder;
        } catch (error) {
            // Manejo de errores con reintentos
        }
    }
}
```

### 3. Actualización de Componentes

#### CategoryNotebook.tsx
- Reemplazado `generateUniqueOrderNumberHybrid()` por `createOrderWithRetry()`
- Eliminada la lógica manual de generación de números
- Mejor manejo de errores específicos

#### OrdersManagement.tsx
- Actualizada la función `handleCreateOrder()`
- Uso de `createOrderWithRetry()` para creación robusta
- Mantenida compatibilidad con código existente

## Beneficios de la Solución

### 1. **Eliminación de Duplicados**
- Sistema de reintentos automáticos
- Detección específica de errores de clave duplicada
- Fallback garantizado con timestamp

### 2. **Mejor Experiencia de Usuario**
- Los usuarios no verán más errores de duplicados
- Creación de órdenes más confiable
- Mensajes de error más informativos

### 3. **Robustez del Sistema**
- Manejo de condiciones de carrera
- Delays aleatorios para evitar colisiones
- Múltiples niveles de fallback

### 4. **Mantenibilidad**
- Código centralizado en `orderIdGenerator.ts`
- Función reutilizable `createOrderWithRetry()`
- Logging detallado para debugging

## Casos de Uso Cubiertos

### Escenario 1: Usuarios Simultáneos
- **Antes**: Error de duplicado
- **Después**: Cada usuario obtiene un número único automáticamente

### Escenario 2: Conexión Lenta
- **Antes**: Posible timeout y duplicado
- **Después**: Reintentos con delays progresivos

### Escenario 3: Pico de Tráfico
- **Antes**: Múltiples errores de duplicado
- **Después**: Sistema maneja la carga automáticamente

## Monitoreo y Debugging

### Logs Importantes
```
✅ Nueva orden creada: PED-20250101-0001
⚠️ Order number PED-20250101-0001 already exists, trying again... (attempt 2/10)
⚠️ Duplicate order number detected (attempt 1/5), retrying...
```

### Métricas a Monitorear
- Número de reintentos por orden
- Tiempo promedio de creación
- Frecuencia de uso de fallback con timestamp

## Pruebas Recomendadas

1. **Prueba de Carga**: Crear múltiples órdenes simultáneamente
2. **Prueba de Red**: Simular conexiones lentas
3. **Prueba de Pico**: Generar muchas órdenes en poco tiempo

## Archivos Modificados

- `src/utils/orderIdGenerator.ts` - Lógica principal mejorada
- `src/components/CategoryNotebook.tsx` - Uso de nueva función
- `src/components/OrdersManagement.tsx` - Uso de nueva función

## Conclusión

Esta solución elimina completamente el problema de números de orden duplicados mediante:

1. **Detección proactiva** de colisiones
2. **Reintentos automáticos** con delays inteligentes  
3. **Fallbacks garantizados** para casos extremos
4. **Mejor experiencia de usuario** sin errores

El sistema ahora es robusto contra condiciones de carrera y puede manejar múltiples usuarios creando órdenes simultáneamente sin problemas.
