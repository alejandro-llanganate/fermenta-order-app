import { Route, Client, ProductCategory, Product } from '@/types/routeNotebook';
import { useEffect } from 'react';

interface RouteNotebookTableBodyProps {
    routes: Route[];
    selectedRoute: string;
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
    isVerticalText?: boolean;
}

export default function RouteNotebookTableBody({
    routes,
    selectedRoute,
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
    isVerticalText
}: RouteNotebookTableBodyProps) {
    // 🔍 DEBUG: Log de datos recibidos - solo cuando cambien
    const dataHash = `${routes.length}-${selectedRoute}-${productCategories.length}-${unifiedProducts.length}`;

    useEffect(() => {
        if (!(window as any).lastTableBodyHash || (window as any).lastTableBodyHash !== dataHash) {
            console.log('🔍 RouteNotebookTableBody - Datos recibidos:', {
                rutas: routes.length,
                rutaSeleccionada: selectedRoute,
                categorias: productCategories.length,
                productosUnificados: unifiedProducts.length,
                productosUnificadosNombres: unifiedProducts.map(p => p.name).slice(0, 5)
            });

            // 🔍 DEBUG: Verificar si hay datos pero no se renderizan
            if (unifiedProducts.length === 0) {
                console.log('🚨 PROBLEMA: No hay productos unificados para renderizar');
            } else {
                console.log('✅ OK: Hay productos unificados para renderizar');
            }

            (window as any).lastTableBodyHash = dataHash;
        }
    }, [dataHash]);

    // Filtrar rutas según la selección
    const filteredRoutes = selectedRoute
        ? routes.filter(route => route.id === selectedRoute)
        : routes;

    // Calcular totales filtrados por ruta seleccionada
    const getFilteredTotalForProduct = (productId: string): number => {
        if (selectedRoute) {
            // Solo productos de la ruta seleccionada
            return getTotalForProduct(productId, selectedRoute);
        } else {
            // Todos los productos de todas las rutas
            return getTotalForProduct(productId);
        }
    };

    const getFilteredTotalForAllRoutes = (): { quantity: number; amount: number } => {
        if (selectedRoute) {
            // Solo totales de la ruta seleccionada
            return getTotalForRoute(selectedRoute);
        } else {
            // Suma de todas las rutas
            return routes.reduce((total, route) => {
                const routeTotal = getTotalForRoute(route.id);
                return {
                    quantity: total.quantity + routeTotal.quantity,
                    amount: total.amount + routeTotal.amount
                };
            }, { quantity: 0, amount: 0 });
        }
    };

    return (
        <>
            {filteredRoutes.map((route) => {
                const routeClients = getClientsWithOrders(route.id);
                const routeTotal = getTotalForRoute(route.id);

                return routeClients.map((client) => {
                    const clientTotal = getTotalForClient(client.id);

                    return (
                        <tr key={client.id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                                {client.nombre}
                            </td>
                            {unifiedProducts.map((product) => {
                                const quantity = getQuantityForClientAndProduct(client.id, product.id);

                                // 🔍 DEBUG: Log solo para el primer cliente y primer producto (evitar spam)
                                if (routeClients.indexOf(client) === 0 && unifiedProducts.indexOf(product) === 0) {
                                    console.log(`🔍 RouteNotebookTableBody - Renderizando primera columna: Cliente: ${client.nombre}, Producto: ${product.name}, Cantidad: ${quantity}`);
                                }

                                // Determinar si es un producto de naranja (misma lógica que tabla de totales)
                                const productName = product.name.toLowerCase();
                                const isNaranja = productName.includes('pastelnaranj') ||
                                    productName.includes('naranja') ||
                                    productName.includes('orange');

                                return (
                                    <td
                                        key={product.id}
                                        className={`px-2 py-3 text-sm text-center border-l border-gray-200 ${isNaranja ? 'bg-orange-50' : ''}`}
                                        style={{
                                            // Aplicar estilos inline como en el PDF para garantizar que se vean
                                            ...(isNaranja && {
                                                backgroundColor: '#fed7aa !important',
                                                color: '#ea580c !important'
                                            })
                                        }}
                                    >
                                        {quantity > 0 ? (
                                            <span
                                                className={`font-medium ${isNaranja ? 'text-orange-900' : 'text-black'}`}
                                                style={{
                                                    ...(isNaranja && { color: '#ea580c !important' })
                                                }}
                                            >
                                                {quantity}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                );
                            })}

                        </tr>
                    );
                });
            })}

        </>
    );
}
