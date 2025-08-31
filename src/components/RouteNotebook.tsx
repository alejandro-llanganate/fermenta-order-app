'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Footer from './Footer';
import RouteNotebookHeader from './RouteNotebookHeader';
import RouteNotebookControls from './RouteNotebookControls';
import RouteNotebookTable from './RouteNotebookTable';
import RouteNotebookPreview from './RouteNotebookPreview';
import { Route, Client, Product, ProductCategory, Order, OrderItem } from '@/types/routeNotebook';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RouteNotebookPDF from './pdf/RouteNotebookPDF';
import ColumnOrderModal from './ColumnOrderModal';

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
    const [showColumnOrderModal, setShowColumnOrderModal] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            console.log('🔄 useEffect triggered - fetching orders for', dateFilterType, 'date:', selectedDate.toISOString().split('T')[0]);
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

            console.log('🔍 Buscando órdenes para', dateFilterType, 'fecha:', selectedDate.toISOString().split('T')[0]);

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

            console.log('📋 Órdenes encontradas:', ordersData?.length || 0);
            console.log('📋 Datos de órdenes:', ordersData);

            // Fetch order items for each order
            const ordersWithItems = await Promise.all(
                (ordersData || []).map(async (order) => {
                    console.log('🔍 Obteniendo items para orden:', order.id, order.order_number);

                    const { data: itemsData, error: itemsError } = await supabase
                        .from('order_items')
                        .select('*')
                        .eq('order_id', order.id);

                    if (itemsError) {
                        console.error('❌ Error fetching items for order:', order.id, itemsError);
                        return null;
                    }

                    console.log('📦 Items encontrados para orden', order.order_number, ':', itemsData?.length || 0);

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

                    console.log('✅ Orden transformada:', {
                        id: transformedOrder.id,
                        orderNumber: transformedOrder.orderNumber,
                        clientName: transformedOrder.clientName,
                        routeName: transformedOrder.routeName,
                        itemsCount: transformedOrder.items.length,
                        totalAmount: transformedOrder.totalAmount
                    });

                    return transformedOrder;
                })
            );

            const validOrders = ordersWithItems.filter(order => order !== null) as Order[];
            console.log('🎯 Total de órdenes válidas:', validOrders.length);
            console.log('🎯 Órdenes finales:', validOrders.map(o => ({
                orderNumber: o.orderNumber,
                clientName: o.clientName,
                routeName: o.routeName,
                itemsCount: o.items.length
            })));

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

    // Función para obtener solo categorías y productos que tienen valores
    const getActiveProductCategories = (): ProductCategory[] => {
        const categoriesMap = new Map<string, Product[]>();
        const activeProducts = new Set<string>();

        // Obtener todos los productos que tienen cantidades > 0
        orders.forEach(order => {
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
            products
        }));

        // console.log('📦 Categorías activas:', activeCategories.length, activeCategories.map(c => c.name));
        // console.log('📦 Productos activos:', activeProducts.size);

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
            products
        }));

        return allCategories;
    };



    // Función para obtener categorías ordenadas según configuración
    const getOrderedProductCategories = (): ProductCategory[] => {
        const activeCategories = getActiveProductCategories();

        // Por ahora, usar solo el orden por defecto
        // En el futuro, aquí se aplicará el orden guardado en settings
        return activeCategories;
    };

    // Función helper para generar array unificado de productos
    const getUnifiedProductArray = (): Product[] => {
        return getActiveProductCategories().flatMap(category => category.products);
    };

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

            // console.log(`👥 Clientes con pedidos en ruta ${routeId}:`, clientsWithOrders.length, clientsWithOrders.map(c => c.nombre));
            return clientsWithOrders;
        }

        // Si no se especifica ruta, mostrar todos los clientes que tienen pedidos
        const allOrderClientIds = [...new Set(orders.map(order => order.clientId))];
        const clientsWithOrders = clients.filter(client =>
            allOrderClientIds.includes(client.id) && client.isActive
        );

        // console.log(`👥 Todos los clientes con pedidos:`, clientsWithOrders.length, clientsWithOrders.map(c => c.nombre));
        return clientsWithOrders;
    };

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

    const getQuantityForClientAndProduct = (clientId: string, productId: string): number => {
        const clientOrders = orders.filter(order => order.clientId === clientId);
        const quantity = clientOrders.reduce((sum, order) => {
            const productItems = order.items.filter(item => item.productId === productId);
            return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        if (quantity > 0) {
            // console.log(`🔢 Cantidad para cliente ${clientId} y producto ${productId}:`, quantity);
        }

        return quantity;
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

        return filteredOrders.reduce((sum, order) => {
            const productItems = order.items.filter(item => item.productId === productId);
            return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
    };

    const getTotalForRoute = (routeId: string): { quantity: number; amount: number } => {
        const routeOrders = orders.filter(order => order.routeId === routeId);
        const quantity = routeOrders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
        const amount = routeOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        return { quantity, amount };
    };

    const handleQuantityChange = async (clientId: string, productId: string, newQuantity: number) => {
        // Función deshabilitada - no se permite edición en cuadernos por rutas
        console.log('⚠️ Edición deshabilitada en cuadernos por rutas');
    };

    const handleDefineColumnOrder = () => {
        setShowColumnOrderModal(true);
    };

    const handleColumnOrderUpdated = () => {
        // Por ahora, solo recargar datos
        fetchData();
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

                    <RouteNotebookTable
                        routes={routes}
                        selectedRoute={selectedRoute}
                        setSelectedRoute={setSelectedRoute}
                        loading={loading}
                        productCategories={getOrderedProductCategories()}
                        unifiedProducts={getUnifiedProductArray()}
                        getClientsWithOrders={getClientsWithOrders}
                        getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                        getTotalForClient={getTotalForClient}
                        getTotalForProduct={getTotalForProduct}
                        getTotalForRoute={getTotalForRoute}
                        handleQuantityChange={handleQuantityChange}
                        editingCell={editingCell}
                        isUpdating={isUpdating}
                        onDefineColumnOrder={handleDefineColumnOrder}
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
                productCategories={getOrderedProductCategories()}
                getClientsWithOrders={getClientsWithOrders}
                getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                getTotalForClient={getTotalForClient}
                getTotalForProduct={getTotalForProduct}
                getTotalForRoute={getTotalForRoute}
                printRef={printRef}
            />

            <ColumnOrderModal
                isOpen={showColumnOrderModal}
                onClose={() => setShowColumnOrderModal(false)}
                productCategories={getActiveProductCategories()}
                onOrderUpdated={handleColumnOrderUpdated}
                allProductCategories={getAllProductCategories()}
            />

            <Footer />
        </div>
    );
}
