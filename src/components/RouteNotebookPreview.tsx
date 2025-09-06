import { Printer } from 'lucide-react';
import { Route, Client, Product, ProductCategory } from '@/types/routeNotebook';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RouteNotebookPDF from './pdf/RouteNotebookPDF';
import { generateMainTitle } from '@/utils/dateUtils';
import { getCategoryColors } from '@/utils/categoryColors';

interface RouteNotebookPreviewProps {
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    generatePDF: () => void;
    selectedDate: Date;
    dateFilterType: 'registration' | 'delivery';
    selectedRoute: string;
    routes: Route[];
    productCategories: ProductCategory[];
    getClientsWithOrders: (routeId?: string) => Client[];
    getQuantityForClientAndProduct: (clientId: string, productId: string) => number;
    getTotalForClient: (clientId: string) => { quantity: number; amount: number };
    getTotalForProduct: (productId: string) => number;
    getTotalForRoute: (routeId: string) => { quantity: number; amount: number };
    printRef: React.RefObject<HTMLDivElement>;
}

export default function RouteNotebookPreview({
    showPreview,
    setShowPreview,
    generatePDF,
    selectedDate,
    dateFilterType,
    selectedRoute,
    routes,
    productCategories,
    getClientsWithOrders,
    getQuantityForClientAndProduct,
    getTotalForClient,
    getTotalForProduct,
    getTotalForRoute,
    printRef
}: RouteNotebookPreviewProps) {
    // RF-24: Mostrar todos los productos y categorías (columnas fijas) como en la vista general
    const getProductsWithOrders = () => {
        return productCategories.flatMap(category => category.products); // Mostrar todos los productos
    };

    const filteredProducts = getProductsWithOrders();

    // RF-24: Mostrar todas las categorías (columnas fijas) como en la vista general
    const getCategoriesWithOrders = () => {
        return productCategories; // Mostrar todas las categorías
    };

    const filteredCategories = getCategoriesWithOrders();
    if (!showPreview) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-full w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Vista Previa - MEGA DONUT PEDIDOS Y ENTREGAS</h2>
                        <div className="flex items-center space-x-3">
                            <PDFDownloadLink
                                document={
                                    <RouteNotebookPDF
                                        selectedDate={selectedDate}
                                        dateFilterType={dateFilterType}
                                        selectedRoute={selectedRoute}
                                        productCategories={productCategories}
                                        routes={routes}
                                        getClientsWithOrders={getClientsWithOrders}
                                        getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                                        getTotalForClient={getTotalForClient}
                                        getTotalForProduct={getTotalForProduct}
                                        getTotalForRoute={getTotalForRoute}
                                    />
                                }
                                fileName={`Mega-Donut-Rutas-${selectedRoute ? routes.find(r => r.id === selectedRoute)?.nombre : 'Todas'}-${dateFilterType === 'registration' ? 'Registro' : 'Entrega'}-${selectedDate.toLocaleDateString('es-ES')}.pdf`}
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
                <div ref={printRef} className="p-6">
                    <div className="space-y-6">
                        {/* Header - RF-18: Encabezado en negro con fecha subrayada */}
                        <div className="text-center border-b border-gray-200 pb-4">
                            <h1 className="text-3xl font-bold text-black">
                                {generateMainTitle(selectedDate, selectedRoute ? `RUTA ${routes.find(r => r.id === selectedRoute)?.nombre}` : 'TODAS LAS RUTAS')}
                            </h1>
                            <p className="text-lg text-black underline">
                                FILTRADO POR: {dateFilterType === 'registration' ? 'Fecha de Registro' : 'Fecha de Entrega'}
                            </p>
                            {selectedRoute && (
                                <p className="text-lg text-black">
                                    RUTA: {routes.find(r => r.id === selectedRoute)?.nombre}
                                </p>
                            )}
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold sticky left-0 bg-gray-100">
                                            CLIENTES
                                        </th>
                                        {filteredCategories.map((category) => {
                                            const categoryProductsWithOrders = category.products.filter(product => {
                                                const total = getTotalForProduct(product.id);
                                                return total > 0;
                                            });
                                            return (
                                                <th key={category.name} colSpan={categoryProductsWithOrders.length} className="border border-gray-300 px-3 py-2 text-center text-black font-semibold">
                                                    {category.name}
                                                </th>
                                            );
                                        })}

                                    </tr>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold sticky left-0 bg-gray-50">
                                            &nbsp;
                                        </th>
                                        {filteredCategories.map((category) => (
                                            category.products.map((product) => (
                                                <th key={product.id} className="border border-gray-300 px-2 py-2 text-center text-black font-semibold text-xs">
                                                    {product.name}
                                                </th>
                                            ))
                                        ))}

                                    </tr>
                                </thead>
                                <tbody>
                                    {routes
                                        .filter(route => !selectedRoute || route.id === selectedRoute)
                                        .map((route) => {
                                            const routeClients = getClientsWithOrders(route.id);

                                            return routeClients.map((client) => {
                                                const clientTotal = getTotalForClient(client.id);

                                                return (
                                                    <tr key={client.id}>
                                                        <td className="border border-gray-300 px-3 py-2 text-black font-medium sticky left-0 bg-white">
                                                            {client.nombre}
                                                        </td>
                                                        {filteredCategories.map((category) => (
                                                            category.products.map((product) => {
                                                                const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                                                return (
                                                                    <td key={product.id} className="border border-gray-300 px-2 py-2 text-black text-center">
                                                                        {quantity > 0 ? quantity : '-'}
                                                                    </td>
                                                                );
                                                            })
                                                        ))}

                                                    </tr>
                                                );
                                            });
                                        })}

                                    {/* Totals Row */}
                                    <tr className="bg-gray-100 font-bold">
                                        <td className="border border-gray-300 px-3 py-2 text-black font-bold sticky left-0 bg-gray-100">
                                            TOTALES
                                        </td>
                                        {productCategories.map((category) => (
                                            category.products.map((product) => {
                                                const total = getTotalForProduct(product.id);
                                                return (
                                                    <td key={product.id} className="border border-gray-300 px-2 py-2 text-black font-bold text-center">
                                                        {total > 0 ? total : '-'}
                                                    </td>
                                                );
                                            }))
                                        )}

                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t border-gray-300">
                            <p className="text-center text-sm text-gray-800 font-medium">
                                MEGA DONUT - Sistema de Gestión de Pedidos<br />
                                Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
