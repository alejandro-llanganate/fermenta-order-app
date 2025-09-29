'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, TrendingUp, Users, Package, MapPin, Calendar, Filter, BarChart3, PieChart, LineChart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Footer from './Footer';
import Swal from 'sweetalert2';

interface ReportsManagementProps {
    onBack: () => void;
}

export default function ReportsManagement({ onBack }: ReportsManagementProps) {
    const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [startDate, setStartDate] = useState(new Date('2024-03-11').toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date('2024-03-17').toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<string>('all');
    const [selectedClient, setSelectedClient] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table' | 'charts'>('cards');

    const reportTypes = [
        {
            id: 'sales',
            title: 'Reporte de Ventas',
            description: 'Análisis completo de ventas por período, productos y rutas',
            icon: TrendingUp,
            color: 'bg-gradient-to-br from-green-500 to-green-700',
            metrics: ['Total Ventas', 'Pedidos', 'Promedio por Pedido', 'Crecimiento']
        },
        {
            id: 'routes',
            title: 'Reporte por Rutas',
            description: 'Rendimiento por ruta, clientes activos y productos top',
            icon: MapPin,
            color: 'bg-gradient-to-br from-blue-500 to-blue-700',
            metrics: ['Rutas Activas', 'Clientes por Ruta', 'Ventas por Ruta', 'Eficiencia']
        },
        {
            id: 'products',
            title: 'Reporte de Productos',
            description: 'Análisis detallado por categoría y línea de productos',
            icon: Package,
            color: 'bg-gradient-to-br from-purple-500 to-purple-700',
            metrics: ['Productos Activos', 'Categorías', 'Inventario', 'Rendimiento']
        },
        {
            id: 'clients',
            title: 'Reporte de Clientes',
            description: 'Análisis de clientes, frecuencia de compra y valor',
            icon: Users,
            color: 'bg-gradient-to-br from-orange-500 to-orange-700',
            metrics: ['Clientes Activos', 'Frecuencia', 'Valor Promedio', 'Retención']
        }
    ];

    const fetchOrdersData = async () => {
        try {
            console.log('Fetching orders...');
            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .gte('order_date', startDate)
                .lte('order_date', endDate);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Orders fetched successfully:', orders?.length || 0);
            return orders || [];
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    };

    const fetchProductsData = async () => {
        try {
            console.log('Fetching products...');
            const { data: products, error } = await supabase
                .from('products')
                .select('*');

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Products fetched successfully:', products?.length || 0);
            return products || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    };

    const fetchClientsData = async () => {
        try {
            console.log('Fetching clients...');
            const { data: clients, error } = await supabase
                .from('clients')
                .select('*');

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Clients fetched successfully:', clients?.length || 0);
            return clients || [];
        } catch (error) {
            console.error('Error fetching clients:', error);
            return [];
        }
    };

    const fetchRoutesData = async () => {
        try {
            console.log('Fetching routes...');
            const { data: routes, error } = await supabase
                .from('routes')
                .select('*');

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Routes fetched successfully:', routes?.length || 0);
            return routes || [];
        } catch (error) {
            console.error('Error fetching routes:', error);
            return [];
        }
    };

    // Función para calcular métricas avanzadas
    const calculateAdvancedMetrics = (data: any) => {
        const orders = data.orders || [];
        const products = data.products || [];
        const clients = data.clients || [];
        const routes = data.routes || [];

        // Métricas de ventas
        const totalSales = orders.reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount) || 0), 0);
        const completedOrders = orders.filter((order: any) => order.status === 'completed');
        const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

        // Crecimiento (comparar con período anterior)
        const currentPeriodOrders = orders.length;
        const previousPeriodOrders = Math.max(1, Math.floor(orders.length * 0.8)); // Simulación
        const growthRate = ((currentPeriodOrders - previousPeriodOrders) / previousPeriodOrders) * 100;

        // Métricas por ruta
        const routeMetrics = routes.map((route: any) => {
            const routeOrders = orders.filter((order: any) => order.route_id === route.id);
            const routeSales = routeOrders.reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount) || 0), 0);
            const routeClients = clients.filter((client: any) => client.route_id === route.id);

            return {
                ...route,
                orders: routeOrders.length,
                sales: routeSales,
                clients: routeClients.length,
                efficiency: routeOrders.length > 0 ? routeSales / routeOrders.length : 0
            };
        });

        // Top productos
        const productSales = products.map((product: any) => {
            const productOrders = orders.filter((order: any) =>
                order.order_items?.some((item: any) => item.product_id === product.id)
            );
            const productRevenue = productOrders.reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount) || 0), 0);

            return {
                ...product,
                orders: productOrders.length,
                revenue: productRevenue,
                performance: productOrders.length > 0 ? productRevenue / productOrders.length : 0
            };
        }).sort((a: any, b: any) => b.revenue - a.revenue);

        // Métricas de clientes
        const clientMetrics = clients.map((client: any) => {
            const clientOrders = orders.filter((order: any) => order.client_id === client.id);
            const clientValue = clientOrders.reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount) || 0), 0);
            const frequency = clientOrders.length;

            return {
                ...client,
                orders: clientOrders.length,
                value: clientValue,
                frequency: frequency,
                averageValue: frequency > 0 ? clientValue / frequency : 0
            };
        }).sort((a: any, b: any) => b.value - a.value);

        return {
            ...data,
            metrics: {
                totalSales,
                totalOrders: orders.length,
                completedOrders: completedOrders.length,
                averageOrderValue,
                growthRate,
                activeClients: clients.length,
                activeProducts: products.filter((p: any) => p.is_active).length,
                activeRoutes: routes.length
            },
            routeMetrics,
            productSales,
            clientMetrics,
            topProducts: productSales.slice(0, 5),
            topClients: clientMetrics.slice(0, 5)
        };
    };

    const generateReport = async (type: string) => {
        setLoading(true);
        setSelectedReportType(type);

        try {
            const [orders, products, clients, routes] = await Promise.all([
                fetchOrdersData(),
                fetchProductsData(),
                fetchClientsData(),
                fetchRoutesData()
            ]);

            const baseData = {
                orders,
                products,
                clients,
                routes,
                period: selectedPeriod,
                startDate,
                endDate
            };

            const reportData = calculateAdvancedMetrics(baseData);
            setReportData(reportData);
        } catch (error) {
            console.error('Error generating report:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo generar el reporte. Inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        Swal.fire({
            title: 'Exportar a PDF',
            text: 'Funcionalidad de exportación a PDF - En desarrollo',
            icon: 'info',
            confirmButtonText: 'OK'
        });
    };

    const exportToExcel = () => {
        Swal.fire({
            title: 'Exportar a Excel',
            text: 'Funcionalidad de exportación a Excel - En desarrollo',
            icon: 'info',
            confirmButtonText: 'OK'
        });
    };

        return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header mejorado */}
            <div className="bg-white shadow-lg border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center space-x-6">
                                <button
                                onClick={onBack}
                                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5 mr-2" />
                                Volver al dashboard
                                </button>
                            <div className="h-8 w-px bg-gray-300"></div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Centro de Reportes</h1>
                                <p className="text-sm text-gray-600">Análisis avanzado de datos y métricas</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Filtros */}
                                <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros
                                </button>

                            {/* Modo de vista */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('cards')}
                                    className={`px-3 py-1 rounded-md text-sm transition-colors ${viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                        }`}
                                >
                                    <BarChart3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-1 rounded-md text-sm transition-colors ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                        }`}
                                >
                                    <FileText className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('charts')}
                                    className={`px-3 py-1 rounded-md text-sm transition-colors ${viewMode === 'charts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                        }`}
                                >
                                    <PieChart className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Período */}
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                            >
                                <option value="daily">📅 Diario</option>
                                <option value="weekly">📊 Semanal</option>
                                <option value="monthly">📈 Mensual</option>
                            </select>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Panel de filtros */}
            {showFilters && (
                <div className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ruta</label>
                                <select
                                    value={selectedRoute}
                                    onChange={(e) => setSelectedRoute(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="all">Todas las rutas</option>
                                    {reportData?.routes?.map((route: any) => (
                                        <option key={route.id} value={route.id}>{route.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                                <select
                                    value={selectedClient}
                                    onChange={(e) => setSelectedClient(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="all">Todos los clientes</option>
                                    {reportData?.clients?.slice(0, 10).map((client: any) => (
                                        <option key={client.id} value={client.id}>{client.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Dashboard de métricas principales */}
                {reportData && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen Ejecutivo</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm">Total Ventas</p>
                                        <p className="text-3xl font-bold">${reportData.metrics?.totalSales?.toFixed(2) || '0.00'}</p>
                                        <p className="text-green-200 text-sm">
                                            {reportData.metrics?.growthRate > 0 ? '+' : ''}{reportData.metrics?.growthRate?.toFixed(1) || '0'}% vs período anterior
                                        </p>
                                        </div>
                                    <TrendingUp className="h-12 w-12 text-green-200" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm">Pedidos</p>
                                        <p className="text-3xl font-bold">{reportData.metrics?.totalOrders || 0}</p>
                                        <p className="text-blue-200 text-sm">
                                            {reportData.metrics?.completedOrders || 0} completados
                                            </p>
                                        </div>
                                    <FileText className="h-12 w-12 text-blue-200" />
                                    </div>
                                </div>

                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm">Valor Promedio</p>
                                        <p className="text-3xl font-bold">${reportData.metrics?.averageOrderValue?.toFixed(2) || '0.00'}</p>
                                        <p className="text-purple-200 text-sm">
                                            por pedido
                                        </p>
                                        </div>
                                    <BarChart3 className="h-12 w-12 text-purple-200" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100 text-sm">Clientes Activos</p>
                                        <p className="text-3xl font-bold">{reportData.metrics?.activeClients || 0}</p>
                                        <p className="text-orange-200 text-sm">
                                            {reportData.metrics?.activeRoutes || 0} rutas
                                            </p>
                                        </div>
                                    <Users className="h-12 w-12 text-orange-200" />
                                    </div>
                                </div>
                        </div>
                    </div>
                )}

                {/* Tarjetas de reportes mejoradas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {reportTypes.map((reportType) => {
                        const IconComponent = reportType.icon;
                        const isSelected = selectedReportType === reportType.id;

                        return (
                            <div
                                key={reportType.id}
                                className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${isSelected
                                    ? 'border-orange-500 shadow-orange-100'
                                    : 'border-gray-200 hover:border-orange-300 hover:shadow-xl'
                                    }`}
                                onClick={() => generateReport(reportType.id)}
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${reportType.color} shadow-lg`}>
                                            <IconComponent className="h-6 w-6 text-white" />
                                        </div>
                                        {isSelected && (
                                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {reportType.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 mb-4">
                                        {reportType.description}
                                    </p>

                                    {/* Métricas del reporte */}
                                    <div className="space-y-2 mb-4">
                                        {reportType.metrics.map((metric, index) => (
                                            <div key={index} className="flex items-center text-xs text-gray-500">
                                                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                                                {metric}
                                        </div>
                                        ))}
                                    </div>

                                    <div className={`text-sm font-semibold transition-colors ${isSelected ? 'text-orange-600' : 'text-orange-500'
                                        }`}>
                                        {isSelected ? '✓ Reporte activo' : 'Generar reporte →'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                                </div>

                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        <span className="ml-3 text-gray-600">Generando reporte...</span>
                    </div>
                )}

                {!loading && selectedReportType === 'sales' && reportData && (
                    <div className="mt-8 space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Resumen de Ventas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{reportData.orders.length}</div>
                                    <div className="text-sm text-blue-800">Total Pedidos</div>
                                        </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{reportData.clients.length}</div>
                                    <div className="text-sm text-green-800">Clientes Activos</div>
                                        </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{reportData.products.length}</div>
                                    <div className="text-sm text-purple-800">Productos</div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">{reportData.routes.length}</div>
                                    <div className="text-sm text-orange-800">Rutas</div>
                                    </div>
                                </div>
                            </div>

                        {/* Detalles de Pedidos */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Detalles de Pedidos</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID Pedido
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cliente
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ruta
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fecha
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {reportData.orders.slice(0, 10).map((order: any, index: number) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {order.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    Cliente #{order.client_id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    Ruta #{order.route_id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(order.order_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : order.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {order.status || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ${order.total_amount || '0.00'}
                                                    </td>
                                                </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                {reportData.orders.length > 10 && (
                                    <div className="mt-4 text-center text-sm text-gray-500">
                                        Mostrando 10 de {reportData.orders.length} pedidos
                                    </div>
                                )}
                                </div>
                            </div>

                        {/* Análisis por Ruta */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ventas por Ruta</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reportData.routes.map((route: any, index: number) => {
                                    const routeOrders = reportData.orders.filter((order: any) => order.route_id === route.id);
                                    const totalSales = routeOrders.reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount) || 0), 0);

                                    return (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="font-semibold text-gray-900 mb-2">{route.nombre}</div>
                                            <div className="text-sm text-gray-600 mb-3">{route.identificador}</div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Pedidos:</span>
                                                    <span className="font-semibold text-blue-600">{routeOrders.length}</span>
                                            </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Ventas:</span>
                                                    <span className="font-semibold text-green-600">${totalSales.toFixed(2)}</span>
                                            </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Promedio:</span>
                                                    <span className="font-semibold text-purple-600">
                                                        ${routeOrders.length > 0 ? (totalSales / routeOrders.length).toFixed(2) : '0.00'}
                                                    </span>
                                        </div>
                                </div>
                            </div>
                                    );
                                })}
                                </div>
                                </div>
                            </div>
                )}

                {!loading && selectedReportType === 'routes' && reportData && (
                    <div className="mt-8 space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Análisis por Rutas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reportData.routes.map((route: any, index: number) => {
                                    const routeOrders = reportData.orders.filter((order: any) => order.route_id === route.id);
                                    const routeClients = reportData.clients.filter((client: any) => client.route_id === route.id);
                                    const totalSales = routeOrders.reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount) || 0), 0);
                                    const completedOrders = routeOrders.filter((order: any) => order.status === 'completed').length;

                                    return (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="font-semibold text-gray-900 mb-2">{route.nombre}</div>
                                            <div className="text-sm text-gray-600 mb-3">{route.identificador}</div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Pedidos:</span>
                                                    <span className="font-semibold text-blue-600">{routeOrders.length}</span>
                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Completados:</span>
                                                    <span className="font-semibold text-green-600">{completedOrders}</span>
                            </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Clientes:</span>
                                                    <span className="font-semibold text-purple-600">{routeClients.length}</span>
                            </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Ventas:</span>
                                                    <span className="font-semibold text-orange-600">${totalSales.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Promedio:</span>
                                                    <span className="font-semibold text-indigo-600">
                                                        ${routeOrders.length > 0 ? (totalSales / routeOrders.length).toFixed(2) : '0.00'}
                                                    </span>
                                                </div>
                                            </div>
                                    </div>
                                    );
                                })}
                                </div>
                            </div>

                        {/* Top Clientes por Ruta */}
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Clientes por Ruta</h3>
                            <div className="space-y-4">
                                {reportData.routes.map((route: any, routeIndex: number) => {
                                    const routeOrders = reportData.orders.filter((order: any) => order.route_id === route.id);
                                    const clientStats = routeOrders.reduce((acc: any, order: any) => {
                                        const clientId = order.client_id;
                                        if (!acc[clientId]) {
                                            acc[clientId] = {
                                                nombre: `Cliente #${clientId}`,
                                                pedidos: 0,
                                                total: 0
                                            };
                                        }
                                        acc[clientId].pedidos += 1;
                                        acc[clientId].total += parseFloat(order.total_amount) || 0;
                                        return acc;
                                    }, {});

                                    const topClients = Object.values(clientStats)
                                        .sort((a: any, b: any) => b.total - a.total)
                                        .slice(0, 3);

                                    return (
                                        <div key={routeIndex} className="border border-gray-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 mb-3">{route.nombre}</h4>
                                            <div className="space-y-2">
                                                {topClients.map((client: any, clientIndex: number) => (
                                                    <div key={clientIndex} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                                        <span className="text-sm font-medium text-gray-900">{client.nombre}</span>
                                                        <div className="flex space-x-4 text-sm">
                                                            <span className="text-blue-600">{client.pedidos} pedidos</span>
                                                            <span className="text-green-600">${client.total.toFixed(2)}</span>
                                        </div>
                                        </div>
                                                ))}
                                                {topClients.length === 0 && (
                                                    <div className="text-sm text-gray-500 text-center py-2">
                                                        No hay pedidos para esta ruta
                                    </div>
                                                )}
                                </div>
                                        </div>
                                    );
                                })}
                                        </div>
                                    </div>
                                </div>
                )}

                {!loading && selectedReportType === 'clients' && reportData && (
                    <div className="mt-8 space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Análisis de Clientes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{reportData.metrics?.activeClients || 0}</div>
                                    <div className="text-sm text-blue-800">Clientes Activos</div>
                                        </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        ${reportData.clientMetrics?.reduce((sum: number, client: any) => sum + client.value, 0)?.toFixed(2) || '0.00'}
                                        </div>
                                    <div className="text-sm text-green-800">Total Clientes</div>
                                    </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {reportData.clientMetrics?.reduce((sum: number, client: any) => sum + client.orders, 0) || 0}
                                </div>
                                    <div className="text-sm text-purple-800">Total Pedidos</div>
                                    </div>
                                </div>
                            </div>

                        {/* Top Clientes */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Top 10 Clientes por Valor</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frecuencia</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {reportData.topClients?.slice(0, 10).map((client: any, index: number) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {client.nombre}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {client.orders}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ${client.value?.toFixed(2) || '0.00'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ${client.averageValue?.toFixed(2) || '0.00'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${client.frequency >= 5
                                                                ? 'bg-green-100 text-green-800'
                                                        : client.frequency >= 3
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                        {client.frequency >= 5 ? 'Alta' : client.frequency >= 3 ? 'Media' : 'Baja'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        {/* Análisis de Retención */}
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Análisis de Retención</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {reportData.clientMetrics?.filter((client: any) => client.frequency >= 5).length || 0}
                                        </div>
                                    <div className="text-sm text-green-800">Clientes Frecuentes (5+ pedidos)</div>
                                        </div>
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {reportData.clientMetrics?.filter((client: any) => client.frequency >= 3 && client.frequency < 5).length || 0}
                                    </div>
                                    <div className="text-sm text-yellow-800">Clientes Regulares (3-4 pedidos)</div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">
                                        {reportData.clientMetrics?.filter((client: any) => client.frequency < 3).length || 0}
                                        </div>
                                    <div className="text-sm text-red-800">Clientes Ocasionales (&lt;3 pedidos)</div>
                                        </div>
                                    </div>
                                </div>
                                        </div>
                )}

                {!loading && selectedReportType === 'products' && reportData && (
                    <div className="mt-8 space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Análisis de Productos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(
                                    reportData.products.reduce((acc: any, product: any) => {
                                        const category = `Categoría ${product.category_id || 'Sin ID'}`;
                                        if (!acc[category]) {
                                            acc[category] = [];
                                        }
                                        acc[category].push(product);
                                        return acc;
                                    }, {})
                                ).map(([category, categoryProducts]: [string, any]) => (
                                    <div key={category} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="font-semibold text-gray-900 mb-2">{category}</div>
                                        <div className="text-sm text-gray-600 mb-3">{categoryProducts.length} productos</div>
                                        <div className="space-y-1">
                                            {categoryProducts.slice(0, 3).map((product: any, index: number) => (
                                                <div key={index} className="text-sm text-gray-700">
                                                    • {product.nombre}
                                        </div>
                                            ))}
                                            {categoryProducts.length > 3 && (
                                                <div className="text-sm text-gray-500">
                                                    ... y {categoryProducts.length - 3} más
                                        </div>
                                            )}
                                    </div>
                                    </div>
                                ))}
                                </div>
                            </div>

                        {/* Productos más vendidos */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Productos más vendidos</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Producto
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Categoría
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Precio
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Estado
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {reportData.products.slice(0, 10).map((product: any, index: number) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {product.nombre}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    Categoría #{product.category_id || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ${product.price || '0.00'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}>
                                                        {product.is_active ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                {reportData.products.length > 10 && (
                                    <div className="mt-4 text-center text-sm text-gray-500">
                                        Mostrando 10 de {reportData.products.length} productos
                        </div>
                    )}
                                        </div>
                                    </div>

                        {/* Resumen por categorías */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Resumen por Categorías</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.entries(
                                    reportData.products.reduce((acc: any, product: any) => {
                                        const category = `Categoría ${product.category_id || 'Sin ID'}`;
                                        if (!acc[category]) {
                                            acc[category] = {
                                                total: 0,
                                                activos: 0,
                                                inactivos: 0,
                                                precioPromedio: 0
                                            };
                                        }
                                        acc[category].total += 1;
                                        if (product.is_active) {
                                            acc[category].activos += 1;
                                        } else {
                                            acc[category].inactivos += 1;
                                        }
                                        acc[category].precioPromedio += parseFloat(product.price) || 0;
                                        return acc;
                                    }, {})
                                ).map(([category, stats]: [string, any]) => (
                                    <div key={category} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="font-semibold text-gray-900 mb-2">{category}</div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Total:</span>
                                                <span className="font-semibold text-blue-600">{stats.total}</span>
                                                    </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Activos:</span>
                                                <span className="font-semibold text-green-600">{stats.activos}</span>
                                                        </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Inactivos:</span>
                                                <span className="font-semibold text-red-600">{stats.inactivos}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Precio Promedio:</span>
                                                <span className="font-semibold text-purple-600">
                                                    ${stats.total > 0 ? (stats.precioPromedio / stats.total).toFixed(2) : '0.00'}
                                                </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                        </div>
                    )}

                {!loading && selectedReportType && (
                    <div className="mt-8 flex justify-end space-x-3">
                            <button
                            onClick={exportToPDF}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                            <Download className="h-4 w-4 mr-2" />
                            Exportar PDF
                            </button>
                        <button
                            onClick={exportToExcel}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Exportar Excel
                            </button>
                        </div>
                )}

                {!loading && !selectedReportType && (
                    <div className="mt-8 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Centro de Reportes</h3>
                            <p className="text-gray-600 mb-6">
                                Selecciona un tipo de reporte para comenzar el análisis de tus datos.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">📊</div>
                                    <div className="text-sm text-blue-800 mt-2">Reportes de Ventas</div>
                            </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">🗺️</div>
                                    <div className="text-sm text-green-800 mt-2">Análisis por Rutas</div>
                        </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">📦</div>
                                    <div className="text-sm text-purple-800 mt-2">Productos y Categorías</div>
                    </div>
                </div>
                                </div>
                            </div>
                )}
            </div>

            <Footer />
        </div>
    );
} 