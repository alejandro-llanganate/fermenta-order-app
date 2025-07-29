'use client';

import { useState } from 'react';
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
    DollarSign
} from 'lucide-react';
import { Product, CreateProductData, ProductCategory } from '@/types/product';
import { mockProducts } from '@/data/mockProducts';
import Footer from './Footer';

interface ProductsManagementProps {
    onBack: () => void;
}

export default function ProductsManagement({ onBack }: ProductsManagementProps) {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [filterCategory, setFilterCategory] = useState<ProductCategory | 'Todos'>('Todos');

    const [formData, setFormData] = useState<CreateProductData>({
        name: '',
        category: 'Donut',
        variant: 'choco',
        priceRegular: 0,
        pricePage: undefined,
        description: ''
    });

    const categories: ProductCategory[] = [
        'Donut', 'Rellenas', 'Mini donut', 'Mini rellenas', 'Orejas', 'Pizzas',
        'Pan choco', 'Melvas', 'Muffins', 'Panes', 'Pasteles chocolate', 'Pasteles de naranja'
    ];

    const getVariantsByCategory = (category: ProductCategory) => {
        switch (category) {
            case 'Donut':
            case 'Mini donut':
                return ['choco', 'choco grajeas', 'choco coco', 'glase', 'glase grajeas', 'glase coco'];
            case 'Rellenas':
            case 'Mini rellenas':
                return ['chantilly', 'manjar'];
            case 'Orejas':
                return ['orejas', 'mini orejas'];
            case 'Pizzas':
                return ['cuadrada', 'redonda', 'mini'];
            case 'Pan choco':
                return ['panes', 'mini panes'];
            case 'Melvas':
                return ['melvas', 'mini melvas'];
            case 'Muffins':
                return ['normales', 'manjar'];
            case 'Panes':
                return ['hamburguesa', 'mini hamburguesa', 'hot dog', 'mini hot dog', 'gusano', 'mini gusano'];
            case 'Pasteles chocolate':
            case 'Pasteles de naranja':
                return ['normales', 'choco grajeas', 'sin cortar (s/c)', 'x12', 'x14', 'decorados'];
            default:
                return ['normales'];
        }
    };

    const handleCreateProduct = () => {
        const newProduct: Product = {
            id: Date.now().toString(),
            name: formData.name,
            category: formData.category,
            variant: formData.variant,
            priceRegular: formData.priceRegular,
            pricePage: formData.pricePage,
            description: formData.description,
            isActive: true,
            createdAt: new Date()
        };

        setProducts([...products, newProduct]);
        setShowCreateModal(false);
        resetForm();
    };

    const handleUpdateProduct = () => {
        if (!editingProduct) return;

        const updatedProducts = products.map(product =>
            product.id === editingProduct.id
                ? { ...product, ...formData }
                : product
        );

        setProducts(updatedProducts);
        setEditingProduct(null);
        resetForm();
    };

    const handleDeleteProduct = (productId: string) => {
        if (confirm('¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer.')) {
            setProducts(products.filter(product => product.id !== productId));
        }
    };

    const handleToggleActive = (productId: string) => {
        setProducts(products.map(product =>
            product.id === productId
                ? { ...product, isActive: !product.isActive }
                : product
        ));
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.variant.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = filterCategory === 'Todos' || product.category === filterCategory;

        return matchesSearch && matchesCategory;
    });

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            variant: product.variant,
            priceRegular: product.priceRegular,
            pricePage: product.pricePage,
            description: product.description || ''
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Donut',
            variant: 'choco',
            priceRegular: 0,
            pricePage: undefined,
            description: ''
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

    const getCategoryIcon = (category: ProductCategory) => {
        return <ShoppingBag className="h-5 w-5 text-orange-600" />;
    };

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
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Agregar nuevo producto</span>
                        </button>
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
                                        onChange={(e) => setFilterCategory(e.target.value as ProductCategory | 'Todos')}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                                    >
                                        <option value="Todos">Todas las categorías</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
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
                                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                            {getCategoryIcon(product.category)}
                                                        </div>
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
                                                    {product.category}
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
                                                value={formData.category}
                                                onChange={(e) => {
                                                    const newCategory = e.target.value as ProductCategory;
                                                    const variants = getVariantsByCategory(newCategory);
                                                    setFormData({
                                                        ...formData,
                                                        category: newCategory,
                                                        variant: variants[0]
                                                    });
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                                            >
                                                {categories.map(category => (
                                                    <option key={category} value={category}>{category}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Variante *
                                            </label>
                                            <select
                                                value={formData.variant}
                                                onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                                            >
                                                {getVariantsByCategory(formData.category).map(variant => (
                                                    <option key={variant} value={variant}>{variant}</option>
                                                ))}
                                            </select>
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
                                            disabled={!formData.name.trim() || formData.priceRegular <= 0}
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
                                        ${(products.reduce((sum, p) => sum + p.priceRegular, 0) / products.length).toFixed(2)}
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