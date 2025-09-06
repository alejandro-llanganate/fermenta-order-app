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
    // Mostrar todos los productos (columnas fijas)
    const getProductsWithOrders = () => {
        return unifiedProducts; // Mostrar todos los productos
    };

    const filteredProducts = getProductsWithOrders();

    // Mostrar todas las categorías (columnas fijas)
    const getCategoriesWithOrders = () => {
        return productCategories; // Mostrar todas las categorías
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
                    const categoryProductsWithOrders = category.products; // Mostrar todos los productos de la categoría
                    return (
                        <th key={category.name} colSpan={categoryProductsWithOrders.length} className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider border-l border-gray-200 ${getCategoryColors(category.name).backgroundColor} ${getCategoryColors(category.name).textColor}`}>
                            <span>{category.name}</span>
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
                    <th key={product.id} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200" style={{ width: '80px' }}>
                        <span className={`text-xs ${isVerticalText ? 'writing-mode-vertical-rl transform-rotate-45 origin-center' : ''}`}>
                            {product.name}
                        </span>
                    </th>
                ))}
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200" style={{ width: '120px' }}>
                    CANT. | $
                </th>
            </tr>
        </>
    );
}
