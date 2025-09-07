# Control de Vista Previa y Corrección de Encabezado - Cuaderno por Rutas

## Cambios Implementados:

### **1. Corrección de Encabezado Duplicado** ✅

#### **Problema:** 
El encabezado del PDF mostraba "RUTA" dos veces porque el nombre de la ruta ya incluía "RUTA" al inicio.

#### **Solución:**
```typescript
// ANTES:
FECHA (08/09/2025) — RUTA RUTA NORTE - FILTRADO POR: Fecha de Entrega

// AHORA:
FECHA (08/09/2025) — RUTA NORTE - FILTRADO POR: Fecha de Entrega
```

#### **Cambio Técnico:**
```typescript
// En RouteNotebookPDF.tsx
<Text style={[styles.title, { color: '#000000' }]}>
    FECHA ({selectedDate.toLocaleDateString('es-ES')}) — {selectedRoute ? currentRoute?.nombre : 'TODAS LAS RUTAS'} - FILTRADO POR: {dateFilterType === 'registration' ? 'Fecha de Registro' : 'Fecha de Entrega'}
</Text>
```

### **2. Control Horizontal/Vertical en Vista Previa** ✅

#### **Funcionalidad Agregada:**
- ✅ **Toggle independiente:** La vista previa ahora tiene su propio control para cambiar entre modo horizontal y vertical
- ✅ **Estado local:** No afecta el estado principal de la tabla general
- ✅ **Interfaz intuitiva:** Botones con iconos para fácil identificación

#### **Implementación:**

##### **Estado Local:**
```typescript
// En RouteNotebookPreview.tsx
const [previewVerticalText, setPreviewVerticalText] = useState(isVerticalText);
```

##### **Interfaz de Usuario:**
```typescript
{/* Toggle para modo vertical/horizontal */}
<div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
    <button
        onClick={() => setPreviewVerticalText(false)}
        className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
            !previewVerticalText 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Modo horizontal"
    >
        <RotateCcw className="h-4 w-4" />
        <span className="text-sm">Horizontal</span>
    </button>
    <button
        onClick={() => setPreviewVerticalText(true)}
        className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
            previewVerticalText 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Modo vertical"
    >
        <RotateCw className="h-4 w-4" />
        <span className="text-sm">Vertical</span>
    </button>
</div>
```

##### **Aplicación en Vista Previa:**
```typescript
// Usar el estado local en lugar del prop
{previewVerticalText ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {renderVerticalText(product.name)}
    </div>
) : (
    product.name
)}
```

##### **Aplicación en PDF:**
```typescript
// El PDF recibe el estado de la vista previa
<RouteNotebookPDF
    // ... otros props
    isVerticalText={previewVerticalText}
/>
```

### **3. Layout Horizontal Inteligente en PDF** ✅

#### **Problema:** 
En modo horizontal, los nombres largos de productos no se ajustaban bien en las columnas del PDF.

#### **Solución:**
Función inteligente que divide los nombres largos con saltos de línea apropiados.

#### **Implementación:**

##### **Función de División Inteligente:**
```typescript
const renderHorizontalText = (text: string) => {
    if (isVerticalText) {
        return text;
    }

    // Si el texto es muy largo, dividirlo en palabras y crear saltos de línea
    if (text.length > 8) {
        const words = text.split(' ');
        if (words.length > 1) {
            // Dividir en dos líneas si hay múltiples palabras
            const midPoint = Math.ceil(words.length / 2);
            const firstLine = words.slice(0, midPoint).join(' ');
            const secondLine = words.slice(midPoint).join(' ');
            
            return (
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 5, lineHeight: 1.0, textAlign: 'center' }}>
                        {firstLine}
                    </Text>
                    <Text style={{ fontSize: 5, lineHeight: 1.0, textAlign: 'center' }}>
                        {secondLine}
                    </Text>
                </View>
            );
        } else {
            // Para palabras muy largas, dividir por caracteres
            const midPoint = Math.ceil(text.length / 2);
            const firstPart = text.substring(0, midPoint);
            const secondPart = text.substring(midPoint);
            
            return (
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 5, lineHeight: 1.0, textAlign: 'center' }}>
                        {firstPart}
                    </Text>
                    <Text style={{ fontSize: 5, lineHeight: 1.0, textAlign: 'center' }}>
                        {secondPart}
                    </Text>
                </View>
            );
        }
    }
    
    // Para textos cortos, devolver normal
    return text;
};
```

