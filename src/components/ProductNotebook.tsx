'use client';

import { useState, useRef } from 'react';
import Select from 'react-select';
import {
    ArrowLeft,
    Download,
    FileText,
    Calendar,
    MapPin,
    Package
} from 'lucide-react';
import { Order } from '@/types/order';
import { Client } from '@/types/client';
import { Product } from '@/types/product';
import { mockOrders } from '@/data/mockOrders';
import { mockClients } from '@/data/mockClients';
import { mockProducts } from '@/data/mockProducts';
import { mockRoutes } from '@/data/mockRoutes';
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
    const [selectedProduct, setSelectedProduct] = useState<SelectOption | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Obtener pedidos del día seleccionado
    const getOrdersForDate = (date: string) => {
        const targetDate = new Date(date);
        return mockOrders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate.toDateString() === targetDate.toDateString();
        });
    };

    // Obtener productos por categoría
    const getProductsByCategory = () => {
        const categories = ['Pizzas', 'Donut', 'Rellenas', 'Mini donut', 'Mini rellenas', 'Panes', 'Muffins', 'Pasteles'];
        const productsByCategory: { [category: string]: Product[] } = {};

        categories.forEach(category => {
            productsByCategory[category] = mockProducts.filter(product =>
                product.category === category && product.isActive
            );
        });

        return productsByCategory;
    };

    // Calcular resumen de productos
    const calculateProductSummary = (orders: Order[]): ProductSummary[] => {
        const productMap: { [productId: string]: ProductSummary } = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                const product = mockProducts.find(p => p.id === item.productId);
                if (!product) return;

                if (!productMap[item.productId]) {
                    productMap[item.productId] = {
                        productId: item.productId,
                        productName: item.productName,
                        category: item.productCategory,
                        variant: item.productVariant,
                        totalQuantity: 0,
                        routeQuantities: {}
                    };
                }

                productMap[item.productId].totalQuantity += item.quantity;

                if (order.routeId) {
                    productMap[item.productId].routeQuantities[order.routeId] =
                        (productMap[item.productId].routeQuantities[order.routeId] || 0) + item.quantity;
                }
            });
        });

        return Object.values(productMap);
    };

    // Obtener clientes por ruta
    const getClientsByRoute = (routeId: string) => {
        return mockClients.filter(client => client.routeId === routeId && client.isActive);
    };

    // Obtener cantidades de productos por cliente y ruta
    const getClientProductQuantities = (client: Client, routeId: string, orders: Order[]) => {
        const clientProducts: { [productId: string]: number } = {};

        // Buscar pedidos que coincidan con el cliente y la ruta
        orders.forEach(order => {
            // Verificar si el pedido pertenece a la ruta y al cliente
            if (order.routeId === routeId) {
                // Buscar por nombre completo del cliente
                if (order.clientName === client.nombreCompleto ||
                    order.clientName === client.institucionEducativa) {
                    order.items.forEach(item => {
                        clientProducts[item.productId] = (clientProducts[item.productId] || 0) + item.quantity;
                    });
                }
            }
        });

        return clientProducts;
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

            const categoryText = selectedCategory ? `-${selectedCategory.value}` : '';
            const productText = selectedProduct ? `-${selectedProduct.value}` : '';
            pdf.save(`Cuaderno-Producto${categoryText}${productText}-${selectedDate}.pdf`);
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
        }
    };

    const orders = getOrdersForDate(selectedDate);
    const productSummary = calculateProductSummary(orders);
    const productsByCategory = getProductsByCategory();
    const activeRoutes = mockRoutes.filter(route => route.isActive);

    // Opciones para los selects
    const categoryOptions: SelectOption[] = Object.keys(productsByCategory).map(category => ({
        value: category,
        label: category
    }));

    const productOptions: SelectOption[] = Object.entries(productsByCategory).flatMap(([category, products]) =>
        products.map(product => ({
            value: product.id,
            label: `${product.name} (${product.variant})`
        }))
    );

    // Filtrar productos según selección
    const filteredProducts = selectedCategory
        ? productSummary.filter(p => p.category === selectedCategory.value)
        : selectedProduct
            ? productSummary.filter(p => p.productId === selectedProduct.value)
            : productSummary.filter(p => p.category === 'Pizzas'); // Por defecto mostrar solo pizzas



    // Estilos personalizados para react-select
    const selectStyles = {
        control: (provided: any) => ({
            ...provided,
            borderColor: '#d1d5db',
            borderRadius: '0.5rem',
            '&:hover': {
                borderColor: '#f97316'
            }
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#f97316' : state.isFocused ? '#fed7aa' : 'white',
            color: state.isSelected ? 'white' : 'black',
            '&:hover': {
                backgroundColor: state.isSelected ? '#f97316' : '#fed7aa'
            }
        }),
        menu: (provided: any) => ({
            ...provided,
            zIndex: 9999
        })
    };

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
                                <FileText className="h-8 w-8 text-orange-500" />
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
                                <Select
                                    value={selectedCategory}
                                    onChange={(option) => {
                                        setSelectedCategory(option);
                                        setSelectedProduct(null);
                                    }}
                                    options={categoryOptions}
                                    isClearable
                                    placeholder="Buscar categoría..."
                                    styles={selectStyles}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Producto específico (opcional)
                                </label>
                                <Select
                                    value={selectedProduct}
                                    onChange={(option) => setSelectedProduct(option)}
                                    options={productOptions}
                                    isClearable
                                    placeholder="Buscar producto..."
                                    styles={selectStyles}
                                />
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
                                <p className="text-2xl font-bold text-orange-600">{orders.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contenido para impresión */}
                    <div ref={printRef} className="bg-white p-8 border border-gray-300">
                        {/* Header del reporte */}
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-black">PIZZAS</h1>
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
                            const routeClients = getClientsByRoute(route.id);
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
                                                                {client.institucionEducativa}
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
                                        <span className="ml-2 text-black font-bold">{product.totalQuantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t border-gray-300">
                            <p className="text-center text-sm text-gray-800 font-medium">
                                Cuaderno por producto generado para Mega Donut<br />
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
