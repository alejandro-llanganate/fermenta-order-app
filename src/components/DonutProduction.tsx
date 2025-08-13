'use client';

import { useState, useRef } from 'react';
import {
    ArrowLeft,
    Printer,
    Calendar,
    Calculator,
    Package,
    Download
} from 'lucide-react';
import { Order } from '@/types/order';
import { Client } from '@/types/client';
import { Product } from '@/types/product';
import { mockOrders } from '@/data/mockOrders';
import { mockClients } from '@/data/mockClients';
import { mockProducts } from '@/data/mockProducts';
import { mockRoutes } from '@/data/mockRoutes';
import Footer from './Footer';

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
    const printRef = useRef<HTMLDivElement>(null);

    // Obtener pedidos del día seleccionado
    const getOrdersForDate = (date: string) => {
        const targetDate = new Date(date);
        return mockOrders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate.toDateString() === targetDate.toDateString();
        });
    };

    // Calcular totales de producción
    const calculateProductionTotals = (orders: Order[]): ProductionTotals => {
        let rellenasChantilly = 0;
        let rellenasManjar = 0;
        let miniRellenasChantilly = 0;
        let miniRellenasManjar = 0;
        let donasTotal = 0;
        let miniDonasTotal = 0;
        const donasSabores: { [key: string]: number } = {};
        const miniDonasSabores: { [key: string]: number } = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                const product = mockProducts.find(p => p.id === item.productId);
                if (!product) return;

                const quantity = item.quantity;

                // Categorizar productos
                if (product.category === 'Rellenas') {
                    if (product.variant === 'chantilly') {
                        rellenasChantilly += quantity;
                    } else if (product.variant === 'manjar') {
                        rellenasManjar += quantity;
                    }
                } else if (product.category === 'Mini rellenas') {
                    if (product.variant === 'chantilly') {
                        miniRellenasChantilly += quantity;
                    } else if (product.variant === 'manjar') {
                        miniRellenasManjar += quantity;
                    }
                } else if (product.category === 'Donut') {
                    donasTotal += quantity;
                    const sabor = product.variant;
                    donasSabores[sabor] = (donasSabores[sabor] || 0) + quantity;
                } else if (product.category === 'Mini donut') {
                    miniDonasTotal += quantity;
                    const sabor = product.variant;
                    miniDonasSabores[sabor] = (miniDonasSabores[sabor] || 0) + quantity;
                }
            });
        });

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
    const getClientsByRoute = (routeId: string) => {
        return mockClients.filter(client => client.routeId === routeId && client.isActive);
    };

    // Obtener productos por categoría
    const getProductsByCategory = (category: string) => {
        return mockProducts.filter(product => product.category === category && product.isActive);
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

            pdf.save(`Produccion-Donas-${selectedDate}.pdf`);
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
        }
    };

    const orders = getOrdersForDate(selectedDate);
    const productionTotals = calculateProductionTotals(orders);
    const selectedRouteData = selectedRoute ? mockRoutes.find(r => r.id === selectedRoute) : null;
    const routeClients = selectedRoute ? getClientsByRoute(selectedRoute) : [];

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
                    <div ref={printRef} className="bg-white p-8 border border-gray-300">
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
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals.rellenas.total}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals.rellenas.tablas}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals.rellenas.unidades}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-black">M.RELLENAS</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals.miniRellenas.total}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals.miniRellenas.tablas}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals.miniRellenas.unidades}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-black">DONAS</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals.donas.total}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals.donas.tablas}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals.donas.unidades}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-black">MINIDONAS</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals.miniDonas.total}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals.miniDonas.tablas}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">{productionTotals.miniDonas.unidades}</td>
                                    </tr>
                                    <tr className="bg-blue-100">
                                        <td className="border border-gray-300 px-4 py-2 font-bold text-black">TOTAL PROD.</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center font-bold text-black">{productionTotals.totalProduccion}</td>
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
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{productionTotals.rellenas.chantilly}</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{Math.floor(productionTotals.rellenas.chantilly / 25)}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2 font-medium text-black">MANJAR</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{productionTotals.rellenas.manjar}</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{Math.floor(productionTotals.rellenas.manjar / 25)}</td>
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
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{productionTotals.miniRellenas.chantilly}</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{Math.floor(productionTotals.miniRellenas.chantilly / 56)}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-3 py-2 font-medium text-black">MANJAR</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{productionTotals.miniRellenas.manjar}</td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{Math.floor(productionTotals.miniRellenas.manjar / 56)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Donas */}
                                <div>
                                    <h4 className="text-lg font-bold text-black mb-2">DONUTS</h4>
                                    <table className="w-full border-collapse border border-gray-300">
                                        <tbody>
                                            {Object.entries(productionTotals.donas.sabores).map(([sabor, cantidad]) => (
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
                                            {Object.entries(productionTotals.miniDonas.sabores).map(([sabor, cantidad]) => (
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
                        {selectedRouteData && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-black mb-4 text-center">
                                    RUTA {selectedRouteData.identificador} - {selectedRouteData.nombre}
                                </h3>
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 px-3 py-2 text-left text-black font-bold">CLIENTE</th>
                                            <th className="border border-gray-300 px-3 py-2 text-center text-black font-bold">RELLENAS</th>
                                            <th className="border border-gray-300 px-3 py-2 text-center text-black font-bold">MINI RELLENAS</th>
                                            <th className="border border-gray-300 px-3 py-2 text-center text-black font-bold">DONAS</th>
                                            <th className="border border-gray-300 px-3 py-2 text-center text-black font-bold">MINI DONAS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {routeClients.map((client) => {
                                            const clientOrders = orders.filter(order => order.clientName === client.nombreCompleto);
                                            let rellenas = 0;
                                            let miniRellenas = 0;
                                            let donas = 0;
                                            let miniDonas = 0;

                                            clientOrders.forEach(order => {
                                                order.items.forEach(item => {
                                                    const product = mockProducts.find(p => p.id === item.productId);
                                                    if (!product) return;

                                                    const quantity = item.quantity;
                                                    if (product.category === 'Rellenas') {
                                                        rellenas += quantity;
                                                    } else if (product.category === 'Mini rellenas') {
                                                        miniRellenas += quantity;
                                                    } else if (product.category === 'Donut') {
                                                        donas += quantity;
                                                    } else if (product.category === 'Mini donut') {
                                                        miniDonas += quantity;
                                                    }
                                                });
                                            });

                                            return (
                                                <tr key={client.id}>
                                                    <td className="border border-gray-300 px-3 py-2 text-black">{client.institucionEducativa}</td>
                                                    <td className="border border-gray-300 px-3 py-2 text-center text-black">{rellenas || '-'}</td>
                                                    <td className="border border-gray-300 px-3 py-2 text-center text-black">{miniRellenas || '-'}</td>
                                                    <td className="border border-gray-300 px-3 py-2 text-center text-black">{donas || '-'}</td>
                                                    <td className="border border-gray-300 px-3 py-2 text-center text-black">{miniDonas || '-'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

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
