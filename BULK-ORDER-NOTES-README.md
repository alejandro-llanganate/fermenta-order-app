# Descarga Masiva de Notas de Pedido

## Descripción
Funcionalidad que permite la descarga masiva de todas las notas de pedido en un solo archivo PDF, de acuerdo con el filtro seleccionado (por ruta, por fecha, por cliente, etc.), evitando tener que imprimir una por una.

## Características Implementadas

### ✅ **Botón de Descarga Masiva**
- **Ubicación**: Junto al botón "Exportar" en la gestión de pedidos
- **Color**: Púrpura (`bg-purple-500`) para diferenciarlo de otros botones
- **Icono**: `FileText` de Lucide React
- **Visibilidad**: Solo aparece cuando hay pedidos filtrados

### ✅ **Generación de PDF Consolidado**
- **Formato**: Un archivo PDF con múltiples páginas
- **Estructura**: Cada nota de pedido en una hoja independiente
- **Orden**: Según el criterio aplicado en el filtro

### ✅ **Filtros Soportados**
- **Por Ruta**: Todas las notas de una ruta específica
- **Por Fecha**: Fecha de registro o fecha de entrega
- **Por Cliente**: Búsqueda por nombre de cliente
- **Combinados**: Múltiples filtros aplicados simultáneamente

### ✅ **Contenido de Cada Nota**
- **Header**: Mega Donut - Nota de Pedido
- **Información del Cliente**: Nombre, dirección, teléfono, cédula
- **Información del Pedido**: Número, fechas, ruta, estado, método de pago
- **Tabla de Productos**: Producto, cantidad, precio unitario, total
- **Totales**: Total del pedido
- **Notas**: Observaciones del pedido (si existen)
- **Footer**: Información legal y agradecimiento

## Archivos Creados/Modificados

### 1. **Nuevo Componente PDF**
**Archivo**: `src/components/pdf/BulkOrderNotesPDF.tsx`

```typescript
interface BulkOrderNotesPDFProps {
    orders: Order[];
    clients: Client[];
    routes: Route[];
    dateFilterType: 'order' | 'delivery';
    dateFilterValue: Date | null;
    routeFilter: string;
    searchTerm: string;
}
```

**Características**:
- Genera un PDF con múltiples páginas
- Cada pedido en una página independiente
- Incluye información completa del cliente y pedido
- Maneja precios especiales
- Numeración de páginas
- Descripción de filtros aplicados

### 2. **Componente Principal Actualizado**
**Archivo**: `src/components/OrdersManagement.tsx`

**Cambios realizados**:
- Importación del componente PDF masivo
- Nuevo estado para control de generación
- Función para generar nombres de archivo
- Botón de descarga masiva integrado

## Funcionalidad del Botón

### **Ubicación en la UI**
```typescript
{/* Botón de descarga masiva de notas de pedido */}
{filteredOrders.length > 0 && (
    <PDFDownloadLink
        document={
            <BulkOrderNotesPDF
                orders={filteredOrders}
                clients={clients}
                routes={routes}
                dateFilterType={dateFilterType}
                dateFilterValue={dateFilterValue}
                routeFilter={routeFilter}
                searchTerm={searchTerm}
            />
        }
        fileName={generateBulkPDFFileName()}
        className="flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
    >
        {({ loading }) => (
            <>
                <FileText className="h-4 w-4" />
                <span>
                    {loading ? 'Generando...' : `Descargar Notas (${filteredOrders.length})`}
                </span>
            </>
        )}
    </PDFDownloadLink>
)}
```

