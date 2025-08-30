'use client';

import { useState, useEffect } from 'react';
import {
    UserCheck,
    Plus,
    Search,
    ArrowLeft,
    Check,
    X,
    UserX,
    Filter,
    Edit,
    Trash2
} from 'lucide-react';
import { Client, CreateClientData } from '@/types/client';
import { Route } from '@/types/route';
import { supabase } from '@/lib/supabase';
import Footer from './Footer';
import Swal from 'sweetalert2';

interface ClientsManagementProps {
    onBack: () => void;
}

export default function ClientsManagement({ onBack }: ClientsManagementProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [routeFilter, setRouteFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Estados para ordenamiento
    const [sortField, setSortField] = useState<string>('nombre');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const [formData, setFormData] = useState<CreateClientData>({
        nombre: '',
        telefono: '',
        direccion: '',
        cedula: '',
        email: '',
        routeId: ''
    });

    // Función helper para mapear clientes de la base de datos al formato TypeScript
    const mapClientFromDB = (client: any): Client => ({
        id: client.id,
        nombre: client.nombre,
        telefono: client.telefono,
        direccion: client.direccion,
        cedula: client.cedula,
        email: client.email,
        routeId: client.route_id,
        routeIdentifier: client.route_identificador || null,
        routeName: client.route_nombre || null,
        isActive: Boolean(client.is_active), // Convertir is_active a isActive
        createdAt: new Date(client.created_at),
        updatedAt: new Date(client.updated_at)
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch routes
            const { data: routesData, error: routesError } = await supabase
                .from('routes')
                .select('*')
                .eq('is_active', true)
                .order('identificador');

            if (routesError) throw routesError;
            setRoutes(routesData || []);

            // Fetch clients with route information using a left join
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select(`
                    *,
                    routes (
                        id,
                        identificador,
                        nombre
                    )
                `)
                .order('nombre');

            if (clientsError) throw clientsError;

            console.log('Clients fetched:', clientsData);

            // Mapear los datos de la base de datos al formato TypeScript
            const mappedClients = (clientsData || []).map(client => ({
                id: client.id,
                nombre: client.nombre,
                telefono: client.telefono,
                direccion: client.direccion,
                cedula: client.cedula,
                email: client.email,
                routeId: client.route_id,
                routeIdentifier: client.routes?.identificador || null,
                routeName: client.routes?.nombre || null,
                isActive: Boolean(client.is_active), // Convertir is_active a isActive
                createdAt: new Date(client.created_at),
                updatedAt: new Date(client.updated_at)
            }));

            console.log('Mapped clients:', mappedClients);
            setClients(mappedClients);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error al cargar los datos: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClient = async () => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .insert([formData])
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Fetch the client with route information
            const { data: clientWithRoute } = await supabase
                .from('clients')
                .select(`
                    *,
                    routes (
                        id,
                        identificador,
                        nombre
                    )
                `)
                .eq('id', data.id)
                .single();

            if (clientWithRoute) {
                const mappedClient = {
                    id: clientWithRoute.id,
                    nombre: clientWithRoute.nombre,
                    telefono: clientWithRoute.telefono,
                    direccion: clientWithRoute.direccion,
                    routeId: clientWithRoute.route_id,
                    routeIdentifier: clientWithRoute.routes?.identificador || null,
                    routeName: clientWithRoute.routes?.nombre || null,
                    isActive: Boolean(clientWithRoute.is_active),
                    createdAt: new Date(clientWithRoute.created_at),
                    updatedAt: new Date(clientWithRoute.updated_at)
                };
                setClients([...clients, mappedClient]);
            }

            setShowCreateModal(false);
            resetForm();
        } catch (err) {
            console.error('Error creating client:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error al crear el cliente',
                text: (err as Error).message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const handleUpdateClient = async () => {
        if (!editingClient) return;

        try {
            const { data, error } = await supabase
                .from('clients')
                .update(formData)
                .eq('id', editingClient.id)
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Fetch the updated client with route information
            const { data: clientWithRoute } = await supabase
                .from('clients')
                .select(`
                    *,
                    routes (
                        id,
                        identificador,
                        nombre
                    )
                `)
                .eq('id', editingClient.id)
                .single();

            if (clientWithRoute) {
                const mappedClient = {
                    id: clientWithRoute.id,
                    nombre: clientWithRoute.nombre,
                    telefono: clientWithRoute.telefono,
                    direccion: clientWithRoute.direccion,
                    routeId: clientWithRoute.route_id,
                    routeIdentifier: clientWithRoute.routes?.identificador || null,
                    routeName: clientWithRoute.routes?.nombre || null,
                    isActive: Boolean(clientWithRoute.is_active),
                    createdAt: new Date(clientWithRoute.created_at),
                    updatedAt: new Date(clientWithRoute.updated_at)
                };
                setClients(clients.map(client =>
                    client.id === editingClient.id ? mappedClient : client
                ));
            }

            setEditingClient(null);
            resetForm();
        } catch (err) {
            console.error('Error updating client:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar el cliente',
                text: (err as Error).message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const handleDeleteClient = async (clientId: string) => {
        const result = await Swal.fire({
            title: '¿Está seguro de que desea eliminar este cliente?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', clientId);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            setClients(clients.filter(client => client.id !== clientId));
                Swal.fire({
                    icon: 'success',
                    title: 'Cliente eliminado',
                    text: 'El cliente ha sido eliminado.',
                    confirmButtonColor: '#28a745',
                    confirmButtonText: 'Aceptar'
                });
        } catch (err) {
            console.error('Error deleting client:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar el cliente',
                    text: (err as Error).message,
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Aceptar'
                });
            }
        }
    };

    const handleToggleActive = async (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (!client) return;

        try {
            const { data, error } = await supabase
                .from('clients')
                .update({ is_active: !client.isActive })
                .eq('id', clientId)
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Fetch the updated client with route information
            const { data: clientWithRoute } = await supabase
                .from('clients')
                .select(`
                    *,
                    routes (
                        id,
                        identificador,
                        nombre
                    )
                `)
                .eq('id', clientId)
                .single();

            if (clientWithRoute) {
                const mappedClient = {
                    id: clientWithRoute.id,
                    nombre: clientWithRoute.nombre,
                    telefono: clientWithRoute.telefono,
                    direccion: clientWithRoute.direccion,
                    routeId: clientWithRoute.route_id,
                    routeIdentifier: clientWithRoute.routes?.identificador || null,
                    routeName: clientWithRoute.routes?.nombre || null,
                    isActive: Boolean(clientWithRoute.is_active),
                    createdAt: new Date(clientWithRoute.created_at),
                    updatedAt: new Date(clientWithRoute.updated_at)
                };
                setClients(clients.map(c =>
                    c.id === clientId ? mappedClient : c
                ));
            }
        } catch (err) {
            console.error('Error toggling client status:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error al cambiar el estado del cliente',
                text: (err as Error).message,
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.telefono && client.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.direccion && client.direccion.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.cedula && client.cedula.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.routeName && client.routeName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRoute = !routeFilter ||
            (client.routeId && client.routeId === routeFilter) ||
            (routeFilter === 'no-route' && !client.routeId);

        const matchesStatus = !statusFilter ||
            (statusFilter === 'active' && client.isActive) ||
            (statusFilter === 'inactive' && !client.isActive);

        return matchesSearch && matchesRoute && matchesStatus;
    });

    // Función para ordenar clientes
    const sortedClients = [...filteredClients].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
            case 'nombre':
                aValue = a.nombre.toLowerCase();
                bValue = b.nombre.toLowerCase();
                break;
            case 'telefono':
                aValue = (a.telefono || '').toLowerCase();
                bValue = (b.telefono || '').toLowerCase();
                break;
            case 'cedula':
                aValue = (a.cedula || '').toLowerCase();
                bValue = (b.cedula || '').toLowerCase();
                break;
            case 'email':
                aValue = (a.email || '').toLowerCase();
                bValue = (b.email || '').toLowerCase();
                break;
            case 'routeName':
                aValue = (a.routeName || '').toLowerCase();
                bValue = (b.routeName || '').toLowerCase();
                break;
            case 'isActive':
                aValue = a.isActive;
                bValue = b.isActive;
                break;
            default:
                aValue = a.nombre.toLowerCase();
                bValue = b.nombre.toLowerCase();
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
    const handleSelectClient = (clientId: string) => {
        setSelectedClients(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedClients([]);
        } else {
            setSelectedClients(sortedClients.map(client => client.id));
        }
        setSelectAll(!selectAll);
    };

    // Función para eliminar múltiples clientes
    const handleBulkDelete = async () => {
        if (selectedClients.length === 0) return;

        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: `Esta acción eliminará ${selectedClients.length} cliente(s) y no se puede deshacer.`,
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
                    .from('clients')
                    .delete()
                    .in('id', selectedClients);

                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }

                setClients(clients.filter(c => !selectedClients.includes(c.id)));
                setSelectedClients([]);
                setSelectAll(false);

                Swal.fire({
                    icon: 'success',
                    title: 'Clientes eliminados',
                    text: `${selectedClients.length} cliente(s) han sido eliminados exitosamente.`,
                });
            } catch (err) {
                console.error('Error deleting clients:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar los clientes',
                    text: (err as Error).message,
                });
            }
        }
    };

    const openEditModal = (client: Client) => {
        setEditingClient(client);
        setFormData({
            nombre: client.nombre,
            telefono: client.telefono || '',
            direccion: client.direccion || '',
            cedula: client.cedula || '',
            email: client.email || '',
            routeId: client.routeId || ''
        });
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            telefono: '',
            direccion: '',
            cedula: '',
            email: '',
            routeId: ''
        });
    };

    // Función para limpiar todos los filtros
    const clearFilters = () => {
        setSearchTerm('');
        setRouteFilter('');
        setStatusFilter('');
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingClient(null);
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
                    <p className="mt-4 text-gray-600">Cargando clientes...</p>
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
                                <UserCheck className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
                                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Gestión de clientes</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center justify-center space-x-2 bg-orange-500 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm lg:text-base"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Agregar nuevo cliente</span>
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

                    {/* Search and Filters */}
                    <div className={`bg-white rounded-lg shadow-sm p-4 mb-6 ${(searchTerm || routeFilter || statusFilter) ? 'ring-2 ring-orange-200' : ''}`}>
                        {(searchTerm || routeFilter || statusFilter) && (
                            <div className="mb-3 flex items-center space-x-2">
                                <Filter className="h-4 w-4 text-orange-500" />
                                <span className="text-sm text-orange-600 font-medium">Filtros activos</span>
                            </div>
                        )}
                        <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
                    {/* Search */}
                            <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar clientes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                            />
                        </div>
                    </div>

                            {/* Route Filter */}
                            <div className="lg:w-48">
                                <select
                                    value={routeFilter}
                                    onChange={(e) => setRouteFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
                                >
                                    <option value="">Todas las rutas</option>
                                    <option value="no-route">Sin ruta</option>
                                    {routes.map((route) => (
                                        <option key={route.id} value={route.id}>
                                            {route.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="lg:w-48">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="active">Solo activos</option>
                                    <option value="inactive">Solo inactivos</option>
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            {(searchTerm || routeFilter || statusFilter) && (
                                <div className="lg:w-auto">
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center space-x-2 px-3 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                    >
                                        <X className="h-4 w-4" />
                                        <span>Limpiar filtros</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedClients.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-blue-800">
                                        {selectedClients.length} cliente(s) seleccionado(s)
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

                    {/* Clients Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {/* Mobile Card View */}
                        <div className="lg:hidden">
                            <div className="p-4 space-y-4">
                                {sortedClients.map((client) => (
                                    <div key={client.id} className={`border rounded-lg p-4 ${selectedClients.includes(client.id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedClients.includes(client.id)}
                                                    onChange={() => handleSelectClient(client.id)}
                                                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 cursor-pointer hover:border-orange-400 transition-colors"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{client.nombre}</h3>
                                                    <p className="text-sm text-gray-600">{client.telefono || 'Sin teléfono'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(client);
                                                    }}
                                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                                    title="Editar cliente"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClient(client.id);
                                                    }}
                                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                    title="Eliminar cliente"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Cédula:</span>
                                                <span className="text-gray-900">{client.cedula || 'Sin cédula'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Email:</span>
                                                <span className="text-gray-900">{client.email || 'Sin email'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Dirección:</span>
                                                <span className="text-gray-900">{client.direccion || 'Sin dirección'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Ruta:</span>
                                                <span className="text-gray-900">{client.routeName || 'Sin ruta'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Estado:</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {client.isActive ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Desktop Table View */}
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
                                            onClick={() => handleSort('nombre')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Cliente</span>
                                                {getSortIcon('nombre') && (
                                                    <span className="text-orange-500">{getSortIcon('nombre')}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('telefono')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Teléfono</span>
                                                {getSortIcon('telefono') && (
                                                    <span className="text-orange-500">{getSortIcon('telefono')}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('cedula')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Cédula</span>
                                                {getSortIcon('cedula') && (
                                                    <span className="text-orange-500">{getSortIcon('cedula')}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('email')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Email</span>
                                                {getSortIcon('email') && (
                                                    <span className="text-orange-500">{getSortIcon('email')}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dirección
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('routeName')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Ruta</span>
                                                {getSortIcon('routeName') && (
                                                    <span className="text-orange-500">{getSortIcon('routeName')}</span>
                                                )}
                                            </div>
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
                                    {sortedClients.map((client) => (
                                        <tr key={client.id} className={`hover:bg-gray-50 ${selectedClients.includes(client.id) ? 'bg-blue-50' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedClients.includes(client.id)}
                                                    onChange={() => handleSelectClient(client.id)}
                                                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 cursor-pointer hover:border-orange-400 transition-colors"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                            <UserCheck className="h-5 w-5 text-orange-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {client.nombre}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {client.telefono || 'No especificado'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {client.cedula || 'No especificada'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {client.email || 'No especificado'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {client.direccion || 'No especificada'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {client.routeName ? (
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {client.routeName}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Sin ruta</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${client.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {client.isActive ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleToggleActive(client.id)}
                                                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                                                        title={client.isActive ? 'Desactivar cliente' : 'Activar cliente'}
                                                    >
                                                        {client.isActive ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                                        <span>{client.isActive ? 'Desactivar' : 'Activar'}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(client)}
                                                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-xs font-medium border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                                                        title="Editar cliente"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                        <span>Editar</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClient(client.id)}
                                                        className="flex items-center space-x-1 text-red-600 hover:text-red-900 px-2 py-1 rounded text-xs font-medium border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                                                        title="Eliminar cliente"
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
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Total clientes</p>
                                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{clients.length}</p>
                                </div>
                                <UserCheck className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
                            </div>
                        </div>

                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Clientes activos</p>
                                    <p className="text-xl lg:text-2xl font-bold text-green-600">
                                        {clients.filter(client => client.isActive).length}
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
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Clientes inactivos</p>
                                    <p className="text-xl lg:text-2xl font-bold text-red-600">
                                        {clients.filter(client => !client.isActive).length}
                                    </p>
                                </div>
                                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Mostrando</p>
                                    <p className="text-xl lg:text-2xl font-bold text-blue-600">
                                        {sortedClients.length}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {searchTerm || routeFilter || statusFilter ? 'con filtros' : 'sin filtros'}
                                    </p>
                                </div>
                                <Filter className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingClient) && (
                <div
                    className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
                    onClick={handleModalBackdropClick}
                >
                    <div className="relative top-4 lg:top-20 mx-auto p-4 lg:p-5 border w-[95%] lg:w-[500px] shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingClient ? 'Modificar cliente' : 'Registrar nuevo cliente'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre del cliente *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                        placeholder="Ejemplo: Juan Pérez"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                        placeholder="Ejemplo: 1234567890"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cédula Ecuatoriana
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.cedula}
                                        onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                        placeholder="Ejemplo: 1234567890"
                                        maxLength={10}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                        placeholder="Ejemplo: cliente@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dirección
                                    </label>
                                    <textarea
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                        placeholder="Ejemplo: Calle Principal 123"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ruta
                                    </label>
                                    <select
                                        value={formData.routeId}
                                        onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                                    >
                                        <option value="">Seleccionar ruta (opcional)</option>
                                        {routes.map(route => (
                                            <option key={route.id} value={route.id}>
                                                {route.identificador} - {route.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                                <button
                                    onClick={closeModal}
                                    className="flex items-center justify-center space-x-2 px-3 lg:px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-sm lg:text-base"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancelar</span>
                                </button>
                                <button
                                    onClick={editingClient ? handleUpdateClient : handleCreateClient}
                                    disabled={!formData.nombre.trim()}
                                    className="flex items-center justify-center space-x-2 px-3 lg:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
                                >
                                    <Check className="h-4 w-4" />
                                    <span>{editingClient ? 'Guardar cambios' : 'Registrar cliente'}</span>
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