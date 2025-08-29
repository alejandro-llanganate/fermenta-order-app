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

interface ClientsManagementProps {
    onBack: () => void;
}

export default function ClientsManagement({ onBack }: ClientsManagementProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateClientData>({
        nombre: '',
        telefono: '',
        direccion: '',
        routeId: ''
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

            // Fetch clients with route information
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients_with_routes')
                .select('*')
                .order('nombre');

            if (clientsError) throw clientsError;
            setClients(clientsData || []);
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
                .from('clients_with_routes')
                .select('*')
                .eq('id', data.id)
                .single();

            if (clientWithRoute) {
                setClients([...clients, clientWithRoute]);
            }

            setShowCreateModal(false);
            resetForm();
        } catch (err) {
            console.error('Error creating client:', err);
            alert('Error al crear el cliente: ' + (err as Error).message);
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
                .from('clients_with_routes')
                .select('*')
                .eq('id', editingClient.id)
                .single();

            if (clientWithRoute) {
                setClients(clients.map(client =>
                    client.id === editingClient.id ? clientWithRoute : client
                ));
            }

            setEditingClient(null);
            resetForm();
        } catch (err) {
            console.error('Error updating client:', err);
            alert('Error al actualizar el cliente: ' + (err as Error).message);
        }
    };

    const handleDeleteClient = async (clientId: string) => {
        if (!confirm('¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.')) {
            return;
        }

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
        } catch (err) {
            console.error('Error deleting client:', err);
            alert('Error al eliminar el cliente: ' + (err as Error).message);
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
                .from('clients_with_routes')
                .select('*')
                .eq('id', clientId)
                .single();

            if (clientWithRoute) {
                setClients(clients.map(c =>
                    c.id === clientId ? clientWithRoute : c
                ));
            }
        } catch (err) {
            console.error('Error toggling client status:', err);
            alert('Error al cambiar el estado del cliente: ' + (err as Error).message);
        }
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.telefono && client.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.direccion && client.direccion.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.routeIdentifier && client.routeIdentifier.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSearch;
    });

    const openEditModal = (client: Client) => {
        setEditingClient(client);
        setFormData({
            nombre: client.nombre,
            telefono: client.telefono || '',
            direccion: client.direccion || '',
            routeId: client.routeId || ''
        });
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            telefono: '',
            direccion: '',
            routeId: ''
        });
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
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <UserCheck className="h-8 w-8 text-orange-500" />
                                <h1 className="text-2xl font-bold text-gray-900">Gestión de clientes</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
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

                    {/* Search */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
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

                    {/* Clients Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Teléfono
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dirección
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ruta
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Opciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-gray-50">
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
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {client.direccion || 'No especificada'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {client.routeIdentifier ? (
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {client.routeIdentifier}
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
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button
                                                        onClick={() => handleToggleActive(client.id)}
                                                        className="text-gray-400 hover:text-gray-600 p-1 rounded"
                                                        title={client.isActive ? 'Desactivar cliente' : 'Activar cliente'}
                                                    >
                                                        {client.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(client)}
                                                        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded text-xs font-medium border border-blue-200 hover:bg-blue-50"
                                                        title="Editar cliente"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClient(client.id)}
                                                        className="text-red-600 hover:text-red-900 px-3 py-1 rounded text-xs font-medium border border-red-200 hover:bg-red-50"
                                                        title="Eliminar cliente"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total clientes</p>
                                    <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                                </div>
                                <UserCheck className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Clientes activos</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {clients.filter(client => client.isActive).length}
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
                                    <p className="text-sm font-medium text-gray-600">Clientes inactivos</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {clients.filter(client => !client.isActive).length}
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

            {/* Create/Edit Modal */}
            {(showCreateModal || editingClient) && (
                <div
                    className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
                    onClick={handleModalBackdropClick}
                >
                    <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
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

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={closeModal}
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancelar</span>
                                </button>
                                <button
                                    onClick={editingClient ? handleUpdateClient : handleCreateClient}
                                    disabled={!formData.nombre.trim()}
                                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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