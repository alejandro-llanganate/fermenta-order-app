/**
 * Utilidades para formateo de fechas con manejo correcto de zona horaria Ecuador (UTC-5)
 */

/**
 * Obtiene la fecha actual en zona horaria de Ecuador (UTC-5)
 * @returns Date en zona horaria de Ecuador
 */
export function getEcuadorDate(): Date {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "America/Guayaquil" }));
}

/**
 * Convierte una fecha UTC a zona horaria de Ecuador
 * @param utcDate - Fecha en UTC
 * @returns Date en zona horaria de Ecuador
 */
export function convertUTCToEcuador(utcDate: Date): Date {
    return new Date(utcDate.toLocaleString("en-US", { timeZone: "America/Guayaquil" }));
}

/**
 * Convierte una fecha de Ecuador a UTC para almacenamiento en base de datos
 * @param ecuadorDate - Fecha en zona horaria de Ecuador
 * @returns Date en UTC
 */
export function convertEcuadorToUTC(ecuadorDate: Date): Date {
    // Crear una nueva fecha con la misma fecha local pero en UTC
    const year = ecuadorDate.getFullYear();
    const month = ecuadorDate.getMonth();
    const day = ecuadorDate.getDate();
    const hours = ecuadorDate.getHours();
    const minutes = ecuadorDate.getMinutes();
    const seconds = ecuadorDate.getSeconds();
    
    return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
}

/**
 * Formatea una fecha en el formato dd/mm/aaaa usando zona horaria de Ecuador
 * @param date - Fecha a formatear (puede ser UTC o local)
 * @returns String con la fecha en formato dd/mm/aaaa en zona horaria de Ecuador
 */
export function formatDateDDMMYYYY(date: Date): string {
    // Convertir a zona horaria de Ecuador si es necesario
    const ecuadorDate = convertUTCToEcuador(date);
    const day = ecuadorDate.getDate().toString().padStart(2, '0');
    const month = (ecuadorDate.getMonth() + 1).toString().padStart(2, '0');
    const year = ecuadorDate.getFullYear();
    
    return `${day}/${month}/${year}`;
}

/**
 * Formatea una fecha para base de datos (YYYY-MM-DD) en zona horaria de Ecuador
 * @param date - Fecha a formatear
 * @returns String con la fecha en formato YYYY-MM-DD en zona horaria de Ecuador
 */
export function formatDateForDB(date: Date): string {
    // Si la fecha es medianoche UTC (típico de date pickers), 
    // usar directamente los componentes de fecha sin conversión
    if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0) {
        // Es una fecha de date picker, usar directamente los componentes de fecha
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
    
    // Para fechas con hora específica, usar la conversión normal a Ecuador
    const ecuadorDate = convertUTCToEcuador(date);
    const year = ecuadorDate.getFullYear();
    const month = (ecuadorDate.getMonth() + 1).toString().padStart(2, '0');
    const day = ecuadorDate.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * Parsea una fecha desde la base de datos y la convierte a zona horaria de Ecuador
 * @param dateStr - String de fecha en formato YYYY-MM-DD
 * @returns Date en zona horaria de Ecuador
 */
export function parseDateFromDB(dateStr: string): Date {
    // Crear fecha en UTC y luego convertir a Ecuador
    const utcDate = new Date(dateStr + 'T00:00:00Z');
    return convertUTCToEcuador(utcDate);
}

/**
 * Convierte una fecha de la base de datos (timestamptz) a zona horaria de Ecuador
 * @param dbTimestamp - Timestamp de la base de datos
 * @returns Date en zona horaria de Ecuador
 */
export function convertDBTimestampToEcuador(dbTimestamp: string | Date): Date {
    const date = typeof dbTimestamp === 'string' ? new Date(dbTimestamp) : dbTimestamp;
    return convertUTCToEcuador(date);
}

/**
 * Formatea una fecha para mostrar en la interfaz usando zona horaria de Ecuador
 * @param date - Fecha a formatear
 * @returns String formateado para mostrar
 */
export function formatDateForDisplay(date: Date): string {
    const ecuadorDate = convertUTCToEcuador(date);
    return ecuadorDate.toLocaleString("es-EC", { 
        timeZone: "America/Guayaquil",
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
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
