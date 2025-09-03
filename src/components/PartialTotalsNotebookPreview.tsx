import { Printer } from 'lucide-react';
import { Route, Product } from '@/types/routeNotebook';
import { generateMainTitle } from '@/utils/dateUtils';

interface PartialTotalsNotebookPreviewProps {
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    generatePDF: () => void;
    selectedDate: Date;
    productCategories: { name: string; products: Product[] }[];
    unifiedProducts: Product[];
    routes: Route[];
    getQuantityForRouteAndProduct: (routeId: string, productId: string) => number;
    getTotalForRoute: (routeId: string) => { quantity: number; amount: number };
    getTotalForProduct: (productId: string) => number;
    getTotalForCategory: (categoryName: string) => { quantity: number; amount: number };
    getGrandTotal: () => { quantity: number; amount: number };
    printRef: React.RefObject<HTMLDivElement>;
}

export default function PartialTotalsNotebookPreview({
    showPreview,
    setShowPreview,
    generatePDF,
    selectedDate,
    productCategories,
    unifiedProducts,
    routes,
    getQuantityForRouteAndProduct,
    getTotalForRoute,
    getTotalForProduct,
    getTotalForCategory,
    getGrandTotal,
    printRef
}: PartialTotalsNotebookPreviewProps) {
    if (!showPreview) return null;

    const grandTotal = getGrandTotal();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-full w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Vista Previa - MEGA DONUT TOTALES PARCIALES</h2>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={generatePDF}
                                className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
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
                            <h1 className="text-3xl font-bold text-black">
                                {generateMainTitle(selectedDate, 'TOTALES PARCIALES')}
                            </h1>
                            <p className="text-lg text-gray-600">
                                RESUMEN CONSOLIDADO POR RUTAS Y CATEGORÍAS
                            </p>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300">
                                <thead>
                                    {/* Category Headers */}
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">
                                            RUTAS
                                        </th>
                                        {productCategories.map((category) => (
                                            <th key={category.name} colSpan={category.products.length} className="border border-gray-300 px-3 py-2 text-center text-black font-semibold text-sm">
                                                {category.name}
                                            </th>
                                        ))}
                                        <th className="border border-gray-300 px-3 py-2 text-center text-black font-semibold">
                                            TOTAL
                                        </th>
                                    </tr>
                                    {/* Product Headers */}
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">
                                            &nbsp;
                                        </th>
                                        {unifiedProducts.map((product) => (
                                            <th key={product.id} className="border border-gray-300 px-2 py-2 text-center text-black font-semibold text-xs">
                                                {product.name}
                                            </th>
                                        ))}
                                        <th className="border border-gray-300 px-3 py-2 text-center text-black font-semibold">
                                            CANT. | $
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Route Rows */}
                                    {routes.map((route) => {
                                        const routeTotal = getTotalForRoute(route.id);

                                        return (
                                            <tr key={route.id}>
                                                <td className="border border-gray-300 px-3 py-2 text-black font-medium">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">{route.nombre}</span>
                                                        <span className="text-xs text-gray-500">{route.identificador}</span>
                                                    </div>
                                                </td>
                                                {unifiedProducts.map((product) => {
                                                    const quantity = getQuantityForRouteAndProduct(route.id, product.id);
                                                    return (
                                                        <td key={product.id} className="border border-gray-300 px-2 py-2 text-black text-center">
                                                            {quantity > 0 ? quantity : ''}
                                                        </td>
                                                    );
                                                })}
                                                <td className="border border-gray-300 px-3 py-2 text-black font-medium text-center">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold">{routeTotal.quantity}</span>
                                                        <span className="text-xs">${routeTotal.amount.toFixed(2)}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {/* Grand Total Row */}
                                    <tr className="bg-purple-100 font-bold">
                                        <td className="border border-gray-300 px-3 py-2 text-black font-bold">
                                            TOTAL GENERAL
                                        </td>
                                        {unifiedProducts.map((product) => {
                                            const total = getTotalForProduct(product.id);
                                            return (
                                                <td key={product.id} className="border border-gray-300 px-2 py-2 text-black font-bold text-center">
                                                    {total > 0 ? total : ''}
                                                </td>
                                            );
                                        })}
                                        <td className="border border-gray-300 px-3 py-2 text-black font-bold text-center">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{grandTotal.quantity}</span>
                                                <span className="text-xs">${grandTotal.amount.toFixed(2)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Cards */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Ejecutivo</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600">Total Órdenes</p>
                                    <p className="text-2xl font-bold text-purple-600">{routes.length}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600">Total Productos</p>
                                    <p className="text-2xl font-bold text-purple-600">{unifiedProducts.length}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600">Cantidad Total</p>
                                    <p className="text-2xl font-bold text-purple-600">{grandTotal.quantity}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600">Monto Total</p>
                                    <p className="text-2xl font-bold text-purple-600">${grandTotal.amount.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t border-gray-300">
                            <p className="text-center text-sm text-gray-800 font-medium">
                                MEGA DONUT - Sistema de Gestión de Totales Parciales<br />
                                Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
