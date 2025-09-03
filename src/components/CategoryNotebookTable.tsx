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

    // Calcular totales por tipo para Pasteles
    const getTotalsByType = (): { chocolate: number; naranja: number } => {
        if (selectedCategory !== 'Pasteles') {
            return { chocolate: 0, naranja: 0 };
        }

        let chocolateTotal = 0;
        let naranjaTotal = 0;

        categoryProducts.forEach(product => {
            const total = getTotalForProductInCategory(product.id);

            // Identificar productos de chocolate y naranja por nombre
            const productName = product.name.toLowerCase();
            if (productName.includes('choco') || productName.includes('chocolate')) {
                chocolateTotal += total;
            } else if (productName.includes('naranja') || productName.includes('orange')) {
                naranjaTotal += total;
            }
        });

        return { chocolate: chocolateTotal, naranja: naranjaTotal };
    };

    const totalsByType = getTotalsByType();

    // Filtrar productos que tienen pedidos para Pasteles
    const getProductsWithOrders = () => {
        if (selectedCategory === 'Pasteles') {
            return categoryProducts.filter(product => {
                const total = getTotalForProductInCategory(product.id);
                return total > 0;
            });
        }
        return categoryProducts;
    };

    const filteredProducts = getProductsWithOrders();

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
                {/* Bloque de TOTAL para Pasteles - AL INICIO */}
                {selectedCategory === 'Pasteles' && (totalsByType.chocolate > 0 || totalsByType.naranja > 0) && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4 text-center">
                            TOTAL
                        </h3>

                        {/* Tabla de totales en columnas */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                {/* Headers de productos */}
                                <thead>
                                    <tr>
                                        {/* Headers Chocolate */}
                                        {filteredProducts
                                            .filter(product => {
                                                const productName = product.name.toLowerCase();
                                                return productName.includes('choco') || productName.includes('chocolate');
                                            })
                                            .map(product => (
                                                <th key={product.id} className="bg-orange-100 border border-orange-300 px-2 py-2 text-center">
                                                    <span className="text-xs font-semibold text-orange-800">
                                                        {product.name.replace('PASTEL ', '').replace('CHOCO ', '').replace('CHOCOLATE ', '').substring(0, 8)}
                                                    </span>
                                                </th>
                                            ))}

                                        {/* Headers Naranja */}
                                        {filteredProducts
                                            .filter(product => {
                                                const productName = product.name.toLowerCase();
                                                return productName.includes('naranja') || productName.includes('orange');
                                            })
                                            .map(product => (
                                                <th key={product.id} className="bg-yellow-100 border border-yellow-300 px-2 py-2 text-center">
                                                    <span className="text-xs font-semibold text-yellow-800">
                                                        {product.name.replace('PASTEL ', '').replace('NARANJA ', '').substring(0, 8)}
                                                    </span>
                                                </th>
                                            ))}
                                    </tr>
                                </thead>

                                {/* Fila de datos */}
                                <tbody>
                                    <tr>
                                        {/* Datos Chocolate */}
                                        {filteredProducts
                                            .filter(product => {
                                                const productName = product.name.toLowerCase();
                                                return productName.includes('choco') || productName.includes('chocolate');
                                            })
                                            .map(product => {
                                                const total = getTotalForProductInCategory(product.id);
                                                return (
                                                    <td key={product.id} className="bg-orange-50 border border-orange-300 px-2 py-2 text-center">
                                                        <span className="text-lg font-bold text-orange-900">
                                                            {total}
                                                        </span>
                                                    </td>
                                                );
                                            })}

                                        {/* Datos Naranja */}
                                        {filteredProducts
                                            .filter(product => {
                                                const productName = product.name.toLowerCase();
                                                return productName.includes('naranja') || productName.includes('orange');
                                            })
                                            .map(product => {
                                                const total = getTotalForProductInCategory(product.id);
                                                return (
                                                    <td key={product.id} className="bg-yellow-50 border border-yellow-300 px-2 py-2 text-center">
                                                        <span className="text-lg font-bold text-yellow-900">
                                                            {total}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                    </tr>

                                    {/* Fila de separadores y subtotales */}
                                    <tr>
                                        {/* Separador y subtotal Chocolate */}
                                        <td
                                            colSpan={
                                                filteredProducts.filter(product => {
                                                    const productName = product.name.toLowerCase();
                                                    return productName.includes('choco') || productName.includes('chocolate');
                                                }).length
                                            }
                                            className="bg-orange-200 border border-orange-300 px-3 py-2 text-center"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-orange-800">CHOCOLATE</span>
                                                <span className="text-lg font-bold text-orange-900">{totalsByType.chocolate}</span>
                                            </div>
                                        </td>

                                        {/* Separador y subtotal Naranja */}
                                        <td
                                            colSpan={
                                                filteredProducts.filter(product => {
                                                    const productName = product.name.toLowerCase();
                                                    return productName.includes('naranja') || productName.includes('orange');
                                                }).length
                                            }
                                            className="bg-yellow-200 border border-yellow-300 px-3 py-2 text-center"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-yellow-800">NARANJA</span>
                                                <span className="text-lg font-bold text-yellow-900">{totalsByType.naranja}</span>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Fila de total consolidado */}
                                    <tr>
                                        <td
                                            colSpan={
                                                filteredProducts.filter(product => {
                                                    const productName = product.name.toLowerCase();
                                                    return productName.includes('choco') || productName.includes('chocolate') ||
                                                        productName.includes('naranja') || productName.includes('orange');
                                                }).length
                                            }
                                            className="bg-blue-200 border border-blue-300 px-4 py-3 text-center"
                                        >
                                            <span className="text-xl font-bold text-blue-900">
                                                TOTAL GENERAL: {totalsByType.chocolate + totalsByType.naranja}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tablas por ruta */}
                {selectedCategory ? (
                    <>
                        {routes.map((route) => {
                            const routeClients = getClientsByRoute(route.id);

                            if (routeClients.length === 0) return null;

                            return (
                                <div key={route.id} className="mb-6">
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {route.nombre} - {route.identificador}
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold text-xs" style={{ width: '200px' }}>
                                                            CLIENTES
                                                        </th>
                                                        {filteredProducts.map((product) => (
                                                            <th key={product.id} className="border border-gray-300 px-2 py-2 text-center text-black font-semibold text-xs" style={{ width: '100px' }}>
                                                                {product.name}
                                                            </th>
                                                        ))}

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
                                                                {filteredProducts.map((product) => {
                                                                    const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                                                    const isEditing = editingCell?.clientId === client.id && editingCell?.productId === product.id;

                                                                    return (
                                                                        <td key={product.id} className="border border-gray-300 px-2 py-2 text-center">
                                                                            {quantity > 0 ? (
                                                                                <span className="text-black font-medium">{quantity}</span>
                                                                            ) : (
                                                                                <span className="text-gray-400">-</span>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                })}

                                                            </tr>
                                                        );
                                                    })}

                                                    {/* Route Totals Row */}
                                                    <tr className="bg-gray-100 font-bold">
                                                        <td className="border border-gray-300 px-3 py-2 text-black font-bold">
                                                            TOTALES {route.nombre}
                                                        </td>
                                                        {filteredProducts.map((product) => {
                                                            const total = routeClients.reduce((sum, client) => {
                                                                return sum + getQuantityForClientAndProduct(client.id, product.id);
                                                            }, 0);
                                                            return (
                                                                <td key={product.id} className="border border-gray-300 px-2 py-2 text-black font-bold text-center">
                                                                    {total > 0 ? total : ''}
                                                                </td>
                                                            );
                                                        })}

                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
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
