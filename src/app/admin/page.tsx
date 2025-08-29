'use client';

// Forzar renderizado dinámico para evitar problemas con variables de entorno
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Shield, AlertTriangle, Settings, Users, BarChart3, Building2, Menu, X } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import Image from 'next/image';
import Logo from '@/components/Logo';
import CompanyConfig from '@/components/CompanyConfig';
import UsersManagement from '@/components/UsersManagement';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const { user, isLoading, signIn, signOut, isAuthenticated } = useAuth();

  // Función para cargar estadísticas del dashboard
  const loadDashboardStats = async () => {
    if (!isAuthenticated) return;

    setIsLoadingStats(true);
    try {
      const { count, error } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setUserCount(count || 0);
    } catch (error) {
      console.error('Error loading user count:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Efecto para cargar estadísticas cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardStats();
    }
  }, [isAuthenticated, user]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Aquí puedes agregar lógica específica para admin
    // Por ahora usamos el mismo sistema de autenticación
    const result = await signIn(username, password);

    if (!result.success) {
      setError(result.error || 'Error de autenticación');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUsername('');
    setPassword('');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Cerrar menú móvil al cambiar de tab

    // Recargar estadísticas cuando se vuelve al dashboard
    if (tab === 'dashboard' && isAuthenticated) {
      loadDashboardStats();
    }
  };

  // Si está autenticado, mostrar dashboard de admin
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo y título */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                    Panel de Administración
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 truncate">
                    Bienvenido, {user.username}
                  </p>
                </div>
              </div>

              {/* Botón de menú móvil */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Menu className="h-5 w-5 text-gray-600" />
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base cursor-pointer"
                >
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                  <span className="sm:hidden">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('config')}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === 'config'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Configuración</span>
                </div>
              </button>
              <button
                onClick={() => handleTabChange('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Usuarios</span>
                </div>
              </button>
            </nav>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <nav className="lg:hidden py-4 space-y-2">
                <button
                  onClick={() => handleTabChange('dashboard')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer ${activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => handleTabChange('config')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer ${activeTab === 'config'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Configuración</span>
                </button>
                <button
                  onClick={() => handleTabChange('users')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer ${activeTab === 'users'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Usuarios</span>
                </button>
              </nav>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Usuarios</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {isLoadingStats ? (
                          <ClipLoader color="#3B82F6" size={20} />
                        ) : (
                          userCount
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Reportes</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Configurado</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">Sí</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Resumen del Sistema</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Gestión de Usuarios</h3>
                    <p className="text-sm sm:text-base text-gray-600">Administrar usuarios del sistema, roles y permisos.</p>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Reportes</h3>
                    <p className="text-sm sm:text-base text-gray-600">Ver estadísticas y reportes del sistema.</p>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Configuración</h3>
                    <p className="text-sm sm:text-base text-gray-600">Configurar parámetros de la empresa y sistema.</p>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Soporte</h3>
                    <p className="text-sm sm:text-base text-gray-600">Sistema de tickets y soporte técnico.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <CompanyConfig />
          )}

          {activeTab === 'users' && (
            <UsersManagement />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Formulario de Login Admin - Lado Izquierdo */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Logo y Título */}
          <div className="text-center mb-6 sm:mb-8">
            <Logo size="lg" className="justify-center mb-4" />
            <p className="text-blue-600 font-medium text-sm sm:text-base">Mega Donut</p>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">Panel de Administración</h1>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border border-blue-100">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">
              Acceso Administrativo
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center">
              Ingresa tus credenciales de administrador
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Campo Usuario */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario Administrador
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500 text-gray-900 text-sm sm:text-base"
                    placeholder="Ingresa tu usuario de administrador"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500 text-gray-900 text-sm sm:text-base"
                    placeholder="Ingresa tu contraseña"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botón de Inicio de Sesión */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <ClipLoader color="#ffffff" size={16} className="sm:w-5 sm:h-5" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Acceder como Administrador</span>
                    <span className="sm:hidden">Acceder</span>
                  </>
                )}
              </button>
            </form>

            {/* Advertencia de Seguridad */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-yellow-800">
                  <p className="font-medium mb-1">Acceso Restringido</p>
                  <p>Este panel es exclusivo para administradores autorizados. Todas las actividades son registradas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Imagen de Seguridad - Lado Derecho */}
      <div className="flex-1 relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 z-10"></div>
        <Image
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Seguridad y administración"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 sm:p-8 text-white">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Panel de Administración</h3>
          <p className="text-base sm:text-lg opacity-90">
            Gestión segura y controlada del sistema
          </p>
        </div>
      </div>

    </div>
  );
}
