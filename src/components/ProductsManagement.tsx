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
import { Product, CreateProductData, ProductCategory, ProductVariant } from '@/types/product';
import { mockProducts } from '@/data/mockProducts';
import { mockOrders } from '@/data/mockOrders';
import Footer from './Footer';

interface ProductsManagementProps {
    onBack: () => void;
}

export default function ProductsManagement({ onBack }: ProductsManagementProps) {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedProductForExport, setSelectedProductForExport] = useState<string>('');
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

    const getVariantsByCategory = (category: ProductCategory): ProductVariant[] => {
        switch (category) {
            case 'Donut':
            case 'Mini donut':
                return ['choco', 'choco grajeas', 'choco coco', 'glase', 'glase grajeas', 'glase coco'] as ProductVariant[];
            case 'Rellenas':
            case 'Mini rellenas':
                return ['chantilly', 'manjar'] as ProductVariant[];
            case 'Orejas':
                return ['orejas', 'mini orejas'] as ProductVariant[];
            case 'Pizzas':
                return ['cuadrada', 'redonda', 'mini'] as ProductVariant[];
            case 'Pan choco':
                return ['panes', 'mini panes'] as ProductVariant[];
            case 'Melvas':
                return ['melvas', 'mini melvas'] as ProductVariant[];
            case 'Muffins':
                return ['normales', 'manjar'] as ProductVariant[];
            case 'Panes':
                return ['hamburguesa', 'mini hamburguesa', 'hot dog', 'mini hot dog', 'gusano', 'mini gusano'] as ProductVariant[];
            case 'Pasteles chocolate':
            case 'Pasteles de naranja':
                return ['normales', 'choco grajeas', 'sin cortar (s/c)', 'x12', 'x14', 'decorados'] as ProductVariant[];
            default:
                return ['normales'] as ProductVariant[];
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

    const getCategoryIcon = (_category: ProductCategory) => {
        return <ShoppingBag className="h-5 w-5 text-orange-600" />;
    };

    // Funciones para exportación por producto
    const openExportModal = () => {
        setShowExportModal(true);
    };

    const generateProductExportPDF = async () => {
        if (!selectedProductForExport) return;

        try {
            // Importar dinámicamente para evitar errores de SSR
            const jsPDF = (await import('jspdf')).default;
            const html2canvas = (await import('html2canvas')).default;

            const exportRef = document.getElementById('product-export-content');
            if (!exportRef) return;

            const canvas = await html2canvas(exportRef, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const product = products.find(p => p.id === selectedProductForExport);
            const productName = product ? `${product.name}-${product.category}-${product.variant}` : 'producto';
            pdf.save(`Reporte-Pedidos-${productName}-${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`);
        } catch (error) {
            console.error('Error generando PDF de exportación por producto:', error);
            alert('Error al generar el PDF de exportación. Por favor, inténtalo de nuevo.');
        }
    };

    // Obtener pedidos por producto
    const getOrdersByProduct = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return [];

        return mockOrders.filter(order =>
            order.items.some(item =>
                item.productName === product.name &&
                item.productCategory === product.category &&
                item.productVariant === product.variant
            )
        );
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
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Agregar nuevo producto</span>
                            </button>
                            <button
                                onClick={openExportModal}
                                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <DollarSign className="h-4 w-4" />
                                <span>Exportar por producto</span>
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
                                                onChange={(e) => setFormData({ ...formData, variant: e.target.value as ProductVariant })}
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

            {/* Modal de Exportación por Producto */}
            {showExportModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={handleModalBackdropClick}
                >
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Exportar Pedidos por Producto</h2>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={generateProductExportPDF}
                                        disabled={!selectedProductForExport}
                                        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <DollarSign className="h-4 w-4" />
                                        <span>Generar PDF</span>
                                    </button>
                                    <button
                                        onClick={() => setShowExportModal(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Selector de Producto */}
                        <div className="p-6 border-b border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccionar Producto
                            </label>
                            <select
                                value={selectedProductForExport}
                                onChange={(e) => setSelectedProductForExport(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="">Seleccionar un producto</option>
                                {products.filter(product => product.isActive).map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} - {product.category} - {product.variant}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Contenido de Exportación */}
                        {selectedProductForExport && (
                            <div id="product-export-content" className="p-6">
                                {(() => {
                                    const product = products.find(p => p.id === selectedProductForExport);
                                    const productOrders = getOrdersByProduct(selectedProductForExport);
                                    const totalQuantity = productOrders.reduce((sum, order) => {
                                        return sum + order.items.reduce((itemSum, item) => {
                                            if (item.productName === product?.name &&
                                                item.productCategory === product?.category &&
                                                item.productVariant === product?.variant) {
                                                return itemSum + item.quantity;
                                            }
                                            return itemSum;
                                        }, 0);
                                    }, 0);
                                    const totalValue = productOrders.reduce((sum, order) => {
                                        return sum + order.items.reduce((itemSum, item) => {
                                            if (item.productName === product?.name &&
                                                item.productCategory === product?.category &&
                                                item.productVariant === product?.variant) {
                                                return itemSum + item.individualValue;
                                            }
                                            return itemSum;
                                        }, 0);
                                    }, 0);

                                    if (!product) return <p className="text-gray-500">Producto no encontrado</p>;

                                    return (
                                        <div className="space-y-6">
                                            {/* Header del Reporte */}
                                            <div className="text-center border-b border-gray-200 pb-4">
                                                <h1 className="text-2xl font-bold text-black">Mega Donut</h1>
                                                <h2 className="text-xl font-semibold text-gray-800">Reporte de Pedidos por Producto</h2>
                                                <p className="text-sm text-gray-500">
                                                    Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                                                </p>
                                            </div>

                                            {/* Información del Producto */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Producto</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Nombre</p>
                                                        <p className="text-lg font-semibold text-gray-900">{product.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Categoría</p>
                                                        <p className="text-lg font-semibold text-gray-900">{product.category}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Variante</p>
                                                        <p className="text-lg font-semibold text-gray-900">{product.variant}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Precio Regular</p>
                                                        <p className="text-lg font-semibold text-green-600">${product.priceRegular.toFixed(2)}</p>
                                                    </div>
                                                    {product.pricePage && (
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-600">Precio PAGINA</p>
                                                            <p className="text-lg font-semibold text-orange-600">${product.pricePage.toFixed(2)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Resumen */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 p-4 rounded-lg">
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                                                    <p className="text-2xl font-bold text-blue-600">{productOrders.length}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-gray-600">Cantidad Total</p>
                                                    <p className="text-2xl font-bold text-green-600">{totalQuantity}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                                                    <p className="text-2xl font-bold text-purple-600">${totalValue.toFixed(2)}</p>
                                                </div>
                                            </div>

                                            {/* Tabla de Pedidos */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Pedidos</h3>
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full border border-gray-300">
                                                        <thead>
                                                            <tr className="bg-gray-100">
                                                                <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">Número</th>
                                                                <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">Cliente</th>
                                                                <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">Fecha</th>
                                                                <th className="border border-gray-300 px-3 py-2 text-center text-black font-semibold">Cantidad</th>
                                                                <th className="border border-gray-300 px-3 py-2 text-right text-black font-semibold">Precio Unit.</th>
                                                                <th className="border border-gray-300 px-3 py-2 text-right text-black font-semibold">Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {productOrders.map((order, index) => {
                                                                const productItems = order.items.filter(item =>
                                                                    item.productName === product.name &&
                                                                    item.productCategory === product.category &&
                                                                    item.productVariant === product.variant
                                                                );

                                                                return productItems.map((item, itemIndex) => (
                                                                    <tr key={`${order.id}-${itemIndex}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                        <td className="border border-gray-300 px-3 py-2 text-black">{order.orderNumber}</td>
                                                                        <td className="border border-gray-300 px-3 py-2 text-black">{order.clientName}</td>
                                                                        <td className="border border-gray-300 px-3 py-2 text-black">{order.orderDate.toLocaleDateString('es-ES')}</td>
                                                                        <td className="border border-gray-300 px-3 py-2 text-center text-black">{item.quantity}</td>
                                                                        <td className="border border-gray-300 px-3 py-2 text-right text-black">${item.unitPrice.toFixed(2)}</td>
                                                                        <td className="border border-gray-300 px-3 py-2 text-right font-medium text-black">${item.individualValue.toFixed(2)}</td>
                                                                    </tr>
                                                                ));
                                                            })}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className="bg-gray-100">
                                                                <td colSpan={3} className="border border-gray-300 px-3 py-2 text-right font-bold text-black">TOTALES:</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-center font-bold text-black">{totalQuantity}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-right font-bold text-black">-</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-right font-bold text-lg text-black">${totalValue.toFixed(2)}</td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="mt-8 pt-4 border-t border-gray-300">
                                                <p className="text-center text-sm text-gray-800 font-medium">
                                                    Reporte generado para Mega Donut<br />
                                                    {productOrders.length} pedidos con {product.name}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
} 