import { Route, Client, ProductCategory, Product } from '@/types/routeNotebook';
import RouteNotebookTableHeader from './RouteNotebookTableHeader';
import RouteNotebookTableBody from './RouteNotebookTableBody';
import RouteNotebookTableLoading from './RouteNotebookTableLoading';
import { useState, useEffect } from 'react';

interface RouteNotebookTableProps {
    routes: Route[];
    selectedRoute: string;
    setSelectedRoute: (route: string) => void;
    loading: boolean;
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
    onDefineColumnOrder: () => void;
    saveColumnOrder: (categories: ProductCategory[]) => void;
    onReorderCategories: (newCategories: ProductCategory[]) => void;
    onReorderProducts: (newProducts: Product[]) => void;
}

export default function RouteNotebookTable({
    routes,
    selectedRoute,
    setSelectedRoute,
    loading,
    productCategories,
    unifiedProducts,
    getClientsWithOrders,
    getQuantityForClientAndProduct,
    getTotalForClient,
    getTotalForProduct,
    getTotalForRoute,
    handleQuantityChange,
    editingCell,
    isUpdating,
    onDefineColumnOrder,
    saveColumnOrder,
    onReorderCategories,
    onReorderProducts
}: RouteNotebookTableProps) {
    // 🔍 DEBUG: Log de props recibidas - solo cuando cambien
    const propsHash = `${routes.length}-${selectedRoute}-${loading}-${productCategories.length}-${unifiedProducts.length}`;

    useEffect(() => {
        if (!(window as any).lastRouteTablePropsHash || (window as any).lastRouteTablePropsHash !== propsHash) {
            console.log('🔍 RouteNotebookTable - Props recibidas:', {
                rutas: routes.length,
                rutaSeleccionada: selectedRoute,
                loading: loading,
                categorias: productCategories.length,
                productosUnificados: unifiedProducts.length,
                productosUnificadosNombres: unifiedProducts.map(p => p.name).slice(0, 5)
            });
            (window as any).lastRouteTablePropsHash = propsHash;
        }
    }, [propsHash]);

    // Estado para la orientación vertical del texto
    const [isVerticalText, setIsVerticalText] = useState(() => {
        const saved = localStorage.getItem('routeNotebookVerticalText');
        return saved ? JSON.parse(saved) : false;
    });

    // Guardar en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('routeNotebookVerticalText', JSON.stringify(isVerticalText));
    }, [isVerticalText]);

    // Función para alternar la orientación del texto
    const toggleVerticalText = () => {
        setIsVerticalText(!isVerticalText);
    };

    // Mostrar todos los productos (columnas fijas)
    const getProductsWithOrders = () => {
        return unifiedProducts; // Mostrar todos los productos
    };

    const filteredProducts = getProductsWithOrders();

    // Funciones para reordenar categorías (trabajan solo con arrays filtrados)
    const handleMoveCategoryLeft = (filteredCategoryIndex: number) => {
        const filteredCategories = getCategoriesWithOrders();

        if (filteredCategoryIndex > 0) {
            // Crear nuevo array con solo las categorías filtradas
            const newFilteredCategories = [...filteredCategories];

            // Intercambiar directamente en el array filtrado
            const temp = newFilteredCategories[filteredCategoryIndex];
            newFilteredCategories[filteredCategoryIndex] = newFilteredCategories[filteredCategoryIndex - 1];
            newFilteredCategories[filteredCategoryIndex - 1] = temp;

            // Crear nuevo array completo manteniendo el orden de las categorías filtradas
            const newCategories = [...productCategories];

            // Aplicar el nuevo orden solo a las categorías filtradas
            let filteredIndex = 0;
            for (let i = 0; i < newCategories.length; i++) {
                // Si esta categoría está en el array filtrado, aplicar el nuevo orden
                if (filteredCategories.some(cat => cat.name === newCategories[i].name)) {
                    newCategories[i] = newFilteredCategories[filteredIndex];
                    filteredIndex++;
                }
            }

            onReorderCategories(newCategories);
        }
    };

    const handleMoveCategoryRight = (filteredCategoryIndex: number) => {
        const filteredCategories = getCategoriesWithOrders();

        if (filteredCategoryIndex < filteredCategories.length - 1) {
            // Crear nuevo array con solo las categorías filtradas
            const newFilteredCategories = [...filteredCategories];

            // Intercambiar directamente en el array filtrado
            const temp = newFilteredCategories[filteredCategoryIndex];
            newFilteredCategories[filteredCategoryIndex] = newFilteredCategories[filteredCategoryIndex + 1];
            newFilteredCategories[filteredCategoryIndex + 1] = temp;

            // Crear nuevo array completo manteniendo el orden de las categorías filtradas
            const newCategories = [...productCategories];

            // Aplicar el nuevo orden solo a las categorías filtradas
            let filteredIndex = 0;
            for (let i = 0; i < newCategories.length; i++) {
                // Si esta categoría está en el array filtrado, aplicar el nuevo orden
                if (filteredCategories.some(cat => cat.name === newCategories[i].name)) {
                    newCategories[i] = newFilteredCategories[filteredIndex];
                    filteredIndex++;
                }
            }

            onReorderCategories(newCategories);
        }
    };

    // Funciones para reordenar productos (nueva estrategia simple)
    const handleMoveProductLeft = (filteredProductIndex: number) => {
        const filteredProducts = getProductsWithOrders();

        if (filteredProductIndex > 0) {
            // Obtener el producto que se quiere mover
            const productToMove = filteredProducts[filteredProductIndex];
            const productToSwap = filteredProducts[filteredProductIndex - 1];

            console.log('🔄 handleMoveProductLeft - Producto a mover:', productToMove.name);
            console.log('🔄 handleMoveProductLeft - Producto a intercambiar:', productToSwap.name);
            console.log('🔄 handleMoveProductLeft - Índice filtrado:', filteredProductIndex);

            // Verificar que ambos productos pertenezcan a la misma categoría
            const productToMoveCategory = productCategories.find(cat =>
                cat.products.some(prod => prod.id === productToMove.id)
            );
            const productToSwapCategory = productCategories.find(cat =>
                cat.products.some(prod => prod.id === productToSwap.id)
            );

            console.log('🔄 handleMoveProductLeft - Categoría del producto a mover:', productToMoveCategory?.name);
            console.log('🔄 handleMoveProductLeft - Categoría del producto a intercambiar:', productToSwapCategory?.name);

            // Solo permitir el intercambio si ambos productos están en la misma categoría
            if (productToMoveCategory && productToSwapCategory &&
                productToMoveCategory.name === productToSwapCategory.name) {

                console.log('✅ handleMoveProductLeft - Misma categoría, procediendo con intercambio');

                // Crear nuevo array de productos unificados
                const newUnifiedProducts = [...unifiedProducts];

                // Encontrar los índices reales en el array unificado
                const moveIndex = newUnifiedProducts.findIndex(prod => prod.id === productToMove.id);
                const swapIndex = newUnifiedProducts.findIndex(prod => prod.id === productToSwap.id);

                console.log('🔄 handleMoveProductLeft - Índices en array unificado:', { moveIndex, swapIndex });
                console.log('🔄 handleMoveProductLeft - Productos en índices unificados:', {
                    moveProduct: newUnifiedProducts[moveIndex]?.name,
                    swapProduct: newUnifiedProducts[swapIndex]?.name
                });

                if (moveIndex !== -1 && swapIndex !== -1) {
                    // Intercambiar los productos en el array unificado
                    const temp = newUnifiedProducts[moveIndex];
                    newUnifiedProducts[moveIndex] = newUnifiedProducts[swapIndex];
                    newUnifiedProducts[swapIndex] = temp;

                    console.log('✅ handleMoveProductLeft - Productos intercambiados en array unificado');

                    // Crear nuevo array de categorías con el orden actualizado
                    const newCategories = [...productCategories];

                    // Reconstruir las categorías con el nuevo orden de productos
                    let productIndex = 0;
                    for (let i = 0; i < newCategories.length; i++) {
                        const category = newCategories[i];
                        const categoryProductCount = category.products.length;

                        // Actualizar los productos de esta categoría con el nuevo orden
                        newCategories[i] = {
                            ...category,
                            products: newUnifiedProducts.slice(productIndex, productIndex + categoryProductCount)
                        };

                        productIndex += categoryProductCount;
                    }

                    // Reordenar las categorías (esto es lo que realmente funciona)
                    onReorderCategories(newCategories);
                }
            } else {
                console.log('❌ handleMoveProductLeft - Diferentes categorías, no se permite el intercambio');
            }
        }
    };

    const handleMoveProductRight = (filteredProductIndex: number) => {
        const filteredProducts = getProductsWithOrders();

        if (filteredProductIndex < filteredProducts.length - 1) {
            // Obtener el producto que se quiere mover
            const productToMove = filteredProducts[filteredProductIndex];
            const productToSwap = filteredProducts[filteredProductIndex + 1];

            console.log('🔄 handleMoveProductRight - Producto a mover:', productToMove.name);
            console.log('🔄 handleMoveProductRight - Producto a intercambiar:', productToSwap.name);
            console.log('🔄 handleMoveProductRight - Índice filtrado:', filteredProductIndex);

            // Verificar que ambos productos pertenezcan a la misma categoría
            const productToMoveCategory = productCategories.find(cat =>
                cat.products.some(prod => prod.id === productToMove.id)
            );
            const productToSwapCategory = productCategories.find(cat =>
                cat.products.some(prod => prod.id === productToSwap.id)
            );

            console.log('🔄 handleMoveProductRight - Categoría del producto a mover:', productToMoveCategory?.name);
            console.log('🔄 handleMoveProductRight - Categoría del producto a intercambiar:', productToSwapCategory?.name);

            // Solo permitir el intercambio si ambos productos están en la misma categoría
            if (productToMoveCategory && productToSwapCategory &&
                productToMoveCategory.name === productToSwapCategory.name) {

                console.log('✅ handleMoveProductRight - Misma categoría, procediendo con intercambio');

                // Crear nuevo array de productos unificados
                const newUnifiedProducts = [...unifiedProducts];

                // Encontrar los índices reales en el array unificado
                const moveIndex = newUnifiedProducts.findIndex(prod => prod.id === productToMove.id);
                const swapIndex = newUnifiedProducts.findIndex(prod => prod.id === productToSwap.id);

                console.log('🔄 handleMoveProductRight - Índices en array unificado:', { moveIndex, swapIndex });
                console.log('🔄 handleMoveProductRight - Productos en índices unificados:', {
                    moveProduct: newUnifiedProducts[moveIndex]?.name,
                    swapProduct: newUnifiedProducts[swapIndex]?.name
                });

                if (moveIndex !== -1 && swapIndex !== -1) {
                    // Intercambiar los productos en el array unificado
                    const temp = newUnifiedProducts[moveIndex];
                    newUnifiedProducts[moveIndex] = newUnifiedProducts[swapIndex];
                    newUnifiedProducts[swapIndex] = temp;

                    console.log('✅ handleMoveProductRight - Productos intercambiados en array unificado');

                    // Crear nuevo array de categorías con el orden actualizado
                    const newCategories = [...productCategories];

                    // Reconstruir las categorías con el nuevo orden de productos
                    let productIndex = 0;
                    for (let i = 0; i < newCategories.length; i++) {
                        const category = newCategories[i];
                        const categoryProductCount = category.products.length;

                        // Actualizar los productos de esta categoría con el nuevo orden
                        newCategories[i] = {
                            ...category,
                            products: newUnifiedProducts.slice(productIndex, productIndex + categoryProductCount)
                        };

                        productIndex += categoryProductCount;
                    }

                    // Reordenar las categorías (esto es lo que realmente funciona)
                    onReorderCategories(newCategories);
                }
            } else {
                console.log('❌ handleMoveProductRight - Diferentes categorías, no se permite el intercambio');
            }
        }
    };

    // Mostrar todas las categorías (columnas fijas)
    const getCategoriesWithOrders = () => {
        return productCategories; // Mostrar todas las categorías
    };

    const filteredCategories = getCategoriesWithOrders();

    if (loading) {
        return <RouteNotebookTableLoading />;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Route Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex items-center justify-between px-6">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {routes.map((route) => (
                            <button
                                key={route.id}
                                onClick={() => setSelectedRoute(selectedRoute === route.id ? '' : route.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${selectedRoute === route.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {route.nombre}
                            </button>
                        ))}
                    </nav>

                    {/* Botón para orientación vertical del texto */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleVerticalText}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${isVerticalText
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            title={isVerticalText ? 'Cambiar a texto horizontal' : 'Cambiar a texto vertical'}
                        >
                            {isVerticalText ? 'Horizontal' : 'Vertical'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Unified Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
                    <thead className="bg-gray-50">
                        <RouteNotebookTableHeader
                            routes={routes}
                            selectedRoute={selectedRoute}
                            setSelectedRoute={setSelectedRoute}
                            productCategories={productCategories}
                            unifiedProducts={unifiedProducts}
                            getTotalForProduct={getTotalForProduct}
                            onMoveCategoryLeft={handleMoveCategoryLeft}
                            onMoveCategoryRight={handleMoveCategoryRight}
                            onMoveProductLeft={handleMoveProductLeft}
                            onMoveProductRight={handleMoveProductRight}
                            isVerticalText={isVerticalText}
                        />
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <RouteNotebookTableBody
                            routes={routes}
                            selectedRoute={selectedRoute}
                            productCategories={productCategories}
                            unifiedProducts={unifiedProducts}
                            getClientsWithOrders={getClientsWithOrders}
                            getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                            getTotalForClient={getTotalForClient}
                            getTotalForProduct={getTotalForProduct}
                            getTotalForRoute={getTotalForRoute}
                            handleQuantityChange={handleQuantityChange}
                            editingCell={editingCell}
                            isUpdating={isUpdating}
                            isVerticalText={isVerticalText}
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
}