### **Generación de Nombres de Archivo**
```typescript
const generateBulkPDFFileName = (): string => {
    const filters = [];
    
    if (searchTerm) {
        filters.push(`Busqueda-${searchTerm.replace(/[^a-zA-Z0-9]/g, '-')}`);
    }
    
    if (routeFilter) {
        const route = routes.find(r => r.id === routeFilter);
        filters.push(`Ruta-${route?.identificador || routeFilter}`);
    }
    
    if (dateFilterValue) {
        const filterType = dateFilterType === 'order' ? 'Registro' : 'Entrega';
        const dateStr = dateFilterValue.toLocaleDateString('es-ES').replace(/\//g, '-');
        filters.push(`${filterType}-${dateStr}`);
    }
    
    const filterText = filters.length > 0 ? `-${filters.join('-')}` : '';
    const orderCount = filteredOrders.length;
    
    return `Notas-Pedido-Masivas${filterText}-${orderCount}-pedidos-${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`;
};
```

## Ejemplos de Nombres de Archivo

### **Sin Filtros**
```
Notas-Pedido-Masivas-25-pedidos-03-09-2025.pdf
```

### **Con Filtro de Ruta**
```
Notas-Pedido-Masivas-Ruta-Norte-8-pedidos-03-09-2025.pdf
```

### **Con Filtro de Fecha**
```
Notas-Pedido-Masivas-Registro-03-09-2025-12-pedidos-03-09-2025.pdf
```

### **Con Múltiples Filtros**
```
Notas-Pedido-Masivas-Busqueda-Juan-Ruta-Sur-Registro-03-09-2025-3-pedidos-03-09-2025.pdf
```

## Características del PDF Generado

### **Estructura de Página**
1. **Header**: Título, subtítulo, filtros aplicados, fecha de generación
2. **Información del Cliente**: Datos completos del cliente
3. **Información del Pedido**: Detalles del pedido
4. **Tabla de Productos**: Lista de productos con precios
5. **Totales**: Total del pedido
6. **Notas**: Observaciones (si existen)
7. **Footer**: Información legal
8. **Numeración**: Página X de Y

### **Información Incluida**
- ✅ Nombre y datos del cliente
- ✅ Número de pedido
- ✅ Fechas de registro y entrega
- ✅ Ruta asignada
- ✅ Estado del pedido
- ✅ Método de pago
- ✅ Lista completa de productos
- ✅ Precios unitarios y totales
- ✅ Precios especiales (marcados)
- ✅ Notas del pedido
- ✅ Total general
- ✅ Información legal

## Instrucciones de Uso

### **Paso 1: Aplicar Filtros**
1. Usar el filtro de búsqueda para buscar por cliente
2. Seleccionar una ruta específica (opcional)
3. Aplicar filtro de fecha (opcional)
4. Combinar múltiples filtros según necesidad

### **Paso 2: Descargar PDF**
1. Verificar que aparezca el botón "Descargar Notas (X)"
2. Hacer clic en el botón púrpura
3. Esperar a que se genere el PDF
4. El archivo se descargará automáticamente

### **Paso 3: Verificar Contenido**
1. Abrir el archivo PDF descargado
2. Verificar que cada pedido esté en una página separada
3. Confirmar que la información sea correcta
4. Revisar que los filtros aplicados estén reflejados

## Beneficios

### **Eficiencia**
- ✅ Descarga masiva en un solo archivo
- ✅ No necesidad de imprimir pedido por pedido
- ✅ Generación automática según filtros

### **Organización**
- ✅ Archivos con nombres descriptivos
- ✅ Información de filtros en el nombre
- ✅ Conteo de pedidos incluido

### **Profesionalismo**
- ✅ Formato consistente y profesional
- ✅ Información completa de cada pedido
- ✅ Diseño limpio y legible

### **Flexibilidad**
- ✅ Múltiples opciones de filtrado
- ✅ Combinación de filtros
- ✅ Adaptable a diferentes necesidades

## Estados Soportados
- **Pendiente** (`pending`)
- **Listo** (`ready`)
- **Entregado** (`delivered`)
- **Cancelado** (`cancelled`)

## Métodos de Pago Soportados
- **Efectivo**
- **Transferencia**
- **Tarjeta de Crédito**
- **Tarjeta de Débito**
- **Cheque**

La funcionalidad está completamente implementada y lista para uso en producción.
