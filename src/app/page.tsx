'use client';

import { useState } from 'react';
import { User, CreditCard, Eye, EyeOff } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import Image from 'next/image';
import Logo from '@/components/Logo';
import ContactModal from '@/components/ContactModal';
import Dashboard from '@/components/Dashboard';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [cedula, setCedula] = useState('');
  const [showCedula, setShowCedula] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular proceso de autenticación
    setTimeout(() => {
      setIsLoading(false);
      setIsAuthenticated(true);
    }, 2000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setCedula('');
  };

  // Si está autenticado, mostrar el dashboard
  if (isAuthenticated) {
    return <Dashboard username={username} onLogout={handleLogout} />;
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
              {/* Campo Usuario */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Usuario
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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder-gray-500 text-gray-900"
                    placeholder="Ingresa tu nombre de usuario"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
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
