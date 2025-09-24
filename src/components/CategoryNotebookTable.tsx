import { Plus } from 'lucide-react';
import { Client, ProductCategory, Product, Route } from '@/types/routeNotebook';
import CategoryNotebookTableLoading from './CategoryNotebookTableLoading';
import { useFontSize } from '@/contexts/FontSizeContext';
import { useAuth } from '@/contexts/AuthContext';
import FontSizeConfig from './FontSizeConfig';
import { getOptimizedTableText } from '@/utils/textHandling';

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
    getDonutCalculations: (filteredProducts?: any[]) => { totalDonuts: number; result: number; restante: number; donutProducts: string[] } | null;
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
    isUpdating,
    getDonutCalculations
}: CategoryNotebookTableProps) {
    const { getFontSizeClass, getFontSizeValue } = useFontSize();
    const { isAdmin } = useAuth();

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
        if (selectedCategory.toLowerCase() !== 'pasteles') {
            return { chocolate: 0, naranja: 0 };
        }

        let chocolateTotal = 0;
        let naranjaTotal = 0;

        categoryProducts.forEach(product => {
            const total = getTotalForProductInCategory(product.id);

            // Identificar productos de chocolate y naranja por nombre
            const productName = product.name.toLowerCase();
            if (productName.includes('pastelchoco') || productName.includes('choco') || productName.includes('chocolate')) {
                chocolateTotal += total;
            } else if (productName.includes('pastelnaranj') || productName.includes('naranja') || productName.includes('orange')) {
                naranjaTotal += total;
            }
        });

        return { chocolate: chocolateTotal, naranja: naranjaTotal };
    };

    const totalsByType = getTotalsByType();

    // Debug: Log para verificar si se está detectando la categoría correctamente
    console.log('🔍 CategoryNotebookTable Debug:', {
        selectedCategory,
        isPasteles: selectedCategory.toLowerCase() === 'pasteles',
        totalsByType,
        categoryProducts: categoryProducts.length,
        allProducts: categoryProducts.map(p => ({ name: p.name, total: getTotalForProductInCategory(p.id) })),
        chocolateProducts: categoryProducts.filter(p => p.name.toLowerCase().includes('pastelchoco') || p.name.toLowerCase().includes('choco') || p.name.toLowerCase().includes('chocolate')),
        naranjaProducts: categoryProducts.filter(p => p.name.toLowerCase().includes('pastelnaranj') || p.name.toLowerCase().includes('naranja') || p.name.toLowerCase().includes('orange'))
    });

    // Filtrar productos que tienen pedidos para Pasteles y Donuts
    const getProductsWithOrders = () => {
        if (selectedCategory.toLowerCase() === 'pasteles' || selectedCategory.toLowerCase() === 'donuts') {
            return categoryProducts.filter(product => {
                const total = getTotalForProductInCategory(product.id);
                return total > 0;
            });
        }
        return categoryProducts;
    };

    // Para la tabla de resumen, usar solo productos de pasteles que tengan cantidades > 0
    const getAllPastelProducts = () => {
        if (selectedCategory.toLowerCase() === 'pasteles') {
            return categoryProducts.filter(product => {
                const total = getTotalForProductInCategory(product.id);
                return total > 0;
            });
        }
        return [];
    };

    const filteredProducts = getProductsWithOrders();
    const allPastelProducts = getAllPastelProducts();

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Category Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex items-center justify-between px-6">
                    <nav className="flex space-x-8 overflow-x-auto">
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

                    {/* Configuración de tamaño de letra */}
                    <FontSizeConfig />
                </div>
            </div>

            {/* Content - Multiple Tables by Route */}
            <div className="p-6 space-y-8">
                {/* Bloque de TOTAL para Pasteles - AL INICIO */}
                {selectedCategory.toLowerCase() === 'pasteles' && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-6">
                        <h3 className={`font-bold text-green-900 mb-4 text-center ${getFontSizeClass('titles')}`}>
                            TOTAL
                        </h3>

                        {/* Tabla de totales en columnas - Estilo similar a la imagen */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                {/* Headers de productos */}
                                <thead>
                                    {/* Fila de categorías CHOCOLATE y NARANJA */}
                                    <tr>
                                        {/* Categoría Chocolate */}
                                        <th
                                            colSpan={
                                                allPastelProducts.filter(product => {
                                                    const productName = product.name.toLowerCase();
                                                    return productName.includes('pastelchoco') || productName.includes('choco') || productName.includes('chocolate');
                                                }).length
                                            }
                                            className="bg-orange-200 border border-orange-300 px-3 py-2 text-center"
                                        >
                                            <span className={`font-bold text-orange-900 ${getFontSizeClass('titles')}`}>
                                                CHOCOLATE
                                            </span>
                                        </th>

                                        {/* Categoría Naranja */}
                                        <th
                                            colSpan={
                                                allPastelProducts.filter(product => {
                                                    const productName = product.name.toLowerCase();
                                                    return productName.includes('pastelnaranj') || productName.includes('naranja') || productName.includes('orange');
                                                }).length
                                            }
                                            className="bg-yellow-200 border border-yellow-300 px-3 py-2 text-center"
                                        >
                                            <span className={`font-bold text-yellow-900 ${getFontSizeClass('titles')}`}>
                                                NARANJA
                                            </span>
                                        </th>
                                    </tr>

                                    {/* Fila de headers de productos */}
                                    <tr>
                                        {/* Headers Chocolate */}
                                        {allPastelProducts
                                            .filter(product => {
                                                const productName = product.name.toLowerCase();
                                                return productName.includes('pastelchoco') || productName.includes('choco') || productName.includes('chocolate');
                                            })
                                            .map(product => {
                                                // Usar la nueva estrategia de manejo de texto
                                                const textOptimization = getOptimizedTableText(
                                                    product.name,
                                                    selectedCategory,
                                                    { maxLength: 10, maxWords: 2 }
                                                );

                                                return (
                                                    <th
                                                        key={product.id}
                                                        className="bg-orange-100 border border-orange-300 px-2 py-2 text-center"
                                                        title={textOptimization.fullText}
                                                    >
                                                        <span className={`font-bold text-orange-800 ${getFontSizeClass('cells')} ${textOptimization.classes}`} style={textOptimization.styles}>
                                                            {textOptimization.displayText}
                                                        </span>
                                                    </th>
                                                );
                                            })}

                                        {/* Headers Naranja */}
                                        {allPastelProducts
                                            .filter(product => {
                                                const productName = product.name.toLowerCase();
                                                return productName.includes('pastelnaranj') || productName.includes('naranja') || productName.includes('orange');
                                            })
                                            .map(product => {
                                                // Usar la nueva estrategia de manejo de texto
                                                const textOptimization = getOptimizedTableText(
                                                    product.name,
                                                    selectedCategory,
                                                    { maxLength: 10, maxWords: 2 }
                                                );

                                                return (
                                                    <th
                                                        key={product.id}
                                                        className="bg-yellow-100 border border-yellow-300 px-2 py-2 text-center"
                                                        title={textOptimization.fullText}
                                                    >
                                                        <span className={`font-bold text-yellow-800 ${getFontSizeClass('cells')} ${textOptimization.classes}`} style={textOptimization.styles}>
                                                            {textOptimization.displayText}
                                                        </span>
                                                    </th>
                                                );
                                            })}
                                    </tr>
                                </thead>

                                {/* Fila de datos */}
                                <tbody>
                                    <tr>
                                        {/* Datos Chocolate */}
                                        {allPastelProducts
                                            .filter(product => {
                                                const productName = product.name.toLowerCase();
                                                return productName.includes('pastelchoco') || productName.includes('choco') || productName.includes('chocolate');
                                            })
                                            .map(product => {
                                                const total = getTotalForProductInCategory(product.id);
                                                return (
                                                    <td
                                                        key={product.id}
                                                        className="bg-orange-50 border border-orange-300 px-2 py-2 text-center"
                                                        title={`${product.name}: ${total}`}
                                                    >
                                                        <span className={`font-bold text-orange-900 ${getFontSizeClass('headers')}`}>
                                                            {total}
                                                        </span>
                                                    </td>
                                                );
                                            })}

                                        {/* Datos Naranja */}
                                        {allPastelProducts
                                            .filter(product => {
                                                const productName = product.name.toLowerCase();
                                                return productName.includes('pastelnaranj') || productName.includes('naranja') || productName.includes('orange');
                                            })
                                            .map(product => {
                                                const total = getTotalForProductInCategory(product.id);
                                                return (
                                                    <td
                                                        key={product.id}
                                                        className="bg-yellow-50 border border-yellow-300 px-2 py-2 text-center"
                                                        title={`${product.name}: ${total}`}
                                                    >
                                                        <span className={`font-bold text-yellow-900 ${getFontSizeClass('headers')}`}>
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
                                                allPastelProducts.filter(product => {
                                                    const productName = product.name.toLowerCase();
                                                    return productName.includes('pastelchoco') || productName.includes('choco') || productName.includes('chocolate');
                                                }).length
                                            }
                                            className="bg-orange-200 border border-orange-300 px-3 py-2 text-center"
                                        >
                                            <span className={`font-bold text-orange-900 ${getFontSizeClass('headers')}`}>{totalsByType.chocolate}</span>
                                        </td>

                                        {/* Separador y subtotal Naranja */}
                                        <td
                                            colSpan={
                                                allPastelProducts.filter(product => {
                                                    const productName = product.name.toLowerCase();
                                                    return productName.includes('pastelnaranj') || productName.includes('naranja') || productName.includes('orange');
                                                }).length
                                            }
                                            className="bg-yellow-200 border border-yellow-300 px-3 py-2 text-center"
                                        >
                                            <span className={`font-bold text-yellow-900 ${getFontSizeClass('headers')}`}>{totalsByType.naranja}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tabla de Donas Normales - Solo para categoría DONUTS */}
                {selectedCategory && selectedCategory.toLowerCase() === 'donuts' && (() => {
                    const donutCalc = getDonutCalculations(filteredProducts);
                    if (!donutCalc) return null;

                    return (
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-6 border border-yellow-200 mb-6">
                            <h3 className={`font-bold text-yellow-900 mb-4 text-center ${getFontSizeClass('titles')}`}>
                                SUMA DONAS NORMALES
                            </h3>

                            <div className="bg-white rounded-lg p-4 border border-yellow-300">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>

                                        <div>
                                            <h4 className={`font-semibold text-gray-700 mb-2 ${getFontSizeClass('headers')}`}>
                                                Cálculos:
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className={`${getFontSizeClass('cells')}`}>Total Donas:</span>
                                                    <span className={`font-bold ${getFontSizeClass('cells')}`}>{donutCalc.totalDonuts}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={`${getFontSizeClass('cells')}`}>Resultado / 30:</span>
                                                    <span className={`font-bold ${getFontSizeClass('cells')}`}>{donutCalc.result}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={`${getFontSizeClass('cells')}`}>Restante:</span>
                                                    <span className={`font-bold text-red-600 ${getFontSizeClass('cells')}`}>{donutCalc.restante}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-yellow-300 pt-4">
                                        <div className="text-center">
                                            <div className={`font-bold text-yellow-900 ${getFontSizeClass('headers')}`}>
                                                Total Donas: {donutCalc.totalDonuts} | Resultado: {donutCalc.result} | Restante: {donutCalc.restante}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            );
                })()}

                            {/* Resumen de Cantidades por Producto - Diseño de Recuadros (solo para categorías que no sean Pasteles) */}
                            {selectedCategory && selectedCategory.toLowerCase() !== 'pasteles' && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 mb-6">
                                    <h3 className={`font-bold text-green-900 mb-6 text-center ${getFontSizeClass('titles')}`}>
                                        TOTALES POR PRODUCTO - {selectedCategory.toUpperCase()}
                                    </h3>

                                    {/* Grid de recuadros de productos */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                        {filteredProducts.map((product) => {
                                            const totalQuantity = getTotalForProduct(product.id);

                                            return (
                                                <div
                                                    key={product.id}
                                                    className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                                                >
                                                    <div className="text-center">
                                                        <div className={`font-bold text-gray-800 mb-2 ${getFontSizeClass('cells')}`}>
                                                            {product.name}
                                                        </div>
                                                        <div className={`font-bold text-green-600 ${getFontSizeClass('headers')}`}>
                                                            {totalQuantity}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Total General */}
                                    <div className="mt-6 text-center">
                                        <div className="inline-block bg-green-200 rounded-lg px-6 py-3 border border-green-300">
                                            <div className={`font-bold text-green-900 ${getFontSizeClass('headers')}`}>
                                                TOTAL GENERAL: {filteredProducts.reduce((sum, product) => sum + getTotalForProduct(product.id), 0)}
                                            </div>
                                        </div>
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
                                                        <h3 className={`font-semibold text-gray-900 ${getFontSizeClass('titles')}`}>
                                                            {route.nombre} - {route.identificador}
                                                        </h3>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border-collapse">
                                                            <thead>
                                                                <tr className="bg-gray-50">
                                                                    <th className={`border border-gray-300 px-3 py-2 text-left text-black font-semibold ${getFontSizeClass('headers')}`} style={{ width: '200px' }}>
                                                                        CLIENTES
                                                                    </th>
                                                                    {filteredProducts.map((product) => {
                                                                        // Función para obtener abreviación del producto (solo para Pasteles)
                                                                        // Usar la nueva estrategia de manejo de texto
                                                                        const textOptimization = getOptimizedTableText(
                                                                            product.name,
                                                                            selectedCategory,
                                                                            { maxLength: 12, maxWords: 2 }
                                                                        );

                                                                        return (
                                                                            <th
                                                                                key={product.id}
                                                                                className={`border border-gray-300 px-2 py-2 text-center text-black font-semibold ${getFontSizeClass('headers')} ${textOptimization.classes}`}
                                                                                style={{ width: '100px', ...textOptimization.styles }}
                                                                                title={textOptimization.fullText}
                                                                            >
                                                                                {textOptimization.displayText}
                                                                            </th>
                                                                        );
                                                                    })}

                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {routeClients.map((client) => {
                                                                    const clientTotal = getTotalForClient(client.id);

                                                                    return (
                                                                        <tr key={client.id} className="hover:bg-gray-50">
                                                                            <td className={`border border-gray-300 px-3 py-2 text-black font-medium ${getFontSizeClass('cells')}`}>
                                                                                {client.nombre}
                                                                            </td>
                                                                            {filteredProducts.map((product) => {
                                                                                const quantity = getQuantityForClientAndProduct(client.id, product.id);
                                                                                const isEditing = editingCell?.clientId === client.id && editingCell?.productId === product.id;

                                                                                return (
                                                                                    <td key={product.id} className={`border border-gray-300 px-2 py-2 text-center ${getFontSizeClass('cells')}`}>
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
                                                                    <td className={`border border-gray-300 px-3 py-2 text-black font-bold ${getFontSizeClass('headers')}`}>
                                                                        TOTALES {route.nombre}
                                                                    </td>
                                                                    {filteredProducts.map((product) => {
                                                                        const total = routeClients.reduce((sum, client) => {
                                                                            return sum + getQuantityForClientAndProduct(client.id, product.id);
                                                                        }, 0);
                                                                        return (
                                                                            <td key={product.id} className={`border border-gray-300 px-2 py-2 text-black font-bold text-center ${getFontSizeClass('headers')}`}>
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
                        </div>
        </div>
            );
}
