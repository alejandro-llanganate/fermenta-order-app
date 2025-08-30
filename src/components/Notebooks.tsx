'use client';

import { useState } from 'react';
import {
    ArrowLeft,
    BookOpen,
    FileText,
    Calculator,
    Download,
    MapPin,
    Tag,
    BarChart3
} from 'lucide-react';
import ProductNotebook from './ProductNotebook';
import DonutProductionNotebook from './DonutProductionNotebook';
import RouteNotebook from './RouteNotebook';
import Footer from './Footer';

interface NotebooksProps {
    onBack: () => void;
}

type SubModule = 'main' | 'product' | 'donut-production' | 'by-routes' | 'by-categories' | 'partial-totals';

export default function Notebooks({ onBack }: NotebooksProps) {
    const [currentSubModule, setCurrentSubModule] = useState<SubModule>('main');

    const handleBackToMain = () => {
        setCurrentSubModule('main');
    };

    if (currentSubModule === 'product') {
        return <ProductNotebook onBack={handleBackToMain} />;
    }

    if (currentSubModule === 'donut-production') {
        return <DonutProductionNotebook onBack={handleBackToMain} />;
    }

    if (currentSubModule === 'by-routes') {
        return <RouteNotebook onBack={handleBackToMain} />;
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
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <BookOpen className="h-8 w-8 text-orange-500" />
                                <h1 className="text-2xl font-bold text-gray-900">Cuadernos</h1>
                            </div>
                        </div>
                    </div>

                    {/* Submódulos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Cuaderno por Rutas */}
                        <div
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setCurrentSubModule('by-routes')}
                        >
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Por Rutas</h3>
                                    <p className="text-sm text-gray-600">Reportes organizados por rutas de entrega</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-4">
                                Genera cuadernos de pedidos organizados por rutas, con distribución de productos y totales por ruta.
                            </p>
                            <div className="flex items-center text-blue-600 text-sm font-medium">
                                <span>Acceder</span>
                                <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                            </div>
                        </div>

                        {/* Cuaderno por Categorías de Productos */}
                        <div
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setCurrentSubModule('by-categories')}
                        >
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Tag className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Por Categorías de Productos</h3>
                                    <p className="text-sm text-gray-600">Reportes agrupados por tipo de producto</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-4">
                                Genera cuadernos organizados por categorías de productos, con subtotales y distribución por rutas.
                            </p>
                            <div className="flex items-center text-green-600 text-sm font-medium">
                                <span>Acceder</span>
                                <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                            </div>
                        </div>

                        {/* Cuaderno de Totales Parciales */}
                        <div
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setCurrentSubModule('partial-totals')}
                        >
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Totales Parciales</h3>
                                    <p className="text-sm text-gray-600">Reportes con subtotales y resúmenes</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-4">
                                Genera cuadernos con totales parciales por ruta, categoría y producto, con resúmenes ejecutivos.
                            </p>
                            <div className="flex items-center text-purple-600 text-sm font-medium">
                                <span>Acceder</span>
                                <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                            </div>
                        </div>

                        {/* Cuaderno por Producto (Existente) */}
                        <div
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setCurrentSubModule('product')}
                        >
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Cuaderno por Producto</h3>
                                    <p className="text-sm text-gray-600">Reportes consolidados por producto</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-4">
                                Genera cuadernos de pedidos organizados por producto, con fecha global y distribución por rutas.
                            </p>
                            <div className="flex items-center text-orange-600 text-sm font-medium">
                                <span>Acceder</span>
                                <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                            </div>
                        </div>

                        {/* Cuaderno de Producción de Donas (Existente) */}
                        <div
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setCurrentSubModule('donut-production')}
                        >
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <Calculator className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Producción de Donas</h3>
                                    <p className="text-sm text-gray-600">Reporte detallado por rutas y sabores</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-4">
                                Genera reportes de producción de donas con cálculos de tablas, unidades y sabores por ruta.
                            </p>
                            <div className="flex items-center text-red-600 text-sm font-medium">
                                <span>Acceder</span>
                                <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                            </div>
                        </div>
                    </div>

                    {/* Descripción del módulo */}
                    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Acerca de Cuadernos</h2>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            El módulo de Cuadernos te permite generar reportes consolidados de pedidos y producción
                            en formato similar a Excel, organizados por diferentes criterios. Estos reportes son ideales
                            para la planificación diaria, control de inventario y seguimiento de entregas por rutas.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
