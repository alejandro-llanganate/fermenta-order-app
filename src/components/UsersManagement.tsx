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
  Shield,
  ShieldCheck
} from 'lucide-react';
import { User, CreateUserData, UserRole } from '@/types/user';
import { mockUsers } from '@/data/mockUsers';
import Footer from './Footer';

interface UsersManagementProps {
  onBack: () => void;
}

export default function UsersManagement({ onBack }: UsersManagementProps) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<UserRole | 'Todos'>('Todos');

  const [formData, setFormData] = useState<CreateUserData>({
    nombres: '',
    apellidos: '',
    username: '',
    cedula: '',
    rol: 'Asistente'
  });

  const generateUsername = (nombres: string, apellidos: string) => {
    const nombre = nombres.toLowerCase().split(' ')[0];
    const apellido = apellidos.toLowerCase().split(' ')[0];
    return `${nombre}.${apellido}`;
  };

  const handleCreateUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      username: formData.username || generateUsername(formData.nombres, formData.apellidos),
      cedula: formData.cedula,
      rol: formData.rol,
      isActive: true,
      createdAt: new Date()
    };

    setUsers([...users, newUser]);
    setShowCreateModal(false);
    setFormData({
      nombres: '',
      apellidos: '',
      username: '',
      cedula: '',
      rol: 'Asistente'
    });
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const updatedUsers = users.map(user =>
      user.id === editingUser.id
        ? { ...user, ...formData }
        : user
    );

    setUsers(updatedUsers);
    setEditingUser(null);
    setFormData({
      nombres: '',
      apellidos: '',
      username: '',
      cedula: '',
      rol: 'Asistente'
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleToggleActive = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.cedula.includes(searchTerm);
    
    const matchesRole = filterRole === 'Todos' || user.rol === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      nombres: user.nombres,
      apellidos: user.apellidos,
      username: user.username,
      cedula: user.cedula,
      rol: user.rol
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    setFormData({
      nombres: '',
      apellidos: '',
      username: '',
      cedula: '',
      rol: 'Asistente'
    });
  };

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const getRoleIcon = (rol: UserRole) => {
    switch (rol) {
      case 'Administrador':
        return <Shield className="h-4 w-4" />;
      case 'Asistente':
        return <UserCheck className="h-4 w-4" />;
      case 'Secretaria':
        return <ShieldCheck className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getActionLabel = (action: string, user: User) => {
    switch (action) {
      case 'toggle':
        return user.isActive ? 'Desactivar Usuario' : 'Activar Usuario';
      case 'edit':
        return 'Editar Información';
      case 'delete':
        return 'Eliminar Usuario';
      default:
        return '';
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
                <Users className="h-8 w-8 text-orange-500" />
                <h1 className="text-2xl font-bold text-gray-900">Gestión de usuarios</h1>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar nuevo usuario</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o cédula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as UserRole | 'Todos')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                >
                  <option value="Todos">Todos los roles</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Asistente">Asistente</option>
                  <option value="Secretaria">Secretaria</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Información del Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número de Cédula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo de Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado Actual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Registro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opciones Disponibles
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.nombres} {user.apellidos}
                          </div>
                          <div className="text-sm text-gray-500">
                            Usuario: @{user.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.cedula}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.rol)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.rol === 'Administrador' ? 'bg-red-100 text-red-800' :
                            user.rol === 'Asistente' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.rol}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Usuario Activo' : 'Usuario Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt.toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleToggleActive(user.id)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded"
                            title={getActionLabel('toggle', user)}
                          >
                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded text-xs font-medium border border-blue-200 hover:bg-blue-50"
                            title={getActionLabel('edit', user)}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 px-3 py-1 rounded text-xs font-medium border border-red-200 hover:bg-red-50"
                            title={getActionLabel('delete', user)}
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
          {(showCreateModal || editingUser) && (
            <div 
              className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
              onClick={handleModalBackdropClick}
            >
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingUser ? 'Modificar Información del Usuario' : 'Registrar Nuevo Usuario'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombres Completos *
                      </label>
                      <input
                        type="text"
                        value={formData.nombres}
                        onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                        placeholder="Ejemplo: Juan Carlos"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellidos Completos *
                      </label>
                      <input
                        type="text"
                        value={formData.apellidos}
                        onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                        placeholder="Ejemplo: Pérez González"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de Usuario
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                        placeholder="Se generará automáticamente si se deja vacío"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Cédula *
                      </label>
                      <input
                        type="text"
                        value={formData.cedula}
                        onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                        placeholder="Ejemplo: 1234567890"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Este número será su contraseña para acceder al sistema
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Usuario *
                      </label>
                      <select
                        value={formData.rol}
                        onChange={(e) => setFormData({...formData, rol: e.target.value as UserRole})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                      >
                        <option value="Asistente">Asistente</option>
                        <option value="Secretaria">Secretaria</option>
                        <option value="Administrador">Administrador</option>
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
                      onClick={editingUser ? handleUpdateUser : handleCreateUser}
                      disabled={!formData.nombres || !formData.apellidos || !formData.cedula}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4" />
                      <span>{editingUser ? 'Guardar Cambios' : 'Registrar Usuario'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
} 