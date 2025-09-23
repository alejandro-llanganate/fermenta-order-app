'use client';

import { useState, useEffect } from 'react';
import { Users, ShoppingCart, LogOut, Clock, UserCheck, MapPin, ShoppingBag, BarChart3, DollarSign, BookOpen, FolderOpen } from 'lucide-react';
import Logo from './Logo';
import UsersManagement from './UsersManagement';
import ClientsManagement from './ClientsManagement';
import RoutesManagement from './RoutesManagement';
import ProductsManagement from './ProductsManagement';
import CategoryManagement from './CategoryManagement';
import OrdersManagement from './OrdersManagement';
import ReportsManagement from './ReportsManagement';
import Notebooks from './Notebooks';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface DashboardProps {
    username: string;
    onLogout: () => void;
    userData?: {
        first_name: string;
        last_name: string;
        email: string;
        role: string;
        cedula: string;
    };
}

export default function Dashboard({ username, onLogout, userData }: DashboardProps) {
    const { isAdmin } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentView, setCurrentView] = useState<'dashboard' | 'users' | 'orders' | 'clients' | 'routes' | 'products' | 'categories' | 'reports' | 'notebooks'>('dashboard');

    // Estados para estadísticas
    const [stats, setStats] = useState({
        activeClients: 0,
        totalOrders: 0,
        ordersRegisteredToday: 0,
        activeProducts: 0,
        totalSales: 0,
        salesRegisteredToday: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Función para obtener estadísticas
    const fetchStats = async () => {
        try {
            setLoading(true);

            // Obtener clientes activos
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('id, is_active')
                .eq('is_active', true);

            if (clientsError) {
                console.error('Error fetching clients:', clientsError);
            }

            // Obtener productos activos
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('id, is_active')
                .eq('is_active', true);

            if (productsError) {
                console.error('Error fetching products:', productsError);
            }

            let ordersData = null;
            let ordersRegisteredData = null;
            let totalSales = 0;
            let salesRegisteredToday = 0;

            // Solo obtener datos de ventas si el usuario es administrador
            if (isAdmin) {
                // Obtener pedidos que se entregarán hoy (basado en delivery_date)
                const today = new Date();
                const todayString = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD

                const { data: ordersDataResult, error: ordersError } = await supabase
                    .from('orders')
                    .select('id, total_amount, delivery_date')
                    .eq('delivery_date', todayString);

                if (ordersError) {
                    console.error('Error fetching orders:', ordersError);
                } else {
                    ordersData = ordersDataResult;
                }

                // Obtener pedidos registrados hoy (basado en created_at)
                const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

                const { data: ordersRegisteredDataResult, error: ordersRegisteredError } = await supabase
                    .from('orders')
                    .select('id, total_amount, created_at')
                    .gte('created_at', startOfDay.toISOString())
                    .lte('created_at', endOfDay.toISOString());

                if (ordersRegisteredError) {
                    console.error('Error fetching registered orders:', ordersRegisteredError);
                } else {
                    ordersRegisteredData = ordersRegisteredDataResult;
                }

                // Calcular total de ventas de pedidos que se entregarán hoy
                totalSales = ordersData?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0;

                // Calcular total de ventas de pedidos registrados hoy
                salesRegisteredToday = ordersRegisteredData?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0;
            }

            setStats({
                activeClients: clientsData?.length || 0,
                totalOrders: ordersData?.length || 0,
                ordersRegisteredToday: ordersRegisteredData?.length || 0,
                activeProducts: productsData?.length || 0,
                totalSales: totalSales,
                salesRegisteredToday: salesRegisteredToday
            });

        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar estadísticas al montar el componente y cuando se regrese al dashboard
    useEffect(() => {
        if (currentView === 'dashboard') {
            fetchStats();
        }
    }, [currentView]);

    const menuItems = [
        // Solo mostrar gestión de usuarios para admins
        ...(isAdmin ? [{
            label: 'Usuarios',
            icon: Users,
            color: 'bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800',
            onClick: () => setCurrentView('users')
        }] : []),
        {
            label: 'Categorías',
            icon: FolderOpen,
            color: 'bg-gradient-to-br from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800',
            onClick: () => setCurrentView('categories')
        },
        {
            label: 'Productos',
            icon: ShoppingBag,
            color: 'bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800',
            onClick: () => setCurrentView('products')
        },
        {
            label: 'Rutas',
            icon: MapPin,
            color: 'bg-gradient-to-br from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800',
            onClick: () => setCurrentView('routes')
        },
        {
            label: 'Clientes',
            icon: UserCheck,
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800',
            onClick: () => setCurrentView('clients')
        },
        {
            label: 'Pedidos',
            icon: ShoppingCart,
            color: 'bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800',
            onClick: () => setCurrentView('orders')
        },
        {
            label: 'Cuadernos',
            icon: BookOpen,
            color: 'bg-gradient-to-br from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800',
            onClick: () => setCurrentView('notebooks')
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
        return <UsersManagement />;
    }

    if (currentView === 'products') {
        return <ProductsManagement onBack={() => setCurrentView('dashboard')} />;
    }

    if (currentView === 'categories') {
        return <CategoryManagement onBack={() => setCurrentView('dashboard')} />;
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

    if (currentView === 'notebooks') {
        return <Notebooks onBack={() => setCurrentView('dashboard')} />;
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
                                <p className="text-sm text-gray-600">Sistema de Gestión</p>
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
                                {userData ? (
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {userData.first_name} {userData.last_name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {userData.role} • {userData.cedula}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="font-medium">Usuario: {username}</span>
                                )}
                            </div>
                            <button
                                onClick={onLogout}
                                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
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
                {/* Botón de actualización */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Resumen del Día</h2>
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Clock className="h-4 w-4" />
                        <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                    {/* Solo mostrar tarjetas de ventas para administradores */}
                    {isAdmin && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ventas por Entregar</p>
                                    {loading ? (
                                        <div className="animate-pulse">
                                            <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-2xl font-bold text-green-600">
                                                ${stats.totalSales.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {stats.totalSales > 0 ? 'Ventas que se entregarán hoy' : 'Sin entregas hoy'}
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>
                    )}

                    {isAdmin && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ventas Registradas</p>
                                    {loading ? (
                                        <div className="animate-pulse">
                                            <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-2xl font-bold text-emerald-600">
                                                ${stats.salesRegisteredToday.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {stats.salesRegisteredToday > 0 ? 'Ventas registradas hoy' : 'Sin ventas registradas'}
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="p-3 bg-emerald-100 rounded-full">
                                    <DollarSign className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pedidos por Entregar</p>
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                                        <p className="text-xs text-gray-500">
                                            {stats.totalOrders > 0 ? 'Pedidos que se entregarán hoy' : 'Sin entregas hoy'}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <ShoppingCart className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pedidos Registrados</p>
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold text-indigo-600">{stats.ordersRegisteredToday}</p>
                                        <p className="text-xs text-gray-500">
                                            {stats.ordersRegisteredToday > 0 ? 'Pedidos registrados hoy' : 'Sin pedidos registrados'}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="p-3 bg-indigo-100 rounded-full">
                                <ShoppingCart className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold text-purple-600">{stats.activeClients}</p>
                                        <p className="text-xs text-gray-500">
                                            {stats.activeClients > 0 ? 'Clientes activos' : 'Sin clientes activos'}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <UserCheck className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Productos Activos</p>
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold text-red-600">
                                            {stats.activeProducts}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {stats.activeProducts > 0 ? 'Productos activos' : 'Sin productos activos'}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="p-3 bg-red-100 rounded-full">
                                <ShoppingBag className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información del usuario */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Usuario</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Rol</p>
                            <p className="text-xl font-bold text-gray-900 capitalize">{isAdmin ? 'Administrador' : 'Usuario'}</p>
                            <p className="text-xs text-blue-600">
                                {isAdmin ? 'Acceso completo' : 'Acceso limitado'}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Usuario</p>
                            <p className="text-xl font-bold text-gray-900">{username}</p>
                            <p className="text-xs text-gray-600">Conectado</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Hora</p>
                            <p className="text-xl font-bold text-gray-900">
                                {currentTime.toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                            <p className="text-xs text-gray-600">
                                {currentTime.toLocaleDateString('es-ES')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onClick}
                            className={`${item.color} p-6 rounded-xl shadow-sm border border-gray-200 text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg cursor-pointer relative ${item.label === 'Cuadernos' ? 'ring-4 ring-yellow-300 ring-opacity-50' : ''}`}
                        >
                            <div className="flex flex-col items-center space-y-3">
                                <item.icon className="h-12 w-12" />
                                <span className="text-lg font-semibold">{item.label}</span>
                                {item.label === 'Cuadernos' && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                                        MÁS USADO
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Progreso Semanal */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso de Ventas Semanal</h3>
                    {/* The LineChart component and its data were removed as per the edit hint. */}
                    {/* This section will now be empty or contain a placeholder. */}
                    <p className="text-center text-gray-500">Progreso de ventas semanal no disponible.</p>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => setCurrentView('orders')}
                            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <h4 className="font-medium text-gray-900">Nuevo pedido</h4>
                            <p className="text-sm text-gray-600">Crear un pedido rápidamente</p>
                        </button>
                        <button
                            onClick={() => setCurrentView('reports')}
                            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <h4 className="font-medium text-gray-900">Ver reporte diario</h4>
                            <p className="text-sm text-gray-600">Consultar ventas del día</p>
                        </button>
                        <button
                            onClick={() => setCurrentView('products')}
                            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
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