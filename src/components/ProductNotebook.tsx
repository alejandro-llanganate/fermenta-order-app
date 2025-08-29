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

interface ProductNotebookProps {
    onBack: () => void;
}

interface ProductSummary {
    productId: string;
    productName: string;
    category: string;
    variant: string;
    totalQuantity: number;
    routeQuantities: { [routeId: string]: number };
}

interface SelectOption {
    value: string;
    label: string;
}

export default function ProductNotebook({ onBack }: ProductNotebookProps) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Pizzas');
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printRef, setPrintRef] = useState<HTMLDivElement | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [productsByCategory, setProductsByCategory] = useState<{ [category: string]: Product[] }>({});
    const [activeRoutes, setActiveRoutes] = useState<Route[]>([]);
    const [productSummary, setProductSummary] = useState<ProductSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch orders
            const ordersData = await getOrdersForDate(selectedDate);
            setOrders(ordersData);

            // Fetch products by category
            const productsData = await getProductsByCategory();
            setProductsByCategory(productsData);

            // Fetch routes
            const { data: routesData, error: routesError } = await supabase
                .from('routes')
                .select('*')
                .eq('is_active', true);

            if (routesError) throw routesError;
            setActiveRoutes(routesData || []);

            // Calculate product summary
            const summary = calculateProductSummary(ordersData);
            setProductSummary(summary);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Obtener pedidos del día seleccionado
    const getOrdersForDate = async (date: string) => {
        const { data, error } = await supabase
            .from('orders_with_details')
            .select('*')
            .eq('order_date', date)
            .order('order_date', { ascending: true });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
        return data as Order[];
    };

    // Obtener productos por categoría
    const getProductsByCategory = async () => {
        const { data, error } = await supabase
            .from('products_with_categories')
            .select('*')
            .eq('is_active', true)
            .order('category_name', { ascending: true });

        if (error) {
            console.error('Error fetching products:', error);
            return {};
        }

        const productsByCategory: { [category: string]: Product[] } = {};
        data.forEach((product: Product) => {
            if (!productsByCategory[product.categoryName]) {
                productsByCategory[product.categoryName] = [];
            }
            productsByCategory[product.categoryName].push(product);
        });

        return productsByCategory;
    };

    // Calcular resumen de productos
    const calculateProductSummary = (orders: Order[]): ProductSummary[] => {
        const summary: { [productId: string]: ProductSummary } = {};

        orders.forEach(order => {
            order.items?.forEach(item => {
                if (!summary[item.productId]) {
                    summary[item.productId] = {
                        productId: item.productId,
                        productName: item.productName,
                        category: item.productCategory,
                        variant: item.productVariant,
                        totalQuantity: 0,
                        routeQuantities: {}
                    };
                }

                summary[item.productId].totalQuantity += item.quantity;

                if (order.routeId) {
                    if (!summary[item.productId].routeQuantities[order.routeId]) {
                        summary[item.productId].routeQuantities[order.routeId] = 0;
                    }
                    summary[item.productId].routeQuantities[order.routeId] += item.quantity;
                }
            });
        });

        return Object.values(summary);
    };

    // Obtener clientes por ruta
    const getClientsByRoute = async (routeId: string) => {
        const { data, error } = await supabase
            .from('clients_with_routes')
            .select('*')
            .eq('route_id', routeId)
            .eq('is_active', true)
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error fetching clients:', error);
            return [];
        }
        return data as Client[];
    };

    // Obtener cantidades de productos por cliente y ruta
    const getClientProductQuantities = (client: Client, routeId: string, orders: Order[]) => {
        const clientProducts: { [productId: string]: number } = {};

        orders.forEach(order => {
            if (order.clientId === client.id && order.routeId === routeId) {
                order.items?.forEach(item => {
                    if (!clientProducts[item.productId]) {
                        clientProducts[item.productId] = 0;
                    }
                    clientProducts[item.productId] += item.quantity;
                });
            }
        });

        return clientProducts;
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

            const categoryText = selectedCategory ? `-${selectedCategory}` : '';
            pdf.save(`Cuaderno-Producto${categoryText}-${selectedDate}.pdf`);
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
        }
    };

    // Filtrar productos según selección

    // Filtrar productos según selección
    const filteredProducts = productSummary.filter(product =>
        product.category === selectedCategory
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando datos...</p>
                </div>
            </div>
        );
    }

    // Componente para el contenido de impresión
    const PrintContent = () => {
        const [routeClientsMap, setRouteClientsMap] = useState<{ [routeId: string]: Client[] }>({});

        useEffect(() => {
            const fetchRouteClients = async () => {
                const clientsMap: { [routeId: string]: Client[] } = {};
                for (const route of activeRoutes) {
                    const clients = await getClientsByRoute(route.id);
                    clientsMap[route.id] = clients;
                }
                setRouteClientsMap(clientsMap);
            };
            fetchRouteClients();
        }, [activeRoutes]);

        return (
            <div ref={setPrintRef} className="bg-white p-8 border border-gray-300">
                {/* Header del reporte */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-black">{selectedCategory.toUpperCase()}</h1>
                    <p className="text-lg text-gray-600 mt-2">
                        {new Date(selectedDate).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        }).toUpperCase()}
                    </p>
                </div>

                {/* Tabla de productos por ruta */}
                {activeRoutes.map((route, routeIndex) => {
                    const routeClients = routeClientsMap[route.id] || [];
                    const routeProducts = filteredProducts.filter(p => p.routeQuantities[route.id] > 0);

                    if (routeProducts.length === 0 && routeClients.length === 0) return null;

                    return (
                        <div key={route.id} className="mb-8">
                            {/* Header de la ruta */}
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-black">
                                    RUTA {route.identificador} - {route.nombre}
                                </h2>
                            </div>

                            {/* Tabla de productos */}
                            <div className="overflow-x-auto mb-4">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-yellow-100">
                                            <th className="border border-gray-300 px-3 py-2 text-left text-black font-bold">CLIENTE</th>
                                            {filteredProducts.map(product => (
                                                <th key={product.productId} className="border border-gray-300 px-2 py-2 text-center text-black font-bold text-xs">
                                                    {product.variant.toUpperCase()}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {routeClients.map((client, clientIndex) => {
                                            const clientProducts = getClientProductQuantities(client, route.id, orders);

                                            return (
                                                <tr key={client.id} className={clientIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="border border-gray-300 px-3 py-2 text-black font-medium">
                                                        {client.nombre}
                                                    </td>
                                                    {filteredProducts.map(product => (
                                                        <td key={product.productId} className="border border-gray-300 px-2 py-2 text-center text-black">
                                                            {clientProducts[product.productId] || ''}
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totales de la ruta */}
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <h3 className="font-semibold text-black mb-2">Totales Ruta {route.identificador}:</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {filteredProducts.map(product => {
                                        const total = product.routeQuantities[route.id] || 0;
                                        return total > 0 ? (
                                            <div key={product.productId} className="text-sm">
                                                <span className="font-medium text-black">{product.variant}:</span>
                                                <span className="ml-2 text-black">{total}</span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Totales generales */}
                <div className="mt-8 bg-blue-100 p-4 rounded-lg">
                    <h3 className="font-bold text-black mb-3">TOTALES GENERALES:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <div key={product.productId} className="text-sm">
                                <span className="font-medium text-black">{product.variant}:</span>
                                <span className="ml-2 text-black">{product.totalQuantity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Estilos personalizados para react-select


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
                                <h1 className="text-2xl font-bold text-gray-900">Cuaderno por Producto</h1>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    Categoría (opcional)
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                                >
                                    <option value="">Todas las categorías</option>
                                    {Object.keys(productsByCategory).map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Producto específico (opcional)
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                                    disabled
                                >
                                    <option value="">Seleccionar producto...</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Información de pedidos */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Resumen del día</h3>
                                <p className="text-sm text-gray-600">
                                    {new Date(selectedDate).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Total de pedidos</p>
                                <p className="text-2xl font-bold text-orange-600">{productSummary.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contenido para impresión */}
                    <PrintContent />

                    {/* Modal de impresión */}
                    {showPrintModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">Vista previa de impresión</h2>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={generatePDF}
                                            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>Descargar PDF</span>
                                        </button>
                                        <button
                                            onClick={() => setShowPrintModal(false)}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                                    <PrintContent />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t border-gray-300">
                        <p className="text-center text-sm text-gray-800 font-medium">
                            Cuaderno por producto generado para Mega Donut<br />
                            {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
