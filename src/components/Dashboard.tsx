'use client';

import { useState, useEffect } from 'react';
import { Users, ShoppingCart, LogOut, Clock, UserCheck, MapPin, ShoppingBag, BarChart3, DollarSign } from 'lucide-react';
import Logo from './Logo';
import UsersManagement from './UsersManagement';
import ClientsManagement from './ClientsManagement';
import RoutesManagement from './RoutesManagement';
import ProductsManagement from './ProductsManagement';
import OrdersManagement from './OrdersManagement';
import ReportsManagement from './ReportsManagement';
import { weeklyProgressData } from '@/data/mockChartData';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
    username: string;
    onLogout: () => void;
}

export default function Dashboard({ username, onLogout }: DashboardProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentView, setCurrentView] = useState<'dashboard' | 'users' | 'orders' | 'clients' | 'routes' | 'products' | 'reports'>('dashboard');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const menuItems = [
        {
            label: 'Usuarios',
            icon: Users,
            color: 'bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800',
            onClick: () => setCurrentView('users')
        },
        {
            label: 'Productos',
            icon: ShoppingBag,
            color: 'bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800',
            onClick: () => setCurrentView('products')
        },
        {
            label: 'Pedidos',
            icon: ShoppingCart,
            color: 'bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800',
            onClick: () => setCurrentView('orders')
        },
        {
            label: 'Clientes',
            icon: UserCheck,
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800',
            onClick: () => setCurrentView('clients')
        },
        {
            label: 'Rutas',
            icon: MapPin,
            color: 'bg-gradient-to-br from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800',
            onClick: () => setCurrentView('routes')
        },
        {
            label: 'Reportes',
            icon: BarChart3,
            color: 'bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800',
            onClick: () => setCurrentView('reports')
        }
    ];

    // Render specific management component
    if (currentView === 'users') {
        return <UsersManagement onBack={() => setCurrentView('dashboard')} />;
    }

    if (currentView === 'products') {
        return <ProductsManagement onBack={() => setCurrentView('dashboard')} />;
    }

    if (currentView === 'orders') {
        return <OrdersManagement onBack={() => setCurrentView('dashboard')} />;
    }

    if (currentView === 'clients') {
        return <ClientsManagement onBack={() => setCurrentView('dashboard')} />;
    }

    if (currentView === 'routes') {
        return <RoutesManagement onBack={() => setCurrentView('dashboard')} />;
    }

    if (currentView === 'reports') {
        return <ReportsManagement onBack={() => setCurrentView('dashboard')} />;
    }



    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo y Título */}
                        <div className="flex items-center space-x-4">
                            <Logo size="md" />
                            <div className="text-center">
                                <h1 className="text-xl font-bold text-orange-600">MEGA DONUT</h1>
                                <p className="text-sm text-gray-600">Panadería Encarnación</p>
                            </div>
                            <div className="ml-6">
                                <h2 className="text-lg font-bold text-gray-900">Panel de Control</h2>
                                <p className="text-sm text-gray-600">
                                    {new Date().toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Info del usuario y hora */}
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>{currentTime.toLocaleTimeString('es-ES')}</span>
                            </div>
                            <div className="text-sm text-gray-900">
                                <span className="font-medium">Usuario: {username}</span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Salir sesión</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Ventas Hoy</p>
                                <p className="text-2xl font-bold text-green-600">$368.50</p>
                                <p className="text-xs text-green-500">+12% vs ayer</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pedidos Hoy</p>
                                <p className="text-2xl font-bold text-blue-600">8</p>
                                <p className="text-xs text-blue-500">6 entregados</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <ShoppingCart className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                                <p className="text-2xl font-bold text-purple-600">38</p>
                                <p className="text-xs text-purple-500">En 5 rutas</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <UserCheck className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                                <p className="text-2xl font-bold text-red-600">2</p>
                                <p className="text-xs text-red-500">Requiere atención</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-full">
                                <ShoppingBag className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stock del día anterior */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock del Día Anterior</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Donuts Choco</p>
                            <p className="text-xl font-bold text-gray-900">45</p>
                            <p className="text-xs text-green-600">Normal</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Rellenas</p>
                            <p className="text-xl font-bold text-gray-900">15</p>
                            <p className="text-xs text-red-600">Bajo</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Pasteles</p>
                            <p className="text-xl font-bold text-gray-900">8</p>
                            <p className="text-xs text-green-600">Normal</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Pizzas</p>
                            <p className="text-xl font-bold text-gray-900">0</p>
                            <p className="text-xs text-red-600">Agotado</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Pan Hamburguesa</p>
                            <p className="text-xl font-bold text-gray-900">125</p>
                            <p className="text-xs text-green-600">Excelente</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Muffins</p>
                            <p className="text-xl font-bold text-gray-900">32</p>
                            <p className="text-xs text-green-600">Normal</p>
                        </div>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onClick}
                            className={`${item.color} text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                        >
                            <div className="flex flex-col items-center space-y-4">
                                <item.icon className="h-12 w-12" />
                                <span className="text-lg font-semibold">{item.label}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Progreso Semanal */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso de Ventas Semanal</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={weeklyProgressData}>
                            <XAxis dataKey="day" />
                            <YAxis hide />
                            <Tooltip formatter={(value, name) => [
                                name === 'ventas' ? `$${Number(value).toFixed(2)}` : value,
                                name === 'ventas' ? 'Ventas' : name === 'meta' ? 'Meta' : 'Pedidos'
                            ]} />
                            <Line type="monotone" dataKey="ventas" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                            <Line type="monotone" dataKey="meta" stroke="#EF4444" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => setCurrentView('orders')}
                            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <h4 className="font-medium text-gray-900">Nuevo pedido</h4>
                            <p className="text-sm text-gray-600">Crear un pedido rápidamente</p>
                        </button>
                        <button
                            onClick={() => setCurrentView('reports')}
                            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <h4 className="font-medium text-gray-900">Ver reporte diario</h4>
                            <p className="text-sm text-gray-600">Consultar ventas del día</p>
                        </button>
                        <button
                            onClick={() => setCurrentView('products')}
                            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <h4 className="font-medium text-gray-900">Gestionar inventario</h4>
                            <p className="text-sm text-gray-600">Actualizar stock de productos</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 