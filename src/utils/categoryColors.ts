/**
 * Utilidades para manejar colores de categorías según RF-18
 */

export interface CategoryColorConfig {
    backgroundColor: string;
    textColor: string;
    hexColor: string;
}

export const CATEGORY_COLORS: Record<string, CategoryColorConfig> = {
    'Pizzas': {
        backgroundColor: 'bg-red-400',
        textColor: 'text-white',
        hexColor: '#F87171'
    },
    'Panes de chocolate': {
        backgroundColor: 'bg-yellow-400',
        textColor: 'text-black',
        hexColor: '#FBBF24'
    },
    'Pasteles': {
        backgroundColor: 'bg-pink-400',
        textColor: 'text-white',
        hexColor: '#F472B6'
    },
    'Melvas': {
        backgroundColor: 'bg-orange-400',
        textColor: 'text-white',
        hexColor: '#FB923C'
    },
    'Varios': {
        backgroundColor: 'bg-gray-400',
        textColor: 'text-white',
        hexColor: '#9CA3AF'
    },
    'Orejas': {
        backgroundColor: 'bg-purple-400',
        textColor: 'text-white',
        hexColor: '#C084FC'
    },
    'Muffins': {
        backgroundColor: 'bg-blue-400',
        textColor: 'text-white',
        hexColor: '#60A5FA'
    },
    'Mini Panes': {
        backgroundColor: 'bg-green-400',
        textColor: 'text-white',
        hexColor: '#4ADE80'
    },
    'Donas': {
        backgroundColor: 'bg-indigo-400',
        textColor: 'text-white',
        hexColor: '#818CF8'
    },
    'Panes': {
        backgroundColor: 'bg-amber-400',
        textColor: 'text-black',
        hexColor: '#FBBF24'
    },
    'Masa Pizza': {
        backgroundColor: 'bg-red-500',
        textColor: 'text-white',
        hexColor: '#EF4444'
    },
    'Página': {
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
        color: '#000000'
    };
}
