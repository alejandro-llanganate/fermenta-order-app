import { Calendar, Eye, Download } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Route, Order } from '@/types/routeNotebook';

interface PartialTotalsNotebookControlsProps {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    dateFilterType: 'registration' | 'delivery';
    setDateFilterType: (type: 'registration' | 'delivery') => void;
    loading: boolean;
    orders: Order[];
    routes: Route[];
    generatePDF: () => void;
    setShowPreview: (show: boolean) => void;
}

export default function PartialTotalsNotebookControls({
    selectedDate,
    setSelectedDate,
    dateFilterType,
    setDateFilterType,
    loading,
    orders,
    routes,
    generatePDF,
    setShowPreview
}: PartialTotalsNotebookControlsProps) {
    const totalOrders = orders.length;
    const totalRoutes = routes.length;
    const totalQuantity = orders.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Date Selector */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <label className="text-sm font-medium text-gray-700">Fecha:</label>
                    </div>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => date && setSelectedDate(date)}
                        dateFormat="dd/MM/yyyy"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={loading}
                    />
                    <select
                        value={dateFilterType}
                        onChange={(e) => setDateFilterType(e.target.value as 'registration' | 'delivery')}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={loading}
                    >
                        <option value="registration">Fecha de Registro</option>
                        <option value="delivery">Fecha de Entrega</option>
                    </select>
                </div>

                {/* Summary Stats */}
                <div className="flex items-center space-x-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Órdenes</p>
                        <p className="text-lg font-bold text-purple-600">{totalOrders}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Rutas</p>
                        <p className="text-lg font-bold text-purple-600">{totalRoutes}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Cantidad Total</p>
                        <p className="text-lg font-bold text-purple-600">{totalQuantity}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Monto Total</p>
                        <p className="text-lg font-bold text-purple-600">${totalAmount.toFixed(2)}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowPreview(true)}
                        className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        <Eye className="h-4 w-4" />
                        <span>Vista Previa</span>
                    </button>
                    <button
                        onClick={generatePDF}
                        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        <span>Generar PDF</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
