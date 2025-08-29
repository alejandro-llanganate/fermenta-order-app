'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    ArrowLeft,
    Download,
    Calculator,
    BarChart3
} from 'lucide-react';
import { Order } from '@/types/order';
import { Client } from '@/types/client';
import { Product } from '@/types/product';
import { Route } from '@/types/route';
import { supabase } from '@/lib/supabase';
import Footer from './Footer';

interface RoutePrintSheetProps {
    onBack: () => void;
}

interface ClientOrderSummary {
    client: Client;
    orders: Order[];
    products: { [productId: string]: number };
}

export default function RoutePrintSheet({ onBack }: RoutePrintSheetProps) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedRoute, setSelectedRoute] = useState<string>('');
    const printRef = useRef<HTMLDivElement>(null);

    // Obtener pedidos del día seleccionado
    const getOrdersForDate = async (date: string) => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('orderDate', date)
            .order('orderDate', { ascending: true });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
        return data as Order[];
    };

    // Obtener productos organizados por categoría
    const getProductsByCategory = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('category', { ascending: true });

        if (error) {
            console.error('Error fetching products:', error);
            return {};
        }

        const categories = ['Donut', 'Rellenas', 'Mini donut', 'Mini rellenas', 'Pizzas', 'Panes', 'Muffins', 'Pasteles'];
        const productsByCategory: { [category: string]: Product[] } = {};

        categories.forEach(category => {
            productsByCategory[category] = data.filter(product =>
                product.category === category && product.isActive
            );
        });

        return productsByCategory;
    };

    // Obtener resumen de pedidos por cliente en una ruta
    const getClientOrderSummary = async (routeId: string, orders: Order[]): Promise<ClientOrderSummary[]> => {
        const { data: clients, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('routeId', routeId)
            .eq('isActive', true)
            .order('nombreCompleto', { ascending: true });

        if (clientError) {
            console.error('Error fetching clients:', clientError);
            return [];
        }

        return clients.map(client => {
            const clientOrders = orders.filter(order => order.clientName === client.nombreCompleto);
            const products: { [productId: string]: number } = {};

            clientOrders.forEach(order => {
                order.items?.forEach(item => {
                    products[item.productId] = (products[item.productId] || 0) + item.quantity;
                });
            });

            return {
                client,
                orders: clientOrders,
                products
            };
        });
    };

    // Generar PDF
    const generatePDF = async () => {
        if (!printRef.current) return;

        try {
            const jsPDF = (await import('jspdf')).default;
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');

            const imgWidth = 297;
            const pageHeight = 210;
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

            const route = await supabase
                .from('routes')
                .select('*')
                .eq('id', selectedRoute)
                .single();
            const routeName = route.data ? `${route.data.identificador}-${route.data.nombre}` : 'Todas';
            pdf.save(`Hoja-Ruta-${routeName}-${selectedDate}.pdf`);
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const orders = await getOrdersForDate(selectedDate);
            const productsByCategory = await getProductsByCategory();
            const clientSummaries = selectedRoute ? await getClientOrderSummary(selectedRoute, orders) : [];
            // No need to set state here, as the component will re-render with new data
        };
        fetchData();
    }, [selectedDate, selectedRoute]);

    const [orders, setOrders] = useState<Order[]>([]);
    const [productsByCategory, setProductsByCategory] = useState<{ [category: string]: Product[] }>({});
    const [selectedRouteData, setSelectedRouteData] = useState<any>(null);
    const [clientSummaries, setClientSummaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [routes, setRoutes] = useState<Route[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const ordersData = await getOrdersForDate(selectedDate);
                const productsData = await getProductsByCategory();
                const routeData = selectedRoute ? await supabase
                    .from('routes')
                    .select('*')
                    .eq('id', selectedRoute)
                    .single() : null;
                const summaries = selectedRoute ? await getClientOrderSummary(selectedRoute, ordersData) : [];
                const routesData = await supabase
                    .from('routes')
                    .select('*')
                    .eq('is_active', true)
                    .order('identificador', { ascending: true });

                setOrders(ordersData);
                setProductsByCategory(productsData);
                setSelectedRouteData(routeData);
                setClientSummaries(summaries);
                setRoutes(routesData.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedDate, selectedRoute]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col">
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <BarChart3 className="h-8 w-8 text-orange-500" />
                                <h1 className="text-2xl font-bold text-gray-900">Hoja de Ruta</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={generatePDF}
                                disabled={!selectedRoute}
                                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="h-4 w-4" />
                                <span>Descargar PDF</span>
                            </button>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ruta *
                                </label>
                                <select
                                    value={selectedRoute}
                                    onChange={(e) => setSelectedRoute(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="">Seleccionar una ruta</option>
                                    {routes.map((route: Route) => (
                                        <option key={route.id} value={route.id}>
                                            {route.identificador} - {route.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contenido para impresión */}
                    {selectedRouteData && (
                        <div ref={printRef} className="bg-white p-8 border border-gray-300">
                            {/* Header del reporte */}
                            <div className="text-center mb-6">
                                <h1 className="text-3xl font-bold text-black">MEGA DONUT PEDIDOS Y ENTREGAS</h1>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="text-left">
                                        <p className="text-lg font-medium text-black">RUTA {selectedRouteData.data?.identificador}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-medium text-black">FECHA: {new Date(selectedDate).toLocaleDateString('es-ES')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tabla de productos y clientes */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300 text-xs">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 px-2 py-1 text-left text-black font-bold">CLIENTES</th>
                                            {/* Columnas de productos por categoría */}
                                            {Object.entries(productsByCategory).map(([category, products]) => (
                                                products.map(product => (
                                                    <th key={product.id} className="border border-gray-300 px-1 py-1 text-center text-black font-bold">
                                                        {product.variant.toUpperCase()}
                                                    </th>
                                                ))
                                            ))}
                                            <th className="border border-gray-300 px-2 py-1 text-center text-black font-bold">PEDIDO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientSummaries.map((summary) => {
                                            let totalPedido = 0;

                                            return (
                                                <tr key={summary.client.id}>
                                                    <td className="border border-gray-300 px-2 py-1 text-black font-medium">
                                                        {summary.client.nombre}
                                                    </td>
                                                    {/* Celdas de productos */}
                                                    {Object.entries(productsByCategory).map(([category, products]) => (
                                                        products.map(product => {
                                                            const quantity = summary.products[product.id] || 0;
                                                            totalPedido += quantity;
                                                            return (
                                                                <td key={product.id} className="border border-gray-300 px-1 py-1 text-center text-black">
                                                                    {quantity > 0 ? quantity : ''}
                                                                </td>
                                                            );
                                                        })
                                                    ))}
                                                    <td className="border border-gray-300 px-2 py-1 text-center text-black font-bold">
                                                        {totalPedido > 0 ? totalPedido : ''}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {/* Fila de totales */}
                                        <tr className="bg-gray-100">
                                            <td className="border border-gray-300 px-2 py-1 text-black font-bold">TOTALES</td>
                                            {Object.entries(productsByCategory).map(([category, products]) => (
                                                products.map(product => {
                                                    const total = clientSummaries.reduce((sum, summary) =>
                                                        sum + (summary.products[product.id] || 0), 0
                                                    );
                                                    return (
                                                        <td key={product.id} className="border border-gray-300 px-1 py-1 text-center text-black font-bold">
                                                            {total > 0 ? total : ''}
                                                        </td>
                                                    );
                                                })
                                            ))}
                                            <td className="border border-gray-300 px-2 py-1 text-center text-black font-bold">
                                                {clientSummaries.reduce((sum, summary) =>
                                                    sum + Object.values(summary.products).reduce((a, b) => (a as number) + (b as number), 0), 0
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Información adicional */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-black">Total de Clientes: {clientSummaries.length}</p>
                                    <p className="font-medium text-black">Total de Pedidos: {clientSummaries.reduce((sum, summary) => sum + summary.orders.length, 0)}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-black">Ruta: {selectedRouteData.data?.identificador} - {selectedRouteData.data?.nombre}</p>
                                    <p className="font-medium text-black">Fecha: {new Date(selectedDate).toLocaleDateString('es-ES')}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-black">Generado: {new Date().toLocaleDateString('es-ES')}</p>
                                    <p className="font-medium text-black">Hora: {new Date().toLocaleTimeString('es-ES')}</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 pt-4 border-t border-gray-300">
                                <p className="text-center text-sm text-gray-800 font-medium">
                                    Hoja de ruta generada para Mega Donut<br />
                                    Ruta {selectedRouteData.data?.identificador} - {selectedRouteData.data?.nombre}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Mensaje cuando no hay ruta seleccionada */}
                    {!selectedRoute && (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una ruta</h3>
                            <p className="text-gray-600">Para generar la hoja de ruta, primero selecciona una ruta específica.</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
