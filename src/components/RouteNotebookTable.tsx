import { Route, Client, ProductCategory, Product } from '@/types/routeNotebook';
import RouteNotebookTableHeader from './RouteNotebookTableHeader';
import RouteNotebookTableBody from './RouteNotebookTableBody';
import RouteNotebookTableLoading from './RouteNotebookTableLoading';

interface RouteNotebookTableProps {
    routes: Route[];
    selectedRoute: string;
    setSelectedRoute: (route: string) => void;
    loading: boolean;
    productCategories: ProductCategory[];
    unifiedProducts: Product[];
    getClientsWithOrders: (routeId?: string) => Client[];
    getQuantityForClientAndProduct: (clientId: string, productId: string) => number;
    getTotalForClient: (clientId: string) => { quantity: number; amount: number };
    getTotalForProduct: (productId: string, routeId?: string) => number;
    getTotalForRoute: (routeId: string) => { quantity: number; amount: number };
    handleQuantityChange: (clientId: string, productId: string, newQuantity: number) => void;
    editingCell: { clientId: string; productId: string } | null;
    isUpdating: boolean;
    onDefineColumnOrder: () => void;
}

export default function RouteNotebookTable({
    routes,
    selectedRoute,
    setSelectedRoute,
    loading,
    productCategories,
    unifiedProducts,
    getClientsWithOrders,
    getQuantityForClientAndProduct,
    getTotalForClient,
    getTotalForProduct,
    getTotalForRoute,
    handleQuantityChange,
    editingCell,
    isUpdating,
    onDefineColumnOrder
}: RouteNotebookTableProps) {
    if (loading) {
        return <RouteNotebookTableLoading />;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Route Tabs with Column Order Button */}
            <div className="border-b border-gray-200">
                <div className="flex items-center justify-between px-6">
                    <nav className="flex space-x-8 overflow-x-auto">
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
                    <button
                        onClick={onDefineColumnOrder}
                        className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span>Definir Orden</span>
                    </button>
                </div>
            </div>

            {/* Unified Table */}
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

                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <RouteNotebookTableBody
                            routes={routes}
                            selectedRoute={selectedRoute}
                            productCategories={productCategories}
                            unifiedProducts={unifiedProducts}
                            getClientsWithOrders={getClientsWithOrders}
                            getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                            getTotalForClient={getTotalForClient}
                            getTotalForProduct={getTotalForProduct}
                            getTotalForRoute={getTotalForRoute}
                            handleQuantityChange={handleQuantityChange}
                            editingCell={editingCell}
                            isUpdating={isUpdating}
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
}
