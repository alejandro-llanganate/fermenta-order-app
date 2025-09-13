/**
 * Utilidades para manejar colores de categorías según RF-18
 */

export interface CategoryColorConfig {
    backgroundColor: string;
    textColor: string;
    hexColor: string;
}

export const CATEGORY_COLORS: Record<string, CategoryColorConfig> = {
    'DONUTS': {
        backgroundColor: 'bg-indigo-400',
        textColor: 'text-white',
        hexColor: '#818CF8'
    },
    'MELVAS': {
        backgroundColor: 'bg-orange-600',
        textColor: 'text-white',
        hexColor: '#EA580C'
    },
    'MUFFINS': {
        backgroundColor: 'bg-purple-500',
        textColor: 'text-white',
        hexColor: '#8B5CF6'
    },
    'OREJAS': {
        backgroundColor: 'bg-pink-400',
        textColor: 'text-white',
        hexColor: '#F472B6'
    },
    'PANES': {
        backgroundColor: 'bg-green-500',
        textColor: 'text-white',
        hexColor: '#10B981'
    },
    'PANES CHOCOLATE': {
        backgroundColor: 'bg-blue-400',
        textColor: 'text-white',
        hexColor: '#60A5FA'
    },
    'PASTELES': {
        backgroundColor: 'bg-pink-400',
        textColor: 'text-white',
        hexColor: '#F472B6'
    },
    'PIZZAS': {
        backgroundColor: 'bg-yellow-400',
        textColor: 'text-black',
        hexColor: '#FBBF24'
    },
    'HAMBURGUESAS': {
        backgroundColor: 'bg-green-500',
        textColor: 'text-white',
        hexColor: '#10B981'
    },
    'VARIOS': {
        backgroundColor: 'bg-gray-400',
        textColor: 'text-white',
        hexColor: '#9CA3AF'
    },
    'PAGINA': {
        backgroundColor: 'bg-teal-400',
        textColor: 'text-white',
        hexColor: '#2DD4BF'
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
        color: colors.textColor === 'text-white' ? '#FFFFFF' : '#000000'
    };
}
