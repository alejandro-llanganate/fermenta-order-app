'use client';

import { useState } from 'react';
import {
    MapPin,
    Plus,
    Search,
    ArrowLeft,
    Check,
    X,
    UserCheck,
    UserX
} from 'lucide-react';
import { Route, CreateRouteData } from '@/types/route';
import { mockRoutes } from '@/data/mockRoutes';
import Footer from './Footer';

interface RoutesManagementProps {
    onBack: () => void;
}

export default function RoutesManagement({ onBack }: RoutesManagementProps) {
    const [routes, setRoutes] = useState<Route[]>(mockRoutes);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Route | null>(null);

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

    const handleModalBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
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