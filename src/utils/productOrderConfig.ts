/**
 * Configuración de orden de productos por categoría
 * RF-10: Orden de PIZZAS
 * RF-11: Orden de PANES CHOCO
 * RF-12: Orden de PANES (HOT DOG / HAMB / GUSANO)
 */

export interface ProductOrderConfig {
    categoryName: string;
    productOrder: string[];
    description: string;
}

export const PRODUCT_ORDER_CONFIG: ProductOrderConfig[] = [
    {
        categoryName: 'PIZZAS',
        productOrder: [
            'Pizza Cuadrada',
            'Pizza Redonda',
            'Mini Pizza',
            'Masa Pizza'
        ],
        description: 'RF-10: Orden específico para cuaderno de pizzas'
    },
    {
        categoryName: 'PANES CHOCO',
        productOrder: [
            'Panes',
            'Mini Pan'
        ],
        description: 'RF-11: Orden específico para cuaderno de panes de choco'
    },
    {
        categoryName: 'HOT DOG / HAMB / GUSANO',
        productOrder: [
            'Hamburguesa (HAMB)',
            'Mini Hamburguesa (MINI HAMB.)',
            'Hot Dog',
            'Mini Hot Dog (MINI HOT.)',
            'Sanduche',
            'Mini Sanduche'
        ],
        description: 'RF-12: Orden específico para cuaderno de panes'
    }
];

/**
 * Obtiene la configuración de orden para una categoría específica
 * @param categoryName - Nombre de la categoría
 * @returns Configuración de orden o null si no existe
 */
export function getProductOrderConfig(categoryName: string): ProductOrderConfig | null {
    return PRODUCT_ORDER_CONFIG.find(config => 
        config.categoryName.toUpperCase() === categoryName.toUpperCase()
    ) || null;
}

/**
 * Ordena los productos de una categoría según la configuración específica
 * @param products - Array de productos a ordenar
 * @param categoryName - Nombre de la categoría
 * @returns Array de productos ordenados
 */
export function sortProductsByCategoryOrder(products: any[], categoryName: string): any[] {
    const config = getProductOrderConfig(categoryName);
    
    if (!config) {
        // Si no hay configuración específica, ordenar alfabéticamente
        return products.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Crear un mapa de orden para acceso rápido
    const orderMap = new Map<string, number>();
    config.productOrder.forEach((productName, index) => {
        orderMap.set(productName.toUpperCase(), index);
    });

    // Ordenar productos según la configuración
    return products.sort((a, b) => {
        const orderA = orderMap.get(a.name.toUpperCase()) ?? 999;
        const orderB = orderMap.get(b.name.toUpperCase()) ?? 999;
        
        if (orderA === orderB) {
            // Si tienen el mismo orden, ordenar alfabéticamente
            return a.name.localeCompare(b.name);
        }
        
        return orderA - orderB;
    });
}

/**
 * Verifica si una categoría tiene configuración de orden específica
 * @param categoryName - Nombre de la categoría
 * @returns true si tiene configuración específica
 */
export function hasSpecificOrder(categoryName: string): boolean {
    return getProductOrderConfig(categoryName) !== null;
}

/**
 * Obtiene la descripción de la configuración de orden para una categoría
 * @param categoryName - Nombre de la categoría
 * @returns Descripción de la configuración o null si no existe
 */
export function getOrderDescription(categoryName: string): string | null {
    const config = getProductOrderConfig(categoryName);
    return config?.description || null;
}

/**
 * Obtiene todos los nombres de categorías que tienen configuración específica
 * @returns Array de nombres de categorías
 */
export function getConfiguredCategories(): string[] {
    return PRODUCT_ORDER_CONFIG.map(config => config.categoryName);
}

