'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Footer from './Footer';
import RouteNotebookHeader from './RouteNotebookHeader';
import RouteNotebookControls from './RouteNotebookControls';
import RouteNotebookTable from './RouteNotebookTable';
import RouteNotebookPreview from './RouteNotebookPreview';
import { Route, Client, Product, ProductCategory, Order, OrderItem } from '@/types/routeNotebook';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RouteNotebookPDF from './pdf/RouteNotebookPDF';
import { sortProductsByCategoryOrder } from '@/utils/productOrderConfig';
// ColumnOrderModal eliminado - ahora usamos localStorage directamente

interface RouteNotebookProps {
    onBack: () => void;
}

export default function RouteNotebook({ onBack }: RouteNotebookProps) {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [dateFilterType, setDateFilterType] = useState<'registration' | 'delivery'>('registration');
    const [selectedRoute, setSelectedRoute] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [editingCell, setEditingCell] = useState<{ clientId: string; productId: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    // Sistema de orden local con localStorage
    const [columnOrderVersion, setColumnOrderVersion] = useState(0); // Para forzar re-render
    const printRef = useRef<HTMLDivElement>(null);

    // Estado para la orientación vertical del texto (por defecto activado)
    const [isVerticalText, setIsVerticalText] = useState(() => {
        const saved = localStorage.getItem('routeNotebookVerticalText');
        return saved ? JSON.parse(saved) : true; // Por defecto true (vertical)
    });

    // Sincronizar con localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('routeNotebookVerticalText', JSON.stringify(isVerticalText));
    }, [isVerticalText]);

    // 🔍 DEBUG: Obtener información del usuario actual (solo una vez)
    const [userInfo, setUserInfo] = useState<any>(null);

    useEffect(() => {
        try {
            const currentUser = sessionStorage.getItem('currentUser');
            if (currentUser) {
                const userData = JSON.parse(currentUser);
                console.log('🔍 RouteNotebook - Usuario actual:', {
                    id: userData.id,
                    username: userData.username,
                    role: userData.role,
                    type: userData.type,
                    first_name: userData.first_name,
                    last_name: userData.last_name
                });
                setUserInfo(userData);

                // 🔧 FIX: Limpiar caché específico del usuario para evitar conflictos
                const userCacheKey = `routeNotebookCache_${userData.id}`;
                const lastCache = localStorage.getItem(userCacheKey);
                if (lastCache) {
                    console.log('🔧 Limpiando caché anterior del usuario:', userData.role);
                    localStorage.removeItem(userCacheKey);
                }
            } else {
                console.log('🔍 RouteNotebook - No hay usuario en sessionStorage');
                setUserInfo(null);
            }
        } catch (error) {
            console.error('🔍 RouteNotebook - Error obteniendo usuario:', error);
            setUserInfo(null);
        }
    }, []); // Solo se ejecuta una vez al montar el componente

    useEffect(() => {
        fetchData();
    }, []);

    // Listener para cambios en localStorage del orden de columnas
    useEffect(() => {
        const handleLocalChange = () => {
            console.log('🔄 Evento megaDonutColumnOrderChanged recibido, actualizando versión...');
            setColumnOrderVersion(prev => {
                const newVersion = prev + 1;
                console.log(`📈 Nueva versión de orden: ${newVersion}`);
                return newVersion;
            });
        };

        window.addEventListener('megaDonutColumnOrderChanged', handleLocalChange);

        return () => {
            window.removeEventListener('megaDonutColumnOrderChanged', handleLocalChange);
        };
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchOrdersByDate();
        }
    }, [selectedDate, dateFilterType]);



    const fetchData = async () => {
        try {
            setLoading(true);
            console.log('🚀 Iniciando fetchData...');

            // Fetch routes
            const { data: routesData, error: routesError } = await supabase
                .from('routes')
                .select('*')
                .eq('is_active', true)
                .order('identificador');

            if (routesError) throw routesError;
            setRoutes(routesData || []);
            console.log('🛣️ Rutas cargadas:', routesData?.length || 0, routesData?.map(r => r.identificador));

            // Fetch clients
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('*')
                .eq('is_active', true)
                .order('nombre');

            if (clientsError) throw clientsError;

            // Transformar los datos para usar camelCase
            const transformedClients = (clientsData || []).map(client => ({
                id: client.id,
                nombre: client.nombre,
                routeId: client.route_id, // Mapear route_id a routeId
                isActive: client.is_active,
                telefono: client.telefono,
                direccion: client.direccion,
                cedula: client.cedula,
                email: client.email
            }));

            setClients(transformedClients);
            console.log('👥 Clientes cargados:', transformedClients.length, transformedClients.map(c => c.nombre));
            console.log('🔍 Ejemplos de clientes con route_id:', transformedClients.slice(0, 5).map(c => ({
                nombre: c.nombre,
                routeId: c.routeId,
                isActive: c.isActive
            })));

            // Fetch products with categories
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (productsError) throw productsError;

            // Fetch categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('product_categories')
                .select('*');

            if (categoriesError) throw categoriesError;

            const transformedProducts = (productsData || []).map(product => {
                const category = categoriesData?.find(cat => cat.id === product.category_id);
                return {
                    ...product,
                    name: product.name,
                    categoryName: category?.name || 'Sin categoría',
                    variant: product.variant || 'Regular',
                    priceRegular: product.price_regular || 0,
                    isActive: product.is_active
                };
            });

            setProducts(transformedProducts);
            console.log('🏷️ Productos cargados:', transformedProducts.length, transformedProducts.map(p => `${p.name} (${p.categoryName})`));
        } catch (error) {
            console.error('❌ Error fetching data:', error);
        } finally {
            setLoading(false);
            console.log('✅ fetchData completado');
        }
    };

    const fetchOrdersByDate = async () => {
        try {
            const startDate = new Date(selectedDate);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(selectedDate);
            endDate.setHours(23, 59, 59, 999);

            // Fetch orders for the selected date based on filter type
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    *,
                    clients!orders_client_id_fkey (
                        id,
                        nombre,
                        route_id,
                        is_active
                    ),
                    routes!orders_route_id_fkey (
                        id,
                        identificador,
                        nombre,
                        is_active
                    )
                `)
                .gte(dateFilterType === 'registration' ? 'order_date' : 'delivery_date', startDate.toISOString().split('T')[0])
                .lte(dateFilterType === 'registration' ? 'order_date' : 'delivery_date', endDate.toISOString().split('T')[0])
                .order('created_at', { ascending: false });

            if (ordersError) {
                console.error('❌ Error fetching orders:', ordersError);
                throw ordersError;
            }

            console.log('🔍 RouteNotebook: Consulta SQL ejecutada');
            console.log('🔍 RouteNotebook: Fecha inicio:', startDate.toISOString().split('T')[0]);
            console.log('🔍 RouteNotebook: Fecha fin:', endDate.toISOString().split('T')[0]);
            console.log('🔍 RouteNotebook: Tipo de filtro:', dateFilterType);
            console.log('🔍 RouteNotebook: Órdenes encontradas en BD:', ordersData?.length || 0);

            // Fetch order items for each order
            const ordersWithItems = await Promise.all(
                (ordersData || []).map(async (order) => {

                    const { data: itemsData, error: itemsError } = await supabase
                        .from('order_items')
                        .select('*')
                        .eq('order_id', order.id);

                    if (itemsError) {
                        console.error('❌ Error fetching items for order:', order.id, itemsError);
                        return null;
                    }

                    const items = (itemsData || []).map(item => ({
                        id: item.id,
                        productId: item.product_id,
                        productName: item.product_name,
                        productCategory: item.product_category,
                        productVariant: item.product_variant,
                        quantity: item.quantity,
                        unitPrice: parseFloat(item.unit_price),
                        totalPrice: parseFloat(item.total_price)
                    }));

                    const transformedOrder = {
                        id: order.id,
                        orderNumber: order.order_number,
                        clientId: order.client_id,
                        clientName: order.clients?.nombre || 'Cliente no encontrado',
                        routeId: order.route_id,
                        routeName: order.routes?.nombre || 'Ruta no encontrada',
                        orderDate: new Date(order.order_date),
                        status: order.status,
                        totalAmount: parseFloat(order.total_amount) || 0,
                        items: items
                    };

                    return transformedOrder;
                })
            );

            const validOrders = ordersWithItems.filter(order => order !== null) as Order[];
            console.log('📊 RouteNotebook: Órdenes cargadas:', validOrders.length);
            console.log('📊 RouteNotebook: Filtro aplicado - Fecha:', selectedDate.toLocaleDateString('es-ES'), 'Tipo:', dateFilterType);
            console.log('📊 RouteNotebook: Total de pedidos únicos:', validOrders.length);
            setOrders(validOrders);
        } catch (error) {
            console.error('❌ Error fetching orders by date:', error);
        }
    };

    const getProductCategories = (): ProductCategory[] => {
        const categoriesMap = new Map<string, Product[]>();

        products.forEach(product => {
            if (!categoriesMap.has(product.categoryName)) {
                categoriesMap.set(product.categoryName, []);
            }
            categoriesMap.get(product.categoryName)!.push(product);
        });

        return Array.from(categoriesMap.entries()).map(([name, products]) => ({
            name,
            products
        }));
    };

    // Función para obtener solo categorías y productos que tienen valores (filtrado por ruta seleccionada)
    const getActiveProductCategories = (): ProductCategory[] => {
        // Si no hay órdenes, retornar array vacío
        if (orders.length === 0) {
            return [];
        }

        const categoriesMap = new Map<string, Product[]>();
        const activeProducts = new Set<string>();

        // Obtener productos que tienen cantidades > 0 en la ruta seleccionada
        orders.forEach(order => {
            // Si hay una ruta seleccionada, solo considerar órdenes de esa ruta
            if (selectedRoute && order.routeId !== selectedRoute) {
                return;
            }
            order.items.forEach(item => {
                if (item.quantity > 0) {
                    activeProducts.add(item.productId);
                }
            });
        });

        // Filtrar productos activos y agrupar por categoría
        products.forEach(product => {
            if (activeProducts.has(product.id)) {
                if (!categoriesMap.has(product.categoryName)) {
                    categoriesMap.set(product.categoryName, []);
                }
                categoriesMap.get(product.categoryName)!.push(product);
            }
        });

        const activeCategories = Array.from(categoriesMap.entries()).map(([name, products]) => ({
            name,
            products: sortProductsByCategoryOrder(products, name)
        }));

        return activeCategories;
    };

    // Función para obtener TODAS las categorías del sistema
    const getAllProductCategories = (): ProductCategory[] => {
        const categoriesMap = new Map<string, Product[]>();

        // Agrupar todos los productos por categoría
        products.forEach(product => {
            if (!categoriesMap.has(product.categoryName)) {
                categoriesMap.set(product.categoryName, []);
            }
            categoriesMap.get(product.categoryName)!.push(product);
        });

        const allCategories = Array.from(categoriesMap.entries()).map(([name, products]) => ({
            name,
            products: sortProductsByCategoryOrder(products, name)
        }));

        return allCategories;
    };

    // Versión memoizada de allProductCategories para evitar re-renders innecesarios
    const memoizedAllProductCategories = useMemo(() => {
        return getAllProductCategories();
    }, [products]);

    // Función para guardar el orden de columnas en localStorage
    const saveColumnOrder = (categories: ProductCategory[]) => {
        const orderData = {
            categories: categories.map((category, categoryIndex) => ({
                name: category.name,
                order: categoryIndex,
                products: category.products.map((product, productIndex) => ({
                    id: product.id,
                    order: productIndex
                }))
            })),
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('routeNotebookColumnOrder', JSON.stringify(orderData));
        console.log('✅ Orden de columnas guardado:', orderData);

        // Disparar evento para actualizar la vista
        window.dispatchEvent(new CustomEvent('megaDonutColumnOrderChanged'));
    };

    // Funciones para reordenar categorías y productos
    const handleReorderCategories = (newCategories: ProductCategory[]) => {
        // Reconstruir el array unificado con el nuevo orden
        const newUnifiedProducts = newCategories.flatMap(category => category.products);

        // Actualizar el estado local
        setColumnOrderVersion(prev => prev + 1);

        // Guardar el nuevo orden
        saveColumnOrder(newCategories);
    };

    const handleReorderProducts = (newProducts: Product[]) => {
        // Reconstruir las categorías con el nuevo orden de productos
        const newCategories = [...getOrderedProductCategories];

        // Actualizar el estado local
        setColumnOrderVersion(prev => prev + 1);

        // Guardar el nuevo orden
        saveColumnOrder(newCategories);
    };



    // Función para obtener categorías y productos ordenados localmente (filtrado por ruta seleccionada)
    const getOrderedProductCategories = useMemo((): ProductCategory[] => {
        // Obtener productos activos (con pedidos > 0) en la ruta seleccionada
        const activeProducts = new Set<string>();
        orders.forEach(order => {
            // Si hay una ruta seleccionada, solo considerar órdenes de esa ruta
            if (selectedRoute && order.routeId !== selectedRoute) {
                return;
            }
            order.items.forEach(item => {
                if (item.quantity > 0) {
                    activeProducts.add(item.productId);
                }
            });
        });

        // Cargar orden desde localStorage
        const savedOrder = localStorage.getItem('routeNotebookColumnOrder');

        if (savedOrder) {
            try {
                const parsedOrder = JSON.parse(savedOrder);
                const orderedCategories: ProductCategory[] = [];

                // Crear categorías según el orden guardado
                parsedOrder.categories.forEach((savedCategory: any) => {
                    const categoryName = savedCategory.name;
                    const categoryProducts = products.filter(product =>
                        product.categoryName === categoryName && activeProducts.has(product.id)
                    );

                    if (categoryProducts.length > 0) {
                        // Ordenar productos según el orden guardado
                        const orderedProducts = categoryProducts.sort((a, b) => {
                            const orderA = savedCategory.products.find((sp: any) => sp.id === a.id)?.order || 999;
                            const orderB = savedCategory.products.find((sp: any) => sp.id === b.id)?.order || 999;
                            return orderA - orderB;
                        });

                        orderedCategories.push({
                            name: categoryName,
                            products: orderedProducts
                        });
                    }
                });

                return orderedCategories;
            } catch (error) {
                console.error('Error parsing saved column order:', error);
                return getActiveProductCategories();
            }
        }

        // Si no hay orden guardado, usar orden por defecto
        return getActiveProductCategories();
    }, [products, orders, columnOrderVersion, selectedRoute]);

    const getClientsWithOrders = (routeId?: string): Client[] => {
        // Solo mostrar clientes que tienen pedidos
        if (routeId) {
            // Obtener órdenes de la ruta específica
            const routeOrders = orders.filter(order => order.routeId === routeId);
            const orderClientIds = [...new Set(routeOrders.map(order => order.clientId))];

            // Filtrar solo clientes que tienen órdenes en esta ruta
            const clientsWithOrders = clients.filter(client =>
                orderClientIds.includes(client.id) && client.isActive
            );

            return clientsWithOrders;
        }

        // Si no se especifica ruta, mostrar todos los clientes que tienen pedidos
        const allOrderClientIds = [...new Set(orders.map(order => order.clientId))];
        const clientsWithOrders = clients.filter(client =>
            allOrderClientIds.includes(client.id) && client.isActive
        );

        return clientsWithOrders;
    };

    const getQuantityForClientAndProduct = (clientId: string, productId: string): number => {
        const clientOrders = orders.filter(order => order.clientId === clientId);
        const quantity = clientOrders.reduce((sum, order) => {
            const productItems = order.items.filter(item => item.productId === productId);
            return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        return quantity;
    };

    // Función helper para generar array unificado de productos (solo con cantidades > 0 en la ruta seleccionada)
    const getUnifiedProductArray = useMemo((): Product[] => {
        const orderedCategories = getOrderedProductCategories;
        const allProducts = orderedCategories.flatMap(category => category.products);

        // Filtrar solo productos que tienen al menos una cantidad > 0 en la ruta seleccionada
        const productsWithQuantities = allProducts.filter(product => {
            const clientsWithOrders = getClientsWithOrders(selectedRoute); // Filtrar por ruta seleccionada
            return clientsWithOrders.some(client => {
                const quantity = getQuantityForClientAndProduct(client.id, product.id);
                return quantity > 0;
            });
        });

        // console.log('🔗 Array unificado de productos (con cantidades en ruta):', productsWithQuantities.map(p => p.name));
        // console.log('📊 Resumen:', {
        //     rutaSeleccionada: selectedRoute,
        //     categorías: orderedCategories.length,
        //     productosTotales: allProducts.length,
        //     productosConCantidades: productsWithQuantities.length,
        //     categoríasDetalle: orderedCategories.map(c => ({ nombre: c.name, productos: c.products.length }))
        // });
        return productsWithQuantities;
    }, [getOrderedProductCategories, orders, clients, selectedRoute]);

    const getOrderItemsForClient = (clientId: string): OrderItem[] => {
        const clientOrders = orders.filter(order => order.clientId === clientId);
        console.log(`📋 Órdenes para cliente ${clientId}:`, clientOrders.length, clientOrders.map(o => o.orderNumber));

        const allItems: OrderItem[] = [];

        clientOrders.forEach(order => {
            allItems.push(...order.items);
        });

        console.log(`📦 Total items para cliente ${clientId}:`, allItems.length);
        return allItems;
    };

    const getTotalForClient = (clientId: string): { quantity: number; amount: number } => {
        const clientOrders = orders.filter(order => order.clientId === clientId);
        const quantity = clientOrders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
        const amount = clientOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        return { quantity, amount };
    };

    const getTotalForProduct = (productId: string, routeId?: string): number => {
        let filteredOrders = orders;

        // Si se especifica una ruta, filtrar por esa ruta
        if (routeId) {
            filteredOrders = orders.filter(order => order.routeId === routeId);
        }

        const total = filteredOrders.reduce((sum, order) => {
            const productItems = order.items.filter(item => item.productId === productId);
            return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        // Logging para debugging
        if (total > 0) {
            console.log(`🔢 getTotalForProduct - Producto: ${productId}, Ruta: ${routeId || 'Todas'}, Total: ${total}, Filtro: ${dateFilterType}`);
        }

        return total;
    };

    const getTotalForRoute = (routeId: string): { quantity: number; amount: number } => {
        const routeOrders = orders.filter(order => order.routeId === routeId);
        const quantity = routeOrders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
        const amount = routeOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        return { quantity, amount };
    };

    // Nueva función para obtener el número de pedidos únicos por ruta
    const getOrderCountForRoute = (routeId: string): number => {
        const routeOrders = orders.filter(order => order.routeId === routeId);
        return routeOrders.length;
    };

    // Nueva función para obtener el número total de pedidos únicos
    const getTotalOrderCount = (): number => {
        return orders.length;
    };

    const handleQuantityChange = async (clientId: string, productId: string, newQuantity: number) => {
        // Función deshabilitada - no se permite edición en cuadernos por rutas
        console.log('⚠️ Edición deshabilitada en cuadernos por rutas');
    };

    // Funciones para manejar el orden de columnas local
    const handleDefineColumnOrder = () => {
        // Ahora se maneja directamente en la tabla
        console.log('🔄 Orden de columnas se maneja directamente en la tabla');
    };

    const handleColumnOrderUpdated = () => {
        // Esta función ya no se usa, pero la mantenemos por compatibilidad
        console.log('🔄 Función handleColumnOrderUpdated llamada (no necesaria)');
    };



    const generatePDF = () => {
        // La generación de PDF ahora se maneja con PDFDownloadLink
        // Esta función se mantiene para compatibilidad con el botón
        console.log('🔄 PDF se generará automáticamente al hacer clic en el enlace de descarga');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
            <div className="flex-1 p-6">
                <div className="max-w-full mx-auto">
                    <RouteNotebookHeader onBack={onBack} />

                    <RouteNotebookControls
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        dateFilterType={dateFilterType}
                        setDateFilterType={setDateFilterType}
                        selectedRoute={selectedRoute}
                        setSelectedRoute={setSelectedRoute}
                        routes={routes}
                        orders={orders}
                        isUpdating={isUpdating}
                        setShowPreview={setShowPreview}
                    />

                    {/* 🔍 DEBUG: Log antes del renderizado de la tabla - solo cuando cambien los datos */}
                    {(() => {
                        // Solo hacer log cuando cambien los datos importantes
                        const userSpecificHash = `user_${userInfo?.id}_${routes.length}-${clients.length}-${products.length}-${orders.length}-${getUnifiedProductArray.length}-${selectedDate.toISOString().split('T')[0]}-${dateFilterType}`;

                        if (!(window as any)[`lastDataHash_${userInfo?.id}`] || (window as any)[`lastDataHash_${userInfo?.id}`] !== userSpecificHash) {
                            console.log('🔍 RouteNotebook - Renderizando tabla con datos:', {
                                usuario: userInfo?.role,
                                usuarioId: userInfo?.id,
                                rutas: routes.length,
                                clientes: clients.length,
                                productos: products.length,
                                ordenes: orders.length,
                                categorias: getOrderedProductCategories.length,
                                productosUnificados: getUnifiedProductArray.length,
                                fechaSeleccionada: selectedDate.toISOString().split('T')[0],
                                tipoFiltro: dateFilterType,
                                rutaSeleccionada: selectedRoute
                            });
                            (window as any)[`lastDataHash_${userInfo?.id}`] = userSpecificHash;
                        }
                        return null;
                    })()}

                    <RouteNotebookTable
                        routes={routes}
                        selectedRoute={selectedRoute}
                        setSelectedRoute={setSelectedRoute}
                        loading={loading}
                        productCategories={getOrderedProductCategories}
                        unifiedProducts={getUnifiedProductArray}
                        getClientsWithOrders={getClientsWithOrders}
                        getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                        getTotalForClient={getTotalForClient}
                        getTotalForProduct={getTotalForProduct}
                        getTotalForRoute={getTotalForRoute}
                        handleQuantityChange={handleQuantityChange}
                        editingCell={editingCell}
                        isUpdating={isUpdating}
                        onDefineColumnOrder={handleDefineColumnOrder}
                        saveColumnOrder={saveColumnOrder}
                        onReorderCategories={handleReorderCategories}
                        onReorderProducts={handleReorderProducts}
                    />
                </div>
            </div>

            <RouteNotebookPreview
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                generatePDF={generatePDF}
                selectedDate={selectedDate}
                dateFilterType={dateFilterType}
                selectedRoute={selectedRoute}
                routes={routes}
                productCategories={getOrderedProductCategories}
                getClientsWithOrders={getClientsWithOrders}
                getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                getTotalForClient={getTotalForClient}
                getTotalForProduct={getTotalForProduct}
                getTotalForRoute={getTotalForRoute}
                printRef={printRef}
                isVerticalText={isVerticalText}
            />

            {/* Modal eliminado - ahora se maneja directamente en la tabla */}

            <Footer />
        </div>
    );
}
