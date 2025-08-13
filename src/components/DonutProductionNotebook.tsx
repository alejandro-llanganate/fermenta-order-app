'use client';

import React, { useState, useRef } from 'react';
import {
    ArrowLeft,
    Download,
    Calculator,
    BarChart3
} from 'lucide-react';
import { Order } from '@/types/order';
import { mockOrders } from '@/data/mockOrders';
import { mockRoutes } from '@/data/mockRoutes';
import Footer from './Footer';

interface DonutProductionNotebookProps {
    onBack: () => void;
}

interface RouteDonutData {
    routeId: string;
    routeName: string;
    routeIdentificador: string;
    donuts: {
        choc: number;
        grag: number;
        chocoCoco: number;
        glace: number;
        gragGlace: number;
        glaceCoco: number;
    };
    rellenas: {
        chant: number;
        manu: number;
    };
    miniDonuts: {
        choc: number;
        grag: number;
        choco: number;
        glace: number;
        gragGlace: number;
        glaceCoco: number;
    };
    miniRellenas: {
        chant: number;
        manu: number;
    };
}

interface ProductionTotals {
    donuts: {
        choc: number;
        grag: number;
        chocoCoco: number;
        glace: number;
        gragGlace: number;
        glaceCoco: number;
    };
    rellenas: {
        chant: number;
        manu: number;
    };
    miniDonuts: {
        choc: number;
        grag: number;
        choco: number;
        glace: number;
        gragGlace: number;
        glaceCoco: number;
    };
    miniRellenas: {
        chant: number;
        manu: number;
    };
}

