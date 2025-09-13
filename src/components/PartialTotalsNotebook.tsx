'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Route, Client, Product, Order, OrderItem } from '@/types/routeNotebook';
import PartialTotalsNotebookHeader from './PartialTotalsNotebookHeader';
import PartialTotalsNotebookControls from './PartialTotalsNotebookControls';
import PartialTotalsNotebookTable from './PartialTotalsNotebookTable';
import PartialTotalsNotebookPreview from './PartialTotalsNotebookPreview';
import Footer from './Footer';
import { sortProductsByCategoryOrder } from '@/utils/productOrderConfig';

interface PartialTotalsNotebookProps {
    onBack: () => void;
}

export default function PartialTotalsNotebook({ onBack }: PartialTotalsNotebookProps) {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [dateFilterType, setDateFilterType] = useState<'registration' | 'delivery'>('registration');
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    // Fetch data from Supabase
    const fetchData = async () => {
        console.log('🚀 Iniciando fetchData...');
        setLoading(true);

        try {
            // Fetch active routes
            const { data: routesData, error: routesError } = await supabase
                .from('routes')
                .select('*')
                .eq('is_active', true)
                .order('nombre');

            if (routesError) throw routesError;
            setRoutes(routesData || []);
            console.log('🛣️ Rutas cargadas:', routesData?.length, routesData?.map(r => r.identificador));

            // Fetch active clients
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('*')
                .eq('is_active', true)
                .order('nombre');

            if (clientsError) throw clientsError;
            setClients(clientsData || []);
            console.log('👥 Clientes cargados:', clientsData?.length, clientsData?.map(c => c.nombre));

            // Fetch products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (productsError) throw productsError;
            setProducts(productsData || []);
            console.log('📦 Productos cargados:', productsData?.length);

        } catch (error) {
            console.error('❌ Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch orders by date
    const fetchOrdersByDate = async (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        console.log('🔄 useEffect triggered - fetching orders for date:', dateStr);
        console.log('🔍 Tipo de filtro:', dateFilterType);

        console.log('🔍 Buscando órdenes para fecha:', dateStr);

        try {
            // Fetch orders with client and route joins
            let query = supabase
                .from('orders')
                .select(`
                    *,
                    clients:client_id(id, nombre, route_id, is_active),
                    routes:route_id(id, nombre, identificador, is_active)
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

            const { data: ordersData, error: ordersError } = await query;

            if (ordersError) throw ordersError;

            console.log('📋 Órdenes encontradas:', ordersData?.length);
            console.log('📋 Datos de órdenes:', ordersData);

            if (ordersData) {
                // Fetch order items for each order
                const ordersWithItems = await Promise.all(
                    ordersData.map(async (order) => {
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
                            unitPrice: item.unit_price,
                            totalPrice: item.total_price,
                        }));

                        const transformedOrder: Order = {
                            id: order.id,
                            orderNumber: order.order_number,
                            clientId: order.client_id,
                            clientName: order.clients?.nombre || 'Cliente no encontrado',
                            routeId: order.route_id,
                            routeName: order.routes?.nombre || 'Ruta no encontrada',
                            routeIdentifier: order.routes?.identificador || '',
                            orderDate: order.order_date,
                            deliveryDate: order.delivery_date,
                            status: order.status,
                            totalAmount: order.total_amount,
                            notes: order.notes,
                            paymentMethod: order.payment_method,
                            items: items,
                            itemsCount: items.length,
                        };

                        console.log('✅ Orden transformada:', transformedOrder);
                        return transformedOrder;
                    })
                );

                const validOrders = ordersWithItems.filter(order => order !== null) as Order[];
                console.log('🎯 Total de órdenes válidas:', validOrders.length);
                console.log('🎯 Órdenes finales:', validOrders);
                setOrders(validOrders);
            }
        } catch (error) {
            console.error('❌ Error fetching orders:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (routes.length > 0 && clients.length > 0 && products.length > 0) {
            fetchOrdersByDate(selectedDate);
        }
    }, [selectedDate, dateFilterType, routes.length, clients.length, products.length]);

    // Helper functions
    const getProductCategories = (): { name: string; products: Product[] }[] => {
        const categories = new Map<string, Product[]>();

        products.forEach(product => {
            if (!categories.has(product.categoryName)) {
                categories.set(product.categoryName, []);
            }
            categories.get(product.categoryName)!.push(product);
        });

        return Array.from(categories.entries()).map(([name, products]) => ({
            name,
            products: sortProductsByCategoryOrder(products, name)
        }));
    };

    const getUnifiedProductArray = (): Product[] => {
        return getProductCategories().flatMap(category => category.products);
    };

    const getQuantityForRouteAndProduct = (routeId: string, productId: string): number => {
        return orders
            .filter(order => order.routeId === routeId)
            .reduce((sum, order) => {
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

    const getTotalForProduct = (productId: string): number => {
        const total = orders.reduce((sum, order) => {
            const productItems = order.items.filter(item => item.productId === productId);
            return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        // Logging para debugging
        if (total > 0) {
            console.log(`🔢 PartialTotalsNotebook getTotalForProduct - Producto: ${productId}, Total: ${total}, Filtro: ${dateFilterType}`);
        }

        return total;
    };

    const getTotalForCategory = (categoryName: string): { quantity: number; amount: number } => {
        const categoryProducts = products.filter(product => product.categoryName === categoryName);
        const categoryProductIds = categoryProducts.map(p => p.id);

        const quantity = orders.reduce((sum, order) => {
            const categoryItems = order.items.filter(item => categoryProductIds.includes(item.productId));
            return sum + categoryItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        const amount = orders.reduce((sum, order) => {
            const categoryItems = order.items.filter(item => categoryProductIds.includes(item.productId));
            return sum + categoryItems.reduce((itemSum, item) => itemSum + item.totalPrice, 0);
        }, 0);

        return { quantity, amount };
    };

    const getGrandTotal = (): { quantity: number; amount: number } => {
        const quantity = orders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
        const amount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        return { quantity, amount };
    };

    // Generate PDF
    const generatePDF = async () => {
        if (!printRef.current) return;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: printRef.current.scrollWidth,
                height: printRef.current.scrollHeight,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape', 'mm', 'a4');

            const imgWidth = 297; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pageHeight = 210; // A4 height in mm

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

            const fileName = `Mega-Donut-Totales-Parciales-${selectedDate.toLocaleDateString('es-ES')}.pdf`;
            pdf.save(fileName);

            // Mostrar mensaje de confirmación
            console.log(`✅ PDF generado exitosamente: ${fileName}`);
        } catch (error) {
            console.error('❌ Error generating PDF:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex flex-col">
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    <PartialTotalsNotebookHeader onBack={onBack} />

                    <PartialTotalsNotebookControls
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        dateFilterType={dateFilterType}
                        setDateFilterType={setDateFilterType}
                        loading={loading}
                        orders={orders}
                        routes={routes}
                        generatePDF={generatePDF}
                        setShowPreview={setShowPreview}
                    />

                    <PartialTotalsNotebookTable
                        loading={loading}
                        routes={routes}
                        productCategories={getProductCategories()}
                        unifiedProducts={getUnifiedProductArray()}
                        getQuantityForRouteAndProduct={getQuantityForRouteAndProduct}
                        getTotalForRoute={getTotalForRoute}
                        getTotalForProduct={getTotalForProduct}
                        getTotalForCategory={getTotalForCategory}
                        getGrandTotal={getGrandTotal}
                    />
                </div>
            </div>

            <PartialTotalsNotebookPreview
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                generatePDF={generatePDF}
                selectedDate={selectedDate}
                productCategories={getProductCategories()}
                unifiedProducts={getUnifiedProductArray()}
                routes={routes}
                getQuantityForRouteAndProduct={getQuantityForRouteAndProduct}
                getTotalForRoute={getTotalForRoute}
                getTotalForProduct={getTotalForProduct}
                getTotalForCategory={getTotalForCategory}
                getGrandTotal={getGrandTotal}
                printRef={printRef}
            />

            <Footer />
        </div>
    );
}
