/**
 * Utilidades para validación numérica en campos de cantidad
 */

/**
 * Limpia un valor de entrada, eliminando todos los caracteres que no sean números
 * @param value - Valor de entrada a limpiar
 * @returns String con solo números
 */
export function cleanNumericInput(value: string): string {
    // Eliminar todos los caracteres que no sean números (0-9)
    return value.replace(/[^0-9]/g, '');
}

/**
 * Valida si un valor es numérico y está dentro de un rango válido
 * @param value - Valor a validar
 * @param min - Valor mínimo (por defecto 0)
 * @param max - Valor máximo (por defecto 999999)
 * @returns true si el valor es válido
 */
export function isValidNumericValue(value: string, min: number = 0, max: number = 999999): boolean {
    const cleanValue = cleanNumericInput(value);
    if (cleanValue === '') return true; // Campo vacío es válido
    
    const numValue = parseInt(cleanValue);
    return !isNaN(numValue) && numValue >= min && numValue <= max;
}

/**
 * Convierte un valor de entrada a número, limpiando caracteres no numéricos
 * @param value - Valor de entrada
 * @returns Número o 0 si no es válido
 */
export function parseNumericValue(value: string): number {
    const cleanValue = cleanNumericInput(value);
    if (cleanValue === '') return 0;
    
    const numValue = parseInt(cleanValue);
    return isNaN(numValue) ? 0 : numValue;
}

/**
 * Maneja el cambio en un campo numérico, limpiando automáticamente caracteres no válidos
 * @param value - Valor de entrada del usuario
 * @param callback - Función callback que recibe el valor limpio
 */
export function handleNumericInputChange(value: string, callback: (cleanValue: string) => void): void {
    const cleanValue = cleanNumericInput(value);
    callback(cleanValue);
}

/**
 * Valida y formatea un valor numérico para mostrar en un campo
 * @param value - Valor a formatear
 * @returns String formateado para mostrar
 */
export function formatNumericDisplay(value: string | number): string {
    if (typeof value === 'number') {
        return value.toString();
    }
    
    const cleanValue = cleanNumericInput(value);
    return cleanValue;
}

