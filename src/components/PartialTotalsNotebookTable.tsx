import { Route, Product } from '@/types/routeNotebook';
import PartialTotalsNotebookTableLoading from './PartialTotalsNotebookTableLoading';
import { getCategoryColors } from '@/utils/categoryColors';

interface PartialTotalsNotebookTableProps {
    loading: boolean;
    routes: Route[];
    productCategories: { name: string; products: Product[] }[];
    unifiedProducts: Product[];
    getQuantityForRouteAndProduct: (routeId: string, productId: string) => number;
    getTotalForRoute: (routeId: string) => { quantity: number; amount: number };
    getTotalForProduct: (productId: string) => number;
    getTotalForCategory: (categoryName: string) => { quantity: number; amount: number };
    getGrandTotal: () => { quantity: number; amount: number };
}

export default function PartialTotalsNotebookTable({
    loading,
    routes,
    productCategories,
    unifiedProducts,
    getQuantityForRouteAndProduct,
    getTotalForRoute,
    getTotalForProduct,
    getTotalForCategory,
    getGrandTotal
}: PartialTotalsNotebookTableProps) {
    if (loading) {
        return <PartialTotalsNotebookTableLoading />;
    }

    const grandTotal = getGrandTotal();

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
                <h2 className="text-xl font-semibold text-purple-900">
                    Resumen Consolidado por Rutas y Categorías
                </h2>
                <p className="text-sm text-purple-600 mt-1">
                    Totales parciales por ruta, categoría y producto
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300" style={{ tableLayout: 'fixed' }}>
                    <thead>
                        {/* Category Headers - RF-18: Colores de categoría */}
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold sticky left-0 bg-gray-100 z-20" style={{ width: '200px' }}>
                                RUTAS
                            </th>
                            {productCategories.map((category) => (
                                <th key={category.name} colSpan={category.products.length} className={`border border-gray-300 px-3 py-2 text-center font-semibold text-sm ${getCategoryColors(category.name).backgroundColor} ${getCategoryColors(category.name).textColor}`}>
                                    {category.name}
                                </th>
                            ))}
                            <th className="border border-gray-300 px-3 py-2 text-center text-black font-semibold" style={{ width: '120px' }}>
                                TOTAL
                            </th>
                        </tr>
                        {/* Product Headers */}
                        <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold sticky left-0 bg-gray-50 z-20" style={{ width: '200px' }}>
                                &nbsp;
                            </th>
                            {unifiedProducts.map((product) => (
                                <th key={product.id} className="border border-gray-300 px-2 py-2 text-center text-black font-semibold text-xs" style={{ width: '80px' }}>
                                    {product.name}
                                </th>
                            ))}
                            <th className="border border-gray-300 px-3 py-2 text-center text-black font-semibold" style={{ width: '120px' }}>
                                CANT. | $
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Route Rows */}
                        {routes.map((route) => {
                            const routeTotal = getTotalForRoute(route.id);

                            return (
                                <tr key={route.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-3 py-2 text-black font-medium sticky left-0 bg-white z-10">
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
                            <td className="border border-gray-300 px-3 py-2 text-black font-bold sticky left-0 bg-purple-100 z-20">
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
            <div className="p-6 bg-gray-50 border-t border-gray-200">
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
        </div>
    );
}
