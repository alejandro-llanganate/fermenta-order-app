import { Printer, RefreshCw } from 'lucide-react';
import { Route } from '@/types/routeNotebook';
import { useAuth } from '@/contexts/AuthContext';

interface RouteNotebookControlsProps {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    dateFilterType: 'registration' | 'delivery';
    setDateFilterType: (type: 'registration' | 'delivery') => void;
    selectedRoute: string;
    setSelectedRoute: (route: string) => void;
    routes: Route[];
    orders: any[]; // Should be Order[]
    isUpdating: boolean;
    setShowPreview: (show: boolean) => void;
    onRefresh: () => void;
}

export default function RouteNotebookControls({
    selectedDate,
    setSelectedDate,
    dateFilterType,
    setDateFilterType,
    selectedRoute,
    setSelectedRoute,
    routes,
    orders,
    isUpdating,
    setShowPreview,
    onRefresh
}: RouteNotebookControlsProps) {
    const { isAdmin } = useAuth();

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tipo de Filtro */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        CRITERIO DE FECHA
                    </label>
                    <select
                        value={dateFilterType}
                        onChange={(e) => setDateFilterType(e.target.value as 'registration' | 'delivery')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="registration">Fecha de Registro</option>
                        <option value="delivery">Fecha de Entrega</option>
                    </select>
                </div>

                {/* Fecha */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {dateFilterType === 'registration' ? 'FECHA DE REGISTRO' : 'FECHA DE ENTREGA'}
                    </label>
                    <input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Route Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ruta Específica (Opcional)
                    </label>
                    <select
                        value={selectedRoute}
                        onChange={(e) => setSelectedRoute(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todas las rutas</option>
                        {routes.map((route) => (
                            <option key={route.id} value={route.id}>
                                {route.identificador} - {route.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Summary */}
                <div className="flex items-center justify-end">
                    <div className="text-right">
                        <p className="text-sm text-gray-600">
                            {orders.length} pedidos encontrados
                        </p>
                        {isAdmin && (
                            <p className="text-lg font-semibold text-blue-600">
                                Total: ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowPreview(true)}
                        className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Vista Previa</span>
                    </button>

                    <button
                        onClick={onRefresh}
                        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        title="Refrescar datos"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>Refrescar</span>
                    </button>
                </div>

                {/* Loading Indicator */}
                {isUpdating && (
                    <div className="flex items-center space-x-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Actualizando...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
