'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import RouteNotebookHeader from './RouteNotebookHeader';
import CategoryNotebookControls from './CategoryNotebookControls';
import CategoryNotebookTable from './CategoryNotebookTable';
import CategoryNotebookPreview from './CategoryNotebookPreview';
import Footer from './Footer';
import { Route, Client, Product, ProductCategory, Order, OrderItem } from '@/types/routeNotebook';
import { generateUniqueOrderNumberHybrid } from '@/utils/orderIdGenerator';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CategoryNotebookPDF from './pdf/CategoryNotebookPDF';
import { sortProductsByCategoryOrder } from '@/utils/productOrderConfig';

interface CategoryNotebookProps {
    onBack: () => void;
}

export default function CategoryNotebook({ onBack }: CategoryNotebookProps) {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [dateFilterType, setDateFilterType] = useState<'registration' | 'delivery'>('registration');
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [editingCell, setEditingCell] = useState<{ clientId: string; productId: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
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
            console.log('🛣️ Rutas cargadas:', routesData?.length, routesData?.map(r => r.identificador));

            // Fetch clients
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('*')
                .eq('is_active', true)
                .order('nombre');

            if (clientsError) throw clientsError;
            const transformedClients = (clientsData || []).map(client => ({
                id: client.id,
                nombre: client.nombre,
                routeId: client.route_id,
                isActive: client.is_active,
                telefono: client.telefono,
                direccion: client.direccion,
                cedula: client.cedula,
                email: client.email
            }));
            setClients(transformedClients);
            console.log('👥 Clientes cargados:', transformedClients.length, transformedClients.slice(0, 5).map(c => c.nombre));

            // Fetch products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select(`
                    *,
                    product_categories!inner(name)
                `)
                .eq('is_active', true)
                .order('name');

            if (productsError) throw productsError;
            const transformedProducts = (productsData || []).map(product => ({
                id: product.id,
                name: product.name,
                categoryName: product.product_categories?.name || 'Sin categoría',
                variant: product.variant,
                priceRegular: parseFloat(product.price_regular),
                isActive: product.is_active
            }));
            setProducts(transformedProducts);
            console.log('🏷️ Productos cargados:', transformedProducts.length, transformedProducts.slice(0, 5).map(p => p.name));

        } catch (error) {
            console.error('❌ Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrdersByDate = async () => {
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            console.log('🔄 useEffect triggered - fetching orders for date:', dateStr);
            console.log('🔍 Tipo de filtro:', dateFilterType);

            console.log('🔍 Buscando órdenes para fecha:', dateStr);

            let query = supabase
                .from('orders')
                .select(`
                    *,
                    clients!inner(id, nombre, route_id, is_active),
                    routes!inner(id, nombre, is_active, identificador)
                `);

            // Aplicar filtro según el tipo seleccionado
            if (dateFilterType === 'registration') {
                // Filtrar por fecha de registro (order_date)
                query = query.eq('order_date', dateStr);
                console.log('📅 Filtrando por fecha de registro');
            } else {
                // Filtrar por fecha de entrega (delivery_date)
                query = query.eq('delivery_date', dateStr);
                console.log('📅 Filtrando por fecha de entrega');
            }

            const { data: ordersData, error: ordersError } = await query.order('order_number');

            if (ordersError) throw ordersError;

            console.log('📋 Órdenes encontradas:', ordersData?.length);
            console.log('📋 Datos de órdenes:', ordersData);

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
                        shippingSurcharge: parseFloat(order.shipping_surcharge) || 0,
                        items: items
                    };



                    return transformedOrder;
                })
            );

            const validOrders = ordersWithItems.filter(order => order !== null) as Order[];


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
            products: sortProductsByCategoryOrder(products, name)
        }));
    };

    // Función helper para generar array unificado de productos
    const getUnifiedProductArray = (): Product[] => {
        return getProductCategories().flatMap(category => category.products);
    };

    const getClientsWithOrders = (categoryId?: string): Client[] => {
        // Las órdenes ya vienen filtradas por fecha desde fetchOrdersByDate()
        // No necesitamos filtrar nuevamente aquí

        // Si se especifica una categoría, mostrar todos los clientes activos que tienen órdenes con productos de esa categoría
        if (categoryId) {
            const categoryProducts = products.filter(product => product.categoryName === categoryId);
            const categoryProductIds = categoryProducts.map(p => p.id);

            // Obtener clientes que tienen órdenes con productos de esta categoría
            const categoryOrders = orders.filter(order =>
                order.items.some(item => categoryProductIds.includes(item.productId))
            );
            const orderClientIds = [...new Set(categoryOrders.map(order => order.clientId))];

            const categoryClients = clients.filter(client =>
                orderClientIds.includes(client.id) && client.isActive
            );

            return categoryClients;
        }

        // Si no se especifica categoría, mostrar todos los clientes activos que tienen órdenes
        const orderClientIds = [...new Set(orders.map(order => order.clientId))];
        const activeClients = clients.filter(client =>
            orderClientIds.includes(client.id) && client.isActive
        );
        return activeClients;
    };

    const getQuantityForClientAndProduct = (clientId: string, productId: string): number => {
        // Las órdenes ya vienen filtradas por fecha desde fetchOrdersByDate()
        // No necesitamos filtrar nuevamente aquí

        const clientOrders = orders.filter(order => order.clientId === clientId);
        const quantity = clientOrders.reduce((sum, order) => {
            const productItems = order.items.filter(item => item.productId === productId);
            return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        return quantity;
    };

    const getTotalForClient = (clientId: string): { quantity: number; amount: number } => {
        // Las órdenes ya vienen filtradas por fecha desde fetchOrdersByDate()
        // No necesitamos filtrar nuevamente aquí

        const clientOrders = orders.filter(order => order.clientId === clientId);
        const quantity = clientOrders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
        const amount = clientOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        return { quantity, amount };
    };

    const getTotalForProduct = (productId: string, categoryId?: string): number => {
        // Las órdenes ya vienen filtradas por fecha desde fetchOrdersByDate()
        // No necesitamos filtrar nuevamente aquí

        let filteredOrders = orders;

        // Si se especifica una categoría, filtrar por esa categoría
        if (categoryId) {
            const categoryProducts = products.filter(product => product.categoryName === categoryId);
            const categoryProductIds = categoryProducts.map(p => p.id);
            filteredOrders = orders.filter(order =>
                order.items.some(item => categoryProductIds.includes(item.productId))
            );
        }

        const total = filteredOrders.reduce((sum, order) => {
            const productItems = order.items.filter(item => item.productId === productId);
            return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        // Logging para debugging
        if (total > 0) {
            console.log(`🔢 CategoryNotebook getTotalForProduct - Producto: ${productId}, Categoría: ${categoryId || 'Todas'}, Total: ${total}, Filtro: ${dateFilterType}, Fecha: ${selectedDate.toISOString().split('T')[0]}`);
        }

        return total;
    };

    const getTotalForCategory = (categoryId: string): { quantity: number; amount: number } => {
        // Las órdenes ya vienen filtradas por fecha desde fetchOrdersByDate()
        // No necesitamos filtrar nuevamente aquí

        const categoryProducts = products.filter(product => product.categoryName === categoryId);
        const categoryProductIds = categoryProducts.map(p => p.id);

        const categoryOrders = orders.filter(order =>
            order.items.some(item => categoryProductIds.includes(item.productId))
        );

        const quantity = categoryOrders.reduce((sum, order) => {
            const categoryItems = order.items.filter(item => categoryProductIds.includes(item.productId));
            return sum + categoryItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        const amount = categoryOrders.reduce((sum, order) => {
            const categoryItems = order.items.filter(item => categoryProductIds.includes(item.productId));
            return sum + categoryItems.reduce((itemSum, item) => itemSum + item.totalPrice, 0);
        }, 0);

        return { quantity, amount };
    };

    const handleQuantityChange = async (clientId: string, productId: string, newQuantity: number) => {
        try {
            setIsUpdating(true);
            setEditingCell({ clientId, productId });



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
            console.error('❌ Error updating existing order:', error);
        }
    };

    const createNewOrder = async (clientId: string, productId: string, quantity: number, product: Product, client: Client) => {
        try {
            // Generar número de orden único
            const orderNumber = await generateUniqueOrderNumberHybrid(selectedDate);

            // Crear nueva orden
            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_number: orderNumber,
                    client_id: clientId,
                    route_id: client.routeId,
                    order_date: selectedDate.toISOString().split('T')[0],
                    delivery_date: selectedDate.toISOString().split('T')[0],
                    status: 'pending',
                    total_amount: quantity * product.priceRegular,
                    shipping_surcharge: 1.5, // Valor por defecto para nuevos pedidos
                    notes: 'Orden creada desde cuaderno por categorías',
                    payment_method: 'Efectivo'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Crear item de la orden
            const { error: itemError } = await supabase
                .from('order_items')
                .insert({
                    order_id: newOrder.id,
                    product_id: productId,
                    product_name: product.name,
                    product_category: product.categoryName,
                    product_variant: product.variant,
                    quantity: quantity,
                    unit_price: product.priceRegular,
                    total_price: quantity * product.priceRegular
                });

            if (itemError) throw itemError;

            console.log('✅ Nueva orden creada:', orderNumber);

        } catch (error) {
            console.error('❌ Error creating new order:', error);
        }
    };

    const recalculateOrderTotal = async (orderId: string) => {
        try {
            const { data: items, error: fetchError } = await supabase
                .from('order_items')
                .select('total_price')
                .eq('order_id', orderId);

            if (fetchError) throw fetchError;

            const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);

            const { error: updateError } = await supabase
                .from('orders')
                .update({ total_amount: totalAmount })
                .eq('id', orderId);

            if (updateError) throw updateError;

        } catch (error) {
            console.error('❌ Error recalculando total:', error);
        }
    };

    const generatePDF = () => {
        // La generación de PDF ahora se maneja con PDFDownloadLink
        // Esta función se mantiene para compatibilidad con el botón
        console.log('🔄 PDF se generará automáticamente al hacer clic en el enlace de descarga');
    };

    const productCategories = getProductCategories();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col">
            <div className="flex-1 p-6">
                <div className="max-w-full mx-auto">
                    <RouteNotebookHeader onBack={onBack} />

                    <CategoryNotebookControls
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        dateFilterType={dateFilterType}
                        setDateFilterType={setDateFilterType}
                        productCategories={productCategories}
                        orders={orders}
                        isUpdating={isUpdating}
                        isGeneratingPDF={isGeneratingPDF}
                        setShowPreview={setShowPreview}
                        onRefresh={fetchData}
                    />

                    <CategoryNotebookTable
                        productCategories={productCategories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        loading={loading}
                        routes={routes}
                        getClientsWithOrders={getClientsWithOrders}
                        getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                        getTotalForClient={getTotalForClient}
                        getTotalForProduct={getTotalForProduct}
                        getTotalForCategory={getTotalForCategory}
                        handleQuantityChange={handleQuantityChange}
                        editingCell={editingCell}
                        isUpdating={isUpdating}
                        getDonutCalculations={() => null}
                    />
                </div>
            </div>

            <CategoryNotebookPreview
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                generatePDF={generatePDF}
                isGeneratingPDF={isGeneratingPDF}
                selectedDate={selectedDate}
                selectedCategory={selectedCategory}
                dateFilterType={dateFilterType}
                productCategories={productCategories}
                routes={routes}
                getClientsWithOrders={getClientsWithOrders}
                getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                getTotalForClient={getTotalForClient}
                getTotalForProduct={getTotalForProduct}
                getTotalForCategory={getTotalForCategory}
                printRef={printRef}
                getDonutCalculations={() => null}
            />

            <Footer />
        </div>
    );
}
