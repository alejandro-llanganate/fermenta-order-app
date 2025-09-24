import { supabase } from '@/lib/supabase';

/**
 * Genera un número de pedido único verificando contra la base de datos
 * Formato: PED-YYYYMMDD-XXXX (donde XXXX es un número secuencial de 4 dígitos)
 * Incluye reintentos para manejar condiciones de carrera
 */
export async function generateUniqueOrderNumber(date?: Date, maxRetries: number = 5): Promise<string> {
    const targetDate = date || new Date();
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Buscar el último número de pedido para esta fecha
            const { data: existingOrders, error } = await supabase
                .from('orders')
                .select('order_number')
                .like('order_number', `PED-${datePrefix}-%`)
                .order('order_number', { ascending: false })
                .limit(1);
            
            if (error) {
                console.error('Error checking existing orders:', error);
                // En caso de error, usar timestamp para garantizar unicidad
                const timestamp = Date.now().toString().slice(-6);
                return `PED-${datePrefix}-${timestamp}`;
            }
            
            let nextSequence = 1;
            
            if (existingOrders && existingOrders.length > 0) {
                // Extraer el número secuencial del último pedido
                const lastOrderNumber = existingOrders[0].order_number;
                const match = lastOrderNumber.match(/PED-\d{8}-(\d{4})$/);
                
                if (match) {
                    const lastSequence = parseInt(match[1], 10);
                    nextSequence = lastSequence + 1;
                }
            }
            
            // Agregar un pequeño offset basado en el intento para evitar colisiones
            if (attempt > 0) {
                nextSequence += attempt;
            }
            
            // Formatear el número secuencial con 4 dígitos
            const sequenceNumber = String(nextSequence).padStart(4, '0');
            const proposedOrderNumber = `PED-${datePrefix}-${sequenceNumber}`;
            
            // Verificar si este número ya existe (doble verificación)
            const { data: existingOrder, error: checkError } = await supabase
                .from('orders')
                .select('id')
                .eq('order_number', proposedOrderNumber)
                .limit(1);
            
            if (checkError) {
                console.error('Error checking order number uniqueness:', checkError);
                // En caso de error, usar timestamp
                const timestamp = Date.now().toString().slice(-6);
                return `PED-${datePrefix}-${timestamp}`;
            }
            
            if (!existingOrder || existingOrder.length === 0) {
                return proposedOrderNumber;
            }
            
            // Si el número ya existe, continuar con el siguiente intento
            console.warn(`Order number ${proposedOrderNumber} already exists, trying again...`);
            
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error);
            if (attempt === maxRetries - 1) {
                // En el último intento, usar timestamp para garantizar unicidad
                const timestamp = Date.now().toString().slice(-6);
                return `PED-${datePrefix}-${timestamp}`;
            }
        }
    }
    
    // Fallback final con timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `PED-${datePrefix}-${timestamp}`;
}

/**
 * Genera un número de pedido único con timestamp (método alternativo)
 * Útil cuando se necesita garantizar unicidad absoluta
 */
export function generateUniqueOrderNumberWithTimestamp(date?: Date): string {
    const targetDate = date || new Date();
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    
    // Usar timestamp para garantizar unicidad
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
    
    return `PED-${datePrefix}-${timestamp}`;
}

/**
 * Genera un número de pedido único usando un enfoque híbrido
 * Combina secuencia con timestamp para máxima robustez
 */
export async function generateUniqueOrderNumberHybrid(date?: Date): Promise<string> {
    const targetDate = date || new Date();
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    
    try {
        // Primero intentar con el método secuencial
        const sequentialNumber = await generateUniqueOrderNumber(date, 3);
        return sequentialNumber;
    } catch (error) {
        console.warn('Sequential method failed, falling back to timestamp:', error);
        // Si falla, usar timestamp
        return generateUniqueOrderNumberWithTimestamp(date);
    }
}

/**
 * Verifica si un número de pedido ya existe en la base de datos
 */
export async function isOrderNumberUnique(orderNumber: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('id')
            .eq('order_number', orderNumber)
            .limit(1);
        
        if (error) {
            console.error('Error checking order number uniqueness:', error);
            return false;
        }
        
        return !data || data.length === 0;
    } catch (error) {
        console.error('Error in isOrderNumberUnique:', error);
        return false;
    }
}
