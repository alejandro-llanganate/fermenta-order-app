'use client';

import { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Plus,
    Search,
    ArrowLeft,
    Check,
    X,
    UserCheck,
    UserX,
    Filter,
    DollarSign,
    Upload,
    Image as ImageIcon
} from 'lucide-react';
import { Product, CreateProductData, ProductCategory } from '@/types/product';
import { supabase } from '@/lib/supabase';
import Footer from './Footer';

interface ProductsManagementProps {
    onBack: () => void;
}

export default function ProductsManagement({ onBack }: ProductsManagementProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedProductForExport, setSelectedProductForExport] = useState<string>('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('Todos');
    const [loading, setLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState<CreateProductData>({
        name: '',
        categoryId: '',
        variant: '',
        priceRegular: 0,
        pricePage: undefined,
        description: '',
        imageUrl: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('product_categories')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (categoriesError) throw categoriesError;
            setCategories(categoriesData || []);

            // Fetch products with category information
            const { data: productsData, error: productsError } = await supabase
                .from('products_with_categories')
                .select('*')
                .order('category_name, name');

            if (productsError) throw productsError;
            setProducts(productsData || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            alert('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        try {
            setUploadingImage(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `product-images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            setFormData({ ...formData, imageUrl: publicUrl });
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Error al subir la imagen');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCreateProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([formData])
                .select()
                .single();

            if (error) throw error;

            // Fetch the product with category information
            const { data: productWithCategory } = await supabase
                .from('products_with_categories')
                .select('*')
                .eq('id', data.id)
                .single();

            if (productWithCategory) {
                setProducts([...products, productWithCategory]);
            }

            setShowCreateModal(false);
            resetForm();
        } catch (err) {
            console.error('Error creating product:', err);
            alert('Error al crear el producto');
        }
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct) return;

        try {
            const { data, error } = await supabase
                .from('products')
                .update(formData)
                .eq('id', editingProduct.id)
                .select()
                .single();

            if (error) throw error;

            // Fetch the updated product with category information
            const { data: productWithCategory } = await supabase
                .from('products_with_categories')
                .select('*')
                .eq('id', editingProduct.id)
                .single();

            if (productWithCategory) {
                setProducts(products.map(product =>
                    product.id === editingProduct.id ? productWithCategory : product
                ));
            }

            setEditingProduct(null);
            resetForm();
        } catch (err) {
            console.error('Error updating product:', err);
            alert('Error al actualizar el producto');
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm('¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;

            setProducts(products.filter(product => product.id !== productId));
        } catch (err) {
            console.error('Error deleting product:', err);
            alert('Error al eliminar el producto');
        }
    };

    const handleToggleActive = async (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        try {
            const { data, error } = await supabase
                .from('products')
                .update({ is_active: !product.isActive })
                .eq('id', productId)
                .select()
                .single();

            if (error) throw error;

            // Fetch the updated product with category information
            const { data: productWithCategory } = await supabase
                .from('products_with_categories')
                .select('*')
                .eq('id', productId)
                .single();

            if (productWithCategory) {
                setProducts(products.map(p =>
                    p.id === productId ? productWithCategory : p
                ));
            }
        } catch (err) {
            console.error('Error toggling product status:', err);
            alert('Error al cambiar el estado del producto');
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.variant.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = filterCategory === 'Todos' || product.categoryId === filterCategory;

        return matchesSearch && matchesCategory;
    });

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            categoryId: product.categoryId,
            variant: product.variant,
            priceRegular: product.priceRegular,
            pricePage: product.pricePage,
            description: product.description || '',
            imageUrl: product.imageUrl || ''
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            categoryId: '',
            variant: '',
            priceRegular: 0,
            pricePage: undefined,
            description: '',
            imageUrl: ''
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingProduct(null);
        resetForm();
    };

    const handleModalBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const formatPrice = (price: number | undefined) => {
        return price ? `$${price.toFixed(2)}` : 'N/A';
    };

    const getCategoryIcon = (_category: string) => {
        return <ShoppingBag className="h-5 w-5 text-orange-600" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando productos...</p>
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
                                <ShoppingBag className="h-8 w-8 text-orange-500" />
                                <h1 className="text-2xl font-bold text-gray-900">Gestión de productos</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Agregar nuevo producto</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, categoría o variante..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                    />
                                </div>
                            </div>
                            <div className="md:w-64">
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                                    >
                                        <option value="Todos">Todas las categorías</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Producto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Variante
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Precio regular
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Precio PAGINA
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
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {product.imageUrl ? (
                                                            <img
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                className="h-10 w-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                                {getCategoryIcon(product.categoryName)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {product.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {product.categoryName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {product.variant}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-1">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatPrice(product.priceRegular)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-1">
                                                    <DollarSign className="h-4 w-4 text-orange-600" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatPrice(product.pricePage)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${product.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.isActive ? 'Disponible' : 'No disponible'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button
                                                        onClick={() => handleToggleActive(product.id)}
                                                        className="text-gray-400 hover:text-gray-600 p-1 rounded"
                                                        title={product.isActive ? 'Marcar como no disponible' : 'Marcar como disponible'}
                                                    >
                                                        {product.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded text-xs font-medium border border-blue-200 hover:bg-blue-50"
                                                        title="Editar producto"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="text-red-600 hover:text-red-900 px-3 py-1 rounded text-xs font-medium border border-red-200 hover:bg-red-50"
                                                        title="Eliminar producto"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Create/Edit Modal */}
                    {(showCreateModal || editingProduct) && (
                        <div
                            className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
                            onClick={handleModalBackdropClick}
                        >
                            <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingProduct ? 'Modificar producto' : 'Registrar nuevo producto'}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre del producto *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                                placeholder="Ejemplo: Donut Chocolate"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Categoría *
                                            </label>
                                            <select
                                                value={formData.categoryId}
                                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                                            >
                                                <option value="">Seleccionar categoría</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>{category.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Variante *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.variant}
                                                onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                                placeholder="Ejemplo: Chocolate"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Precio regular *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.priceRegular}
                                                onChange={(e) => setFormData({ ...formData, priceRegular: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Precio PAGINA
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.pricePage || ''}
                                                onChange={(e) => setFormData({ ...formData, pricePage: e.target.value ? parseFloat(e.target.value) : undefined })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                                placeholder="0.00 (opcional)"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Imagen (opcional)
                                            </label>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            handleImageUpload(file);
                                                        }
                                                    }}
                                                    className="hidden"
                                                    id="image-upload"
                                                />
                                                <label
                                                    htmlFor="image-upload"
                                                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                                >
                                                    <Upload className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm text-gray-700">
                                                        {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                                                    </span>
                                                </label>
                                                {formData.imageUrl && (
                                                    <div className="flex items-center space-x-2">
                                                        <ImageIcon className="h-4 w-4 text-green-500" />
                                                        <span className="text-xs text-green-600">Imagen cargada</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Descripción
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                                placeholder="Descripción opcional del producto"
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
                                            onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                                            disabled={!formData.name.trim() || !formData.categoryId || !formData.variant.trim() || formData.priceRegular <= 0}
                                            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Check className="h-4 w-4" />
                                            <span>{editingProduct ? 'Guardar cambios' : 'Registrar producto'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistics */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total productos</p>
                                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                                </div>
                                <ShoppingBag className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Productos disponibles</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {products.filter(product => product.isActive).length}
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
                                    <p className="text-sm font-medium text-gray-600">Categorías</p>
                                    <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
                                </div>
                                <Filter className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Precio promedio</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        ${products.length > 0 ? (products.reduce((sum, p) => sum + p.priceRegular, 0) / products.length).toFixed(2) : '0.00'}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
} 