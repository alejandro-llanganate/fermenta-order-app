import { Route, ProductCategory, Product } from '@/types/routeNotebook';

interface RouteNotebookTableHeaderProps {
    routes: Route[];
    selectedRoute: string;
    setSelectedRoute: (route: string) => void;
    productCategories: ProductCategory[];
    unifiedProducts: Product[];
}

export default function RouteNotebookTableHeader({
    routes,
    selectedRoute,
    setSelectedRoute,
    productCategories,
    unifiedProducts
}: RouteNotebookTableHeaderProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Route Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6 overflow-x-auto">
                    {routes.map((route) => (
                        <button
                            key={route.id}
                            onClick={() => setSelectedRoute(selectedRoute === route.id ? '' : route.id)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${selectedRoute === route.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {route.nombre}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Table Header */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10" style={{ width: '200px' }}>
                                CLIENTES
                            </th>
                            {productCategories.map((category) => (
                                <th key={category.name} colSpan={category.products.length} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                                    {category.name}
                                </th>
                            ))}
                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200" style={{ width: '120px' }}>
                                TOTAL
                            </th>
                        </tr>
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10" style={{ width: '200px' }}>
                                &nbsp;
                            </th>
                            {unifiedProducts.map((product) => (
                                <th key={product.id} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200" style={{ width: '80px' }}>
                                    {product.name}
                                </th>
                            ))}
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200" style={{ width: '120px' }}>
                                CANT. | $
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>
    );
}
