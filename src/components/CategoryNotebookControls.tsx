import { Printer } from 'lucide-react';
import { ProductCategory } from '@/types/routeNotebook';

interface CategoryNotebookControlsProps {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    productCategories: ProductCategory[];
    orders: any[]; // Should be Order[]
    isUpdating: boolean;
    setShowPreview: (show: boolean) => void;
}

export default function CategoryNotebookControls({
    selectedDate,
    setSelectedDate,
    selectedCategory,
    setSelectedCategory,
    productCategories,
    orders,
    isUpdating,
    setShowPreview
}: CategoryNotebookControlsProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        DÍA
                    </label>
                    <input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                {/* Category Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría Específica (Opcional)
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="">Todas las categorías</option>
                        {productCategories.map((category) => (
                            <option key={category.name} value={category.name}>
                                {category.name} ({category.products.length} productos)
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
                        <p className="text-lg font-semibold text-green-600">
                            Total: ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowPreview(true)}
                        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Vista Previa</span>
                    </button>
                </div>

                {/* Loading Indicator */}
                {isUpdating && (
                    <div className="flex items-center space-x-2 text-green-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        <span className="text-sm">Actualizando...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
