/**
 * Utilidades para manejar colores de categorías según RF-18
 */

export interface CategoryColorConfig {
    backgroundColor: string;
    textColor: string;
    hexColor: string;
}

export const CATEGORY_COLORS: Record<string, CategoryColorConfig> = {
    'PIZZAS': {
        backgroundColor: 'bg-yellow-400',
        textColor: 'text-black',
        hexColor: '#FFFF00'
    },
    'PANES CHOCO': {
        backgroundColor: 'bg-sky-400',
        textColor: 'text-black',
        hexColor: '#00BFFF'
    },
    'HOT DOG / HAMB / GUSANO': {
        backgroundColor: 'bg-green-500',
        textColor: 'text-black',
        hexColor: '#00FF00'
    },
    'MELVAS': {
        backgroundColor: 'bg-orange-300',
        textColor: 'text-black',
        hexColor: '#FFA07A'
    },
    'VARIOS': {
        backgroundColor: 'bg-orange-300',
        textColor: 'text-black',
        hexColor: '#FFA07A'
    },
    'PASTELES': {
        backgroundColor: 'bg-green-300',
        textColor: 'text-black',
        hexColor: '#90EE90'
    }
};

/**
 * Obtiene la configuración de colores para una categoría específica
 * @param categoryName - Nombre de la categoría
 * @returns Configuración de colores o configuración por defecto
 */
export function getCategoryColors(categoryName: string): CategoryColorConfig {
    return CATEGORY_COLORS[categoryName] || {
        backgroundColor: 'bg-gray-400',
        textColor: 'text-black',
        hexColor: '#9CA3AF'
    };
}

/**
 * Obtiene solo el color de fondo para una categoría
 * @param categoryName - Nombre de la categoría
 * @returns Clase CSS del color de fondo
 */
export function getCategoryBackgroundColor(categoryName: string): string {
    return getCategoryColors(categoryName).backgroundColor;
}

/**
 * Obtiene solo el color de texto para una categoría
 * @param categoryName - Nombre de la categoría
 * @returns Clase CSS del color de texto
 */
export function getCategoryTextColor(categoryName: string): string {
    return getCategoryColors(categoryName).textColor;
}

/**
 * Obtiene el color hexadecimal para una categoría
 * @param categoryName - Nombre de la categoría
 * @returns Color hexadecimal
 */
export function getCategoryHexColor(categoryName: string): string {
    return getCategoryColors(categoryName).hexColor;
}

/**
 * Obtiene estilos inline para React-PDF
 * @param categoryName - Nombre de la categoría
 * @returns Objeto de estilos para React-PDF
 */
export function getCategoryPDFStyles(categoryName: string) {
    const colors = getCategoryColors(categoryName);
    return {
        backgroundColor: colors.hexColor,
        color: '#000000'
    };
}
