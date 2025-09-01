import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProductOrder {
    productId: string;
    name: string;
    order: number;
}

interface CategoryOrder {
    categoryId: string;
    name: string;
    order: number;
    products: ProductOrder[];
    isExpanded: boolean;
}

interface ProductCategory {
    name: string;
    products: Array<{
        id: string;
        name: string;
    }>;
}

interface ColumnOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    allProductCategories: ProductCategory[];
    onOrderUpdated?: () => void;
}

// Componente para categorías arrastrables
const SortableCategory = ({
    category,
    onToggleExpand,
    onMoveUp,
    onMoveDown,
    onMoveToTop,
    onMoveToBottom,
    onMoveProductUp,
    onMoveProductDown
}: {
    category: CategoryOrder;
    onToggleExpand: (categoryId: string) => void;
    onMoveUp: (categoryId: string) => void;
    onMoveDown: (categoryId: string) => void;
    onMoveToTop: (categoryId: string) => void;
    onMoveToBottom: (categoryId: string) => void;
    onMoveProductUp: (categoryId: string, productId: string) => void;
    onMoveProductDown: (categoryId: string, productId: string) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.categoryId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white border border-gray-300 rounded-lg p-4 mb-3 shadow-sm ${isDragging ? 'shadow-lg' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-move p-1 hover:bg-gray-100 rounded"
                        title="Arrastrar para reordenar"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1-.001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
                        </svg>
                    </button>
                    <span className="font-semibold text-gray-800">{category.name}</span>
                </div>

                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => onMoveToTop(category.categoryId)}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                        title="Mover al inicio"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onMoveUp(category.categoryId)}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                        title="Mover arriba"
                    >
                        ↑
                    </button>
                    <button
                        onClick={() => onMoveDown(category.categoryId)}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                        title="Mover abajo"
                    >
                        ↓
                    </button>
                    <button
                        onClick={() => onMoveToBottom(category.categoryId)}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                        title="Mover al final"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M17 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zM3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onToggleExpand(category.categoryId)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        title={category.isExpanded ? "Contraer productos" : "Expandir productos"}
                    >
                        {category.isExpanded ? '−' : '+'}
                    </button>
                </div>
            </div>

            {category.isExpanded && (
                <div className="mt-3 pl-6 space-y-2">
                    {category.products.map((product, index) => (
                        <div key={product.productId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center space-x-2">
                                <button
                                    className="cursor-move p-1 hover:bg-gray-200 rounded"
                                    title="Arrastrar para reordenar"
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1-.001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
                                    </svg>
                                </button>
                                <span className="text-sm text-gray-700">{product.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => onMoveProductUp(category.categoryId, product.productId)}
                                    className="p-1 hover:bg-blue-100 rounded text-blue-600 text-xs"
                                    title="Mover arriba"
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={() => onMoveProductDown(category.categoryId, product.productId)}
                                    className="p-1 hover:bg-blue-100 rounded text-blue-600 text-xs"
                                    title="Mover abajo"
                                >
                                    ↓
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ColumnOrderModal: React.FC<ColumnOrderModalProps> = ({
    isOpen,
    onClose,
    allProductCategories,
    onOrderUpdated
}) => {
    const [categoriesOrder, setCategoriesOrder] = useState<CategoryOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Log cuando cambia el estado de categoriesOrder
    useEffect(() => {
        if (categoriesOrder.length > 0) {
            console.log('🔄 Estado categoriesOrder cambiado:', categoriesOrder.map(c => ({ name: c.name, order: c.order })));
        }
    }, [categoriesOrder]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Función para crear orden por defecto
    const createDefaultOrder = () => {
        const defaultOrder: CategoryOrder[] = allProductCategories.map((category, categoryIndex) => ({
            categoryId: category.name,
            name: category.name,
            order: categoryIndex,
            isExpanded: false,
            products: category.products.map((product, productIndex) => ({
                productId: product.id,
                name: product.name,
                order: productIndex
            }))
        }));
        setCategoriesOrder(defaultOrder);
    };

    // Cargar orden guardado o crear por defecto SOLO cuando se abre el modal
    useEffect(() => {
        console.log('🔄 useEffect modal - isOpen:', isOpen, 'isInitialized:', isInitialized, 'categoriesLength:', allProductCategories.length);

        if (isOpen && allProductCategories.length > 0 && !isInitialized) {
            setIsLoading(true);
            console.log('🚀 Inicializando modal con', allProductCategories.length, 'categorías');

            try {
                // Intentar cargar orden guardado primero
                const savedOrder = localStorage.getItem('megaDonutColumnOrder');

                if (savedOrder) {
                    try {
                        const parsedOrder = JSON.parse(savedOrder);
                        const savedCategories = parsedOrder.categories;

                        // Reconstruir el orden completo con los datos actuales
                        const restoredOrder: CategoryOrder[] = allProductCategories.map(category => {
                            const savedCategory = savedCategories.find((sc: any) => sc.categoryId === category.name);

                            if (savedCategory) {
                                // Usar orden guardado
                                const savedProducts = category.products.map(product => {
                                    const savedProduct = savedCategory.products.find((sp: any) => sp.productId === product.id);
                                    return {
                                        productId: product.id,
                                        name: product.name,
                                        order: savedProduct?.order || 999
                                    };
                                }).sort((a, b) => a.order - b.order);

                                return {
                                    categoryId: category.name,
                                    name: category.name,
                                    order: savedCategory.order,
                                    isExpanded: false,
                                    products: savedProducts
                                };
                            }

                            // Si no hay orden guardado, usar orden por defecto
                            return {
                                categoryId: category.name,
                                name: category.name,
                                order: 999,
                                isExpanded: false,
                                products: category.products.map((product, index) => ({
                                    productId: product.id,
                                    name: product.name,
                                    order: index
                                }))
                            };
                        }).sort((a, b) => a.order - b.order);

                        setCategoriesOrder(restoredOrder);
                        setIsInitialized(true);
                        console.log('✅ Orden de columnas restaurado desde localStorage');
                    } catch (error) {
                        console.error('Error parsing saved order:', error);
                        createDefaultOrder();
                        setIsInitialized(true);
                    }
                } else {
                    createDefaultOrder();
                    setIsInitialized(true);
                }
            } catch (error) {
                console.error('Error loading column order:', error);
                createDefaultOrder();
                setIsInitialized(true);
            }

            setIsLoading(false);
        }
    }, [isOpen, isInitialized]); // Solo depende de isOpen e isInitialized

    // Función para manejar el final del drag & drop
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setCategoriesOrder((items) => {
                const oldIndex = items.findIndex(item => item.categoryId === active.id);
                const newIndex = items.findIndex(item => item.categoryId === over?.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Funciones para mover categorías
    const moveCategoryUp = (categoryId: string) => {
        console.log('🔄 Moviendo categoría hacia arriba:', categoryId);
        setCategoriesOrder(prev => {
            const newOrder = [...prev];
            const currentIndex = newOrder.findIndex(cat => cat.categoryId === categoryId);

            if (currentIndex > 0) {
                [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
                // Actualizar el orden numérico
                newOrder.forEach((cat, index) => {
                    cat.order = index;
                });
                console.log('✅ Categoría movida hacia arriba, nuevo orden:', newOrder.map(c => ({ name: c.name, order: c.order })));
            }

            return newOrder;
        });
    };

    const moveCategoryDown = (categoryId: string) => {
        console.log('🔄 Moviendo categoría hacia abajo:', categoryId);
        setCategoriesOrder(prev => {
            const newOrder = [...prev];
            const currentIndex = newOrder.findIndex(cat => cat.categoryId === categoryId);

            if (currentIndex < newOrder.length - 1) {
                [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
                // Actualizar el orden numérico
                newOrder.forEach((cat, index) => {
                    cat.order = index;
                });
                console.log('✅ Categoría movida hacia abajo, nuevo orden:', newOrder.map(c => ({ name: c.name, order: c.order })));
            }

            return newOrder;
        });
    };

    const moveCategoryToTop = (categoryId: string) => {
        setCategoriesOrder(prev => {
            const newOrder = [...prev];
            const currentIndex = newOrder.findIndex(cat => cat.categoryId === categoryId);

            if (currentIndex > 0) {
                const category = newOrder.splice(currentIndex, 1)[0];
                newOrder.unshift(category);
                // Actualizar el orden numérico
                newOrder.forEach((cat, index) => {
                    cat.order = index;
                });
            }

            return newOrder;
        });
    };

    const moveCategoryToBottom = (categoryId: string) => {
        setCategoriesOrder(prev => {
            const newOrder = [...prev];
            const currentIndex = newOrder.findIndex(cat => cat.categoryId === categoryId);

            if (currentIndex < newOrder.length - 1) {
                const category = newOrder.splice(currentIndex, 1)[0];
                newOrder.push(category);
                // Actualizar el orden numérico
                newOrder.forEach((cat, index) => {
                    cat.order = index;
                });
            }

            return newOrder;
        });
    };

    // Funciones para mover productos
    const moveProductUp = (categoryId: string, productId: string) => {
        setCategoriesOrder(prev => {
            const newOrder = [...prev];
            const category = newOrder.find(cat => cat.categoryId === categoryId);

            if (category) {
                const productIndex = category.products.findIndex(prod => prod.productId === productId);

                if (productIndex > 0) {
                    [category.products[productIndex], category.products[productIndex - 1]] =
                        [category.products[productIndex - 1], category.products[productIndex]];

                    // Actualizar el orden numérico
                    category.products.forEach((prod, index) => {
                        prod.order = index;
                    });
                }
            }

            return newOrder;
        });
    };

    const moveProductDown = (categoryId: string, productId: string) => {
        setCategoriesOrder(prev => {
            const newOrder = [...prev];
            const category = newOrder.find(cat => cat.categoryId === categoryId);

            if (category) {
                const productIndex = category.products.findIndex(prod => prod.productId === productId);

                if (productIndex < category.products.length - 1) {
                    [category.products[productIndex], category.products[productIndex + 1]] =
                        [category.products[productIndex + 1], category.products[productIndex]];

                    // Actualizar el orden numérico
                    category.products.forEach((prod, index) => {
                        prod.order = index;
                    });
                }
            }

            return newOrder;
        });
    };

    // Función para expandir/contraer categorías
    const toggleCategoryExpansion = (categoryId: string) => {
        setCategoriesOrder(prev =>
            prev.map(cat =>
                cat.categoryId === categoryId
                    ? { ...cat, isExpanded: !cat.isExpanded }
                    : cat
            )
        );
    };

    // Función para guardar el orden
    const saveOrder = async () => {
        try {
            setIsSaving(true);

            // Guardar el orden en localStorage para persistencia en la sesión
            const orderData = {
                categories: categoriesOrder.map(cat => ({
                    categoryId: cat.categoryId,
                    order: cat.order,
                    products: cat.products.map(prod => ({
                        productId: prod.productId,
                        order: prod.order
                    }))
                })),
                timestamp: new Date().toISOString()
            };

            localStorage.setItem('megaDonutColumnOrder', JSON.stringify(orderData));

            console.log('✅ Orden de columnas guardado:', orderData);

            // Disparar evento personalizado para notificar el cambio
            window.dispatchEvent(new CustomEvent('megaDonutColumnOrderChanged'));

            // Mostrar mensaje de éxito
            alert('Orden de columnas guardado exitosamente. Se aplicará a todas las visualizaciones.');

            // NO llamar a onOrderUpdated aquí, solo cerrar el modal
            // El orden se aplicará automáticamente en el próximo render
            onClose();
        } catch (error) {
            console.error('Error saving column order:', error);
            alert('Error al guardar el orden de columnas');
        } finally {
            setIsSaving(false);
        }
    };

    // Función para manejar el cierre del modal
    const handleClose = () => {
        console.log('🚪 Cerrando modal, reseteando estado...');
        setIsInitialized(false);
        setCategoriesOrder([]);
        onClose();
    };

    // Función para resetear a orden por defecto
    const resetToDefault = () => {
        if (confirm('¿Estás seguro de que quieres resetear el orden a la configuración por defecto?')) {
            localStorage.removeItem('megaDonutColumnOrder');
            createDefaultOrder();
            alert('Orden reseteado a configuración por defecto');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Definir Orden de Columnas</h2>
                    <button
                        onClick={handleClose}
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Cargando orden de columnas...</span>
                        </div>
                    ) : (
                        <>
                            {/* Instructions */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-blue-800 mb-2">¿Cómo reordenar?</h3>
                                <p className="text-sm text-blue-700 mb-2">
                                    <strong>Para categorías:</strong> Usa los botones ↑↓ o arrastra el ícono de 6 puntos.
                                </p>
                                <p className="text-sm text-blue-700 mb-2">
                                    <strong>Para productos:</strong> Usa los botones ↑↓ dentro de cada categoría.
                                </p>
                                <p className="text-sm text-blue-800 mt-2">
                                    <strong>Instrucciones:</strong> Usa los botones ↑↓ para mover categorías y productos.
                                    Haz clic en una categoría para expandir/contraer sus productos.
                                    El orden se guarda automáticamente en tu navegador.
                                </p>
                            </div>

                            {/* Categories List */}
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={categoriesOrder.map(cat => cat.categoryId)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {categoriesOrder.map((category) => (
                                            <SortableCategory
                                                key={category.categoryId}
                                                category={category}
                                                onToggleExpand={toggleCategoryExpansion}
                                                onMoveUp={moveCategoryUp}
                                                onMoveDown={moveCategoryDown}
                                                onMoveToTop={moveCategoryToTop}
                                                onMoveToBottom={moveCategoryToBottom}
                                                onMoveProductUp={moveProductUp}
                                                onMoveProductDown={moveProductDown}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                    <button
                        onClick={resetToDefault}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Resetear a Default
                    </button>

                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={saveOrder}
                            disabled={isSaving || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Orden'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColumnOrderModal;
