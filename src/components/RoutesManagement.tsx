'use client';

import { useState, useEffect } from 'react';
import {
    MapPin,
    Plus,
    Search,
    ArrowLeft,
    Check,
    X,
    Edit,
    Trash2,
    Filter
} from 'lucide-react';
import { Route, CreateRouteData } from '@/types/route';
import { supabase } from '@/lib/supabase';
import Footer from './Footer';
import Swal from 'sweetalert2';

interface RoutesManagementProps {
    onBack: () => void;
}

export default function RoutesManagement({ onBack }: RoutesManagementProps) {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Route | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Estados para ordenamiento
    const [sortField, setSortField] = useState<string>('identificador');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const [formData, setFormData] = useState<CreateRouteData>({
        identificador: '',
        nombre: '',
        descripcion: ''
    });

    // Función helper para mapear rutas de la base de datos al formato TypeScript
    const mapRouteFromDB = (route: any): Route => ({
        id: route.id,
        identificador: route.identificador,
        nombre: route.nombre,
        descripcion: route.descripcion,
        isActive: Boolean(route.is_active), // Convertir is_active a isActive
        createdAt: new Date(route.created_at),
        updatedAt: new Date(route.updated_at)
    });

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('routes')
                .select('*')
                .order('identificador');

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Routes fetched:', data);

            // Mapear los datos de la base de datos al formato TypeScript
            const mappedRoutes = (data || []).map(mapRouteFromDB);

            console.log('Mapped routes:', mappedRoutes);
            setRoutes(mappedRoutes);
        } catch (err) {
            console.error('Error fetching routes:', err);
            setError('Error al cargar las rutas: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoute = async () => {
        try {
            const { data, error } = await supabase
                .from('routes')
                .insert([formData])
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Mapear la nueva ruta al formato TypeScript
            const mappedRoute = mapRouteFromDB(data);
            setRoutes([...routes, mappedRoute]);
            setShowCreateModal(false);
            resetForm();
        } catch (err) {
            console.error('Error creating route:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error al crear la ruta',
                text: (err as Error).message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const handleUpdateRoute = async () => {
        if (!editingRoute) return;

        try {
            const { data, error } = await supabase
                .from('routes')
                .update(formData)
                .eq('id', editingRoute.id)
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Mapear la ruta actualizada al formato TypeScript
            const mappedRoute = mapRouteFromDB(data);
            setRoutes(routes.map(route =>
                route.id === editingRoute.id ? mappedRoute : route
            ));
            setEditingRoute(null);
            resetForm();
        } catch (err) {
            console.error('Error updating route:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar la ruta',
                text: (err as Error).message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const handleDeleteRoute = async (routeId: string) => {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
        try {
            const { error } = await supabase
                .from('routes')
                .delete()
                .eq('id', routeId);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            setRoutes(routes.filter(route => route.id !== routeId));
                Swal.fire({
                    icon: 'success',
                    title: 'Ruta eliminada',
                    text: 'La ruta ha sido eliminada.',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Aceptar'
                });
        } catch (err) {
            console.error('Error deleting route:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar la ruta',
                    text: (err as Error).message,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Aceptar'
                });
            }
        }
    };

    const handleToggleActive = async (routeId: string) => {
        const route = routes.find(r => r.id === routeId);
        if (!route) return;

        try {
            const { data, error } = await supabase
                .from('routes')
                .update({ is_active: !route.isActive })
                .eq('id', routeId)
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Mapear la ruta actualizada al formato TypeScript
            const mappedRoute = mapRouteFromDB(data);
            setRoutes(routes.map(r =>
                r.id === routeId ? mappedRoute : r
            ));
        } catch (err) {
            console.error('Error toggling route status:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error al cambiar el estado de la ruta',
                text: (err as Error).message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const filteredRoutes = routes.filter(route =>
        route.identificador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (route.descripcion && route.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Función para ordenar rutas
    const sortedRoutes = [...filteredRoutes].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
            case 'identificador':
                aValue = a.identificador.toLowerCase();
                bValue = b.identificador.toLowerCase();
                break;
            case 'nombre':
                aValue = a.nombre.toLowerCase();
                bValue = b.nombre.toLowerCase();
                break;
            case 'isActive':
                aValue = a.isActive;
                bValue = b.isActive;
                break;
            default:
                aValue = a.identificador.toLowerCase();
                bValue = b.identificador.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Función para manejar el ordenamiento
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Función para obtener el icono de ordenamiento
    const getSortIcon = (field: string) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    // Funciones para selección múltiple
    const handleSelectRoute = (routeId: string) => {
        setSelectedRoutes(prev =>
            prev.includes(routeId)
                ? prev.filter(id => id !== routeId)
                : [...prev, routeId]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRoutes([]);
        } else {
            setSelectedRoutes(sortedRoutes.map(route => route.id));
        }
        setSelectAll(!selectAll);
    };

    // Función para eliminar múltiples rutas
    const handleBulkDelete = async () => {
        if (selectedRoutes.length === 0) return;

        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: `Esta acción eliminará ${selectedRoutes.length} ruta(s) y no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const { error } = await supabase
                    .from('routes')
                    .delete()
                    .in('id', selectedRoutes);

                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }

                setRoutes(routes.filter(r => !selectedRoutes.includes(r.id)));
                setSelectedRoutes([]);
                setSelectAll(false);

                Swal.fire({
                    icon: 'success',
                    title: 'Rutas eliminadas',
                    text: `${selectedRoutes.length} ruta(s) han sido eliminadas exitosamente.`,
                });
            } catch (err) {
                console.error('Error deleting routes:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar las rutas',
                    text: (err as Error).message,
                });
            }
        }
    };

    const openEditModal = (route: Route) => {
        setEditingRoute(route);
        setFormData({
            identificador: route.identificador,
            nombre: route.nombre,
            descripcion: route.descripcion || ''
        });
    };

    const resetForm = () => {
        setFormData({
            identificador: '',
            nombre: '',
            descripcion: ''
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingRoute(null);
        resetForm();
    };

    const handleModalBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando rutas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col">
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <MapPin className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
                                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Gestión de rutas</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center justify-center lg:justify-start space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors w-full lg:w-auto"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="text-sm lg:text-base">Agregar nueva ruta</span>
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <X className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Error
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        {error}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar rutas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600 text-sm lg:text-base"
                            />
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedRoutes.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-blue-800">
                                        {selectedRoutes.length} ruta(s) seleccionada(s)
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 lg:space-x-3">
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center space-x-1 lg:space-x-2 bg-red-500 text-white px-2 lg:px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors text-xs lg:text-sm"
                                    >
                                        <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Routes Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {/* Mobile view - Cards */}
                        <div className="lg:hidden">
                            {sortedRoutes.map((route) => (
                                <div key={route.id} className={`border-b border-gray-200 p-4 ${selectedRoutes.includes(route.id) ? 'bg-blue-50' : ''}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedRoutes.includes(route.id)}
                                                onChange={() => handleSelectRoute(route.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 cursor-pointer"
                                            />
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                                        <MapPin className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleToggleActive(route.id)}
                                                className="text-gray-600 hover:text-gray-900 p-1"
                                                title={route.isActive ? 'Desactivar ruta' : 'Activar ruta'}
                                            >
                                                {route.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => openEditModal(route)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Editar ruta"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRoute(route.id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Eliminar ruta"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">{route.identificador}</h3>
                                            <p className="text-sm text-gray-600">{route.nombre}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                {route.descripcion || 'Sin descripción'}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${route.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {route.isActive ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop view - Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 cursor-pointer hover:border-orange-400 transition-colors"
                                            />
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('identificador')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Ruta</span>
                                                {getSortIcon('identificador') && (
                                                    <span className="text-orange-500">{getSortIcon('identificador')}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('nombre')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Nombre</span>
                                                {getSortIcon('nombre') && (
                                                    <span className="text-orange-500">{getSortIcon('nombre')}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Descripción
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('isActive')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Estado</span>
                                                {getSortIcon('isActive') && (
                                                    <span className="text-orange-500">{getSortIcon('isActive')}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Opciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedRoutes.map((route) => (
                                        <tr key={route.id} className={`hover:bg-gray-50 ${selectedRoutes.includes(route.id) ? 'bg-blue-50' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRoutes.includes(route.id)}
                                                    onChange={() => handleSelectRoute(route.id)}
                                                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 cursor-pointer hover:border-orange-400 transition-colors"
                                                />
                                            </td>
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {route.nombre}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {route.descripcion || 'Sin descripción'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${route.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {route.isActive ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleToggleActive(route.id)}
                                                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                                                        title={route.isActive ? 'Desactivar ruta' : 'Activar ruta'}
                                                    >
                                                        {route.isActive ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                                        <span>{route.isActive ? 'Desactivar' : 'Activar'}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(route)}
                                                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-xs font-medium border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                                                        title="Editar ruta"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                        <span>Editar</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRoute(route.id)}
                                                        className="flex items-center space-x-1 text-red-600 hover:text-red-900 px-2 py-1 rounded text-xs font-medium border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                                                        title="Eliminar ruta"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                        <span>Eliminar</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Total rutas</p>
                                    <p className="text-lg lg:text-2xl font-bold text-gray-900">{routes.length}</p>
                                </div>
                                <MapPin className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
                            </div>
                        </div>

                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Rutas activas</p>
                                    <p className="text-lg lg:text-2xl font-bold text-green-600">
                                        {routes.filter(route => route.isActive).length}
                                    </p>
                                </div>
                                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Rutas inactivas</p>
                                    <p className="text-lg lg:text-2xl font-bold text-red-600">
                                        {routes.filter(route => !route.isActive).length}
                                    </p>
                                </div>
                                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingRoute) && (
                <div
                    className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
                    onClick={handleModalBackdropClick}
                >
                    <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingRoute ? 'Modificar ruta' : 'Registrar nueva ruta'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Identificador *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.identificador}
                                        onChange={(e) => setFormData({ ...formData, identificador: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                        placeholder="Ejemplo: RUTA-001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                        placeholder="Ejemplo: Ruta Centro"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción (opcional)
                                    </label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                        placeholder="Descripción opcional de la ruta"
                                    />
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
                                    disabled={!formData.identificador.trim() || !formData.nombre.trim()}
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

            <Footer />
        </div>
    );
} 