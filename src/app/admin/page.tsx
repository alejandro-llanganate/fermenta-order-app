'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import Image from 'next/image';
import Logo from '@/components/Logo';
import InsecureBrowserModal from '@/components/InsecureBrowserModal';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isInsecureBrowser, setIsInsecureBrowser] = useState(false);

  const { user, isLoading, signIn, signOut, isAuthenticated } = useAuth();

  // Función para detectar navegador inseguro
  const detectInsecureBrowser = () => {
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isEdge = /Edge/.test(userAgent);
    
    // Detectar versiones antiguas o navegadores no soportados
    const isOldBrowser = !isChrome && !isFirefox && !isSafari && !isEdge;
    
    // Detectar si no es HTTPS
    const isNotSecure = window.location.protocol !== 'https:' && window.location.hostname !== 'localhost';
    
    return isOldBrowser || isNotSecure;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verificar si es navegador inseguro
    if (detectInsecureBrowser()) {
      setIsInsecureBrowser(true);
      setIsModalOpen(true);
      return;
    }

    // Aquí puedes agregar lógica específica para admin
    // Por ahora usamos el mismo sistema de autenticación
    const result = await signIn(username, password);

    if (!result.success) {
      setError(result.error || 'Error de autenticación');
    } else {
      // Si el login es exitoso y es navegador inseguro, mostrar modal
      if (detectInsecureBrowser()) {
        setIsInsecureBrowser(true);
        setIsModalOpen(true);
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUsername('');
    setPassword('');
  };

  // Si está autenticado, mostrar dashboard de admin
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                  <p className="text-gray-600">Bienvenido, {user.username}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Gestión de Usuarios</h3>
                <p className="text-blue-700">Administrar usuarios del sistema</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Reportes</h3>
                <p className="text-green-700">Ver estadísticas y reportes</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Configuración</h3>
                <p className="text-purple-700">Configurar parámetros del sistema</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Formulario de Login Admin - Lado Izquierdo */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="w-full max-w-md">
          {/* Logo y Título */}
          <div className="text-center mb-8">
            <Logo size="lg" className="justify-center mb-4" />
            <p className="text-blue-600 font-medium">Mega Donut</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Panel de Administración</h1>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Acceso Administrativo
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Ingresa tus credenciales de administrador
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500 text-gray-900"
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
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500 text-gray-900"
                    placeholder="Ingresa tu contraseña"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
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
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <ClipLoader color="#ffffff" size={20} />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    <span>Acceder como Administrador</span>
                  </>
                )}
              </button>
            </form>

            {/* Advertencia de Seguridad */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
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
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Panel de Administración</h3>
          <p className="text-lg opacity-90">
            Gestión segura y controlada del sistema
          </p>
        </div>
      </div>

      {/* Modal de Navegador Inseguro */}
      <InsecureBrowserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
