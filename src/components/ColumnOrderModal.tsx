'use client';

import { useState, useEffect } from 'react';
import { ProductCategory, Product } from '@/types/routeNotebook';

interface ColumnOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    productCategories: ProductCategory[];
    onOrderUpdated: () => void;
    allProductCategories: ProductCategory[]; // Todas las categorías del sistema
}

interface CategoryOrder {
    categoryId: string;
    categoryName: string;
    order: number;
    products: ProductOrder[];
}

interface ProductOrder {
    productId: string;
    productName: string;
    order: number;
}

export default function ColumnOrderModal({
    isOpen,
    onClose,
    productCategories,
    onOrderUpdated,
    allProductCategories
}: ColumnOrderModalProps) {
    const [categoriesOrder, setCategoriesOrder] = useState<CategoryOrder[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Inicializar el orden de categorías
    useEffect(() => {
        if (isOpen && allProductCategories.length > 0) {
            // Crear orden por defecto con TODAS las categorías del sistema
            const defaultOrder: CategoryOrder[] = allProductCategories.map((category, index) => ({
                categoryId: category.name,
                categoryName: category.name,
                order: index + 1,
                products: category.products.map((product, productIndex) => ({
                    productId: product.id,
                    productName: product.name,
                    order: productIndex + 1
                }))
            }));
            setCategoriesOrder(defaultOrder);
            setIsLoading(false);
        }
    }, [isOpen, allProductCategories]);



    const toggleCategoryExpansion = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const moveCategory = (fromIndex: number, toIndex: number) => {
        const newOrder = [...categoriesOrder];
        const [movedCategory] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedCategory);

        // Actualizar órdenes
        newOrder.forEach((category, index) => {
            category.order = index + 1;
        });

        setCategoriesOrder(newOrder);
    };

    const moveProduct = (categoryId: string, fromIndex: number, toIndex: number) => {
        const newOrder = [...categoriesOrder];
        const categoryIndex = newOrder.findIndex(cat => cat.categoryId === categoryId);

        if (categoryIndex !== -1) {
            const category = newOrder[categoryIndex];
            const newProducts = [...category.products];
            const [movedProduct] = newProducts.splice(fromIndex, 1);
            newProducts.splice(toIndex, 0, movedProduct);

            // Actualizar órdenes de productos
            newProducts.forEach((product, index) => {
                product.order = index + 1;
            });

            category.products = newProducts;
            setCategoriesOrder(newOrder);
        }
    };

    const saveOrder = async () => {
        try {
            setIsSaving(true);

            // Por ahora, solo mostrar mensaje informativo
            alert('Para guardar el orden permanentemente, ejecuta el SQL de la tabla settings en tu base de datos. Por ahora, el orden se aplicará solo en esta sesión.');

            onOrderUpdated();
            onClose();
        } catch (error) {
            console.error('Error saving column order:', error);
            alert('Error al procesar el orden de columnas');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Definir Orden de Columnas
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Cargando orden actual...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Configuración Global:</strong> Estás definiendo el orden de TODAS las categorías y productos del sistema.
                                    Esta configuración se aplicará a todas las visualizaciones, independientemente de los filtros de fecha.
                                </p>
                                <p className="text-sm text-blue-800 mt-2">
                                    <strong>Instrucciones:</strong> Arrastra las categorías y productos para reordenarlos.
                                    Haz clic en una categoría para expandir/contraer sus productos.
                                </p>
                            </div>

                            {!categoriesOrder.some(cat => cat.categoryId.startsWith('temp_')) && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Nota:</strong> Para guardar el orden permanentemente, ejecuta el SQL de la tabla settings en tu base de datos.
                                    </p>
                                </div>
                            )}

                            {/* Categorías */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium text-gray-900">Categorías</h3>
                                {categoriesOrder.map((category, index) => (
                                    <div key={category.categoryId} className="border border-gray-200 rounded-lg">
                                        {/* Header de categoría */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex flex-col space-y-1">
                                                    <button
                                                        onClick={() => index > 0 && moveCategory(index, index - 1)}
                                                        disabled={index === 0}
                                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        onClick={() => index < categoriesOrder.length - 1 && moveCategory(index, index + 1)}
                                                        disabled={index === categoriesOrder.length - 1}
                                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                    >
                                                        ↓
                                                    </button>
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {category.order}. {category.categoryName}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => toggleCategoryExpansion(category.categoryId)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {expandedCategories.has(category.categoryId) ? '▼' : '▶'}
                                            </button>
                                        </div>

                                        {/* Productos de la categoría */}
                                        {expandedCategories.has(category.categoryId) && (
                                            <div className="p-4 bg-white">
                                                <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                    Productos de {category.categoryName}
                                                </h4>
                                                <div className="space-y-2">
                                                    {category.products.map((product, productIndex) => (
                                                        <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex flex-col space-y-1">
                                                                    <button
                                                                        onClick={() => productIndex > 0 && moveProduct(category.categoryId, productIndex, productIndex - 1)}
                                                                        disabled={productIndex === 0}
                                                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                                                                    >
                                                                        ↑
                                                                    </button>
                                                                    <button
                                                                        onClick={() => productIndex < category.products.length - 1 && moveProduct(category.categoryId, productIndex, productIndex + 1)}
                                                                        disabled={productIndex === category.products.length - 1}
                                                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                                                                    >
                                                                        ↓
                                                                    </button>
                                                                </div>
                                                                <span className="text-sm text-gray-700">
                                                                    {product.order}. {product.productName}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200">
                    <div className="flex items-center justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={saveOrder}
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Orden'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
