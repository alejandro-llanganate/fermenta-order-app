'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Mail, Hash, UserCheck, UserX } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';

interface Usuario {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_number: string;
  cedula: string;
  role: 'Administrador' | 'Auxiliar' | 'Secretaria';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  cedula: string;
  role: 'Administrador' | 'Auxiliar' | 'Secretaria';
}

export default function UsersManagement() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    first_name: '',
    last_name: '',
    cedula: '',
    role: 'Auxiliar'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage('Error al cargar usuarios');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const validateCedula = (cedula: string): boolean => {
    if (cedula.length !== 10) return false;
    if (!/^\d+$/.test(cedula)) return false;
    return true;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    // Validaciones
    if (!validateEmail(formData.email)) {
      setMessage('Email inválido');
      setMessageType('error');
      setIsSaving(false);
      return;
    }

    if (!validateCedula(formData.cedula)) {
      setMessage('Cédula inválida. Debe tener 10 dígitos numéricos');
      setMessageType('error');
      setIsSaving(false);
      return;
    }

    if (formData.first_name.trim().length < 2) {
      setMessage('El nombre debe tener al menos 2 caracteres');
      setMessageType('error');
      setIsSaving(false);
      return;
    }

    if (formData.last_name.trim().length < 2) {
      setMessage('El apellido debe tener al menos 2 caracteres');
      setMessageType('error');
      setIsSaving(false);
      return;
    }

    try {
      // Obtener el ID del usuario actual (admin)
      const { data: { user } } = await supabase.auth.getUser();

      if (editingUser) {
        // Actualizar usuario existente
        const { error } = await supabase
          .from('usuarios')
          .update({
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            cedula: formData.cedula,
            role: formData.role,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingUser.id);

        if (error) throw error;
        setMessage('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        const { error } = await supabase
          .from('usuarios')
          .insert([{
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            cedula: formData.cedula,
            role: formData.role,
            created_by: user?.id
          }]);

        if (error) throw error;
        setMessage('Usuario creado exitosamente');
      }

      setMessageType('success');
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      if (error.code === '23505') {
        if (error.message.includes('email')) {
          setMessage('El email ya está registrado');
        } else if (error.message.includes('cedula')) {
          setMessage('La cédula ya está registrada');
        } else {
          setMessage('El usuario ya existe');
        }
      } else {
        setMessage('Error al guardar usuario');
      }
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      cedula: user.cedula,
      role: user.role
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('usuarios')
          .delete()
          .eq('id', userId);

        if (error) throw error;
        Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        Swal.fire('Error', 'Error al eliminar usuario.', 'error');
      }
    }
  };

  const toggleUserStatus = async (user: Usuario) => {
    const newStatus = !user.is_active;
    const title = newStatus ? 'Activar' : 'Desactivar';
    const text = newStatus ? '¿Estás seguro de que quieres activar este usuario?' : '¿Estás seguro de que quieres desactivar este usuario?';
    const icon = newStatus ? 'question' : 'warning';

    const result = await Swal.fire({
      title: `${title} Usuario`,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: newStatus ? '#28a745' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `${title}`,
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('usuarios')
          .update({
            is_active: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;
        Swal.fire(newStatus ? 'Activado' : 'Desactivado', `${user.first_name} ${user.last_name} ha sido ${newStatus ? 'activado' : 'desactivado'}.`, 'success');
        loadUsers();
      } catch (error) {
        console.error('Error toggling user status:', error);
        Swal.fire('Error', 'Error al cambiar estado del usuario.', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      cedula: '',
      role: 'Auxiliar'
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrador': return 'bg-red-100 text-red-800';
      case 'Secretaria': return 'bg-blue-100 text-blue-800';
      case 'Auxiliar': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <ClipLoader color="#3B82F6" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <User className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${messageType === 'success'
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
          {message}
        </div>
      )}

      {/* Formulario de Usuario */}
      {showForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cédula *
              </label>
              <input
                type="text"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1234567890"
                maxLength={10}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Juan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Pérez"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Auxiliar">Auxiliar</option>
                <option value="Secretaria">Secretaria</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            <div className="flex items-end space-x-3">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <ClipLoader color="#ffffff" size={16} className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    {editingUser ? 'Actualizar' : 'Crear'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cédula
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className={!user.is_active ? 'bg-gray-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.user_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.cedula}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${user.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {user.is_active ? (
                      <>
                        <UserCheck className="h-3 w-3 mr-1" />
                        Activo
                      </>
                    ) : (
                      <>
                        <UserX className="h-3 w-3 mr-1" />
                        Inactivo
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleUserStatus(user)}
                    className={`${user.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} cursor-pointer`}
                  >
                    {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay usuarios registrados</p>
        </div>
      )}
    </div>
  );
} 