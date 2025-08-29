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
import Footer from './Footer';

interface CategoryManagementProps {
    onBack: () => void;
}

export default function CategoryManagement({ onBack }: CategoryManagementProps) {
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

            // Verificar autenticación
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
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
            setCategories(data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Error al cargar las categorías: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        try {
            // Verificar autenticación
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Usuario no autenticado');
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

            setCategories([...categories, data]);
            setShowCreateModal(false);
            resetForm();
        } catch (err) {
            console.error('Error creating category:', err);
            alert('Error al crear la categoría: ' + (err as Error).message);
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory) return;

        try {
            // Verificar autenticación
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Usuario no autenticado');
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

            setCategories(categories.map(cat =>
                cat.id === editingCategory.id ? data : cat
            ));
            setEditingCategory(null);
            resetForm();
        } catch (err) {
            console.error('Error updating category:', err);
            alert('Error al actualizar la categoría: ' + (err as Error).message);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm('¿Está seguro de que desea eliminar esta categoría? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            // Verificar autenticación
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Usuario no autenticado');
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
        } catch (err) {
            console.error('Error deleting category:', err);
            alert('Error al eliminar la categoría: ' + (err as Error).message);
        }
    };

    const handleToggleActive = async (categoryId: string) => {
        const category = categories.find(cat => cat.id === categoryId);
        if (!category) return;

        try {
            // Verificar autenticación
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Usuario no autenticado');
                return;
            }

            const { data, error } = await supabase
                .from('product_categories')
                .update({ is_active: !category.isActive })
                .eq('id', categoryId)
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            setCategories(categories.map(cat =>
                cat.id === categoryId ? data : cat
            ));
        } catch (err) {
            console.error('Error toggling category status:', err);
            alert('Error al cambiar el estado de la categoría: ' + (err as Error).message);
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <FolderOpen className="h-8 w-8 text-orange-500" />
                                <h1 className="text-2xl font-bold text-gray-900">Gestión de categorías</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Agregar nueva categoría</span>
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
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* Categories Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Descripción
                                        </th>
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
                                        <tr key={category.id} className="hover:bg-gray-50">
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
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {category.description || 'Sin descripción'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${category.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {category.isActive ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button
                                                        onClick={() => handleToggleActive(category.id)}
                                                        className="text-gray-400 hover:text-gray-600 p-1 rounded"
                                                        title={category.isActive ? 'Desactivar categoría' : 'Activar categoría'}
                                                    >
                                                        <Filter className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(category)}
                                                        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded text-xs font-medium border border-blue-200 hover:bg-blue-50"
                                                        title="Editar categoría"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                        className="text-red-600 hover:text-red-900 px-3 py-1 rounded text-xs font-medium border border-red-200 hover:bg-red-50"
                                                        title="Eliminar categoría"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total categorías</p>
                                    <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                                </div>
                                <FolderOpen className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Categorías activas</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {categories.filter(category => category.isActive).length}
                                    </p>
                                </div>
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Categorías inactivas</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {categories.filter(category => !category.isActive).length}
                                    </p>
                                </div>
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
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
