'use client';

import { useState, useRef } from 'react';
import {
    MapPin,
    Plus,
    Search,
    ArrowLeft,
    Check,
    X,
    UserCheck,
    UserX,
    Printer,
    Download,
    Users,
    Package
} from 'lucide-react';
import { Route, CreateRouteData } from '@/types/route';
import { mockRoutes } from '@/data/mockRoutes';
import { mockClients } from '@/data/mockClients';
import { mockOrders } from '@/data/mockOrders';
import { mockProducts } from '@/data/mockProducts';
import Footer from './Footer';

interface RoutesManagementProps {
    onBack: () => void;
}

export default function RoutesManagement({ onBack }: RoutesManagementProps) {
    const [routes, setRoutes] = useState<Route[]>(mockRoutes);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Route | null>(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [selectedRouteForPrint, setSelectedRouteForPrint] = useState<Route | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<CreateRouteData>({
        nombre: ''
    });

    const generateNextIdentifier = () => {
        const routeNumbers = routes
            .map(route => parseInt(route.identificador.replace('R', '')))
            .filter(num => !isNaN(num));

        const maxNumber = Math.max(...routeNumbers, 0);
        return `R${maxNumber + 1}`;
    };

    const handleCreateRoute = () => {
        const newRoute: Route = {
            id: Date.now().toString(),
            identificador: generateNextIdentifier(),
            nombre: formData.nombre.toUpperCase(),
            isActive: true,
            createdAt: new Date()
        };

        setRoutes([...routes, newRoute]);
        setShowCreateModal(false);
        setFormData({ nombre: '' });
    };

    const handleUpdateRoute = () => {
        if (!editingRoute) return;

        const updatedRoutes = routes.map(route =>
            route.id === editingRoute.id
                ? { ...route, nombre: formData.nombre.toUpperCase() }
                : route
        );

        setRoutes(updatedRoutes);
        setEditingRoute(null);
        setFormData({ nombre: '' });
    };

    const handleDeleteRoute = (routeId: string) => {
        if (confirm('¿Está seguro de que desea eliminar esta ruta? Esta acción no se puede deshacer.')) {
            setRoutes(routes.filter(route => route.id !== routeId));
        }
    };

    const handleToggleActive = (routeId: string) => {
        setRoutes(routes.map(route =>
            route.id === routeId
                ? { ...route, isActive: !route.isActive }
                : route
        ));
    };

    const filteredRoutes = routes.filter(route => {
        const matchesSearch = route.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            route.identificador.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const openEditModal = (route: Route) => {
        setEditingRoute(route);
        setFormData({
            nombre: route.nombre
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingRoute(null);
        setFormData({ nombre: '' });
    };

    const closePrintModal = () => {
        setShowPrintModal(false);
        setSelectedRouteForPrint(null);
    };

    const handleModalBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const handlePrintModalBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closePrintModal();
        }
    };

    // Obtener clientes de una ruta
    const getClientsByRoute = (routeId: string) => {
        return mockClients.filter(client => client.routeId === routeId && client.isActive);
    };

    // Obtener pedidos de una ruta
    const getOrdersByRoute = (routeId: string) => {
        return mockOrders.filter(order => order.routeId === routeId);
    };

    // Obtener productos organizados por categoría
    const getProductsByCategory = () => {
        const categories = ['Donut', 'Rellenas', 'Mini donut', 'Mini rellenas', 'Pizzas', 'Panes', 'Muffins', 'Pasteles'];
        const productsByCategory: { [category: string]: any[] } = {};

        categories.forEach(category => {
            productsByCategory[category] = mockProducts.filter(product =>
                product.category === category && product.isActive
            );
        });

        return productsByCategory;
    };

    // Generar PDF
    const generatePDF = async () => {
        if (!printRef.current || !selectedRouteForPrint) return;

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

            pdf.save(`Ruta-${selectedRouteForPrint.identificador}-${selectedRouteForPrint.nombre}.pdf`);
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
        }
    };

    // Abrir modal de impresión
    const openPrintModal = (route: Route) => {
        setSelectedRouteForPrint(route);
        setShowPrintModal(true);
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
                                <MapPin className="h-8 w-8 text-orange-500" />
                                <h1 className="text-2xl font-bold text-gray-900">Gestión de rutas</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Agregar nueva ruta</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o identificador de ruta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* Routes Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Identificador
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nombre de la ruta
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado actual
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha de registro
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Opciones disponibles
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRoutes.map((route) => (
                                        <tr key={route.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                            <MapPin className="h-5 w-5 text-orange-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {route.identificador}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {route.nombre}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${route.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {route.isActive ? 'Ruta activa' : 'Ruta inactiva'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {route.createdAt.toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button
                                                        onClick={() => openPrintModal(route)}
                                                        className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                                        title="Imprimir vista de ruta"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(route.id)}
                                                        className="text-gray-400 hover:text-gray-600 p-1 rounded"
                                                        title={route.isActive ? 'Desactivar ruta' : 'Activar ruta'}
                                                    >
                                                        {route.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(route)}
                                                        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded text-xs font-medium border border-blue-200 hover:bg-blue-50"
                                                        title="Editar información de la ruta"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRoute(route.id)}
                                                        className="text-red-600 hover:text-red-900 px-3 py-1 rounded text-xs font-medium border border-red-200 hover:bg-red-50"
                                                        title="Eliminar ruta"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Create/Edit Modal */}
                    {(showCreateModal || editingRoute) && (
                        <div
                            className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
                            onClick={handleModalBackdropClick}
                        >
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingRoute ? 'Modificar información de la ruta' : 'Registrar nueva ruta'}
                                    </h3>

                                    <div className="space-y-4">
                                        {!editingRoute && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Identificador de la ruta
                                                </label>
                                                <input
                                                    type="text"
                                                    value={generateNextIdentifier()}
                                                    disabled
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                                />
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Se genera automáticamente de forma secuencial
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre de la ruta *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.nombre}
                                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                                placeholder="Ejemplo: CENTRO NORTE"
                                            />
                                            <p className="text-xs text-gray-600 mt-1">
                                                El nombre se convertirá automáticamente a mayúsculas
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            onClick={closeModal}
                                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                            <span>Cancelar</span>
                                        </button>
                                        <button
                                            onClick={editingRoute ? handleUpdateRoute : handleCreateRoute}
                                            disabled={!formData.nombre.trim()}
                                            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Check className="h-4 w-4" />
                                            <span>{editingRoute ? 'Guardar cambios' : 'Registrar ruta'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Print Modal */}
                    {showPrintModal && selectedRouteForPrint && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            onClick={handlePrintModalBackdropClick}
                        >
                            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Vista de Ruta: {selectedRouteForPrint.identificador} - {selectedRouteForPrint.nombre}
                                        </h2>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={generatePDF}
                                                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                            >
                                                <Download className="h-4 w-4" />
                                                <span>Descargar PDF</span>
                                            </button>
                                            <button
                                                onClick={closePrintModal}
                                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido para impresión */}
                                <div ref={printRef} className="p-6">
                                    {(() => {
                                        const routeClients = getClientsByRoute(selectedRouteForPrint.id);
                                        const routeOrders = getOrdersByRoute(selectedRouteForPrint.id);
                                        const productsByCategory = getProductsByCategory();

                                        return (
                                            <div className="space-y-6">
                                                {/* Header del reporte */}
                                                <div className="text-center border-b border-gray-200 pb-4">
                                                    <h1 className="text-2xl font-bold text-black">MEGA DONUT</h1>
                                                    <h2 className="text-xl font-semibold text-gray-800">Vista de Ruta</h2>
                                                    <p className="text-lg text-gray-600">
                                                        Ruta {selectedRouteForPrint.identificador} - {selectedRouteForPrint.nombre}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                                                    </p>
                                                </div>

                                                {/* Resumen de la ruta */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                                                        <p className="text-2xl font-bold text-blue-600">{routeClients.length}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                                                        <p className="text-2xl font-bold text-green-600">{routeOrders.length}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-gray-600">Estado de la Ruta</p>
                                                        <p className={`text-2xl font-bold ${selectedRouteForPrint.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                            {selectedRouteForPrint.isActive ? 'Activa' : 'Inactiva'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Lista de Clientes */}
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                        <Users className="h-5 w-5 mr-2" />
                                                        Clientes de la Ruta
                                                    </h3>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">Institución</th>
                                                                    <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">Contacto</th>
                                                                    <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">Teléfono</th>
                                                                    <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">Email</th>
                                                                    <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">Dirección</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {routeClients.map((client, index) => (
                                                                    <tr key={client.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                        <td className="border border-gray-300 px-3 py-2 text-black">{client.institucionEducativa}</td>
                                                                        <td className="border border-gray-300 px-3 py-2 text-black">{client.nombreCompleto}</td>
                                                                        <td className="border border-gray-300 px-3 py-2 text-black">{client.telefono}</td>
                                                                        <td className="border border-gray-300 px-3 py-2 text-black">{client.email}</td>
                                                                        <td className="border border-gray-300 px-3 py-2 text-black">{client.direccion}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    {routeClients.length === 0 && (
                                                        <p className="text-gray-500 text-center py-4">No hay clientes asignados a esta ruta</p>
                                                    )}
                                                </div>

                                                {/* Productos de la Ruta */}
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                        <Package className="h-5 w-5 mr-2" />
                                                        Productos Disponibles
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {Object.entries(productsByCategory).map(([category, products]) => (
                                                            products.length > 0 && (
                                                                <div key={category} className="border border-gray-200 rounded-lg p-4">
                                                                    <h4 className="font-semibold text-gray-900 mb-3">{category}</h4>
                                                                    <div className="space-y-2">
                                                                        {products.map(product => (
                                                                            <div key={product.id} className="flex justify-between items-center text-sm">
                                                                                <span className="text-gray-700">{product.name}</span>
                                                                                <span className="text-gray-600">${product.priceRegular.toFixed(2)}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="mt-8 pt-4 border-t border-gray-300">
                                                    <p className="text-center text-sm text-gray-800 font-medium">
                                                        Vista de ruta generada para Mega Donut<br />
                                                        Ruta {selectedRouteForPrint.identificador} - {selectedRouteForPrint.nombre}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistics */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total de rutas</p>
                                    <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
                                </div>
                                <MapPin className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Rutas activas</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {routes.filter(route => route.isActive).length}
                                    </p>
                                </div>
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Rutas inactivas</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {routes.filter(route => !route.isActive).length}
                                    </p>
                                </div>
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
} 