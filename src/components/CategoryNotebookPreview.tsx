import { Printer } from 'lucide-react';
import { ProductCategory, Route } from '@/types/routeNotebook';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CategoryNotebookPDF from './pdf/CategoryNotebookPDF';

interface CategoryNotebookPreviewProps {
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    generatePDF: () => void;
    isGeneratingPDF: boolean;
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
    isGeneratingPDF,
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
                            <PDFDownloadLink
                                document={
                                    <CategoryNotebookPDF
                                        selectedDate={selectedDate}
                                        selectedCategory={selectedCategory}
                                        productCategories={productCategories}
                                        routes={routes}
                                        getClientsWithOrders={getClientsWithOrders}
                                        getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                                        getTotalForClient={getTotalForClient}
                                        getTotalForProduct={getTotalForProduct}
                                        getTotalForCategory={getTotalForCategory}
                                    />
                                }
                                fileName={`Mega-Donut-Categorias-${selectedCategory || 'Todas'}-${selectedDate.toLocaleDateString('es-ES')}.pdf`}
                                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                {({ loading }) => (
                                    <>
                                        <Printer className="h-4 w-4" />
                                        <span>{loading ? 'Generando PDF...' : 'Descargar PDF'}</span>
                                    </>
                                )}
                            </PDFDownloadLink>
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
                <div ref={printRef} className="p-4">
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="text-center border-b border-gray-200 pb-3">
                            <h1 className="text-2xl font-bold text-black">MEGA DONUT</h1>
                            <h2 className="text-xl font-semibold text-gray-800">PEDIDOS POR CATEGORÍAS</h2>
                            <p className="text-sm text-gray-600">
                                DÍA: {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                            </p>
                            {selectedCategory && (
                                <p className="text-sm text-gray-600">
                                    CATEGORÍA: {selectedCategory}
                                </p>
                            )}
                        </div>

                        {/* Multiple Tables by Route */}
                        {selectedCategory ? (
                            <div className="space-y-4">
                                {/* Product Totals at the Beginning */}
                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-4">
                                    <h3 className="text-base font-semibold text-blue-900 mb-3">
                                        TOTALES POR PRODUCTO - {selectedCategory}
                                    </h3>
                                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                        {categoryProducts.map((product) => {
                                            const total = getTotalForProduct(product.id, selectedCategory);
                                            return (
                                                <div key={product.id} className="text-center bg-white rounded p-2 border border-blue-200">
                                                    <p className="text-xs text-blue-600 font-medium">{product.name}</p>
                                                    <p className="text-lg font-bold text-blue-900">{total}</p>
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
                                            <div className="bg-gray-100 px-3 py-1 border-b border-gray-300">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    {route.nombre} - {route.identificador}
                                                </h3>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full border border-gray-300">
                                                    <thead>
                                                        <tr className="bg-gray-50">
                                                            <th className="border border-gray-300 px-2 py-2 text-left text-black font-semibold text-sm w-1/4">
                                                                CLIENTES
                                                            </th>
                                                            {categoryProducts.map((product) => (
                                                                <th key={product.id} className="border border-gray-300 px-1 py-2 text-center text-black font-semibold text-xs">
                                                                    {product.name}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {routeClients.map((client) => {
                                                            return (
                                                                <tr key={client.id}>
                                                                    <td className="border border-gray-300 px-2 py-2 text-black font-medium text-sm">
                                                                        {client.nombre}
                                                                    </td>
                                                                    {categoryProducts.map((product) => {
                                                                        const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                                                        return (
                                                                            <td key={product.id} className="border border-gray-300 px-1 py-2 text-black text-center text-sm">
                                                                                {quantity > 0 ? quantity : ''}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            );
                                                        })}


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
                            <div className="bg-green-50 rounded-lg p-3 border border-green-200 mt-4">
                                <h3 className="text-base font-semibold text-green-900 mb-3">
                                    TOTALES GENERALES - {selectedCategory}
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <p className="text-xs text-green-600">Total Cantidad</p>
                                        <p className="text-lg font-bold text-green-900">
                                            {getTotalForCategory(selectedCategory).quantity}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-green-600">Total Monto</p>
                                        <p className="text-lg font-bold text-green-900">
                                            ${getTotalForCategory(selectedCategory).amount.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-green-600">Rutas Activas</p>
                                        <p className="text-lg font-bold text-green-900">
                                            {routes.filter(route => getClientsByRoute(route.id).length > 0).length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-4 pt-2 border-t border-gray-300">
                            <p className="text-center text-xs text-gray-600">
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
