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
import Swal from 'sweetalert2';

interface DonutProductionProps {
    onBack: () => void;
}

interface ProductionTotals {
    rellenas: {
        chantilly: number;
        manjar: number;
        total: number;
        tablas: number;
        unidades: number;
    };
    miniRellenas: {
        chantilly: number;
        manjar: number;
        total: number;
        tablas: number;
        unidades: number;
    };
    donas: {
        total: number;
        tablas: number;
        unidades: number;
        sabores: { [key: string]: number };
    };
    miniDonas: {
        total: number;
        tablas: number;
        unidades: number;
        sabores: { [key: string]: number };
    };
    totalProduccion: number;
}

export default function DonutProduction({ onBack }: DonutProductionProps) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedRoute, setSelectedRoute] = useState<string>('');
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printRef, setPrintRef] = useState<HTMLDivElement | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [productionTotals, setProductionTotals] = useState<ProductionTotals | null>(null);
    const [loading, setLoading] = useState(true);

    // Obtener pedidos del día seleccionado
    const getOrdersForDate = async (date: string) => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('orderDate', date);

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
        return data as Order[];
    };

    // Calcular totales de producción
    const calculateProductionTotals = async (orders: Order[]): Promise<ProductionTotals> => {
        let rellenasChantilly = 0;
        let rellenasManjar = 0;
        let miniRellenasChantilly = 0;
        let miniRellenasManjar = 0;
        let donasTotal = 0;
        let miniDonasTotal = 0;
        const donasSabores: { [key: string]: number } = {};
        const miniDonasSabores: { [key: string]: number } = {};

        for (const order of orders) {
            // Obtener items del pedido
            const { data: orderItems, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id);

            if (itemsError) {
                console.error('Error fetching order items:', itemsError);
                continue;
            }

            if (!orderItems) continue;

            for (const item of orderItems) {
                const { data: productData, error: productError } = await supabase
                    .from('products_with_categories')
                    .select('*')
                    .eq('id', item.product_id)
                    .single();

                if (productError || !productData) {
                    console.error('Product not found:', item.product_id);
                    continue;
                }

                const product = productData as Product;
                const quantity = item.quantity;

                // Categorizar productos
                if (product.categoryName === 'Rellenas') {
                    if (product.variant === 'chantilly') {
                        rellenasChantilly += quantity;
                    } else if (product.variant === 'manjar') {
                        rellenasManjar += quantity;
                    }
                } else if (product.categoryName === 'Mini rellenas') {
                    if (product.variant === 'chantilly') {
                        miniRellenasChantilly += quantity;
                    } else if (product.variant === 'manjar') {
                        miniRellenasManjar += quantity;
                    }
                } else if (product.categoryName === 'Donut') {
                    donasTotal += quantity;
                    const sabor = product.variant;
                    donasSabores[sabor] = (donasSabores[sabor] || 0) + quantity;
                } else if (product.categoryName === 'Mini donut') {
                    miniDonasTotal += quantity;
                    const sabor = product.variant;
                    miniDonasSabores[sabor] = (miniDonasSabores[sabor] || 0) + quantity;
                }
            }
        }

        const rellenasTotal = rellenasChantilly + rellenasManjar;
        const miniRellenasTotal = miniRellenasChantilly + miniRellenasManjar;

        return {
            rellenas: {
                chantilly: rellenasChantilly,
                manjar: rellenasManjar,
                total: rellenasTotal,
                tablas: Math.floor(rellenasTotal / 30),
                unidades: rellenasTotal % 30
            },
            miniRellenas: {
                chantilly: miniRellenasChantilly,
                manjar: miniRellenasManjar,
                total: miniRellenasTotal,
                tablas: Math.floor(miniRellenasTotal / 56),
                unidades: miniRellenasTotal % 56
            },
            donas: {
                total: donasTotal,
                tablas: Math.floor(donasTotal / 30),
                unidades: donasTotal % 30,
                sabores: donasSabores
            },
            miniDonas: {
                total: miniDonasTotal,
                tablas: Math.floor(miniDonasTotal / 56),
                unidades: miniDonasTotal % 56,
                sabores: miniDonasSabores
            },
            totalProduccion: rellenasTotal + miniRellenasTotal + donasTotal + miniDonasTotal
        };
    };

    // Obtener clientes por ruta
    const getClientsByRoute = async (routeId: string) => {
        const { data, error } = await supabase
            .from('routes')
            .select('*')
            .eq('id', routeId)
            .single();

        if (error || !data) {
            console.error('Route not found:', routeId);
            return [];
        }

        const route = data as Route;
        const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('*')
            .eq('routeId', routeId)
            .eq('isActive', true);

        if (clientsError) {
            console.error('Error fetching clients:', clientsError);
            return [];
        }
        return clientsData as Client[];
    };

    // Obtener productos por categoría
    const getProductsByCategory = async (category: string) => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category', category)
            .eq('isActive', true);

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }
        return data as Product[];
    };

    // Generar PDF
    const generatePDF = async () => {
        if (!printRef) return;

        try {
            const jsPDF = (await import('jspdf')).default;
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(printRef, {
                scale: 2,
                useCORS: true,
                allowTaint: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
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

            pdf.save(`Produccion-Donas-${selectedDate}.pdf`);
        } catch (error) {
            console.error('Error generando PDF:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al generar el PDF',
                text: 'Por favor, inténtalo de nuevo.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch orders
            const ordersData = await getOrdersForDate(selectedDate);
            setOrders(ordersData);

            // Fetch routes
            const { data: routesData, error: routesError } = await supabase
                .from('routes')
                .select('*')
                .eq('is_active', true);

            if (routesError) throw routesError;
            setRoutes(routesData || []);

            // Calculate production totals
            const totals = await calculateProductionTotals(ordersData);
            setProductionTotals(totals);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando datos de producción...</p>
                </div>
            </div>
        );
    }

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
                                <Calculator className="h-8 w-8 text-orange-500" />
                                <h1 className="text-2xl font-bold text-gray-900">Producción de Donas</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={generatePDF}
                                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
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
                                    Fecha de producción
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
                                    Ruta específica (opcional)
                                </label>
                                <select
                                    value={selectedRoute}
                                    onChange={(e) => setSelectedRoute(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="">Todas las rutas</option>
                                    {routes.map(route => (
                                        <option key={route.id} value={route.id}>
                                            {route.identificador} - {route.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contenido para impresión */}
                    <div ref={setPrintRef} className="bg-white p-8 border border-gray-300">
                        {/* Header del reporte */}
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-black">MEGA DONUT</h1>
                            <h2 className="text-2xl font-semibold text-gray-800">Reporte de Producción de Donas</h2>
                            <p className="text-lg text-gray-600">Fecha: {new Date(selectedDate).toLocaleDateString('es-ES')}</p>
                        </div>

                        {/* Tabla de Totales */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-black mb-4 text-center">TOTALES</h3>
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left text-black font-bold">PRODUCTO</th>
                                        <th className="border border-gray-300 px-4 py-2 text-center text-black font-bold">TOTAL</th>
                                        <th className="border border-gray-300 px-4 py-2 text-center text-black font-bold">TABLAS</th>
                                        <th className="border border-gray-300 px-4 py-2 text-center text-black font-bold">UNIDADES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-black">RELLENAS</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals?.rellenas.total || 0}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals?.rellenas.tablas || 0}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals?.rellenas.unidades || 0}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-black">M.RELLENAS</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals?.miniRellenas.total || 0}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals?.miniRellenas.tablas || 0}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals?.miniRellenas.unidades || 0}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-black">DONAS</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals?.donas.total || 0}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals?.donas.tablas || 0}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals?.donas.unidades || 0}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-black">MINIDONAS</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals?.miniDonas.total || 0}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals?.miniDonas.tablas || 0}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals?.miniDonas.unidades || 0}</td>
                                    </tr>
                                    <tr className="bg-blue-100">
                                        <td className="border border-gray-300 px-4 py-2 font-bold text-black">TOTAL PROD.</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center font-bold text-black">{productionTotals?.totalProduccion || 0}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center font-bold text-black">-</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center font-bold text-black">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Tabla de Sabores */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-black mb-4 text-center">SABORES</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Rellenas */}
                                <div>
                                    <h4 className="text-lg font-bold text-black mb-2">RELLENAS</h4>
                                    <table className="w-full border-collapse border border-gray-300">
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2 font-medium text-black">CHANT</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{productionTotals?.rellenas.chantilly || 0}</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{Math.floor((productionTotals?.rellenas.chantilly || 0) / 25)}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2 font-medium text-black">MANJAR</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{productionTotals?.rellenas.manjar || 0}</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{Math.floor((productionTotals?.rellenas.manjar || 0) / 25)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mini Rellenas */}
                                <div>
                                    <h4 className="text-lg font-bold text-black mb-2">M.RELLENAS</h4>
                                    <table className="w-full border-collapse border border-gray-300">
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2 font-medium text-black">CHANT</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{productionTotals?.miniRellenas.chantilly || 0}</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{Math.floor((productionTotals?.miniRellenas.chantilly || 0) / 56)}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2 font-medium text-black">MANJAR</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{productionTotals?.miniRellenas.manjar || 0}</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{Math.floor((productionTotals?.miniRellenas.manjar || 0) / 56)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Donas */}
                                <div>
                                    <h4 className="text-lg font-bold text-black mb-2">DONUTS</h4>
                                    <table className="w-full border-collapse border border-gray-300">
                                        <tbody>
                                            {Object.entries(productionTotals?.donas.sabores || {}).map(([sabor, cantidad]) => (
                                                <tr key={sabor}>
                                                    <td className="border border-gray-300 px-3 py-2 font-medium text-black">{sabor.toUpperCase()}</td>
                                                    <td className="border border-gray-300 px-3 py-2 text-center text-black">{cantidad}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mini Donas */}
                                <div>
                                    <h4 className="text-lg font-bold text-black mb-2">M.DONUTS</h4>
                                    <table className="w-full border-collapse border border-gray-300">
                                        <tbody>
                                            {Object.entries(productionTotals?.miniDonas.sabores || {}).map(([sabor, cantidad]) => (
                                                <tr key={sabor}>
                                                    <td className="border border-gray-300 px-3 py-2 font-medium text-black">{sabor.toUpperCase()}</td>
                                                    <td className="border border-gray-300 px-3 py-2 text-center text-black">{cantidad}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de Rutas (si se selecciona una ruta específica) */}
                        {/* {selectedRouteData && ( */}
                        {/* <div className="mb-8"> */}
                        {/* <h3 className="text-xl font-bold text-black mb-4 text-center"> */}
                        {/* Ruta {selectedRouteData.identificador} - {selectedRouteData.nombre} */}
                        {/* </h3> */}
                        {/* <table className="w-full border-collapse border border-gray-300"> */}
                        {/* <thead> */}
                        {/* <tr className="bg-gray-100"> */}
                        {/* <th className="border border-gray-300 px-3 py-2 text-left text-black font-bold">CLIENTE</th> */}
                        {/* <th className="border border-gray-300 px-3 py-2 text-center text-black font-bold">RELLENAS</th> */}
                        {/* <th className="border border-gray-300 px-3 py-2 text-center text-black font-bold">MINI RELLENAS</th> */}
                        {/* <th className="border border-gray-300 px-3 py-2 text-center text-black font-bold">DONAS</th> */}
                        {/* <th className="border border-gray-300 px-3 py-2 text-center text-black font-bold">MINI DONAS</th> */}
                        {/* </tr> */}
                        {/* </thead> */}
                        {/* <tbody> */}
                        {/* {routeClients.map((client) => { */}
                        {/* const clientOrders = orders.filter(order => order.clientName === client.nombreCompleto); */}
                        {/* let rellenas = 0; */}
                        {/* let miniRellenas = 0; */}
                        {/* let donas = 0; */}
                        {/* let miniDonas = 0; */}

                        {/* clientOrders.forEach(order => { */}
                        {/* order.items.forEach(item => { */}
                        {/* const { data: productData, error: productError } = supabase */}
                        {/* .from('products') */}
                        {/* .select('*') */}
                        {/* .eq('id', item.productId) */}
                        {/* .single(); */}

                        {/* if (productError || !productData) { */}
                        {/* console.error('Product not found:', item.productId); */}
                        {/* return; */}
                        {/* } */}

                        {/* const product = productData as Product; */}
                        {/* const quantity = item.quantity; */}
                        {/* if (product.category === 'Rellenas') { */}
                        {/* rellenas += quantity; */}
                        {/* } else if (product.category === 'Mini rellenas') { */}
                        {/* miniRellenas += quantity; */}
                        {/* } else if (product.category === 'Donut') { */}
                        {/* donas += quantity; */}
                        {/* } else if (product.category === 'Mini donut') { */}
                        {/* miniDonas += quantity; */}
                        {/* } */}
                        {/* }); */}
                        {/* return ( */}
                        {/* <tr key={client.id}> */}
                        {/* <td className="border border-gray-300 px-3 py-2 text-black">{client.institucionEducativa}</td> */}
                        {/* <td className="border border-gray-300 px-3 py-2 text-center text-black">{rellenas || '-'}</td> */}
                        {/* <td className="border border-gray-300 px-3 py-2 text-center text-black">{miniRellenas || '-'}</td> */}
                        {/* <td className="border border-gray-300 px-3 py-2 text-center text-black">{donas || '-'}</td> */}
                        {/* <td className="border border-gray-300 px-3 py-2 text-center text-black">{miniDonas || '-'}</td> */}
                        {/* </tr> */}
                        {/* ); */}
                        {/* })} */}
                        {/* </tbody> */}
                        {/* </table> */}
                        {/* </div> */}
                        {/* )} */}

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t border-gray-300">
                            <p className="text-center text-sm text-gray-800 font-medium">
                                Reporte de producción generado para Mega Donut<br />
                                {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
