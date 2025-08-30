import { Plus } from 'lucide-react';
import { Client, ProductCategory, Product, Route } from '@/types/routeNotebook';
import CategoryNotebookTableLoading from './CategoryNotebookTableLoading';

interface CategoryNotebookTableProps {
    productCategories: ProductCategory[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    loading: boolean;
    routes: Route[];
    getClientsWithOrders: (categoryId?: string) => Client[];
    getQuantityForClientAndProduct: (clientId: string, productId: string) => number;
    getTotalForClient: (clientId: string) => { quantity: number; amount: number };
    getTotalForProduct: (productId: string, categoryId?: string) => number;
    getTotalForCategory: (categoryId: string) => { quantity: number; amount: number };
    handleQuantityChange: (clientId: string, productId: string, newQuantity: number) => void;
    editingCell: { clientId: string; productId: string } | null;
    isUpdating: boolean;
}

export default function CategoryNotebookTable({
    productCategories,
    selectedCategory,
    setSelectedCategory,
    loading,
    routes,
    getClientsWithOrders,
    getQuantityForClientAndProduct,
    getTotalForClient,
    getTotalForProduct,
    getTotalForCategory,
    handleQuantityChange,
    editingCell,
    isUpdating
}: CategoryNotebookTableProps) {
    if (loading) {
        return <CategoryNotebookTableLoading />;
    }

    // Obtener productos de la categoría seleccionada
    const getCategoryProducts = (): Product[] => {
        if (selectedCategory) {
            const category = productCategories.find(cat => cat.name === selectedCategory);
            return category ? category.products : [];
        }
        return [];
    };

    const categoryProducts = getCategoryProducts();

    // Obtener clientes por ruta para la categoría seleccionada
    const getClientsByRoute = (routeId: string): Client[] => {
        const allClients = getClientsWithOrders(selectedCategory);
        return allClients.filter(client => client.routeId === routeId);
    };

    // Calcular totales por producto en la categoría
    const getTotalForProductInCategory = (productId: string): number => {
        return getTotalForProduct(productId, selectedCategory);
    };

    // Calcular totales por ruta para la categoría
    const getTotalForRouteInCategory = (routeId: string): { quantity: number; amount: number } => {
        const routeClients = getClientsByRoute(routeId);
        const quantity = routeClients.reduce((sum, client) => {
            const clientTotal = getTotalForClient(client.id);
            return sum + clientTotal.quantity;
        }, 0);
        const amount = routeClients.reduce((sum, client) => {
            const clientTotal = getTotalForClient(client.id);
            return sum + clientTotal.amount;
        }, 0);
        return { quantity, amount };
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Category Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6 overflow-x-auto">
                    {productCategories.map((category) => (
                        <button
                            key={category.name}
                            onClick={() => setSelectedCategory(selectedCategory === category.name ? '' : category.name)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${selectedCategory === category.name
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content - Multiple Tables by Route */}
            <div className="p-6 space-y-8">
                {selectedCategory ? (
                    <>
                        {/* Product Totals at the Beginning */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4">
                                TOTALES POR PRODUCTO - {selectedCategory}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {categoryProducts.map((product) => {
                                    const total = getTotalForProduct(product.id, selectedCategory);
                                    return (
                                        <div key={product.id} className="text-center bg-white rounded-lg p-3 border border-blue-200">
                                            <p className="text-sm text-blue-600 font-medium">{product.name}</p>
                                            <p className="text-xl font-bold text-blue-900">{total}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Route Tables */}
                        {routes.map((route) => {
                            const routeClients = getClientsByRoute(route.id);
                            const routeTotal = getTotalForRouteInCategory(route.id);

                            // Solo mostrar tabla si hay clientes en esta ruta
                            if (routeClients.length === 0) return null;

                            return (
                                <div key={route.id} className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        {route.nombre} - {route.identificador}
                                    </h3>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border border-gray-300" style={{ tableLayout: 'fixed' }}>
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold" style={{ width: '200px' }}>
                                                        CLIENTES
                                                    </th>
                                                    {categoryProducts.map((product) => (
                                                        <th key={product.id} className="border border-gray-300 px-2 py-2 text-center text-black font-semibold text-xs" style={{ width: '100px' }}>
                                                            {product.name}
                                                        </th>
                                                    ))}
                                                    <th className="border border-gray-300 px-3 py-2 text-center text-black font-semibold" style={{ width: '120px' }}>
                                                        TOTAL
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {routeClients.map((client) => {
                                                    const clientTotal = getTotalForClient(client.id);

                                                    return (
                                                        <tr key={client.id} className="hover:bg-gray-50">
                                                            <td className="border border-gray-300 px-3 py-2 text-black font-medium">
                                                                {client.nombre}
                                                            </td>
                                                            {categoryProducts.map((product) => {
                                                                const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                                                const isEditing = editingCell?.clientId === client.id && editingCell?.productId === product.id;

                                                                return (
                                                                    <td key={product.id} className="border border-gray-300 px-2 py-2 text-center">
                                                                        {quantity > 0 ? (
                                                                            <input
                                                                                type="number"
                                                                                value={quantity}
                                                                                onChange={(e) => handleQuantityChange(client.id, product.id, parseInt(e.target.value) || 0)}
                                                                                className={`w-16 px-1 py-1 border rounded-md text-center ${isEditing ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                                                                                disabled={isUpdating}
                                                                            />
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => handleQuantityChange(client.id, product.id, 1)}
                                                                                disabled={isUpdating}
                                                                                className={`text-green-500 hover:text-green-700 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                            >
                                                                                <Plus className="h-4 w-4" />
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                            <td className="border border-gray-300 px-3 py-2 text-black font-medium text-center">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold">{clientTotal.quantity}</span>
                                                                    <span className="text-xs">${clientTotal.amount.toFixed(2)}</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}

                                                {/* Route Totals Row */}
                                                <tr className="bg-gray-100 font-bold">
                                                    <td className="border border-gray-300 px-3 py-2 text-black font-bold">
                                                        TOTALES {route.nombre}
                                                    </td>
                                                    {categoryProducts.map((product) => {
                                                        const total = routeClients.reduce((sum, client) => {
                                                            return sum + getQuantityForClientAndProduct(client.id, product.id);
                                                        }, 0);
                                                        return (
                                                            <td key={product.id} className="border border-gray-300 px-2 py-2 text-black font-bold text-center">
                                                                {total > 0 ? total : ''}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="border border-gray-300 px-3 py-2 text-black font-bold text-center">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold">{routeTotal.quantity}</span>
                                                            <span className="text-xs">${routeTotal.amount.toFixed(2)}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Selecciona una categoría para ver los reportes por ruta</p>
                    </div>
                )}

                {/* Category Totals */}
                {selectedCategory && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h3 className="text-lg font-semibold text-green-900 mb-4">
                            TOTALES GENERALES - {selectedCategory}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-sm text-green-600">Total Cantidad</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {getTotalForCategory(selectedCategory).quantity}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-green-600">Total Monto</p>
                                <p className="text-2xl font-bold text-green-900">
                                    ${getTotalForCategory(selectedCategory).amount.toFixed(2)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-green-600">Rutas Activas</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {routes.filter(route => getClientsByRoute(route.id).length > 0).length}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
