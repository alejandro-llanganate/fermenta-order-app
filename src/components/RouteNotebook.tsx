'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Footer from './Footer';
import RouteNotebookHeader from './RouteNotebookHeader';
import RouteNotebookControls from './RouteNotebookControls';
import RouteNotebookTable from './RouteNotebookTable';
import RouteNotebookPreview from './RouteNotebookPreview';
import { Route, Client, Product, ProductCategory, Order, OrderItem } from '@/types/routeNotebook';

interface RouteNotebookProps {
    onBack: () => void;
}

export default function RouteNotebook({ onBack }: RouteNotebookProps) {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedRoute, setSelectedRoute] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [editingCell, setEditingCell] = useState<{ clientId: string; productId: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            console.log('🔄 useEffect triggered - fetching orders for date:', selectedDate.toISOString().split('T')[0]);
            fetchOrdersByDate();
        }
    }, [selectedDate]);

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

            console.log('🔍 Buscando órdenes para fecha:', selectedDate.toISOString().split('T')[0]);
            console.log('📅 Rango de búsqueda:', startDate.toISOString(), 'a', endDate.toISOString());

            // Fetch orders for the selected date
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
                .gte('order_date', startDate.toISOString().split('T')[0])
                .lte('order_date', endDate.toISOString().split('T')[0])
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

    // Función helper para generar array unificado de productos
    const getUnifiedProductArray = (): Product[] => {
        return getProductCategories().flatMap(category => category.products);
    };

    const getClientsWithOrders = (routeId?: string): Client[] => {
        // Si se especifica una ruta, mostrar todos los clientes activos de esa ruta
        if (routeId) {
            // Obtener todos los clientes activos que tienen esta ruta asignada
            const routeClients = clients.filter(client => client.routeId === routeId && client.isActive);

            // También incluir clientes que tienen órdenes en esta ruta pero pueden no tener routeId asignado
            const routeOrders = orders.filter(order => order.routeId === routeId);
            const orderClientIds = [...new Set(routeOrders.map(order => order.clientId))];
            const orderClients = clients.filter(client =>
                orderClientIds.includes(client.id) &&
                client.isActive &&
                !routeClients.find(rc => rc.id === client.id)
            );

            const allRouteClients = [...routeClients, ...orderClients];

            console.log(`👥 Clientes activos en ruta ${routeId}:`, allRouteClients.length, allRouteClients.map(c => c.nombre));
            console.log(`📋 Clientes con routeId asignado:`, routeClients.length, routeClients.map(c => c.nombre));
            console.log(`📋 Clientes con órdenes en ruta:`, orderClients.length, orderClients.map(c => c.nombre));

            return allRouteClients;
        }

        // Si no se especifica ruta, mostrar todos los clientes activos
        const activeClients = clients.filter(client => client.isActive);
        console.log(`👥 Todos los clientes activos:`, activeClients.length, activeClients.map(c => c.nombre));
        return activeClients;
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
            console.log(`🔢 Cantidad para cliente ${clientId} y producto ${productId}:`, quantity);
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
        try {
            setIsUpdating(true);
            setEditingCell({ clientId, productId });

            console.log(`🔄 Cambiando cantidad para cliente ${clientId}, producto ${productId}: ${newQuantity}`);

            // Buscar si ya existe una orden para este cliente en la fecha seleccionada
            const existingOrder = orders.find(order =>
                order.clientId === clientId &&
                order.orderDate.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
            );

            const product = products.find(p => p.id === productId);
            const client = clients.find(c => c.id === clientId);

            if (!product || !client) {
                console.error('❌ Producto o cliente no encontrado');
                return;
            }

            if (existingOrder) {
                // Actualizar orden existente
                await updateExistingOrder(existingOrder, productId, newQuantity, product);
            } else if (newQuantity > 0) {
                // Crear nueva orden solo si la cantidad es mayor a 0
                await createNewOrder(clientId, productId, newQuantity, product, client);
            }

            // Recargar datos
            await fetchOrdersByDate();

        } catch (error) {
            console.error('❌ Error al cambiar cantidad:', error);
        } finally {
            setIsUpdating(false);
            setEditingCell(null);
        }
    };

    const updateExistingOrder = async (order: Order, productId: string, newQuantity: number, product: Product) => {
        try {
            // Buscar si el producto ya existe en la orden
            const existingItem = order.items.find(item => item.productId === productId);

            if (existingItem) {
                if (newQuantity === 0) {
                    // Eliminar item si la cantidad es 0
                    const { error } = await supabase
                        .from('order_items')
                        .delete()
                        .eq('id', existingItem.id);

                    if (error) throw error;
                } else {
                    // Actualizar cantidad
                    const newTotalPrice = newQuantity * existingItem.unitPrice;
                    const { error } = await supabase
                        .from('order_items')
                        .update({
                            quantity: newQuantity,
                            total_price: newTotalPrice
                        })
                        .eq('id', existingItem.id);

                    if (error) throw error;
                }
            } else if (newQuantity > 0) {
                // Agregar nuevo item
                const { error } = await supabase
                    .from('order_items')
                    .insert({
                        order_id: order.id,
                        product_id: productId,
                        product_name: product.name,
                        product_category: product.categoryName,
                        product_variant: product.variant,
                        quantity: newQuantity,
                        unit_price: product.priceRegular,
                        total_price: newQuantity * product.priceRegular
                    });

                if (error) throw error;
            }

            // Recalcular total de la orden
            await recalculateOrderTotal(order.id);

        } catch (error) {
            console.error('❌ Error actualizando orden:', error);
            throw error;
        }
    };

    const createNewOrder = async (clientId: string, productId: string, quantity: number, product: Product, client: Client) => {
        try {
            // Crear nueva orden
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_number: `PED-${selectedDate.toISOString().split('T')[0].replace(/-/g, '')}-${Date.now()}`,
                    client_id: clientId,
                    route_id: client.routeId,
                    order_date: selectedDate.toISOString().split('T')[0],
                    delivery_date: selectedDate.toISOString().split('T')[0],
                    status: 'pending',
                    total_amount: quantity * product.priceRegular,
                    payment_method: 'Efectivo',
                    notes: 'Pedido creado desde cuaderno de rutas'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Crear item de la orden
            const { error: itemError } = await supabase
                .from('order_items')
                .insert({
                    order_id: orderData.id,
                    product_id: productId,
                    product_name: product.name,
                    product_category: product.categoryName,
                    product_variant: product.variant,
                    quantity: quantity,
                    unit_price: product.priceRegular,
                    total_price: quantity * product.priceRegular
                });

            if (itemError) throw itemError;

            console.log('✅ Nueva orden creada:', orderData.order_number);

        } catch (error) {
            console.error('❌ Error creando nueva orden:', error);
            throw error;
        }
    };

    const recalculateOrderTotal = async (orderId: string) => {
        try {
            // Obtener todos los items de la orden
            const { data: items, error } = await supabase
                .from('order_items')
                .select('total_price')
                .eq('order_id', orderId);

            if (error) throw error;

            // Calcular nuevo total
            const newTotal = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);

            // Actualizar total de la orden
            const { error: updateError } = await supabase
                .from('orders')
                .update({ total_amount: newTotal })
                .eq('id', orderId);

            if (updateError) throw updateError;

        } catch (error) {
            console.error('❌ Error recalculando total:', error);
        }
    };

    const generatePDF = async () => {
        if (!printRef.current) return;

        try {
            const jsPDF = (await import('jspdf')).default;
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(printRef.current, {
                scale: 1.2,
                useCORS: true,
                backgroundColor: '#ffffff',
                allowTaint: true,
                foreignObjectRendering: false,
                logging: false,
                removeContainer: true,
                width: printRef.current.offsetWidth,
                height: printRef.current.offsetHeight
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation

            const imgWidth = 297; // A4 landscape width
            const pageHeight = 210; // A4 landscape height
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const routeName = selectedRoute ? routes.find(r => r.id === selectedRoute)?.nombre : 'Todas las Rutas';
            const fileName = `Mega-Donut-Pedidos-${routeName}-${selectedDate.toLocaleDateString('es-ES')}.pdf`;
            pdf.save(fileName);

            // Mostrar mensaje de confirmación
            console.log(`✅ PDF generado exitosamente: ${fileName}`);
        } catch (error) {
            console.error('❌ Error generating PDF:', error);
        }
    };



    const productCategories = getProductCategories();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
            <div className="flex-1 p-6">
                <div className="max-w-full mx-auto">
                    <RouteNotebookHeader onBack={onBack} />

                    <RouteNotebookControls
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
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
                        productCategories={productCategories}
                        unifiedProducts={getUnifiedProductArray()}
                        getClientsWithOrders={getClientsWithOrders}
                        getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                        getTotalForClient={getTotalForClient}
                        getTotalForProduct={getTotalForProduct}
                        getTotalForRoute={getTotalForRoute}
                        handleQuantityChange={handleQuantityChange}
                        editingCell={editingCell}
                        isUpdating={isUpdating}
                    />
                </div>
            </div>

            <RouteNotebookPreview
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                generatePDF={generatePDF}
                selectedDate={selectedDate}
                selectedRoute={selectedRoute}
                routes={routes}
                productCategories={productCategories}
                getClientsWithOrders={getClientsWithOrders}
                getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                getTotalForClient={getTotalForClient}
                getTotalForProduct={getTotalForProduct}
                getTotalForRoute={getTotalForRoute}
                printRef={printRef}
            />

            <Footer />
        </div>
    );
}
