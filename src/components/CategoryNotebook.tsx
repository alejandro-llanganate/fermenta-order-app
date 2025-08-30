'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import RouteNotebookHeader from './RouteNotebookHeader';
import CategoryNotebookControls from './CategoryNotebookControls';
import CategoryNotebookTable from './CategoryNotebookTable';
import CategoryNotebookPreview from './CategoryNotebookPreview';
import Footer from './Footer';
import { Route, Client, Product, ProductCategory, Order, OrderItem } from '@/types/routeNotebook';

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
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [editingCell, setEditingCell] = useState<{ clientId: string; productId: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedDate) {
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
            console.log('🔄 useEffect triggered - fetching orders for date:', selectedDate.toISOString().split('T')[0]);

            // Calcular rango de fechas (todo el día)
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            console.log('🔍 Buscando órdenes para fecha:', selectedDate.toISOString().split('T')[0]);
            console.log('📅 Rango de búsqueda:', startOfDay.toISOString(), 'a', endOfDay.toISOString());

            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    *,
                    clients!inner(id, nombre, route_id, is_active),
                    routes!inner(id, nombre, is_active, identificador)
                `)
                .gte('order_date', startOfDay.toISOString().split('T')[0])
                .lte('order_date', endOfDay.toISOString().split('T')[0])
                .order('order_number');

            if (ordersError) throw ordersError;

            console.log('📋 Órdenes encontradas:', ordersData?.length);
            console.log('📋 Datos de órdenes:', ordersData);

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

                    console.log('📦 Items encontrados para orden', order.order_number, ':', itemsData?.length);

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

    // Función helper para generar array unificado de productos
    const getUnifiedProductArray = (): Product[] => {
        return getProductCategories().flatMap(category => category.products);
    };

    const getClientsWithOrders = (categoryId?: string): Client[] => {
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

            console.log(`👥 Clientes con productos de categoría ${categoryId}:`, categoryClients.length, categoryClients.map(c => c.nombre));
            return categoryClients;
        }

        // Si no se especifica categoría, mostrar todos los clientes activos
        const activeClients = clients.filter(client => client.isActive);
        console.log(`👥 Todos los clientes activos:`, activeClients.length, activeClients.map(c => c.nombre));
        return activeClients;
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

    const getTotalForProduct = (productId: string, categoryId?: string): number => {
        let filteredOrders = orders;

        // Si se especifica una categoría, filtrar por esa categoría
        if (categoryId) {
            const categoryProducts = products.filter(product => product.categoryName === categoryId);
            const categoryProductIds = categoryProducts.map(p => p.id);
            filteredOrders = orders.filter(order =>
                order.items.some(item => categoryProductIds.includes(item.productId))
            );
        }

        return filteredOrders.reduce((sum, order) => {
            const productItems = order.items.filter(item => item.productId === productId);
            return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
    };

    const getTotalForCategory = (categoryId: string): { quantity: number; amount: number } => {
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
            console.error('❌ Error updating existing order:', error);
        }
    };

    const createNewOrder = async (clientId: string, productId: string, quantity: number, product: Product, client: Client) => {
        try {
            // Generar número de orden
            const orderNumber = `PED-${selectedDate.toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;

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

            const categoryName = selectedCategory || 'Todas las Categorías';
            const fileName = `Mega-Donut-Categorias-${categoryName}-${selectedDate.toLocaleDateString('es-ES')}.pdf`;
            pdf.save(fileName);

            // Mostrar mensaje de confirmación
            console.log(`✅ PDF generado exitosamente: ${fileName}`);
        } catch (error) {
            console.error('❌ Error generating PDF:', error);
        }
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
                        productCategories={productCategories}
                        orders={orders}
                        isUpdating={isUpdating}
                        setShowPreview={setShowPreview}
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
                    />
                </div>
            </div>

            <CategoryNotebookPreview
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                generatePDF={generatePDF}
                selectedDate={selectedDate}
                selectedCategory={selectedCategory}
                productCategories={productCategories}
                routes={routes}
                getClientsWithOrders={getClientsWithOrders}
                getQuantityForClientAndProduct={getQuantityForClientAndProduct}
                getTotalForClient={getTotalForClient}
                getTotalForProduct={getTotalForProduct}
                getTotalForCategory={getTotalForCategory}
                printRef={printRef}
            />

            <Footer />
        </div>
    );
}
