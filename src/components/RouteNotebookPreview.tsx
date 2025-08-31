import { Printer } from 'lucide-react';
import { Route, Client, Product, ProductCategory } from '@/types/routeNotebook';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RouteNotebookPDF from './pdf/RouteNotebookPDF';

interface RouteNotebookPreviewProps {
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    generatePDF: () => void;
    selectedDate: Date;
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
                                fileName={`Mega-Donut-Rutas-${selectedRoute ? routes.find(r => r.id === selectedRoute)?.nombre : 'Todas'}-${selectedDate.toLocaleDateString('es-ES')}.pdf`}
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
                        {/* Header */}
                        <div className="text-center border-b border-gray-200 pb-4">
                            <h1 className="text-3xl font-bold text-black">MEGA DONUT</h1>
                            <h2 className="text-2xl font-semibold text-gray-800">PEDIDOS Y ENTREGAS</h2>
                            <p className="text-lg text-gray-600">
                                DÍA: {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                            </p>
                            {selectedRoute && (
                                <p className="text-lg text-gray-600">
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
                                        {productCategories.map((category) => (
                                            <th key={category.name} colSpan={category.products.length} className="border border-gray-300 px-3 py-2 text-center text-black font-semibold">
                                                {category.name}
                                            </th>
                                        ))}
                                        <th className="border border-gray-300 px-3 py-2 text-center text-black font-semibold">
                                            TOTAL
                                        </th>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold sticky left-0 bg-gray-50">
                                            &nbsp;
                                        </th>
                                        {productCategories.map((category) => (
                                            category.products.map((product) => (
                                                <th key={product.id} className="border border-gray-300 px-2 py-2 text-center text-black font-semibold text-xs">
                                                    {product.name}
                                                </th>
                                            ))
                                        ))}
                                        <th className="border border-gray-300 px-3 py-2 text-center text-black font-semibold">
                                            CANT. | $
                                        </th>
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
                                                        {productCategories.map((category) => (
                                                            category.products.map((product) => {
                                                                const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                                                return (
                                                                    <td key={product.id} className="border border-gray-300 px-2 py-2 text-black text-center">
                                                                        {quantity > 0 ? quantity : ''}
                                                                    </td>
                                                                );
                                                            })
                                                        ))}
                                                        <td className="border border-gray-300 px-3 py-2 text-black font-medium text-center">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold">{clientTotal.quantity}</span>
                                                                <span className="text-xs">${clientTotal.amount.toFixed(2)}</span>
                                                            </div>
                                                        </td>
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
                                                        {total > 0 ? total : ''}
                                                    </td>
                                                );
                                            }))
                                        )}
                                        <td className="border border-gray-300 px-3 py-2 text-black font-bold text-center">
                                            <div className="flex flex-col">
                                                <span className="font-bold">
                                                    {routes
                                                        .filter(route => !selectedRoute || route.id === selectedRoute)
                                                        .reduce((sum, route) => sum + getTotalForRoute(route.id).quantity, 0)}
                                                </span>
                                                <span className="text-xs">
                                                    ${routes
                                                        .filter(route => !selectedRoute || route.id === selectedRoute)
                                                        .reduce((sum, route) => sum + getTotalForRoute(route.id).amount, 0)
                                                        .toFixed(2)}
                                                </span>
                                            </div>
                                        </td>
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
