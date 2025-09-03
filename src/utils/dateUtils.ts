/**
 * Utilidades para formateo de fechas
 */

/**
 * Formatea una fecha en el formato dd/mm/aaaa
 * @param date - Fecha a formatear
 * @returns String con la fecha en formato dd/mm/aaaa
 */
export function formatDateDDMMYYYY(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

/**
 * Genera el título principal para los cuadernos con formato: FECHA (dd/mm/aaaa) — CATEGORÍA
 * @param date - Fecha del reporte
 * @param category - Categoría del reporte (opcional)
 * @returns String con el título formateado
 */
export function generateMainTitle(date: Date, category?: string): string {
    const formattedDate = formatDateDDMMYYYY(date);
    const datePart = `FECHA (${formattedDate})`;
    
    if (category) {
        return `${datePart} — ${category}`;
    }
    
    return datePart;
}
