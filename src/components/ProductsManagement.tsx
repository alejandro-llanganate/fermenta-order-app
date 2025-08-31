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
    Image as ImageIcon,
    Edit,
    Trash2,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { Product, CreateProductData, ProductCategory } from '@/types/product';
import { supabase } from '@/lib/supabase';
import Footer from './Footer';
import Swal from 'sweetalert2';

interface ProductsManagementProps {
    onBack: () => void;
}

export default function ProductsManagement({ onBack }: ProductsManagementProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Estados para ordenamiento
    const [sortField, setSortField] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const [formData, setFormData] = useState<CreateProductData>({
        name: '',
        categoryId: '',
        price: 0,
        specialPrice: undefined,
        description: '',
        imageBase64: ''
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
                .from('products')
                .select(`
                    *,
                    product_categories (
                        id,
                        name
                    )
                `)
                .order('name');

            if (productsError) throw productsError;

            console.log('Raw products data:', productsData);

            // Mapear los datos al formato esperado
            const mappedProducts = (productsData || []).map(product => {
                console.log('Processing product:', product);
                console.log('Product categories:', product.product_categories);

                const mappedProduct = {
                    id: product.id,
                    name: product.name,
                    categoryId: product.category_id,
                    categoryName: product.product_categories?.name || 'Sin categoría',
                    variant: product.variant || 'General',
                    priceRegular: product.price_regular,
                    pricePage: product.price_page,
                    specialPrice: product.special_price || undefined,
                    description: product.description,
                    imageUrl: product.image_url,
                    isActive: product.is_active,
                    createdAt: new Date(product.created_at),
                    updatedAt: new Date(product.updated_at)
                };

                console.log('Mapped product:', mappedProduct);
                return mappedProduct;
            });

            console.log('Final mapped products:', mappedProducts);
            setProducts(mappedProducts);
        } catch (err) {
            console.error('Error fetching data:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar los datos',
                text: 'Error al cargar los datos. Por favor, inténtelo de nuevo.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setFormData({ ...formData, imageBase64: base64 });
        };
        reader.readAsDataURL(file);
    };

    const handleCreateProduct = async () => {
        try {
            // Convertir precios a números antes de enviar
            const priceRegular = typeof formData.price === 'string' ? parseFloat(formData.price) || 0 : formData.price;
            const specialPrice = typeof formData.specialPrice === 'string' ? parseFloat(formData.specialPrice) || null : formData.specialPrice;

            // Preparar datos para la base de datos
            const productData = {
                name: formData.name,
                category_id: formData.categoryId,
                variant: 'General', // Variante por defecto
                price_regular: priceRegular,
                special_price: specialPrice,
                description: formData.description || null,
                image_url: formData.imageBase64 || null
            };

            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select()
                .single();

            if (error) throw error;

            // Fetch the product with category information
            const { data: productWithCategory } = await supabase
                .from('products')
                .select(`
                    *,
                    product_categories (
                        id,
                        name
                    )
                `)
                .eq('id', data.id)
                .single();

            if (productWithCategory) {
                // Mapear el nuevo producto al formato esperado
                const mappedProduct = {
                    id: productWithCategory.id,
                    name: productWithCategory.name,
                    categoryId: productWithCategory.category_id,
                    categoryName: productWithCategory.product_categories?.name || 'Sin categoría',
                    variant: productWithCategory.variant || 'General',
                    priceRegular: productWithCategory.price_regular,
                    pricePage: productWithCategory.price_page,
                    specialPrice: productWithCategory.special_price || undefined,
                    description: productWithCategory.description,
                    imageUrl: productWithCategory.image_url,
                    isActive: productWithCategory.is_active,
                    createdAt: new Date(productWithCategory.created_at),
                    updatedAt: new Date(productWithCategory.updated_at)
                };

                setProducts([...products, mappedProduct]);
            }

            setShowCreateModal(false);
            resetForm();
            Swal.fire({
                icon: 'success',
                title: 'Producto registrado',
                text: 'El producto ha sido registrado exitosamente.',
            });
        } catch (err) {
            console.error('Error creating product:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error al crear el producto',
                text: 'Error al crear el producto. Por favor, inténtelo de nuevo.',
            });
        }
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct) return;

        try {
            // Convertir precios a números antes de enviar
            const priceRegular = typeof formData.price === 'string' ? parseFloat(formData.price) || 0 : formData.price;
            const specialPrice = typeof formData.specialPrice === 'string' ? parseFloat(formData.specialPrice) || null : formData.specialPrice;

            // Preparar datos para la base de datos
            const productData = {
                name: formData.name,
                category_id: formData.categoryId,
                price_regular: priceRegular,
                special_price: specialPrice,
                description: formData.description || null,
                image_url: formData.imageBase64 || null
            };

            const { data, error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', editingProduct.id)
                .select()
                .single();

            if (error) throw error;

            // Fetch the updated product with category information
            const { data: productWithCategory } = await supabase
                .from('products')
                .select(`
                    *,
                    product_categories (
                        id,
                        name
                    )
                `)
                .eq('id', editingProduct.id)
                .single();

            if (productWithCategory) {
                // Mapear el producto actualizado al formato esperado
                const mappedProduct = {
                    id: productWithCategory.id,
                    name: productWithCategory.name,
                    categoryId: productWithCategory.category_id,
                    categoryName: productWithCategory.product_categories?.name || 'Sin categoría',
                    variant: productWithCategory.variant || 'General',
                    priceRegular: productWithCategory.price_regular,
                    pricePage: productWithCategory.price_page,
                    specialPrice: productWithCategory.special_price || undefined,
                    description: productWithCategory.description,
                    imageUrl: productWithCategory.image_url,
                    isActive: productWithCategory.is_active,
                    createdAt: new Date(productWithCategory.created_at),
                    updatedAt: new Date(productWithCategory.updated_at)
                };

                setProducts(products.map(product =>
                    product.id === editingProduct.id ? mappedProduct : product
                ));
            }

            setEditingProduct(null);
            resetForm();
            Swal.fire({
                icon: 'success',
                title: 'Producto actualizado',
                text: 'El producto ha sido actualizado exitosamente.',
            });
        } catch (err) {
            console.error('Error updating product:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar el producto',
                text: 'Error al actualizar el producto. Por favor, inténtelo de nuevo.',
            });
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: 'Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar este producto?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            try {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', productId);

                if (error) throw error;

                setProducts(products.filter(product => product.id !== productId));
                Swal.fire({
                    icon: 'success',
                    title: 'Producto eliminado',
                    text: 'El producto ha sido eliminado exitosamente.',
                });
            } catch (err) {
                console.error('Error deleting product:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar el producto',
                    text: 'Error al eliminar el producto. Por favor, inténtelo de nuevo.',
                });
            }
        }
    };



    // Funciones para selección múltiple
    const handleSelectProduct = (productId: string) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(sortedProducts.map(p => p.id));
        }
        setSelectAll(!selectAll);
    };

    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No hay productos seleccionados',
                text: 'Por favor, selecciona al menos un producto para eliminar.',
            });
            return;
        }

        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: `¿Está seguro de que desea eliminar ${selectedProducts.length} producto(s)? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            try {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .in('id', selectedProducts);

                if (error) throw error;

                setProducts(products.filter(p => !selectedProducts.includes(p.id)));
                setSelectedProducts([]);
                setSelectAll(false);

                Swal.fire({
                    icon: 'success',
                    title: 'Productos eliminados',
                    text: `${selectedProducts.length} producto(s) han sido eliminados exitosamente.`,
                });
            } catch (err) {
                console.error('Error deleting products:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar los productos',
                    text: 'Error al eliminar los productos. Por favor, inténtelo de nuevo.',
                });
            }
        }
    };



    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    // Función para ordenar productos
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'category':
                aValue = a.categoryName.toLowerCase();
                bValue = b.categoryName.toLowerCase();
                break;
            case 'price':
                aValue = a.priceRegular || 0;
                bValue = b.priceRegular || 0;
                break;
            case 'specialPrice':
                aValue = a.specialPrice || 0;
                bValue = b.specialPrice || 0;
                break;
            default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
        }

        if (aValue < bValue) {
            return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            categoryId: product.categoryId,
            price: product.priceRegular,
            specialPrice: product.specialPrice !== null && product.specialPrice !== undefined ? product.specialPrice : undefined,
            description: product.description || '',
            imageBase64: product.imageUrl || ''
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            categoryId: '',
            price: 0,
            specialPrice: undefined,
            description: '',
            imageBase64: ''
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

    const formatPrice = (price: number | undefined | null, allowMoreDecimals: boolean = false) => {
        if (price === null || price === undefined || isNaN(price)) {
            return 'N/A';
        }
        // Para precios especiales, permitir hasta 4 decimales si es necesario
        if (allowMoreDecimals) {
            const priceStr = Number(price).toString();
            const decimalPlaces = priceStr.includes('.') ? priceStr.split('.')[1].length : 0;
            return `$${Number(price).toFixed(Math.min(decimalPlaces, 4))}`;
        }
        return `$${Number(price).toFixed(2)}`;
    };

    const getCategoryIcon = (_category: string) => {
        return <ShoppingBag className="h-5 w-5 text-orange-600" />;
    };

    // Función para manejar el ordenamiento
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Función para obtener el icono de ordenamiento
    const getSortIcon = (field: string) => {
        if (sortField !== field) {
            return <ChevronUp className="w-4 h-4 text-gray-300" />;
        }
        return sortDirection === 'asc' ?
            <ChevronUp className="w-4 h-4 text-gray-600" /> :
            <ChevronDown className="w-4 h-4 text-gray-600" />;
    };

    // Función para limpiar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
    };

    // Función para abrir modal de producto con SweetAlert2
    const openProductModal = (product: Product) => {
        const imageHtml = product.imageUrl
            ? `<img src="${product.imageUrl}" alt="${product.name}" class="max-w-full max-h-64 object-contain rounded-lg mx-auto mb-4" />`
            : `<div class="w-32 h-32 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                 <svg class="h-12 w-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                 </svg>
               </div>`;

        const descriptionHtml = product.description
            ? `<div class="mt-4">
                 <label class="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
                 <p class="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">${product.description}</p>
               </div>`
            : '';

        Swal.fire({
            title: product.name,
            html: `
                <div class="text-left">
                    ${imageHtml}
                    <div class="grid grid-cols-1 gap-4">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-600">Categoría:</span>
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                ${product.categoryName}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-600">Precio Regular:</span>
                            <span class="text-lg font-semibold text-green-600">
                                $${formatPrice(product.priceRegular)}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-600">Precio Especial:</span>
                            <span class="text-lg font-semibold ${product.specialPrice ? 'text-orange-600' : 'text-gray-400'}">
                                ${product.specialPrice ? `$${formatPrice(product.specialPrice, true)}` : 'No definido'}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-600">Estado:</span>
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }">
                                ${product.isActive ? 'Disponible' : 'No disponible'}
                            </span>
                        </div>
                        ${descriptionHtml}
                    </div>
                </div>
            `,
            width: '32rem',
            showCloseButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Editar Producto',
            confirmButtonColor: '#3B82F6',
            showDenyButton: true,
            denyButtonText: 'Cerrar',
            denyButtonColor: '#6B7280',
            customClass: {
                popup: 'rounded-lg',
                confirmButton: 'rounded-lg',
                denyButton: 'rounded-lg'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                openEditModal(product);
            }
        });
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <ShoppingBag className="h-8 w-8 text-orange-500" />
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de productos</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center space-x-2 bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Agregar nuevo producto</span>
                                <span className="sm:hidden">Agregar</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar productos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="w-full lg:w-64">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            {(searchTerm || categoryFilter) && (
                                <div className="w-full lg:w-auto">
                                    <button
                                        onClick={clearFilters}
                                        className="w-full lg:w-auto flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                        <span>Limpiar filtros</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Active Filters Display */}
                        {(searchTerm || categoryFilter) && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {searchTerm && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                        Búsqueda: "{searchTerm}"
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="ml-1 text-orange-600 hover:text-orange-800"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                {categoryFilter && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                        Categoría: {categories.find(c => c.id === categoryFilter)?.name}
                                        <button
                                            onClick={() => setCategoryFilter('')}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bulk Actions */}
                    {selectedProducts.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-blue-800">
                                        {selectedProducts.length} producto(s) seleccionado(s)
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors text-sm"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {/* Mobile view - Cards */}
                        <div className="lg:hidden">
                            {sortedProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="border-b border-gray-200 p-4 cursor-pointer hover:bg-gray-50"
                                    onClick={() => openProductModal(product)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product.id)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectProduct(product.id);
                                                }}
                                                className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 cursor-pointer"
                                            />
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                                            {getCategoryIcon(product.categoryName)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditModal(product);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Editar producto"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProduct(product.id);
                                                }}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Eliminar producto"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {product.categoryName}
                                            </span>
                                            <div className="flex items-center space-x-1">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatPrice(product.priceRegular)}
                                                </span>
                                            </div>
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
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Producto</span>
                                                {getSortIcon('name')}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handleSort('category')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Categoría</span>
                                                {getSortIcon('category')}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handleSort('price')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Precio regular</span>
                                                {getSortIcon('price')}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handleSort('specialPrice')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Precio especial</span>
                                                {getSortIcon('specialPrice')}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Opciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedProducts.map((product) => {
                                        console.log('Rendering product in table:', product);
                                        console.log('Product categoryName:', product.categoryName);
                                        console.log('Product priceRegular:', product.priceRegular);
                                        return (
                                            <tr
                                                key={product.id}
                                                className={`hover:bg-gray-50 cursor-pointer ${selectedProducts.includes(product.id) ? 'bg-blue-50' : ''}`}
                                                onClick={() => openProductModal(product)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProducts.includes(product.id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            handleSelectProduct(product.id);
                                                        }}
                                                        className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 cursor-pointer hover:border-orange-400 transition-colors"
                                                    />
                                                </td>
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
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {product.categoryName}
                                                    </span>
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
                                                        {product.specialPrice ? (
                                                            <>
                                                                <DollarSign className="h-4 w-4 text-orange-600" />
                                                                <span className="text-sm font-medium text-orange-600">
                                                                    {formatPrice(product.specialPrice, true)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm text-gray-400 italic">
                                                                Sin precio especial
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditModal(product);
                                                            }}
                                                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-xs font-medium border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                                                            title="Editar producto"
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                            <span>Editar</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteProduct(product.id);
                                                            }}
                                                            className="flex items-center space-x-1 text-red-600 hover:text-red-900 px-2 py-1 rounded text-xs font-medium border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                                                            title="Eliminar producto"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            <span>Eliminar</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
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

                                    <div className="space-y-4">
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
                                                Precio regular *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.price === 0 ? '' : formData.price.toString()}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Permitir cualquier texto, solo validar al guardar
                                                    setFormData({ ...formData, price: value === '' ? 0 : value });
                                                }}
                                                onBlur={(e) => {
                                                    // Solo validar cuando el usuario termina de escribir
                                                    const value = e.target.value;
                                                    if (value && value.trim() !== '') {
                                                        // Limpiar y convertir el valor
                                                        const cleanValue = value.replace(/[^0-9.,]/g, '');
                                                        const normalizedValue = cleanValue.replace(',', '.');
                                                        const parsedValue = parseFloat(normalizedValue);

                                                        if (!isNaN(parsedValue) && parsedValue >= 0) {
                                                            setFormData({ ...formData, price: parsedValue });
                                                        } else {
                                                            // Si no es válido, poner 0
                                                            setFormData({ ...formData, price: 0 });
                                                        }
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                                placeholder="Escribe cualquier precio"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Precio especial (opcional)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.specialPrice !== undefined && formData.specialPrice !== null && formData.specialPrice !== '' ? formData.specialPrice.toString() : ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Permitir cualquier texto, solo validar al guardar
                                                    setFormData({ ...formData, specialPrice: value === '' ? undefined : value });
                                                }}
                                                onBlur={(e) => {
                                                    // Solo validar cuando el usuario termina de escribir
                                                    const value = e.target.value;
                                                    if (value && value.trim() !== '') {
                                                        // Limpiar y convertir el valor
                                                        const cleanValue = value.replace(/[^0-9.,]/g, '');
                                                        const normalizedValue = cleanValue.replace(',', '.');
                                                        const parsedValue = parseFloat(normalizedValue);

                                                        if (!isNaN(parsedValue) && parsedValue >= 0) {
                                                            setFormData({ ...formData, specialPrice: parsedValue });
                                                        } else {
                                                            // Si no es válido, limpiar el campo
                                                            setFormData({ ...formData, specialPrice: undefined });
                                                        }
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-600"
                                                placeholder="Escribe cualquier precio (opcional)"
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
                                                        Subir imagen
                                                    </span>
                                                </label>
                                                {formData.imageBase64 && (
                                                    <div className="flex items-center space-x-2">
                                                        <ImageIcon className="h-4 w-4 text-green-500" />
                                                        <span className="text-xs text-green-600">Imagen cargada</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Descripción (opcional)
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
                                            disabled={!formData.name.trim() || !formData.categoryId || (typeof formData.price === 'number' ? formData.price <= 0 : !formData.price || parseFloat(formData.price.toString()) <= 0)}
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
                    <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Total productos</p>
                                    <p className="text-lg lg:text-2xl font-bold text-gray-900">{products.length}</p>
                                </div>
                                <ShoppingBag className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
                            </div>
                        </div>

                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Productos disponibles</p>
                                    <p className="text-lg lg:text-2xl font-bold text-green-600">
                                        {products.filter(product => product.isActive === true).length}
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
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Categorías</p>
                                    <p className="text-lg lg:text-2xl font-bold text-blue-600">{categories.length}</p>
                                </div>
                                <Filter className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs lg:text-sm font-medium text-gray-600">Precio promedio</p>
                                    <p className="text-lg lg:text-2xl font-bold text-purple-600">
                                        ${products.length > 0 ? (products.reduce((sum, p) => sum + (p.priceRegular || 0), 0) / products.length).toFixed(2) : '0.00'}
                                    </p>
                                </div>
                                <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div >
    );
} 