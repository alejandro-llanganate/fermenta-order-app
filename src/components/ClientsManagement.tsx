'use client';

import { useState } from 'react';
import {
    Users,
    Plus,
    Search,
    ArrowLeft,
    Check,
    X,
    UserCheck,
    UserX,
    GraduationCap,
    Phone,
    MapPin as MapPinIcon
} from 'lucide-react';
import { Client, CreateClientData, UpdateClientData } from '@/types/client';
import { mockClients } from '@/data/mockClients';
import Footer from './Footer';

interface ClientsManagementProps {
    onBack: () => void;
}

export default function ClientsManagement({ onBack }: ClientsManagementProps) {
    const [clients, setClients] = useState<Client[]>(mockClients);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const [formData, setFormData] = useState<CreateClientData>({
        institucionEducativa: '',
        nombreCompleto: '',
        telefono: '',
        direccion: ''
    });

    const handleCreateClient = () => {
        const newClient: Client = {
            id: Date.now().toString(),
            institucionEducativa: formData.institucionEducativa,
            nombreCompleto: formData.nombreCompleto,
            telefono: formData.telefono,
            direccion: formData.direccion,
            isActive: true,
            createdAt: new Date()
        };

        setClients([...clients, newClient]);
        setShowCreateModal(false);
        setFormData({
            institucionEducativa: '',
            nombreCompleto: '',
            telefono: '',
            direccion: ''
        });
    };

    const handleUpdateClient = () => {
        if (!editingClient) return;

        const updatedClients = clients.map(client =>
            client.id === editingClient.id
                ? { ...client, ...formData }
                : client
        );

        setClients(updatedClients);
        setEditingClient(null);
        setFormData({
            institucionEducativa: '',
            nombreCompleto: '',
            telefono: '',
            direccion: ''
        });
    };

    const handleDeleteClient = (clientId: string) => {
        if (confirm('¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.')) {
            setClients(clients.filter(client => client.id !== clientId));
        }
    };

    const handleToggleActive = (clientId: string) => {
        setClients(clients.map(client =>
            client.id === clientId
                ? { ...client, isActive: !client.isActive }
                : client
        ));
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.institucionEducativa.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.telefono.includes(searchTerm) ||
            client.direccion.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const openEditModal = (client: Client) => {
        setEditingClient(client);
        setFormData({
            institucionEducativa: client.institucionEducativa,
            nombreCompleto: client.nombreCompleto,
            telefono: client.telefono,
            direccion: client.direccion
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingClient(null);
        setFormData({
            institucionEducativa: '',
            nombreCompleto: '',
            telefono: '',
            direccion: ''
        });
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
                                <GraduationCap className="h-8 w-8 text-orange-500" />
                                <h1 className="text-2xl font-bold text-gray-900">Gestión de clientes educativos</h1>
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

                    {/* Search */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por institución, nombre, teléfono o dirección..."
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
                                            Institución educativa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contacto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Teléfono
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dirección
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado actual
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Opciones disponibles
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <GraduationCap className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {client.institucionEducativa}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {client.nombreCompleto}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center space-x-1">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <span>{client.telefono}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                <div className="flex items-center space-x-1">
                                                    <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate" title={client.direccion}>{client.direccion}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${client.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {client.isActive ? 'Cliente activo' : 'Cliente inactivo'}
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
                                                        title="Editar información del cliente"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClient(client.id)}
                                                        className="text-red-600 hover:text-red-900 px-3 py-1 rounded text-xs font-medium border border-red-200 hover:bg-red-50"
                                                        title="Eliminar cliente"
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
                    {(showCreateModal || editingClient) && (
                        <div
                            className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
                            onClick={handleModalBackdropClick}
                        >
                            <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingClient ? 'Modificar información del cliente educativo' : 'Registrar nuevo cliente educativo'}
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre de la institución educativa *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.institucionEducativa}
                                                onChange={(e) => setFormData({ ...formData, institucionEducativa: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                                placeholder="Ejemplo: Unidad Educativa Nacional Quito"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre y apellido del contacto *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.nombreCompleto}
                                                onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                                placeholder="Ejemplo: María Elena González Pérez"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono de contacto *
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.telefono}
                                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                                placeholder="Ejemplo: 0998765432"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Dirección de la institución *
                                            </label>
                                            <textarea
                                                value={formData.direccion}
                                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                                placeholder="Ejemplo: Av. 10 de Agosto N24-15 y Cordero, Quito"
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
                                            onClick={editingClient ? handleUpdateClient : handleCreateClient}
                                            disabled={!formData.institucionEducativa.trim() || !formData.nombreCompleto.trim() || !formData.telefono.trim() || !formData.direccion.trim()}
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

                    {/* Statistics */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total de clientes</p>
                                    <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                                </div>
                                <GraduationCap className="h-8 w-8 text-blue-500" />
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
            <Footer />
        </div>
    );
} 