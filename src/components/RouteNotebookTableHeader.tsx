import { Route, ProductCategory, Product } from '@/types/routeNotebook';
import { getCategoryColors } from '@/utils/categoryColors';

interface RouteNotebookTableHeaderProps {
    routes: Route[];
    selectedRoute: string;
    setSelectedRoute: (route: string) => void;
    productCategories: ProductCategory[];
    unifiedProducts: Product[];
    getTotalForProduct: (productId: string, routeId?: string) => number;
    onMoveCategoryLeft: (categoryIndex: number) => void;
    onMoveCategoryRight: (categoryIndex: number) => void;
    onMoveProductLeft: (productIndex: number) => void;
    onMoveProductRight: (productIndex: number) => void;
    isVerticalText: boolean;
}

export default function RouteNotebookTableHeader({
    routes,
    selectedRoute,
    setSelectedRoute,
    productCategories,
    unifiedProducts,
    getTotalForProduct,
    onMoveCategoryLeft,
    onMoveCategoryRight,
    onMoveProductLeft,
    onMoveProductRight,
    isVerticalText
}: RouteNotebookTableHeaderProps) {
    // Filtrar productos que tienen pedidos > 0
    const getProductsWithOrders = () => {
        return unifiedProducts.filter(product => {
            const total = getTotalForProduct(product.id, selectedRoute);
            return total > 0;
        });
    };

    const filteredProducts = getProductsWithOrders();

    // Filtrar categorías que tienen productos con pedidos
    const getCategoriesWithOrders = () => {
        return productCategories.filter(category => {
            const categoryProducts = category.products.filter(product => {
                const total = getTotalForProduct(product.id, selectedRoute);
                return total > 0;
            });
            return categoryProducts.length > 0;
        });
    };

    const filteredCategories = getCategoriesWithOrders();

    return (
        <>
            {/* Primera fila: Encabezados de categorías */}
            <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10" style={{ width: '200px' }}>
                    CLIENTES
                </th>
                {filteredCategories.map((category, categoryIndex) => {
                    const categoryProductsWithOrders = category.products.filter(product => {
                        const total = getTotalForProduct(product.id, selectedRoute);
                        return total > 0;
                    });
                    return (
                        <th key={category.name} colSpan={categoryProductsWithOrders.length} className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider border-l border-gray-200 relative group ${getCategoryColors(category.name).backgroundColor} ${getCategoryColors(category.name).textColor}`}>
                            <div className="flex items-center justify-center space-x-2">
                                <button
                                    onClick={() => onMoveCategoryLeft(categoryIndex)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800"
                                    title="Mover categoría a la izquierda"
                                >
                                    ←
                                </button>
                                <span>{category.name}</span>
                                <button
                                    onClick={() => onMoveCategoryRight(categoryIndex)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800"
                                    title="Mover categoría a la derecha"
                                >
                                    →
                                </button>
                            </div>
                        </th>
                    );
                })}
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200" style={{ width: '120px' }}>
                    TOTAL
                </th>
            </tr>
            {/* Segunda fila: Encabezados de productos */}
            <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10" style={{ width: '200px' }}>
                    &nbsp;
                </th>
                {filteredProducts.map((product, productIndex) => (
                    <th key={product.id} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200 relative group" style={{ width: '80px' }}>
                        <div className={`flex items-center justify-center space-x-1 ${isVerticalText ? 'flex-col' : ''}`}>
                            <button
                                onClick={() => onMoveProductLeft(productIndex)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 text-xs"
                                title="Mover producto a la izquierda"
                            >
                                ←
                            </button>
                            <span className={`text-xs ${isVerticalText ? 'writing-mode-vertical-rl transform-rotate-45 origin-center' : ''}`}>
                                {product.name}
                            </span>
                            <button
                                onClick={() => onMoveProductRight(productIndex)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 text-xs"
                                title="Mover producto a la derecha"
                            >
                                →
                            </button>
                        </div>
                    </th>
                ))}
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200" style={{ width: '120px' }}>
                    CANT. | $
                </th>
            </tr>
        </>
    );
}
