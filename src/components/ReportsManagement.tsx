'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3,
    ArrowLeft,
    Download,
    FileText,
    Calendar,
    Filter
} from 'lucide-react';
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

    const reportTypes = [
        {
            id: 'sales',
            title: 'Reporte de Ventas',
            description: 'Análisis completo de ventas por período, productos y rutas',
            icon: FileText,
            color: 'bg-gradient-to-br from-green-500 to-green-700'
        },
        {
            id: 'production',
            title: 'Reporte de Producción',
            description: 'Comparativo planificado vs real, eficiencia y costos',
            icon: FileText,
            color: 'bg-gradient-to-br from-blue-500 to-blue-700'
        },
        {
            id: 'inventory',
            title: 'Reporte de Inventario',
            description: 'Stock actual, productos con bajo inventario y valorización',
            icon: FileText,
            color: 'bg-gradient-to-br from-purple-500 to-purple-700'
        },
        {
            id: 'routes',
            title: 'Reporte por Rutas',
            description: 'Rendimiento por ruta, clientes activos y productos top',
            icon: FileText,
            color: 'bg-gradient-to-br from-yellow-500 to-yellow-700'
        },
        {
            id: 'products',
            title: 'Reporte de Productos',
            description: 'Análisis detallado por categoría y línea de productos',
            icon: FileText,
            color: 'bg-gradient-to-br from-red-500 to-red-700'
        },
        {
            id: 'comparative',
            title: 'Reporte Comparativo',
            description: 'Comparaciones entre períodos y análisis de tendencias',
            icon: FileText,
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-700'
        }
    ];

    const generateReport = (type: string) => {
        setSelectedReportType(type);
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    if (selectedReportType) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setSelectedReportType(null)}
                                    className="flex items-center text-gray-600 hover:text-gray-900"
                                >
                                    <ArrowLeft className="h-5 w-5 mr-2" />
                                    Volver a reportes
                                </button>
                                <div className="h-6 w-px bg-gray-300"></div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {reportTypes.find(r => r.id === selectedReportType)?.title}
                                </h1>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={exportToPDF}
                                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    PDF
                                </button>
                                <button
                                    onClick={exportToExcel}
                                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Excel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {selectedReportType === 'sales' && (
                        <div className="space-y-6">
                            {/* Resumen de ventas */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <FileText className="h-8 w-8 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {/* {formatCurrency(mockSalesReport.totalSales)} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <FileText className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Total Pedidos</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {/* {mockSalesReport.totalOrders} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <BarChart3 className="h-8 w-8 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Promedio por Pedido</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {/* {formatCurrency(mockSalesReport.averageOrderValue)} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Calendar className="h-8 w-8 text-orange-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Período</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {/* {mockSalesReport.startDate.toLocaleDateString('es-ES')} - {mockSalesReport.endDate.toLocaleDateString('es-ES')} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Productos más vendidos */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Producto
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Cantidad Vendida
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Ingresos Totales
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Precio Promedio
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {/* {mockSalesReport.topProducts.map((product, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                                                            <div className="text-sm text-gray-500">{product.category} - {product.variant}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {product.quantitySold}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(product.totalRevenue)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(product.averagePrice)}
                                                    </td>
                                                </tr>
                                            ))} */}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Ventas por ruta */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Ruta</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* {mockSalesReport.salesByRoute.map((route, index) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900">{route.routeName}</h4>
                                                <MapPin className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-600">
                                                    Ventas: {formatCurrency(route.totalSales)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Pedidos: {route.totalOrders}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Promedio: {formatCurrency(route.averageOrderValue)}
                                                </p>
                                            </div>
                                        </div>
                                    ))} */}
                                </div>
                            </div>

                            {/* Gráficos de progreso */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Progreso semanal */}
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso Semanal</h3>
                                    {/* <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={weeklyProgressData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip formatter={(value, name) => [
                                                name === 'ventas' ? formatCurrency(Number(value)) : value,
                                                name === 'ventas' ? 'Ventas' : name === 'meta' ? 'Meta' : 'Pedidos'
                                            ]} />
                                            <Legend />
                                            <Line type="monotone" dataKey="ventas" stroke="#10B981" strokeWidth={2} name="Ventas" />
                                            <Line type="monotone" dataKey="meta" stroke="#EF4444" strokeDasharray="5 5" name="Meta" />
                                        </LineChart>
                                    </ResponsiveContainer> */}
                                </div>

                                {/* Progreso mensual */}
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso Mensual</h3>
                                    {/* <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={monthlyProgressData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value, name) => [
                                                name === 'ventas' ? formatCurrency(Number(value)) : value,
                                                name === 'ventas' ? 'Ventas' : name === 'meta' ? 'Meta' : 'Pedidos'
                                            ]} />
                                            <Legend />
                                            <Area type="monotone" dataKey="ventas" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Ventas" />
                                            <Line type="monotone" dataKey="meta" stroke="#F59E0B" strokeDasharray="5 5" name="Meta" />
                                        </AreaChart>
                                    </ResponsiveContainer> */}
                                </div>
                            </div>

                            {/* Gráficos de distribución */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Productos más vendidos */}
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h3>
                                    {/* <ResponsiveContainer width="100%" height={300}>
                                        <RechartsPieChart>
                                            <Pie
                                                data={topProductsData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, porcentaje }) => `${name} ${porcentaje}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="ventas"
                                            >
                                                {topProductsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [value, 'Ventas']} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer> */}
                                </div>

                                {/* Ventas por ruta */}
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Ruta</h3>
                                    {/* <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={salesByRouteData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="ruta" />
                                            <YAxis />
                                            <Tooltip formatter={(value, name) => [
                                                name === 'ventas' ? formatCurrency(Number(value)) : value,
                                                name === 'ventas' ? 'Ventas' : 'Clientes'
                                            ]} />
                                            <Legend />
                                            <Bar dataKey="ventas" fill="#3B82F6" name="Ventas" />
                                        </BarChart>
                                    </ResponsiveContainer> */}
                                </div>
                            </div>

                            {/* Crecimiento trimestral */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Crecimiento Trimestral</h3>
                                {/* <ResponsiveContainer width="100%" height={350}>
                                    <ComposedChart data={quarterlyGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="quarter" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip formatter={(value, name) => [
                                            name === 'ventas' ? formatCurrency(Number(value)) : `${value}%`,
                                            name === 'ventas' ? 'Ventas' : 'Crecimiento'
                                        ]} />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="ventas" fill="#10B981" name="Ventas" />
                                        <Line yAxisId="right" type="monotone" dataKey="crecimiento" stroke="#F59E0B" strokeWidth={3} name="Crecimiento %" />
                                    </ComposedChart>
                                </ResponsiveContainer> */}
                            </div>

                            {/* Ventas por método de pago */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Método de Pago</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        {/* {mockSalesReport.salesByPaymentMethod.map((method, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                                                    <span className="text-sm font-medium text-gray-900">{method.paymentMethod}</span>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-sm text-gray-600">{method.orderCount} pedidos</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(method.totalSales)}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        ({formatPercentage(method.percentage)})
                                                    </span>
                                                </div>
                                            </div>
                                        ))} */}
                                    </div>
                                    {/* <ResponsiveContainer width="100%" height={200}>
                                        <RechartsPieChart>
                                            <Pie
                                                data={paymentMethodsData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, value }) => `${name} ${value}%`}
                                            >
                                                {paymentMethodsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer> */}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedReportType === 'production' && (
                        <div className="space-y-6">
                            {/* Resumen de producción */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <FileText className="h-8 w-8 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Eficiencia</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {/* {formatPercentage(mockProductionReport.efficiency)} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <FileText className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Costo Total</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {/* {formatCurrency(mockProductionReport.totalCost)} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <FileText className="h-8 w-8 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Productos</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {/* {mockProductionReport.plannedProduction.length} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Calendar className="h-8 w-8 text-orange-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Fecha</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {/* {mockProductionReport.date.toLocaleDateString('es-ES')} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Comparativo planificado vs real */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Producción Planificada vs Real</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Producto
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Planificado
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Real
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Variación
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Costo Real
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {/* {mockProductionReport.variance.map((item, index) => {
                                                const actualItem = mockProductionReport.actualProduction[index];
                                                return (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {item.plannedQuantity}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {item.actualQuantity}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.variance >= 0
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {item.variance >= 0 ? '+' : ''}{item.variance} ({formatPercentage(item.variancePercentage)})
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatCurrency(actualItem.totalCost)}
                                                        </td>
                                                    </tr>
                                                );
                                            })} */}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedReportType === 'inventory' && (
                        <div className="space-y-6">
                            {/* Resumen de inventario */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <FileText className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Valor Total</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {/* {formatCurrency(mockInventoryReport.totalValue)} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <FileText className="h-8 w-8 text-red-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Stock Bajo</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {/* {mockInventoryReport.lowStockItems.length} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <FileText className="h-8 w-8 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Total Productos</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {/* {mockInventoryReport.products.length} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Calendar className="h-8 w-8 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Fecha</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {/* {mockInventoryReport.date.toLocaleDateString('es-ES')} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estado del inventario */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Inventario</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Producto
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Stock Actual
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Stock Mínimo
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Valor Total
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Estado
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {/* {mockInventoryReport.products.map((product, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                                                            <div className="text-sm text-gray-500">{product.category}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {product.currentStock}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {product.minimumStock}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(product.totalValue)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'normal'
                                                            ? 'bg-green-100 text-green-800'
                                                            : product.status === 'low'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {product.status === 'normal' ? 'Normal' :
                                                                product.status === 'low' ? 'Stock Bajo' : 'Agotado'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))} */}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedReportType === 'routes' && (
                        <div className="space-y-6">
                            {/* {mockRouteReports.map((route, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900">Ruta {route.routeName}</h3>
                                        <span className="text-sm text-gray-500">
                                            {route.startDate.toLocaleDateString('es-ES')} - {route.endDate.toLocaleDateString('es-ES')}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                        <div className="text-center">
                                            <p className="text-2xl font-semibold text-gray-900">{route.totalClients}</p>
                                            <p className="text-sm text-gray-500">Total Clientes</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-semibold text-gray-900">{route.activeClients}</p>
                                            <p className="text-sm text-gray-500">Clientes Activos</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {formatCurrency(route.totalSales)}
                                            </p>
                                            <p className="text-sm text-gray-500">Ventas Totales</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {formatPercentage(route.deliveryEfficiency)}
                                            </p>
                                            <p className="text-sm text-gray-500">Eficiencia Entrega</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Productos Más Vendidos</h4>
                                        <div className="space-y-2">
                                            {route.topProducts.map((product, productIndex) => (
                                                <div key={productIndex} className="flex items-center justify-between py-2 border-b border-gray-100">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-900">{product.productName}</span>
                                                        <span className="text-sm text-gray-500 ml-2">({product.category})</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.quantitySold} unidades
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {formatCurrency(product.totalRevenue)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))} */}
                        </div>
                    )}

                    {(selectedReportType === 'products' || selectedReportType === 'comparative') && (
                        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Reporte en Desarrollo
                            </h3>
                            <p className="text-gray-500">
                                Este reporte está siendo desarrollado y estará disponible próximamente.
                            </p>
                        </div>
                    )}
                </div>

                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Volver al dashboard
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <h1 className="text-xl font-semibold text-gray-900">Centro de Reportes</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* <Filter className="h-5 w-5 text-gray-400" /> */}
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="daily">Diario</option>
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensual</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filtros de fecha */}
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurar Período de Reporte</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                                Aplicar Filtros
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid de tipos de reportes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportTypes.map((reportType) => {
                        const IconComponent = reportType.icon;
                        return (
                            <div
                                key={reportType.id}
                                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => generateReport(reportType.id)}
                            >
                                <div className="p-6">
                                    <div className={`w-12 h-12 ${reportType.color} rounded-lg flex items-center justify-center mb-4`}>
                                        <IconComponent className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {reportType.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {reportType.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-orange-600 font-medium">
                                            Generar reporte
                                        </span>
                                        {/* <Eye className="h-4 w-4 text-orange-600" /> */}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Resumen rápido con gráficos */}
                <div className="mt-8 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de la Semana</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-green-600">
                                    {/* {formatCurrency(mockSalesReport.totalSales)} */}
                                </div>
                                <div className="text-sm text-gray-500">Ventas Totales</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-blue-600">
                                    {/* {mockSalesReport.totalOrders} */}
                                </div>
                                <div className="text-sm text-gray-500">Pedidos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-purple-600">
                                    {/* {formatPercentage(mockProductionReport.efficiency)} */}
                                </div>
                                <div className="text-sm text-gray-500">Eficiencia</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-red-600">
                                    {/* {mockInventoryReport.lowStockItems.length} */}
                                </div>
                                <div className="text-sm text-gray-500">Productos Bajo Stock</div>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de progreso rápido */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia Semanal</h3>
                            {/* <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={weeklyProgressData}>
                                    <XAxis dataKey="day" />
                                    <YAxis hide />
                                    <Tooltip formatter={(value, name) => [
                                        name === 'ventas' ? formatCurrency(Number(value)) : value,
                                        name === 'ventas' ? 'Ventas' : 'Meta'
                                    ]} />
                                    <Line type="monotone" dataKey="ventas" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                                    <Line type="monotone" dataKey="meta" stroke="#EF4444" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer> */}
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Rutas</h3>
                            {/* <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={salesByRouteData}>
                                    <XAxis dataKey="ruta" />
                                    <YAxis hide />
                                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Ventas']} />
                                    <Bar dataKey="ventas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer> */}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
} 