##### **Aplicación en Encabezados:**
```typescript
{isVerticalText ? (
    <View style={{ alignItems: 'center' }}>
        {renderVerticalText(product.name)}
    </View>
) : (
    <View style={{ alignItems: 'center' }}>
        {renderHorizontalText(product.name)}
    </View>
)}
```

## Archivos Modificados:

### **1. RouteNotebookPDF.tsx:**

#### **Corrección de Encabezado:**
```typescript
// Línea 282: Eliminada palabra "RUTA" duplicada
FECHA ({selectedDate.toLocaleDateString('es-ES')}) — {selectedRoute ? currentRoute?.nombre : 'TODAS LAS RUTAS'} - FILTRADO POR: {dateFilterType === 'registration' ? 'Fecha de Registro' : 'Fecha de Entrega'}
```

#### **Función de Texto Horizontal:**
```typescript
// Líneas 250-296: Nueva función para dividir texto horizontalmente
const renderHorizontalText = (text: string) => {
    // Lógica de división inteligente
};
```

#### **Aplicación en Encabezados:**
```typescript
// Líneas 393-401: Uso de la nueva función
{isVerticalText ? (
    <View style={{ alignItems: 'center' }}>
        {renderVerticalText(product.name)}
    </View>
) : (
    <View style={{ alignItems: 'center' }}>
        {renderHorizontalText(product.name)}
    </View>
)}
```

### **2. RouteNotebookPreview.tsx:**

#### **Imports Agregados:**
```typescript
import { Printer, RotateCcw, RotateCw } from 'lucide-react';
import { useState } from 'react';
```

#### **Estado Local:**
```typescript
// Línea 45: Estado independiente para la vista previa
const [previewVerticalText, setPreviewVerticalText] = useState(isVerticalText);
```

#### **Interfaz de Toggle:**
```typescript
// Líneas 76-101: Toggle con botones horizontales/verticales
<div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
    {/* Botones de toggle */}
</div>
```

#### **Aplicación del Estado:**
```typescript
// Línea 115: PDF usa el estado local
isVerticalText={previewVerticalText}

// Línea 181: Vista previa usa el estado local
{previewVerticalText ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {renderVerticalText(product.name)}
    </div>
) : (
    product.name
)}
```

## Beneficios:

### **1. Encabezado Limpio:**
- ✅ **Sin duplicación:** Eliminada la palabra "RUTA" duplicada
- ✅ **Más legible:** Encabezado más claro y profesional
- ✅ **Consistente:** Formato uniforme en todos los PDFs

### **2. Control Independiente:**
- ✅ **Flexibilidad:** Vista previa independiente del estado principal
- ✅ **UX mejorada:** Usuario puede probar ambos modos antes de generar PDF
- ✅ **Feedback inmediato:** Cambios visibles al instante

### **3. Layout Horizontal Optimizado:**
- ✅ **Mejor ajuste:** Nombres largos se dividen inteligentemente
- ✅ **Legibilidad mantenida:** Texto sigue siendo legible
- ✅ **Espacio optimizado:** Mejor uso del espacio en columnas

## Ejemplos Visuales:

### **Encabezado Corregido:**
```
ANTES: FECHA (08/09/2025) — RUTA RUTA NORTE - FILTRADO POR: Fecha de Entrega
AHORA: FECHA (08/09/2025) — RUTA NORTE - FILTRADO POR: Fecha de Entrega
```

### **Texto Horizontal Inteligente:**
```
ANTES: CHOCO COCO GLASEADO (muy largo, se corta)
AHORA: CHOCO COCO
        GLASEADO

ANTES: HAMBURGUESA (muy largo, se corta)  
AHORA: HAMBUR
        GUESA
```

### **Toggle en Vista Previa:**
```
[🔄 Horizontal] [🔄 Vertical] [📄 Descargar PDF] [❌ Cerrar]
```

## Testing:

1. **Encabezado:** Verificar que no aparezca "RUTA" duplicada
2. **Toggle Vista Previa:** Probar cambio entre horizontal/vertical
3. **PDF Horizontal:** Verificar que nombres largos se dividan correctamente
4. **PDF Vertical:** Verificar que funcione como antes
5. **Consistencia:** Verificar que el PDF refleje el modo seleccionado en vista previa