export default function DonutProductionNotebook({ onBack }: DonutProductionNotebookProps) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [editableData, setEditableData] = useState<RouteDonutData[]>([]);
    const [editingCell, setEditingCell] = useState<{ routeId: string, category: string, field: string } | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const printRef = useRef<HTMLDivElement>(null);

    // Obtener pedidos del día seleccionado
    const getOrdersForDate = (date: string) => {
        const targetDate = new Date(date);
        return mockOrders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate.toDateString() === targetDate.toDateString();
        });
    };

    // Calcular datos de donas por ruta
    const calculateRouteDonutData = (orders: Order[]): RouteDonutData[] => {
        const routeData: { [routeId: string]: RouteDonutData } = {};

        // Inicializar datos para todas las rutas
        mockRoutes.forEach(route => {
            routeData[route.id] = {
                routeId: route.id,
                routeName: route.nombre,
                routeIdentificador: route.identificador,
                donuts: { choc: 0, grag: 0, chocoCoco: 0, glace: 0, gragGlace: 0, glaceCoco: 0 },
                rellenas: { chant: 0, manu: 0 },
                miniDonuts: { choc: 0, grag: 0, choco: 0, glace: 0, gragGlace: 0, glaceCoco: 0 },
                miniRellenas: { chant: 0, manu: 0 }
            };
        });

        // Procesar pedidos
        orders.forEach(order => {
            if (!order.routeId) return;

            order.items.forEach(item => {
                const category = item.productCategory.toLowerCase();
                const variant = item.productVariant.toLowerCase();

                if (category === 'donut') {
                    if (variant.includes('choc') && variant.includes('coco')) {
                        routeData[order.routeId].donuts.chocoCoco += item.quantity;
                    } else if (variant.includes('grag') && variant.includes('glace')) {
                        routeData[order.routeId].donuts.gragGlace += item.quantity;
                    } else if (variant.includes('glace') && variant.includes('coco')) {
                        routeData[order.routeId].donuts.glaceCoco += item.quantity;
                    } else if (variant.includes('choc')) {
                        routeData[order.routeId].donuts.choc += item.quantity;
                    } else if (variant.includes('grag')) {
                        routeData[order.routeId].donuts.grag += item.quantity;
                    } else if (variant.includes('glace')) {
                        routeData[order.routeId].donuts.glace += item.quantity;
                    }
                } else if (category === 'rellenas') {
                    if (variant.includes('chant')) {
                        routeData[order.routeId].rellenas.chant += item.quantity;
                    } else if (variant.includes('manu') || variant.includes('manjar')) {
                        routeData[order.routeId].rellenas.manu += item.quantity;
                    }
                } else if (category === 'mini donut') {
                    if (variant.includes('choc') && variant.includes('coco')) {
                        routeData[order.routeId].miniDonuts.chocoCoco += item.quantity;
                    } else if (variant.includes('grag') && variant.includes('glace')) {
                        routeData[order.routeId].miniDonuts.gragGlace += item.quantity;
                    } else if (variant.includes('glace') && variant.includes('coco')) {
                        routeData[order.routeId].miniDonuts.glaceCoco += item.quantity;
                    } else if (variant.includes('choc')) {
                        routeData[order.routeId].miniDonuts.choc += item.quantity;
                    } else if (variant.includes('grag')) {
                        routeData[order.routeId].miniDonuts.grag += item.quantity;
                    } else if (variant.includes('glace')) {
                        routeData[order.routeId].miniDonuts.glace += item.quantity;
                    } else if (variant.includes('choco')) {
                        routeData[order.routeId].miniDonuts.choco += item.quantity;
                    }
                } else if (category === 'mini rellenas') {
                    if (variant.includes('chant')) {
                        routeData[order.routeId].miniRellenas.chant += item.quantity;
                    } else if (variant.includes('manu') || variant.includes('manjar')) {
                        routeData[order.routeId].miniRellenas.manu += item.quantity;
                    }
                }
            });
        });

        return Object.values(routeData);
    };

    // Calcular totales generales
    const calculateProductionTotals = (routeData: RouteDonutData[]): ProductionTotals => {
        const totals: ProductionTotals = {
            donuts: { choc: 0, grag: 0, chocoCoco: 0, glace: 0, gragGlace: 0, glaceCoco: 0 },
            rellenas: { chant: 0, manu: 0 },
            miniDonuts: { choc: 0, grag: 0, choco: 0, glace: 0, gragGlace: 0, glaceCoco: 0 },
            miniRellenas: { chant: 0, manu: 0 }
        };

        routeData.forEach(route => {
            // Sumar donuts
            Object.keys(totals.donuts).forEach(key => {
                totals.donuts[key as keyof typeof totals.donuts] += route.donuts[key as keyof typeof route.donuts];
            });
            // Sumar rellenas
            Object.keys(totals.rellenas).forEach(key => {
                totals.rellenas[key as keyof typeof totals.rellenas] += route.rellenas[key as keyof typeof route.rellenas];
            });
            // Sumar mini donuts
            Object.keys(totals.miniDonuts).forEach(key => {
                totals.miniDonuts[key as keyof typeof totals.miniDonuts] += route.miniDonuts[key as keyof typeof route.miniDonuts];
            });
            // Sumar mini rellenas
            Object.keys(totals.miniRellenas).forEach(key => {
                totals.miniRellenas[key as keyof typeof totals.miniRellenas] += route.miniRellenas[key as keyof typeof route.miniRellenas];
            });
        });

        return totals;
    };

    // Calcular tablas y unidades para producción en masa
    const calculateMassProduction = (totals: ProductionTotals) => {
        // Rellenas grandes + Donas grandes
        const totalRellenas = totals.rellenas.chant + totals.rellenas.manu;
        const totalDonuts = Object.values(totals.donuts).reduce((sum, val) => sum + val, 0);
        const totalGrandes = totalRellenas + totalDonuts;

        // Mini Rellenas + Mini Donas
        const totalMiniRellenas = totals.miniRellenas.chant + totals.miniRellenas.manu;
        const totalMiniDonuts = Object.values(totals.miniDonuts).reduce((sum, val) => sum + val, 0);
        const totalMinis = totalMiniRellenas + totalMiniDonuts;

        return {
            grandes: {
                total: totalGrandes,
                tablas: Math.floor(totalGrandes / 30),
                unidades: totalGrandes % 30,
                rellenas: {
                    chant: {
                        total: totals.rellenas.chant,
                        latas: Math.floor(totals.rellenas.chant / 25),
                        unidades: totals.rellenas.chant % 25
                    },
                    manu: {
                        total: totals.rellenas.manu,
                        latas: Math.floor(totals.rellenas.manu / 25),
                        unidades: totals.rellenas.manu % 25
                    }
                }
            },
            minis: {
                total: totalMinis,
                tablas: Math.floor(totalMinis / 56),
                unidades: totalMinis % 56,
                rellenas: {
                    chant: {
                        total: totals.miniRellenas.chant,
                        tablas: Math.floor(totals.miniRellenas.chant / 56),
                        unidades: totals.miniRellenas.chant % 56
                    },
                    manu: {
                        total: totals.miniRellenas.manu,
                        tablas: Math.floor(totals.miniRellenas.manu / 56),
                        unidades: totals.miniRellenas.manu % 56
                    }
                }
            }
        };
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
    const routeData = calculateRouteDonutData(orders);
    const totals = calculateProductionTotals(routeData);
    const massProduction = calculateMassProduction(totals);

    // Inicializar datos editables si están vacíos
    React.useEffect(() => {
        if (editableData.length === 0) {
            setEditableData(routeData);
        }
    }, [routeData]);

    // Función para manejar clic en celda
    const handleCellClick = (routeId: string, category: string, field: string, currentValue: number) => {
        setEditingCell({ routeId, category, field });
        setEditValue(currentValue.toString());
    };

    // Función para guardar cambios
    const handleSaveEdit = () => {
        if (!editingCell) return;

        const newValue = parseInt(editValue) || 0;
        setEditableData(prevData =>
            prevData.map(route => {
                if (route.routeId === editingCell.routeId) {
                    const updatedRoute = { ...route };
                    if (editingCell.category === 'donuts') {
                        updatedRoute.donuts = { ...updatedRoute.donuts, [editingCell.field]: newValue };
                    } else if (editingCell.category === 'rellenas') {
                        updatedRoute.rellenas = { ...updatedRoute.rellenas, [editingCell.field]: newValue };
                    } else if (editingCell.category === 'miniDonuts') {
                        updatedRoute.miniDonuts = { ...updatedRoute.miniDonuts, [editingCell.field]: newValue };
                    } else if (editingCell.category === 'miniRellenas') {
                        updatedRoute.miniRellenas = { ...updatedRoute.miniRellenas, [editingCell.field]: newValue };
                    }
                    return updatedRoute;
                }
                return route;
            })
        );
        setEditingCell(null);
        setEditValue('');
    };

    // Función para cancelar edición
    const handleCancelEdit = () => {
        setEditingCell(null);
        setEditValue('');
    };

    // Usar datos editables para cálculos
    const editableTotals = calculateProductionTotals(editableData);
    const editableMassProduction = calculateMassProduction(editableTotals);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex flex-col">
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
                                <Calculator className="h-8 w-8 text-purple-500" />
                                <h1 className="text-2xl font-bold text-gray-900">Producción de Donas</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setEditableData(routeData)}
                                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <BarChart3 className="h-4 w-4" />
                                <span>Resetear Datos</span>
                            </button>
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
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div className="flex items-end">
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Total de pedidos</p>
                                    <p className="text-2xl font-bold text-purple-600">{orders.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instrucciones */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Instrucciones:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Haz clic en cualquier celda de la tabla para editar su valor</li>
                            <li>• Presiona Enter o haz clic fuera para guardar los cambios</li>
                            <li>• Los cálculos se actualizan automáticamente al editar</li>
                            <li>• Usa "Resetear Datos" para volver a los valores originales</li>
                        </ul>
                    </div>

                    {/* Contenido para impresión */}
                    <div ref={printRef} className="bg-white p-8 border border-gray-300">
                        {/* Header del reporte */}
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-black">PRODUCCIÓN DE DONAS</h1>
                            <p className="text-lg text-gray-600 mt-2">
                                {new Date(selectedDate).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                }).toUpperCase()}
                            </p>
                        </div>

                        {/* Tabla principal */}
                        <div className="overflow-x-auto mb-8">
                            <table className="w-full border-collapse border border-gray-300 text-xs">
                                <thead>
                                    <tr className="bg-yellow-100">
                                        <th className="border border-gray-300 px-2 py-2 text-center text-black font-bold">RUTA</th>
                                        <th colSpan={6} className="border border-gray-300 px-2 py-2 text-center text-black font-bold">DONUTS</th>
                                        <th colSpan={2} className="border border-gray-300 px-2 py-2 text-center text-black font-bold">RELLENAS</th>
                                        <th colSpan={6} className="border border-gray-300 px-2 py-2 text-center text-black font-bold">MINI DONUTS</th>
                                        <th colSpan={2} className="border border-gray-300 px-2 py-2 text-center text-black font-bold">M.RELL</th>
                                    </tr>
                                    <tr className="bg-yellow-50">
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">CLIENTE</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">CHOC</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">GRAG</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">CH.COCO</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">GLACE</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">GR.GLACE</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">GL.COCO</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">CHANT</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">MANU</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">CHOC</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">GRAG</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">CHOCO</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">GLACE</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">GR.GLACE</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">GL.COCO</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">CHANT</th>
                                        <th className="border border-gray-300 px-1 py-1 text-center text-black font-bold text-xs">MANU</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editableData.map((route, index) => (
                                        <tr key={route.routeId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="border border-gray-300 px-2 py-1 text-black font-medium text-xs">
                                                {route.routeIdentificador} - {route.routeName}
                                            </td>
                                            {/* Donuts */}
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'donuts', 'choc', route.donuts.choc)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'donuts' && editingCell?.field === 'choc' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.donuts.choc || '')}
                                            </td>
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'donuts', 'grag', route.donuts.grag)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'donuts' && editingCell?.field === 'grag' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.donuts.grag || '')}
                                            </td>
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'donuts', 'chocoCoco', route.donuts.chocoCoco)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'donuts' && editingCell?.field === 'chocoCoco' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.donuts.chocoCoco || '')}
                                            </td>
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'donuts', 'glace', route.donuts.glace)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'donuts' && editingCell?.field === 'glace' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.donuts.glace || '')}
                                            </td>
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'donuts', 'gragGlace', route.donuts.gragGlace)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'donuts' && editingCell?.field === 'gragGlace' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.donuts.gragGlace || '')}
                                            </td>
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'donuts', 'glaceCoco', route.donuts.glaceCoco)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'donuts' && editingCell?.field === 'glaceCoco' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.donuts.glaceCoco || '')}
                                            </td>
                                            {/* Rellenas */}
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'rellenas', 'chant', route.rellenas.chant)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'rellenas' && editingCell?.field === 'chant' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.rellenas.chant || '')}
                                            </td>
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'rellenas', 'manu', route.rellenas.manu)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'rellenas' && editingCell?.field === 'manu' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.rellenas.manu || '')}
                                            </td>
                                            {/* Mini Donuts */}
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'miniDonuts', 'choc', route.miniDonuts.choc)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'miniDonuts' && editingCell?.field === 'choc' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.miniDonuts.choc || '')}
                                            </td>
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'miniDonuts', 'grag', route.miniDonuts.grag)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'miniDonuts' && editingCell?.field === 'grag' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.miniDonuts.grag || '')}
                                            </td>
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'miniDonuts', 'choco', route.miniDonuts.choco)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'miniDonuts' && editingCell?.field === 'choco' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.miniDonuts.choco || '')}
                                            </td>
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'miniDonuts', 'glace', route.miniDonuts.glace)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'miniDonuts' && editingCell?.field === 'glace' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.miniDonuts.glace || '')}
                                            </td>
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'miniDonuts', 'gragGlace', route.miniDonuts.gragGlace)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'miniDonuts' && editingCell?.field === 'gragGlace' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.miniDonuts.gragGlace || '')}
                                            </td>
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'miniDonuts', 'glaceCoco', route.miniDonuts.glaceCoco)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'miniDonuts' && editingCell?.field === 'glaceCoco' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.miniDonuts.glaceCoco || '')}
                                            </td>
                                            {/* Mini Rellenas */}
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'miniRellenas', 'chant', route.miniRellenas.chant)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'miniRellenas' && editingCell?.field === 'chant' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.miniRellenas.chant || '')}
                                            </td>
                                            <td
                                                className="border border-gray-300 px-1 py-1 text-center text-black cursor-pointer hover:bg-blue-50"
                                                onClick={() => handleCellClick(route.routeId, 'miniRellenas', 'manu', route.miniRellenas.manu)}
                                            >
                                                {editingCell?.routeId === route.routeId && editingCell?.category === 'miniRellenas' && editingCell?.field === 'manu' ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleSaveEdit}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-full text-center border-none outline-none"
                                                        autoFocus
                                                    />
                                                ) : (route.miniRellenas.manu || '')}
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Totales */}
                                    <tr className="bg-blue-100 font-bold">
                                        <td className="border border-gray-300 px-2 py-1 text-black">TOTALES</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.donuts.choc}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.donuts.grag}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.donuts.chocoCoco}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.donuts.glace}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.donuts.gragGlace}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.donuts.glaceCoco}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.rellenas.chant}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.rellenas.manu}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.miniDonuts.choc}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.miniDonuts.grag}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.miniDonuts.choco}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.miniDonuts.glace}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.miniDonuts.gragGlace}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.miniDonuts.glaceCoco}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.miniRellenas.chant}</td>
                                        <td className="border border-gray-300 px-1 py-1 text-center text-black">{editableTotals.miniRellenas.manu}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Cálculos de producción en masa */}
                        <div className="bg-gray-100 p-4 rounded-lg mb-6">
                            <h3 className="font-bold text-black mb-4 text-lg">CÁLCULOS PARA PRODUCCIÓN EN MASA</h3>

                            {/* Grandes */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-black mb-2">RELLENAS GRANDES Y DONAS GRANDES (÷30)</h4>
                                <p className="text-sm text-black mb-2">
                                    {editableTotals.rellenas.chant} + {editableTotals.rellenas.manu} + {Object.values(editableTotals.donuts).reduce((sum, val) => sum + val, 0)} = {editableMassProduction.grandes.total} (total a producir en MASA)
                                </p>
                                <p className="text-sm text-black mb-2">
                                    {editableMassProduction.grandes.total} ÷ 30 = {editableMassProduction.grandes.tablas} (TABLAS) CON {editableMassProduction.grandes.unidades} UNIDADES (FRITURA)
                                </p>

                                <h5 className="font-medium text-black mt-3 mb-1">PARA SABORES:</h5>
                                <p className="text-sm text-black">CHANTILLY: {editableTotals.rellenas.chant} ÷ 25 = {editableMassProduction.grandes.rellenas.chant.latas} (LATAS) CON {editableMassProduction.grandes.rellenas.chant.unidades} UNIDADES</p>
                                <p className="text-sm text-black">MANJAR: {editableTotals.rellenas.manu} ÷ 25 = {editableMassProduction.grandes.rellenas.manu.latas} (LATAS) CON {editableMassProduction.grandes.rellenas.manu.unidades} UNIDADES</p>
                            </div>

                            {/* CON DONAS GRANDES */}
                            <div className="mb-6 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-black mb-2">CON DONAS GRANDES</h4>
                                <p className="text-sm text-black mb-2">
                                    TOTAL DONAS GRANDES = {Object.values(editableTotals.donuts).reduce((sum, val) => sum + val, 0)} ÷ 30 = {Math.floor(Object.values(editableTotals.donuts).reduce((sum, val) => sum + val, 0) / 30)} (TABLAS) CON {Object.values(editableTotals.donuts).reduce((sum, val) => sum + val, 0) % 30} UNIDADES
                                </p>
                            </div>

                            {/* MINI RELLENAS */}
                            <div className="mb-6 bg-green-50 p-3 rounded-lg border border-green-200">
                                <h4 className="font-semibold text-black mb-2">MINI RELLENAS</h4>
                                <p className="text-sm text-black mb-2">
                                    (MINI RELLENAS Y MINI DONAS SE DIVIDE PARA 56 SOLO PARA ELABORACION EN MASA)
                                </p>
                                <p className="text-sm text-black mb-2">
                                    {editableTotals.miniRellenas.chant} + {editableTotals.miniRellenas.manu} = {editableTotals.miniRellenas.chant + editableTotals.miniRellenas.manu}
                                </p>
                                <p className="text-sm text-black mb-2">
                                    Siguiente paso a realizar: {editableTotals.miniRellenas.chant + editableTotals.miniRellenas.manu} ÷ 56 = {Math.floor((editableTotals.miniRellenas.chant + editableTotals.miniRellenas.manu) / 56)} (TABLAS) CON {(editableTotals.miniRellenas.chant + editableTotals.miniRellenas.manu) % 56} UNIDADES (FRITURA)
                                </p>

                                <h5 className="font-medium text-black mt-3 mb-1">PARA SABORES (TABLAS):</h5>
                                <p className="text-sm text-black mb-1">En este caso las mini rellenas se saca los sabores por tabla por la cantidad mayor de producción y no se puede contar por unidades, por lo cual la suma total en masa por cada sabor se realiza por tablas.</p>
                                <p className="text-sm text-black">CHANTILLY: {editableTotals.miniRellenas.chant} ÷ 56 = {Math.floor(editableTotals.miniRellenas.chant / 56)} (TABLAS) CON {editableTotals.miniRellenas.chant % 56} UNIDADES</p>
                                <p className="text-sm text-black">MANJAR: {editableTotals.miniRellenas.manu} ÷ 56 = {Math.floor(editableTotals.miniRellenas.manu / 56)} (TABLAS) CON {editableTotals.miniRellenas.manu % 56} UNIDADES</p>
                            </div>

                            {/* CON MINI DONAS */}
                            <div className="mb-6 bg-orange-50 p-3 rounded-lg border border-orange-200">
                                <h4 className="font-semibold text-black mb-2">CON MINI DONAS</h4>
                                <p className="text-sm text-black mb-2">
                                    Total mini donas: {Object.values(editableTotals.miniDonuts).reduce((sum, val) => sum + val, 0)} ÷ 56 = {Math.floor(Object.values(editableTotals.miniDonuts).reduce((sum, val) => sum + val, 0) / 56)} (TABLAS) CON {Object.values(editableTotals.miniDonuts).reduce((sum, val) => sum + val, 0) % 56} UNIDADES
                                </p>
                            </div>
                        </div>

                        {/* PARA PESAR */}
                        <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-200">
                            <h3 className="font-bold text-black mb-4 text-lg">PARA PESAR</h3>
                            <p className="text-sm text-black mb-3">Se realiza el siguiente reporte:</p>
                            <p className="text-sm text-black mb-3">Los totales que sacamos del primer cuadro que fue mencionado anteriormente, se suma por producto, es decir:</p>

                            <div className="space-y-2">
                                <p className="text-sm text-black">Total, rellenas (chantilly y manjar) {editableTotals.rellenas.chant + editableTotals.rellenas.manu} ÷ 30 = {Math.floor((editableTotals.rellenas.chant + editableTotals.rellenas.manu) / 30)} tablas con {(editableTotals.rellenas.chant + editableTotals.rellenas.manu) % 30} unidades</p>
                                <p className="text-sm text-black">Total, mini rellenas (chantilly y manjar) {editableTotals.miniRellenas.chant + editableTotals.miniRellenas.manu} ÷ 56 = {Math.floor((editableTotals.miniRellenas.chant + editableTotals.miniRellenas.manu) / 56)} tablas con {(editableTotals.miniRellenas.chant + editableTotals.miniRellenas.manu) % 56} unidades</p>
                                <p className="text-sm text-black">Total, donas (con todos los sabores) {Object.values(editableTotals.donuts).reduce((sum, val) => sum + val, 0)} ÷ 30 = {Math.floor(Object.values(editableTotals.donuts).reduce((sum, val) => sum + val, 0) / 30)} tablas con {Object.values(editableTotals.donuts).reduce((sum, val) => sum + val, 0) % 30} unidades</p>
                                <p className="text-sm text-black">Total, mini donas (con todos los sabores) {Object.values(editableTotals.miniDonuts).reduce((sum, val) => sum + val, 0)} ÷ 56 = {Math.floor(Object.values(editableTotals.miniDonuts).reduce((sum, val) => sum + val, 0) / 56)} tablas con {Object.values(editableTotals.miniDonuts).reduce((sum, val) => sum + val, 0) % 56} unidades</p>
                            </div>

                            <div className="mt-4 p-3 bg-white rounded border">
                                <p className="text-sm font-bold text-black">
                                    (Y EL TOTAL DE PRODUCCIÓN ES LA SUMA DE TOTAL DE RELLENAS, MINI RELLENAS, DONAS Y MINI DONAS) = {
                                        (editableTotals.rellenas.chant + editableTotals.rellenas.manu) +
                                        (editableTotals.miniRellenas.chant + editableTotals.miniRellenas.manu) +
                                        Object.values(editableTotals.donuts).reduce((sum, val) => sum + val, 0) +
                                        Object.values(editableTotals.miniDonuts).reduce((sum, val) => sum + val, 0)
                                    }
                                </p>
                            </div>
                        </div>

                        {/* TABLA DE SABORES */}
                        <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-200">
                            <h3 className="font-bold text-black mb-4 text-lg">TABLA DE SABORES</h3>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300 text-xs">
                                    <thead>
                                        <tr className="bg-gray-700">
                                            <th className="border border-gray-300 px-2 py-2 text-center text-white font-bold">SABORES</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gray-100">
                                        {/* RELLENAS */}
                                        <tr className="bg-gray-200">
                                            <td className="border border-gray-300 px-2 py-1 text-black font-bold">RELLENAS</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                CHANT: {editableTotals.rellenas.chant} , {editableTotals.rellenas.chant % 25}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                MANJAR: {editableTotals.rellenas.manu} , {editableTotals.rellenas.manu % 25}
                                            </td>
                                        </tr>

                                        {/* M.RELLENAS */}
                                        <tr className="bg-gray-200">
                                            <td className="border border-gray-300 px-2 py-1 text-black font-bold">M.RELLENAS</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                CHANT: {editableTotals.miniRellenas.chant} , {editableTotals.miniRellenas.chant % 56}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                MANJAR: {editableTotals.miniRellenas.manu} , {editableTotals.miniRellenas.manu % 56}
                                            </td>
                                        </tr>

                                        {/* DONUTS */}
                                        <tr className="bg-gray-200">
                                            <td className="border border-gray-300 px-2 py-1 text-black font-bold">DONUTS</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                CHOCO: {editableTotals.donuts.choc}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                GRAG: {editableTotals.donuts.grag}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                CH.COCO: {editableTotals.donuts.chocoCoco}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                GLACE: {editableTotals.donuts.glace}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                GR.GLACE: {editableTotals.donuts.gragGlace}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                GL.COCO: {editableTotals.donuts.glaceCoco}
                                            </td>
                                        </tr>

                                        {/* M.DONUTS */}
                                        <tr className="bg-gray-200">
                                            <td className="border border-gray-300 px-2 py-1 text-black font-bold">M.DONUTS</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                CHOCO: {editableTotals.miniDonuts.choc}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                GRAG: {editableTotals.miniDonuts.grag}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                CHOCO: {editableTotals.miniDonuts.choco}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                GLACE: {editableTotals.miniDonuts.glace}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                GR.GLACE: {editableTotals.miniDonuts.gragGlace}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-black">
                                                GL.COCO: {editableTotals.miniDonuts.glaceCoco}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t border-gray-300">
                            <p className="text-center text-sm text-gray-800 font-medium">
                                Reporte de producción de donas generado para Mega Donut<br />
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
