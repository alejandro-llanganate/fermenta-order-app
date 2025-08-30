import { Plus } from 'lucide-react';
import { Route, Client, ProductCategory, Product } from '@/types/routeNotebook';

interface RouteNotebookTableBodyProps {
    routes: Route[];
    selectedRoute: string;
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
}

export default function RouteNotebookTableBody({
    routes,
    selectedRoute,
    productCategories,
    unifiedProducts,
    getClientsWithOrders,
    getQuantityForClientAndProduct,
    getTotalForClient,
    getTotalForProduct,
    getTotalForRoute,
    handleQuantityChange,
    editingCell,
    isUpdating
}: RouteNotebookTableBodyProps) {
    // Filtrar rutas según la selección
    const filteredRoutes = selectedRoute
        ? routes.filter(route => route.id === selectedRoute)
        : routes;

    // Calcular totales filtrados por ruta seleccionada
    const getFilteredTotalForProduct = (productId: string): number => {
        if (selectedRoute) {
            // Solo productos de la ruta seleccionada
            return getTotalForProduct(productId, selectedRoute);
        } else {
            // Todos los productos de todas las rutas
            return getTotalForProduct(productId);
        }
    };

    const getFilteredTotalForAllRoutes = (): { quantity: number; amount: number } => {
        if (selectedRoute) {
            // Solo totales de la ruta seleccionada
            return getTotalForRoute(selectedRoute);
        } else {
            // Suma de todas las rutas
            return routes.reduce((total, route) => {
                const routeTotal = getTotalForRoute(route.id);
                return {
                    quantity: total.quantity + routeTotal.quantity,
                    amount: total.amount + routeTotal.amount
                };
            }, { quantity: 0, amount: 0 });
        }
    };

    return (
        <>
            {filteredRoutes.map((route) => {
                const routeClients = getClientsWithOrders(route.id);
                const routeTotal = getTotalForRoute(route.id);

                return routeClients.map((client) => {
                    const clientTotal = getTotalForClient(client.id);

                    return (
                        <tr key={client.id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                                {client.nombre}
                            </td>
                            {unifiedProducts.map((product) => {
                                const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                const isEditing = editingCell?.clientId === client.id && editingCell?.productId === product.id;

                                return (
                                    <td key={product.id} className="px-2 py-3 text-sm text-gray-900 text-center border-l border-gray-200">
                                        {quantity > 0 ? (
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => handleQuantityChange(client.id, product.id, parseInt(e.target.value) || 0)}
                                                className={`w-12 px-1 py-1 border rounded-md text-center ${isEditing ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                                                disabled={isUpdating}
                                            />
                                        ) : (
                                            <button
                                                onClick={() => handleQuantityChange(client.id, product.id, 1)}
                                                disabled={isUpdating}
                                                className={`text-blue-500 hover:text-blue-700 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        )}
                                    </td>
                                );
                            })}
                            <td className="px-3 py-3 text-sm font-medium text-gray-900 text-center border-l border-gray-200">
                                <div className="flex flex-col">
                                    <span className="font-bold">{clientTotal.quantity}</span>
                                    <span className="text-xs text-gray-500">${clientTotal.amount.toFixed(2)}</span>
                                </div>
                            </td>
                        </tr>
                    );
                });
            })}

            {/* Totals Row */}
            <tr className="bg-gray-100 font-bold">
                <td className="px-3 py-3 text-sm font-bold text-gray-900 sticky left-0 bg-gray-100 z-10 border-r border-gray-200">
                    TOTALES
                </td>
                {unifiedProducts.map((product) => {
                    const total = getFilteredTotalForProduct(product.id);
                    return (
                        <td key={product.id} className="px-2 py-3 text-sm font-bold text-gray-900 text-center border-l border-gray-200">
                            {total > 0 ? total : ''}
                        </td>
                    );
                })}
                <td className="px-3 py-3 text-sm font-bold text-gray-900 text-center border-l border-gray-200">
                    <div className="flex flex-col">
                        <span className="font-bold">
                            {getFilteredTotalForAllRoutes().quantity}
                        </span>
                        <span className="text-xs text-gray-500">
                            ${getFilteredTotalForAllRoutes().amount.toFixed(2)}
                        </span>
                    </div>
                </td>
            </tr>
        </>
    );
}
