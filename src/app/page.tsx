'use client';

// Forzar renderizado dinámico para evitar problemas con variables de entorno
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { CreditCard, Eye, EyeOff } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import Image from 'next/image';
import Logo from '@/components/Logo';
import ContactModal from '@/components/ContactModal';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [cedula, setCedula] = useState('');
  const [showCedula, setShowCedula] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, signOut, isAuthenticated } = useAuth();

  const validateCedula = (cedula: string): boolean => {
    if (cedula.length !== 10) return false;
    if (!/^\d+$/.test(cedula)) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validar formato de cédula
    if (!validateCedula(cedula)) {
      setError('Cédula inválida. Debe tener 10 dígitos numéricos');
      setIsLoading(false);
      return;
    }

    try {
      // Buscar usuario por cédula en la tabla usuarios
      const { data: users, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cedula', cedula)
        .eq('is_active', true)
        .limit(1);

      if (error) throw error;

      if (!users || users.length === 0) {
        setError('Cédula no encontrada o usuario inactivo');
        setIsLoading(false);
        return;
      }

      const user = users[0];

      // Verificar que no sea administrador (los administradores van al panel admin)
      if (user.role === 'Administrador') {
        setError('Los administradores deben usar el panel administrativo');
        setIsLoading(false);
        return;
      }

      // Crear un objeto de usuario compatible con el sistema de autenticación
      const authUser = {
        id: user.id,
        username: user.email,
        cedula: user.cedula,
        type: 'user',
        created_at: user.created_at,
        updated_at: user.updated_at,
        // Agregar datos completos del usuario para mostrar en el dashboard
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      };

      // Almacenar en sessionStorage para persistencia
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentUser', JSON.stringify(authUser));
      }

      // Simular login exitoso - recargar la página para actualizar el estado
      window.location.reload();
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error al verificar cédula');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setCedula('');
    // Limpiar sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentUser');
    }
  };

  // Si está autenticado, mostrar el dashboard
  if (isAuthenticated && user) {
    const userData = user.first_name && user.last_name ? {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email || user.username,
      role: user.role || 'Usuario',
      cedula: user.cedula
    } : undefined;

    return <Dashboard
      username={user.username || user.cedula}
      onLogout={handleLogout}
      userData={userData}
    />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Formulario de Login - Lado Izquierdo */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-8">
        <div className="w-full max-w-md">
          {/* Logo Mega Donut */}
          <div className="text-center mb-8">
            <Logo size="lg" className="justify-center mb-4" />
            <p className="text-orange-600 font-medium">Mega Donut</p>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Bienvenido
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Inicia sesión para continuar
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}



              {/* Campo Cédula */}
              <div>
                <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Cédula
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="cedula"
                    type={showCedula ? "text" : "password"}
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder-gray-500 text-gray-900"
                    placeholder="Ingresa tu número de cédula"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCedula(!showCedula)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    disabled={isLoading}
                  >
                    {showCedula ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botón de Inicio de Sesión */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <ClipLoader color="#ffffff" size={20} />
                    <span>Iniciando Sesión...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>
            </form>

            {/* Enlaces adicionales */}
            <div className="mt-6 text-center space-y-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium block cursor-pointer"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
              <a
                href="/admin"
                className="text-xs text-gray-500 hover:text-gray-700 font-medium block"
              >
                Acceso Administrativo
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Imagen de Panadería - Lado Derecho */}
      <div className="flex-1 relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-amber-600/20 z-10"></div>
        <Image
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Panadería y producción de pan"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Mega Donut</h3>
          <p className="text-lg opacity-90">
            Gestión inteligente para tu negocio
          </p>
        </div>
      </div>

      {/* Modal de Contacto */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
