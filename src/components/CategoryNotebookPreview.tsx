import { Printer } from 'lucide-react';
import { ProductCategory, Route } from '@/types/routeNotebook';

interface CategoryNotebookPreviewProps {
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    generatePDF: () => void;
    selectedDate: Date;
    selectedCategory: string;
    productCategories: ProductCategory[];
    routes: Route[];
    getClientsWithOrders: (categoryId?: string) => any[];
    getQuantityForClientAndProduct: (clientId: string, productId: string) => number;
    getTotalForClient: (clientId: string) => { quantity: number; amount: number };
    getTotalForProduct: (productId: string, categoryId?: string) => number;
    getTotalForCategory: (categoryId: string) => { quantity: number; amount: number };
    printRef: React.RefObject<HTMLDivElement>;
}

export default function CategoryNotebookPreview({
    showPreview,
    setShowPreview,
    generatePDF,
    selectedDate,
    selectedCategory,
    productCategories,
    routes,
    getClientsWithOrders,
    getQuantityForClientAndProduct,
    getTotalForClient,
    getTotalForProduct,
    getTotalForCategory,
    printRef
}: CategoryNotebookPreviewProps) {
    if (!showPreview) return null;

    // Obtener productos de la categoría seleccionada
    const getCategoryProducts = (): any[] => {
        if (selectedCategory) {
            const category = productCategories.find(cat => cat.name === selectedCategory);
            return category ? category.products : [];
        }
        return [];
    };

    const categoryProducts = getCategoryProducts();

    // Obtener clientes por ruta para la categoría seleccionada
    const getClientsByRoute = (routeId: string): any[] => {
        const allClients = getClientsWithOrders(selectedCategory);
        return allClients.filter((client: any) => client.routeId === routeId);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-full w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Vista Previa - MEGA DONUT PEDIDOS POR CATEGORÍAS</h2>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={generatePDF}
                                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <Printer className="h-4 w-4" />
                                <span>Generar PDF</span>
                            </button>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Print Content */}
                <div ref={printRef} className="p-6">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="text-center border-b border-gray-200 pb-4">
                            <h1 className="text-3xl font-bold text-black">MEGA DONUT</h1>
                            <h2 className="text-2xl font-semibold text-gray-800">PEDIDOS POR CATEGORÍAS</h2>
                            <p className="text-lg text-gray-600">
                                DÍA: {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                            </p>
                            {selectedCategory && (
                                <p className="text-lg text-gray-600">
                                    CATEGORÍA: {selectedCategory}
                                </p>
                            )}
                        </div>

                        {/* Multiple Tables by Route */}
                        {selectedCategory ? (
                            <div className="space-y-8">
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

                                    // Solo mostrar tabla si hay clientes en esta ruta
                                    if (routeClients.length === 0) return null;

                                    return (
                                        <div key={route.id} className="border border-gray-300 rounded-lg overflow-hidden">
                                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {route.nombre} - {route.identificador}
                                                </h3>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="min-w-full border border-gray-300">
                                                    <thead>
                                                        <tr className="bg-gray-50">
                                                            <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">
                                                                CLIENTES
                                                            </th>
                                                            {categoryProducts.map((product) => (
                                                                <th key={product.id} className="border border-gray-300 px-2 py-2 text-center text-black font-semibold text-xs">
                                                                    {product.name}
                                                                </th>
                                                            ))}
                                                            <th className="border border-gray-300 px-3 py-2 text-center text-black font-semibold">
                                                                TOTAL
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {routeClients.map((client) => {
                                                            const clientTotal = getTotalForClient(client.id);

                                                            return (
                                                                <tr key={client.id}>
                                                                    <td className="border border-gray-300 px-3 py-2 text-black font-medium">
                                                                        {client.nombre}
                                                                    </td>
                                                                    {categoryProducts.map((product) => {
                                                                        const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                                                        return (
                                                                            <td key={product.id} className="border border-gray-300 px-2 py-2 text-black text-center">
                                                                                {quantity > 0 ? quantity : ''}
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
                                                                    <span className="font-bold">
                                                                        {routeClients.reduce((sum, client) => {
                                                                            const clientTotal = getTotalForClient(client.id);
                                                                            return sum + clientTotal.quantity;
                                                                        }, 0)}
                                                                    </span>
                                                                    <span className="text-xs">
                                                                        ${routeClients.reduce((sum, client) => {
                                                                            const clientTotal = getTotalForClient(client.id);
                                                                            return sum + clientTotal.amount;
                                                                        }, 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
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

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t border-gray-300">
                            <p className="text-center text-sm text-gray-800 font-medium">
                                MEGA DONUT - Sistema de Gestión de Pedidos por Categorías<br />
                                Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
