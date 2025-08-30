'use client';

import { useState, useEffect } from 'react';
import {
    FolderOpen,
    Plus,
    Search,
    ArrowLeft,
    Check,
    X,
    Edit,
    Trash2,
    Filter
} from 'lucide-react';
import { ProductCategory, CreateProductCategoryData } from '@/types/product';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Footer from './Footer';
import Swal from 'sweetalert2';

interface CategoryManagementProps {
    onBack: () => void;
}

export default function CategoryManagement({ onBack }: CategoryManagementProps) {
    const { isAuthenticated, isAdmin } = useAuth();
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Función helper para mapear categorías de la base de datos al formato TypeScript
    const mapCategoryFromDB = (category: any): ProductCategory => ({
        id: category.id,
        name: category.name,
        description: category.description,
        isActive: Boolean(category.is_active), // Asegurar que sea boolean
        createdAt: new Date(category.created_at),
        updatedAt: new Date(category.updated_at)
    });

    const [formData, setFormData] = useState<CreateProductCategoryData>({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Auth state:', { isAuthenticated, isAdmin });

            // Verificar autenticación usando el contexto
            if (!isAuthenticated) {
                setError('Usuario no autenticado');
                return;
            }

            const { data, error } = await supabase
                .from('product_categories')
                .select('*')
                .order('name');

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Categories fetched:', data);

            // Mapear los datos de la base de datos al formato TypeScript
            const mappedCategories = (data || []).map(mapCategoryFromDB);

            console.log('Mapped categories:', mappedCategories);
            setCategories(mappedCategories);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Error al cargar las categorías: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        try {
            // Verificar autenticación usando el contexto
            if (!isAuthenticated) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Usuario no autenticado',
                });
                return;
            }

            const { data, error } = await supabase
                .from('product_categories')
                .insert([formData])
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Mapear la nueva categoría al formato TypeScript
            const mappedCategory = mapCategoryFromDB(data);

            setCategories([...categories, mappedCategory]);
            setShowCreateModal(false);
            resetForm();
        } catch (err) {
            console.error('Error creating category:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al crear la categoría: ' + (err as Error).message,
            });
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory) return;

        try {
            // Verificar autenticación usando el contexto
            if (!isAuthenticated) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Usuario no autenticado',
                });
                return;
            }

            const { data, error } = await supabase
                .from('product_categories')
                .update(formData)
                .eq('id', editingCategory.id)
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Mapear la categoría actualizada al formato TypeScript
            const mappedCategory = mapCategoryFromDB(data);

            setCategories(categories.map(cat =>
                cat.id === editingCategory.id ? mappedCategory : cat
            ));
            setEditingCategory(null);
            resetForm();
        } catch (err) {
            console.error('Error updating category:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al actualizar la categoría: ' + (err as Error).message,
            });
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
        try {
            // Verificar autenticación usando el contexto
            if (!isAuthenticated) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Usuario no autenticado',
                    });
                return;
            }

            const { error } = await supabase
                .from('product_categories')
                .delete()
                .eq('id', categoryId);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            setCategories(categories.filter(cat => cat.id !== categoryId));
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'La categoría ha sido eliminada.',
                });
        } catch (err) {
            console.error('Error deleting category:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar la categoría: ' + (err as Error).message,
                });
            }
        }
    };

    const handleToggleActive = async (categoryId: string) => {
        const category = categories.find(cat => cat.id === categoryId);
        if (!category) return;

        try {
            // Verificar autenticación usando el contexto
            if (!isAuthenticated) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Usuario no autenticado',
                });
                return;
            }

            const { error } = await supabase
                .from('product_categories')
                .update({ is_active: !category.isActive })
                .eq('id', categoryId);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Actualizar el estado local directamente sin hacer otra consulta
            const updatedCategories = categories.map(cat =>
                cat.id === categoryId ? { ...cat, isActive: !category.isActive } : cat
            );

            console.log('Category before toggle:', category);
            console.log('Updated categories:', updatedCategories);

            setCategories(updatedCategories);

            Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: `La categoría "${category.name}" ha sido ${!category.isActive ? 'activada' : 'desactivada'}.`,
            });
        } catch (err) {
            console.error('Error toggling category status:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cambiar el estado de la categoría: ' + (err as Error).message,
            });
        }
    };

    // Funciones para selección múltiple
    const handleSelectCategory = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(filteredCategories.map(cat => cat.id));
        }
        setSelectAll(!selectAll);
    };

    const handleBulkDelete = async () => {
        if (selectedCategories.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No hay categorías seleccionadas',
                text: 'Por favor, selecciona al menos una categoría para eliminar.',
            });
            return;
        }

        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: `¿Está seguro de que desea eliminar ${selectedCategories.length} categoría(s)? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            try {
                // Verificar autenticación usando el contexto
                if (!isAuthenticated) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Usuario no autenticado',
                    });
                    return;
                }

                const { error } = await supabase
                    .from('product_categories')
                    .delete()
                    .in('id', selectedCategories);

                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }

                setCategories(categories.filter(cat => !selectedCategories.includes(cat.id)));
                setSelectedCategories([]);
                setSelectAll(false);

                Swal.fire({
                    icon: 'success',
                    title: 'Categorías eliminadas',
                    text: `${selectedCategories.length} categoría(s) han sido eliminadas exitosamente.`,
                });
            } catch (err) {
                console.error('Error deleting categories:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar las categorías: ' + (err as Error).message,
                });
            }
        }
    };

    const handleBulkToggleStatus = async (activate: boolean) => {
        if (selectedCategories.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No hay categorías seleccionadas',
                text: 'Por favor, selecciona al menos una categoría.',
            });
            return;
        }

        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: `¿Está seguro de que desea ${activate ? 'activar' : 'desactivar'} ${selectedCategories.length} categoría(s)?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: activate ? '#28a745' : '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${activate ? 'activar' : 'desactivar'}`,
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            try {
                // Verificar autenticación usando el contexto
                if (!isAuthenticated) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Usuario no autenticado',
                    });
                    return;
                }

                const { error } = await supabase
                    .from('product_categories')
                    .update({ is_active: activate })
                    .in('id', selectedCategories);

                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }

                // Actualizar el estado local directamente
                setCategories(categories.map(cat =>
                    selectedCategories.includes(cat.id)
                        ? { ...cat, isActive: activate }
                        : cat
                ));

                Swal.fire({
                    icon: 'success',
                    title: 'Estado actualizado',
                    text: `${selectedCategories.length} categoría(s) han sido ${activate ? 'activadas' : 'desactivadas'} exitosamente.`,
                });
            } catch (err) {
                console.error('Error updating categories status:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al actualizar el estado de las categorías: ' + (err as Error).message,
                });
            }
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Verificar si alguna categoría tiene descripción
    const hasAnyDescription = categories.some(category => category.description && category.description.trim() !== '');

    const openEditModal = (category: ProductCategory) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || ''
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: ''
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingCategory(null);
        resetForm();
    };

    const handleModalBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando categorías...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col">
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <FolderOpen className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
                                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Gestión de categorías</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center justify-center lg:justify-start space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors w-full lg:w-auto"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="text-sm lg:text-base">Agregar nueva categoría</span>
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <X className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Error
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        {error}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar categorías..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600 text-sm lg:text-base"
                            />
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedCategories.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-blue-800">
                                        {selectedCategories.length} categoría(s) seleccionada(s)
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 lg:space-x-3">
                                    <button
                                        onClick={() => handleBulkToggleStatus(true)}
                                        className="flex items-center space-x-1 lg:space-x-2 bg-green-500 text-white px-2 lg:px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors text-xs lg:text-sm"
                                    >
                                        <Check className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span>Activar</span>
                                    </button>
                                    <button
                                        onClick={() => handleBulkToggleStatus(false)}
                                        className="flex items-center space-x-1 lg:space-x-2 bg-yellow-500 text-white px-2 lg:px-3 py-1.5 rounded-md hover:bg-yellow-600 transition-colors text-xs lg:text-sm"
                                    >
                                        <X className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span>Desactivar</span>
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center space-x-1 lg:space-x-2 bg-red-500 text-white px-2 lg:px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors text-xs lg:text-sm"
                                    >
                                        <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Categories Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {/* Mobile view - Cards */}
                        <div className="lg:hidden">
                            {filteredCategories.map((category) => (
                                <div key={category.id} className="border-b border-gray-200 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category.id)}
                                                onChange={() => handleSelectCategory(category.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 cursor-pointer"
                                            />
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                                        <FolderOpen className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleToggleActive(category.id)}
                                                className="text-gray-600 hover:text-gray-900 p-1"
                                                title={category.isActive ? 'Desactivar categoría' : 'Activar categoría'}
                                            >
                                                {category.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => openEditModal(category)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Editar categoría"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Eliminar categoría"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                                        </div>
                                        {hasAnyDescription && (
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    {category.description || 'Sin descripción'}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {category.isActive ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop view - Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 cursor-pointer hover:border-orange-400 transition-colors"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        {hasAnyDescription && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Descripción
                                        </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Opciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCategories.map((category) => (
                                        <tr key={category.id} className={`hover:bg-gray-50 ${selectedCategories.includes(category.id) ? 'bg-blue-50' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(category.id)}
                                                    onChange={() => handleSelectCategory(category.id)}
                                                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 cursor-pointer hover:border-orange-400 transition-colors"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                            <FolderOpen className="h-5 w-5 text-orange-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {category.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {hasAnyDescription && (
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {category.description || 'Sin descripción'}
                                                </div>
                                            </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${category.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {category.isActive ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleToggleActive(category.id)}
                                                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                                                        title={category.isActive ? 'Desactivar categoría' : 'Activar categoría'}
                                                    >
                                                        {category.isActive ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                                        <span>{category.isActive ? 'Desactivar' : 'Activar'}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(category)}
                                                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-xs font-medium border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                                                        title="Editar categoría"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                        <span>Editar</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                        className="flex items-center space-x-1 text-red-600 hover:text-red-900 px-2 py-1 rounded text-xs font-medium border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                                                        title="Eliminar categoría"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                        <span>Eliminar</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Total categorías</p>
                                    <p className="text-lg lg:text-2xl font-bold text-gray-900">{categories.length}</p>
                                </div>
                                <FolderOpen className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
                            </div>
                        </div>

                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Categorías activas</p>
                                    <p className="text-lg lg:text-2xl font-bold text-green-600">
                                        {categories.filter(category => category.isActive).length}
                                    </p>
                                </div>
                                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Categorías inactivas</p>
                                    <p className="text-lg lg:text-2xl font-bold text-red-600">
                                        {categories.filter(category => !category.isActive).length}
                                    </p>
                                </div>
                                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingCategory) && (
                <div
                    className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
                    onClick={handleModalBackdropClick}
                >
                    <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingCategory ? 'Modificar categoría' : 'Registrar nueva categoría'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre de la categoría *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                        placeholder="Ejemplo: Donuts"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                        placeholder="Descripción opcional de la categoría"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={closeModal}
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancelar</span>
                                </button>
                                <button
                                    onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                                    disabled={!formData.name.trim()}
                                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Check className="h-4 w-4" />
                                    <span>{editingCategory ? 'Guardar cambios' : 'Registrar categoría'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
