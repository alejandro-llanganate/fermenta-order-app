'use client';

import { useState, useRef } from 'react';
import {
    ArrowLeft,
    Download,
    MapPin,
    Calendar,
    Users
} from 'lucide-react';
import { Order } from '@/types/order';
import { Client } from '@/types/client';
import { Product } from '@/types/product';
import { mockOrders } from '@/data/mockOrders';
import { mockClients } from '@/data/mockClients';
import { mockProducts } from '@/data/mockProducts';
import { mockRoutes } from '@/data/mockRoutes';
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
    const getOrdersForDate = (date: string) => {
        const targetDate = new Date(date);
        return mockOrders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate.toDateString() === targetDate.toDateString();
        });
    };

    // Obtener productos organizados por categoría
    const getProductsByCategory = () => {
        const categories = ['Donut', 'Rellenas', 'Mini donut', 'Mini rellenas', 'Pizzas', 'Panes', 'Muffins', 'Pasteles'];
        const productsByCategory: { [category: string]: Product[] } = {};

        categories.forEach(category => {
            productsByCategory[category] = mockProducts.filter(product =>
                product.category === category && product.isActive
            );
        });

        return productsByCategory;
    };

    // Obtener resumen de pedidos por cliente en una ruta
    const getClientOrderSummary = (routeId: string, orders: Order[]): ClientOrderSummary[] => {
        const routeClients = mockClients.filter(client => client.routeId === routeId && client.isActive);

        return routeClients.map(client => {
            const clientOrders = orders.filter(order => order.clientName === client.nombreCompleto);
            const products: { [productId: string]: number } = {};

            clientOrders.forEach(order => {
                order.items.forEach(item => {
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

            const route = mockRoutes.find(r => r.id === selectedRoute);
            const routeName = route ? `${route.identificador}-${route.nombre}` : 'Todas';
            pdf.save(`Hoja-Ruta-${routeName}-${selectedDate}.pdf`);
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
        }
    };

    const orders = getOrdersForDate(selectedDate);
    const productsByCategory = getProductsByCategory();
    const selectedRouteData = selectedRoute ? mockRoutes.find(r => r.id === selectedRoute) : null;
    const clientSummaries = selectedRoute ? getClientOrderSummary(selectedRoute, orders) : [];

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
                                <MapPin className="h-8 w-8 text-orange-500" />
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
                                    {mockRoutes.filter(route => route.isActive).map((route) => (
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
                                        <p className="text-lg font-medium text-black">RUTA {selectedRouteData.identificador}</p>
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
                                                        {summary.client.institucionEducativa}
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
                                                    sum + Object.values(summary.products).reduce((a, b) => a + b, 0), 0
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
                                    <p className="font-medium text-black">Ruta: {selectedRouteData.identificador} - {selectedRouteData.nombre}</p>
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
                                    Ruta {selectedRouteData.identificador} - {selectedRouteData.nombre}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Mensaje cuando no hay ruta seleccionada */}
                    {!selectedRoute && (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
