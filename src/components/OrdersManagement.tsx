'use client';

import { useState, useRef, useEffect } from 'react';
import {
    ShoppingCart,
    Plus,
    Search,
    ArrowLeft,
    Check,
    X,
    Calendar,
    DollarSign,
    Printer,
    Trash2,
    MapPin as MapPinIcon,
    Package,
    User,
    CreditCard,
    FileText
} from 'lucide-react';
import { Order, CreateOrderData, PaymentMethod, OrderItem } from '@/types/order';
import { Product } from '@/types/product';
import { Client } from '@/types/client';
import { Route } from '@/types/route';
import { supabase } from '@/lib/supabase';
import Footer from './Footer';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import BulkOrderNotesPDF from './pdf/BulkOrderNotesPDF';
import { handleNumericInputChange, parseNumericValue } from '@/utils/numericValidation';
import { generateUniqueOrderNumberHybrid } from '@/utils/orderIdGenerator';

interface OrdersManagementProps {
    onBack: () => void;
}

export default function OrdersManagement({ onBack }: OrdersManagementProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSearchTerm, setTempSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showRoutePreviewModal, setShowRoutePreviewModal] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<string>('');
    const [routeFilter, setRouteFilter] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [dateFilterType, setDateFilterType] = useState<'registration' | 'delivery'>('registration');
    const [dateFilterValue, setDateFilterValue] = useState<Date | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
    const [isGeneratingBulkPDF, setIsGeneratingBulkPDF] = useState(false);
    const [bulkActionType, setBulkActionType] = useState<'status' | 'delivery_date'>('status');
    const [bulkStatus, setBulkStatus] = useState<Order['status']>('pending');
    const [bulkDeliveryDate, setBulkDeliveryDate] = useState<Date | null>(null);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<(Order & {
        clientPhone?: string;
        clientAddress?: string;
        clientCedula?: string;
    }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
    const printRef = useRef<HTMLDivElement>(null);
    const routePreviewRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalOrders, setTotalOrders] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Estados para scroll horizontal
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const tableScrollRef = useRef<HTMLDivElement>(null);

    // Estados para el formulario de creación
    const [selectedRouteForOrder, setSelectedRouteForOrder] = useState<Route | null>(null);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [orderDate, setOrderDate] = useState(new Date());
    const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
    const [notes, setNotes] = useState('');
    const [selectedItems, setSelectedItems] = useState<Array<{
        product: Product;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        usesSpecialPrice: boolean;
    }>>([]);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [quantityInputs, setQuantityInputs] = useState<{ [key: string]: string }>({});

    const paymentMethods: PaymentMethod[] = ['Efectivo', 'Transferencia', 'Tarjeta de crédito', 'Tarjeta de débito', 'Cheque'];

    // ===== FUNCIONES AUXILIARES =====

    // Función auxiliar para buscar texto de forma segura
    const safeSearch = (text: string | null | undefined, searchTerm: string): boolean => {
        if (!text || !searchTerm) return false;
        return text.toLowerCase().includes(searchTerm.toLowerCase());
    };

    // Función auxiliar para validar datos antes de procesarlos
    const validateData = (data: any, fieldName: string): boolean => {
        if (data === null || data === undefined) {
            console.warn(`Campo ${fieldName} es null o undefined`);
            return false;
        }
        return true;
    };

    // Función auxiliar para manejar errores de forma consistente
    const handleError = (error: any, context: string) => {
        console.error(`Error en ${context}:`, error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Error en ${context}. Por favor, inténtalo de nuevo.`,
            confirmButtonColor: '#3085d6'
        });
    };

    // Función auxiliar para manejar fechas sin problemas de zona horaria
    const formatDateForDB = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const parseDateFromDB = (dateStr: string): Date => {
        return new Date(dateStr + 'T00:00:00');
    };

    // Función auxiliar para mostrar mensajes de éxito
    const showSuccess = (title: string, message: string) => {
        Swal.fire({
            icon: 'success',
            title,
            text: message,
            confirmButtonColor: '#3085d6'
        });
    };

    // Función auxiliar para obtener el identificador de ruta
    const getRouteIdentifier = (routeId: string | null | undefined): string | null => {
        if (!routeId) return null;
        const route = routes.find(r => r.id === routeId);
        return route?.identificador || null;
    };

    // Función auxiliar para verificar si un pedido coincide con la búsqueda
    const orderMatchesSearch = (order: Order, searchTerm: string): boolean => {
        if (!searchTerm) return true;

        return safeSearch(order.orderNumber, searchTerm) ||
            safeSearch(order.clientName, searchTerm) ||
            safeSearch(order.status, searchTerm) ||
            safeSearch(order.routeName, searchTerm) ||
            safeSearch(getRouteIdentifier(order.routeId), searchTerm);
    };

    // Función auxiliar para verificar si un pedido coincide con el filtro de ruta
    const orderMatchesRouteFilter = (order: Order, routeFilter: string): boolean => {
        if (!routeFilter) return true;
        return order.routeId === routeFilter;
    };

    const orderMatchesDateFilter = (order: Order, dateFilterValue: Date | null, dateFilterType: 'registration' | 'delivery'): boolean => {
        if (!dateFilterValue) return true;

        // Convertir la fecha del filtro a formato YYYY-MM-DD para comparación
        const filterDateStr = dateFilterValue.toISOString().split('T')[0];

        if (dateFilterType === 'registration') {
            const orderDateStr = order.orderDate.toISOString().split('T')[0];
            return orderDateStr === filterDateStr;
        } else {
            // Filtro por fecha de entrega
            if (!order.deliveryDate) return false;
            const deliveryDateStr = order.deliveryDate.toISOString().split('T')[0];
            return deliveryDateStr === filterDateStr;
        }
    };

    // Función auxiliar para validar y limpiar datos de pedidos
    const validateOrderData = (order: any): Order | null => {
        try {
            // Validar campos requeridos
            if (!validateData(order.orderNumber, 'orderNumber') ||
                !validateData(order.status, 'status')) {
                return null;
            }

            return order as Order;
        } catch (error) {
            console.warn('Error validando datos del pedido:', error);
            return null;
        }
    };

    // Función auxiliar para validar datos de productos
    const validateProductData = (product: any): Product | null => {
        try {
            if (!validateData(product.name, 'product.name') ||
                !validateData(product.isActive, 'product.isActive')) {
                return null;
            }
            return product as Product;
        } catch (error) {
            console.warn('Error validando datos del producto:', error);
            return null;
        }
    };

    // Función auxiliar para filtrar productos
    const filterProducts = (products: Product[], searchTerm: string): Product[] => {
        const validProducts = products
            .map(validateProductData)
            .filter((product): product is Product => product !== null);

        if (!searchTerm) return validProducts.filter(product => product.isActive);

        return validProducts.filter(product =>
            product.isActive &&
            (safeSearch(product.name, searchTerm) ||
                safeSearch(product.categoryName, searchTerm))
        );
    };

    // Función auxiliar para filtrar clientes
    const filterClients = (clients: Client[], routeId: string | null, searchTerm: string): Client[] => {
        if (!routeId) return [];

        return clients.filter(client =>
            client.routeId === routeId &&
            client.isActive &&
            safeSearch(client.nombre, searchTerm)
        );
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Cargar pedidos cuando cambien los filtros
    useEffect(() => {
        if (searchTerm || routeFilter || dateFilterValue) {
            fetchOrdersWithPagination(1, itemsPerPage, true);
        }
    }, [searchTerm, routeFilter, dateFilterValue, dateFilterType]);

    // Verificar botones de scroll cuando cambien los datos
    useEffect(() => {
        checkScrollButtons();
    }, [orders]);

    // Función para obtener el nombre del cliente de manera consistente
    const getClientName = (order: Order, client: any): string => {
        return client?.nombre || order.clientName || 'No disponible';
    };



    // Filtrar clientes cuando cambia la ruta seleccionada
    useEffect(() => {
        const filtered = filterClients(clients, selectedRouteForOrder?.id || null, clientSearchTerm);
        setFilteredClients(filtered);
    }, [selectedRouteForOrder, clientSearchTerm, clients]);



    // Filtrar productos cuando cambia el término de búsqueda
    useEffect(() => {
        const filtered = filterProducts(products, productSearchTerm);
        setFilteredProducts(filtered);
    }, [productSearchTerm, products]);

    // Resetear página cuando cambien los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, routeFilter, dateFilterValue, dateFilterType]);

    // Funciones para manejar scroll horizontal
    const checkScrollButtons = () => {
        if (tableScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tableScrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    const scrollTable = (direction: 'left' | 'right') => {
        if (tableScrollRef.current) {
            const scrollAmount = 300; // Píxeles a desplazar
            const currentScroll = tableScrollRef.current.scrollLeft;
            const newScroll = direction === 'left'
                ? currentScroll - scrollAmount
                : currentScroll + scrollAmount;

            tableScrollRef.current.scrollTo({
                left: newScroll,
                behavior: 'smooth'
            });
        }
    };


    // Función para cargar pedidos con paginación del servidor
    const fetchOrdersWithPagination = async (page: number = 1, limit: number = itemsPerPage, reset: boolean = false) => {
        try {
            if (reset) {
                setLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            // Construir query base
            let query = supabase
                .from('orders_summary')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            // Aplicar filtros
            if (searchTerm) {
                query = query.or(`client_name.ilike.%${searchTerm}%,order_number.ilike.%${searchTerm}%`);
            }

            if (routeFilter) {
                query = query.eq('route_id', routeFilter);
            }

            if (dateFilterValue) {
                const dateStr = dateFilterValue.toISOString().split('T')[0];
                if (dateFilterType === 'registration') {
                    query = query.eq('order_date', dateStr);
                } else {
                    query = query.eq('delivery_date', dateStr);
                }
            }

            // Aplicar paginación
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            query = query.range(from, to);

            const { data: ordersData, error: ordersError, count } = await query;

            if (ordersError) throw ordersError;

            // Transform orders data to match our interface
            const transformedOrders = (ordersData || []).map(order => ({
                ...order,
                orderNumber: order.order_number,
                clientId: order.client_id,
                clientName: order.client_name,
                routeName: order.route_name,
                routeId: order.route_id,
                orderDate: parseDateFromDB(order.order_date),
                deliveryDate: order.delivery_date ? parseDateFromDB(order.delivery_date) : null,
                totalAmount: parseFloat(order.total_amount) || 0,
                paymentMethod: order.payment_method || 'Efectivo',
                totalItems: order.total_items || 0,
                productsSummary: order.products_summary || '',
                createdAt: new Date(order.created_at),
                updatedAt: new Date(order.updated_at),
                items: [] // Inicializar items vacío
            }));

            // Ahora cargar los items para cada pedido
            const ordersWithItems = await Promise.all(
                transformedOrders.map(async (order) => {
                    const { data: itemsData, error: itemsError } = await supabase
                        .from('order_items')
                        .select('*')
                        .eq('order_id', order.id);

                    if (itemsError) {
                        console.error('Error fetching items for order:', order.id, itemsError);
                        return order;
                    }

                    const items = (itemsData || []).map(item => ({
                        id: item.id,
                        productId: item.product_id,
                        productName: item.product_name,
                        productCategory: item.product_category,
                        productVariant: item.product_variant,
                        quantity: item.quantity,
                        unitPrice: parseFloat(item.unit_price),
                        totalPrice: parseFloat(item.total_price),
                        usesSpecialPrice: item.uses_special_price || false
                    }));

                    return {
                        ...order,
                        items
                    };
                })
            );

            // Actualizar estado según si es reset o carga de más datos
            if (reset) {
                setOrders(ordersWithItems);
            } else {
                setOrders(prevOrders => [...prevOrders, ...ordersWithItems]);
            }

            setTotalOrders(count || 0);

        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders_summary')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            // Fetch products with categories
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true);

            if (productsError) throw productsError;

            // Fetch categories separately
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('product_categories')
                .select('*');

            if (categoriesError) throw categoriesError;

            // Transform products data to match our interface
            const transformedProducts = (productsData || []).map(product => {
                const category = categoriesData?.find(cat => cat.id === product.category_id);
                return {
                    ...product,
                    name: product.name,
                    nombre: product.name, // Keep both for compatibility
                    categoryName: category?.name || 'Sin categoría',
                    variant: product.variant || 'Regular',
                    priceRegular: product.price_regular || 0,
                    pricePage: product.price_page || 0,
                    specialPrice: product.special_price || undefined,
                    isActive: product.is_active,
                    createdAt: new Date(product.created_at),
                    updatedAt: new Date(product.updated_at)
                };
            });

            console.log('📦 Productos cargados:', transformedProducts.length);
            console.log('📦 Productos con precio especial:', transformedProducts.filter(p => p.specialPrice).length);
            setProducts(transformedProducts);

            // Fetch clients
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('*')
                .eq('is_active', true);

            if (clientsError) throw clientsError;

            // Fetch routes for client mapping
            const { data: allRoutesData, error: allRoutesError } = await supabase
                .from('routes')
                .select('*');

            if (allRoutesError) throw allRoutesError;

            // Transform clients data to match our interface
            const transformedClients = (clientsData || []).map(client => {
                const route = allRoutesData?.find(r => r.id === client.route_id);
                return {
                    ...client,
                    routeId: client.route_id,
                    routeName: route?.nombre,
                    routeIdentifier: route?.identificador,
                    isActive: client.is_active,
                    createdAt: new Date(client.created_at),
                    updatedAt: new Date(client.updated_at)
                };
            });

            setClients(transformedClients);

            // Fetch routes
            const { data: routesData, error: routesError } = await supabase
                .from('routes')
                .select('*');

            if (routesError) throw routesError;

            // Transform to match interface
            const transformedRoutes = (routesData || []).map(route => ({
                ...route,
                isActive: route.is_active !== false,
                createdAt: new Date(route.created_at),
                updatedAt: new Date(route.updated_at)
            }));

            setRoutes(transformedRoutes);

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Función para generar número de pedido único
    const generateOrderNumber = async () => {
        return await generateUniqueOrderNumberHybrid(orderDate);
    };

    // Función para calcular subtotal
    const calculateSubtotal = () => {
        return selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    };

    // Función para manejar la búsqueda manual
    const handleSearch = () => {
        setSearchTerm(tempSearchTerm);
        setCurrentPage(1); // Resetear a la primera página
    };

    // Función para limpiar la búsqueda
    const handleClearSearch = () => {
        setTempSearchTerm('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Función para agregar producto
    const addProduct = async (product: Product, quantity: number) => {
        console.log('🔍 Agregando producto:', product.name);
        console.log('🔍 Precio especial:', product.specialPrice);

        const existingItem = selectedItems.find(item => item.product.id === product.id);

        if (existingItem) {
            // Actualizar cantidad si ya existe
            const updatedItems = selectedItems.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + quantity, totalPrice: (item.quantity + quantity) * item.unitPrice }
                    : item
            );
            setSelectedItems(updatedItems);
        } else {
            // Verificar si el producto tiene precio especial
            if (product.specialPrice && product.specialPrice > 0) {
                console.log('💰 Producto tiene precio especial, mostrando modal...');
                // Preguntar al usuario qué precio usar
                const result = await Swal.fire({
                    title: 'Seleccionar Precio',
                    html: `
                        <div class="text-left">
                            <p class="mb-4"><strong>${product.name}</strong> tiene un precio especial disponible.</p>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="text-center p-3 border rounded-lg">
                                    <p class="font-bold text-green-600">Precio Regular</p>
                                    <p class="text-lg">$${product.priceRegular?.toFixed(2)}</p>
                                </div>
                                <div class="text-center p-3 border rounded-lg bg-orange-50">
                                    <p class="font-bold text-orange-600">Precio Especial</p>
                                    <p class="text-lg">$${product.specialPrice.toString()}</p>
                                </div>
                            </div>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Precio Regular',
                    cancelButtonText: 'Precio Especial',
                    confirmButtonColor: '#10b981',
                    cancelButtonColor: '#f59e0b',
                    reverseButtons: true
                });

                let selectedPrice: number;
                let usesSpecialPrice: boolean;

                if (result.isConfirmed) {
                    // Usar precio regular
                    selectedPrice = product.priceRegular || 0;
                    usesSpecialPrice = false;
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    // Usar precio especial
                    selectedPrice = product.specialPrice || 0;
                    usesSpecialPrice = true;
                } else {
                    // Usuario canceló, no agregar producto
                    return;
                }

                // Agregar nuevo producto con el precio seleccionado
                const newItem = {
                    product,
                    quantity,
                    unitPrice: selectedPrice,
                    totalPrice: selectedPrice * quantity,
                    usesSpecialPrice
                };
                setSelectedItems([...selectedItems, newItem]);
            } else {
                console.log('💰 Producto sin precio especial, agregando directamente...');
                // Agregar nuevo producto con precio regular (sin precio especial)
                const newItem = {
                    product,
                    quantity,
                    unitPrice: product.priceRegular || 0,
                    totalPrice: (product.priceRegular || 0) * quantity,
                    usesSpecialPrice: false
                };
                setSelectedItems([...selectedItems, newItem]);
            }
        }

        setProductSearchTerm('');
        setShowProductDropdown(false);
    };

    // Función para remover producto
    const removeProduct = (productId: string) => {
        setSelectedItems(selectedItems.filter(item => item.product.id !== productId));
        // Limpiar el input de cantidad cuando se elimina el producto
        setQuantityInputs(prev => {
            const newInputs = { ...prev };
            delete newInputs[productId];
            return newInputs;
        });
    };

    // Función para actualizar cantidad con validación numérica
    const updateQuantity = (productId: string, quantity: string) => {
        // Limpiar automáticamente caracteres no numéricos
        handleNumericInputChange(quantity, (cleanQuantity) => {
            // Actualizar el estado local del input con el valor limpio
            setQuantityInputs(prev => ({
                ...prev,
                [productId]: cleanQuantity
            }));

            // Convertir a número para el cálculo
            const numQuantity = parseNumericValue(cleanQuantity);

            const updatedItems = selectedItems.map(item =>
                item.product.id === productId
                    ? { ...item, quantity: numQuantity, totalPrice: item.unitPrice * numQuantity }
                    : item
            );
            setSelectedItems(updatedItems);
        });
    };

    // Función auxiliar para validar el formulario de pedido
    const validateOrderForm = (): { isValid: boolean; message?: string } => {
        if (!selectedClient) {
            return { isValid: false, message: 'Debe seleccionar un cliente.' };
        }
        if (selectedItems.length === 0) {
            return { isValid: false, message: 'Debe agregar al menos un producto.' };
        }
        if (!orderDate) {
            return { isValid: false, message: 'Debe seleccionar una fecha de pedido.' };
        }
        return { isValid: true };
    };

    // Función para crear o actualizar pedido
    const handleCreateOrder = async () => {
        // Validar formulario
        const validation = validateOrderForm();
        if (!validation.isValid) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: validation.message,
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        // Mostrar resumen del pedido antes de crear
        const orderNumber = await generateOrderNumber();
        const subtotal = calculateSubtotal();

        const orderSummary = `
            <div class="text-left">
                <div class="mb-4">
                    <h3 class="font-bold text-lg mb-2">Resumen del Pedido</h3>
                    <p><strong>Número:</strong> ${orderNumber}</p>
                    <p><strong>Cliente:</strong> ${selectedClient?.nombre || 'No seleccionado'}</p>
                    <p><strong>Ruta:</strong> ${selectedRouteForOrder?.nombre || 'Sin ruta'}</p>
                    <p><strong>Fecha:</strong> ${orderDate.toLocaleDateString('es-ES')}</p>
                    ${deliveryDate ? `<p><strong>Entrega:</strong> ${deliveryDate.toLocaleDateString('es-ES')}</p>` : ''}
                    <p><strong>Método de pago:</strong> ${paymentMethod}</p>
                    ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ''}
                </div>
                
                <div class="mb-4">
                    <h4 class="font-semibold mb-2">Productos (${selectedItems.length})</h4>
                    <div class="max-h-32 overflow-y-auto space-y-1">
                        ${selectedItems.map(item => `
                            <div class="flex justify-between text-sm">
                                <span>${item.product.name} x ${item.quantity}${item.usesSpecialPrice ? ' (Precio Especial)' : ''}</span>
                                <span>$${item.usesSpecialPrice ? item.totalPrice.toString() : item.totalPrice.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="border-t pt-2">
                    <div class="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>$${selectedItems.some(item => item.usesSpecialPrice) ? subtotal.toString() : subtotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;

        const isEditing = editingOrder !== null;
        const result = await Swal.fire({
            title: isEditing ? 'Confirmar Cambios' : 'Confirmar Pedido',
            html: orderSummary,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: isEditing ? 'Actualizar Pedido' : 'Crear Pedido',
            cancelButtonText: 'Cancelar',
            width: '600px'
        });

        if (result.isConfirmed) {
            try {
                if (isEditing && editingOrder) {
                    // Actualizar el pedido existente
                    const { error: orderError } = await supabase
                        .from('orders')
                        .update({
                            client_id: selectedClient!.id,
                            route_id: selectedRouteForOrder?.id,
                            order_date: formatDateForDB(orderDate),
                            delivery_date: deliveryDate ? formatDateForDB(deliveryDate) : null,
                            total_amount: subtotal,
                            payment_method: paymentMethod,
                            notes: notes
                        })
                        .eq('id', editingOrder.id);

                    if (orderError) throw orderError;

                    // Eliminar items existentes
                    const { error: deleteItemsError } = await supabase
                        .from('order_items')
                        .delete()
                        .eq('order_id', editingOrder.id);

                    if (deleteItemsError) throw deleteItemsError;

                    // Crear los nuevos items del pedido
                    const orderItems = selectedItems.map(item => ({
                        order_id: editingOrder.id,
                        product_id: item.product.id,
                        product_name: item.product.name,
                        product_category: item.product.categoryName || '',
                        product_variant: item.product.variant || '',
                        quantity: item.quantity,
                        unit_price: item.unitPrice,
                        use_pagina_price: false,
                        uses_special_price: item.usesSpecialPrice,
                        total_price: item.totalPrice
                    }));

                    const { error: itemsError } = await supabase
                        .from('order_items')
                        .insert(orderItems);

                    if (itemsError) throw itemsError;

                    showSuccess('¡Pedido Actualizado!', `El pedido ${orderNumber} ha sido actualizado exitosamente.`);
                } else {
                    // Crear el pedido
                    const { data: orderData, error: orderError } = await supabase
                        .from('orders')
                        .insert([{
                            order_number: orderNumber,
                            client_id: selectedClient!.id,
                            route_id: selectedRouteForOrder?.id,
                            order_date: formatDateForDB(orderDate),
                            delivery_date: deliveryDate ? formatDateForDB(deliveryDate) : null,
                            status: 'pending',
                            total_amount: subtotal,
                            payment_method: paymentMethod,
                            notes: notes
                        }])
                        .select()
                        .single();

                    if (orderError) throw orderError;

                    // Crear los items del pedido
                    const orderItems = selectedItems.map(item => ({
                        order_id: orderData.id,
                        product_id: item.product.id,
                        product_name: item.product.name,
                        product_category: item.product.categoryName || '',
                        product_variant: item.product.variant || '',
                        quantity: item.quantity,
                        unit_price: item.unitPrice,
                        use_pagina_price: false,
                        uses_special_price: item.usesSpecialPrice,
                        total_price: item.totalPrice
                    }));

                    const { error: itemsError } = await supabase
                        .from('order_items')
                        .insert(orderItems);

                    if (itemsError) throw itemsError;

                    showSuccess('¡Pedido Creado!', `El pedido ${orderNumber} ha sido creado exitosamente.`);
                }

                // Actualizar la lista de pedidos
                await fetchData();

                // Cerrar modal y resetear
                setShowCreateModal(false);
                resetOrderForm();

            } catch (error) {
                handleError(error, isEditing ? 'actualizar el pedido' : 'crear el pedido');
            }
        }
    };

    // Función para resetear formulario
    const resetOrderForm = () => {
        setEditingOrder(null);
        setSelectedRouteForOrder(null);
        setSelectedClient(null);
        setClientSearchTerm('');
        setOrderDate(new Date());
        setDeliveryDate(null);
        setPaymentMethod('Efectivo');
        setNotes('');
        setSelectedItems([]);
        setProductSearchTerm('');
        setQuantityInputs({});
    };

    // Función para cerrar modal
    const closeModal = () => {
        setShowCreateModal(false);
        resetOrderForm();
    };



    // Función para manejar click en backdrop del modal
    const handleModalBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    // Función para abrir modal de edición
    const openEditModal = (order: Order) => {
        console.log('🔍 Abriendo modal de edición para pedido:', order);
        console.log('📦 Items del pedido:', order.items);

        setEditingOrder(order);

        // Cargar los datos del pedido en el formulario
        setSelectedClient(clients.find(c => c.id === order.clientId) || null);
        setClientSearchTerm(order.clientName || '');
        setSelectedRouteForOrder(routes.find(r => r.id === order.routeId) || null);
        setOrderDate(new Date(order.orderDate));
        setDeliveryDate(order.deliveryDate ? new Date(order.deliveryDate) : null);
        setPaymentMethod(order.paymentMethod);
        setNotes(order.notes || '');

        // Cargar los items del pedido
        if (order.items && order.items.length > 0) {
            console.log('📦 Procesando', order.items.length, 'items del pedido');

            const transformedItems = order.items.map(item => {
                console.log('🔍 Procesando item:', item);

                // Buscar el producto real en la lista de productos
                const realProduct = products.find(p => p.id === item.productId);
                console.log('🔍 Producto real encontrado:', realProduct);

                if (realProduct) {
                    const transformedItem = {
                        product: realProduct,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        usesSpecialPrice: item.usesSpecialPrice || false
                    };
                    console.log('✅ Item transformado con producto real:', transformedItem);
                    return transformedItem;
                }

                // Si no se encuentra el producto, crear uno temporal
                console.log('⚠️ Producto no encontrado, creando temporal');
                const tempProduct: Product = {
                    id: item.productId,
                    name: item.productName,
                    categoryId: '', // Campo requerido pero no disponible
                    categoryName: item.productCategory,
                    variant: item.productVariant,
                    priceRegular: item.unitPrice,
                    pricePage: item.unitPrice,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                const transformedItem = {
                    product: tempProduct,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                    usesSpecialPrice: item.usesSpecialPrice || false
                };
                console.log('✅ Item transformado con producto temporal:', transformedItem);
                return transformedItem;
            });

            console.log('📦 Total items transformados:', transformedItems.length);
            setSelectedItems(transformedItems);

            // Establecer los valores de los inputs de cantidad
            const quantityInputs: { [key: string]: string } = {};
            transformedItems.forEach(item => {
                quantityInputs[item.product.id] = item.quantity.toString();
            });
            setQuantityInputs(quantityInputs);

            console.log('💾 selectedItems establecido:', transformedItems.length, 'items');
            console.log('💾 quantityInputs establecido:', Object.keys(quantityInputs).length, 'inputs');
        } else {
            console.log('⚠️ No hay items en el pedido o items es undefined');
            setSelectedItems([]);
            setQuantityInputs({});
        }

        setShowCreateModal(true);
    };

    // Función para eliminar pedido
    const handleDeleteOrder = async (orderId: string) => {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: 'Esta acción eliminará el pedido y no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const { error } = await supabase
                    .from('orders')
                    .delete()
                    .eq('id', orderId);

                if (error) throw error;

                await fetchData();
                showSuccess('Pedido eliminado', 'El pedido ha sido eliminado exitosamente.');
            } catch (error) {
                handleError(error, 'eliminar el pedido');
            }
        }
    };

    // Función para actualizar estado del pedido
    const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
        try {
            // Marcar como actualizando
            setUpdatingStatus(prev => new Set(prev).add(orderId));

            // Actualizar el estado local inmediatamente para feedback visual instantáneo
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId
                        ? { ...order, status: newStatus }
                        : order
                )
            );

            // Actualizar en la base de datos
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) {
                // Si hay error, revertir el cambio local
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === orderId
                            ? { ...order, status: order.status }
                            : order
                    )
                );
                throw error;
            }

            // Opcional: Recargar datos para asegurar sincronización completa
            // await fetchData();
        } catch (error) {
            handleError(error, 'actualizar el estado del pedido');
        } finally {
            // Remover del estado de actualización
            setUpdatingStatus(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    // Función para manejar selección múltiple de pedidos
    const handleOrderSelection = (orderId: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedOrders(prev => [...prev, orderId]);
        } else {
            setSelectedOrders(prev => prev.filter(id => id !== orderId));
        }
    };

    // Función para seleccionar/deseleccionar todos los pedidos
    const handleSelectAllOrders = (selectAll: boolean) => {
        if (selectAll) {
            setSelectedOrders(filteredOrders.map(order => order.id));
        } else {
            setSelectedOrders([]);
        }
    };

    // Función para aplicar acciones masivas
    const handleBulkAction = async () => {
        if (selectedOrders.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No hay pedidos seleccionados',
                text: 'Por favor, selecciona al menos un pedido para aplicar la acción.',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        try {
            const updateData: any = {};

            if (bulkActionType === 'status') {
                updateData.status = bulkStatus;
            } else if (bulkActionType === 'delivery_date') {
                updateData.delivery_date = bulkDeliveryDate ? formatDateForDB(bulkDeliveryDate) : null;
            }

            // Actualizar el estado local inmediatamente para feedback visual instantáneo
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    selectedOrders.includes(order.id)
                        ? {
                            ...order,
                            ...(bulkActionType === 'status' ? { status: bulkStatus } : {}),
                            ...(bulkActionType === 'delivery_date' && bulkDeliveryDate ? { deliveryDate: bulkDeliveryDate } : {})
                        }
                        : order
                )
            );

            const { error } = await supabase
                .from('orders')
                .update(updateData)
                .in('id', selectedOrders);

            if (error) {
                // Si hay error, revertir los cambios locales
                await fetchData();
                throw error;
            }

            setSelectedOrders([]);
            setShowBulkActionsModal(false);

            const actionText = bulkActionType === 'status'
                ? `estado a "${getStatusInSpanish(bulkStatus)}"`
                : `fecha de entrega a "${bulkDeliveryDate?.toLocaleDateString('es-ES')}"`;

            showSuccess('Acción aplicada', `Se ha actualizado el ${actionText} en ${selectedOrders.length} pedido(s).`);

        } catch (error) {
            handleError(error, 'aplicar la acción masiva');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando pedidos...</p>
                </div>
            </div>
        );
    }

    const handlePrint = async (order: Order) => {
        try {
            // Obtener los items del pedido
            const { data: orderItemsData, error: orderItemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id)
                .order('created_at', { ascending: true });

            if (orderItemsError) {
                console.error('Error fetching order items:', orderItemsError);
                handleError(orderItemsError, 'obtener los detalles del pedido');
                return;
            }

            // Obtener información del cliente
            let clientData = null;
            if (order.clientId) {
                const { data, error: clientError } = await supabase
                    .from('clients')
                    .select('nombre, telefono, direccion, cedula')
                    .eq('id', order.clientId)
                    .single();

                if (clientError) {
                    console.error('Error fetching client:', clientError);
                    // No mostrar error, continuar sin datos del cliente
                } else {
                    clientData = data;
                }
            }

            // Transformar los items para que coincidan con el tipo OrderItem
            const transformedItems = (orderItemsData || []).map(item => ({
                id: item.id,
                orderId: item.order_id,
                productId: item.product_id,
                productName: item.product_name,
                productCategory: item.product_category,
                productVariant: item.product_variant,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unit_price),
                usePaginaPrice: item.use_pagina_price || false,
                usesSpecialPrice: item.uses_special_price || false,
                individualValue: parseFloat(item.unit_price), // Asumiendo que individual_value es igual a unit_price
                totalPrice: parseFloat(item.total_price),
                createdAt: new Date(item.created_at)
            }));

            // Función auxiliar para validar si un valor es válido
            const isValidValue = (value: any): boolean => {
                if (!value) return false;
                if (typeof value === 'string') {
                    const trimmed = value.trim();
                    return trimmed !== '' &&
                        trimmed !== 'null' &&
                        trimmed !== 'undefined' &&
                        trimmed !== '0000000000' &&
                        trimmed !== 'sin-email@ejemplo.com' &&
                        trimmed.length > 0;
                }
                return true;
            };

            // Función específica para validar cédula (puede ser '0000000000' si es válida)
            const isValidCedula = (value: any): boolean => {
                if (!value) return false;
                if (typeof value === 'string') {
                    const trimmed = value.trim();
                    return trimmed !== '' &&
                        trimmed !== 'null' &&
                        trimmed !== 'undefined' &&
                        trimmed !== 'sin-email@ejemplo.com' &&
                        trimmed.length > 0;
                }
                return true;
            };



            // Crear el pedido con los items y datos del cliente
            const orderWithItems: Order & {
                clientPhone?: string;
                clientAddress?: string;
                clientCedula?: string;
            } = {
                ...order,
                items: transformedItems,
                clientName: getClientName(order, clientData),
                clientPhone: isValidValue(clientData?.telefono) ? clientData!.telefono : 'No disponible',
                clientAddress: isValidValue(clientData?.direccion) ? clientData!.direccion : 'No disponible',
                clientCedula: isValidCedula(clientData?.cedula) ? clientData!.cedula : 'No disponible',
            };



            setSelectedOrder(orderWithItems);
            setShowPrintModal(true);
        } catch (error) {
            handleError(error, 'preparar la vista previa del pedido');
        }
    };

    const generatePDF = async () => {
        if (!selectedOrder) return;

        try {
            // Importar dinámicamente para evitar errores de SSR
            const { pdf } = await import('@react-pdf/renderer');
            const IndividualOrderPDF = (await import('@/components/pdf/IndividualOrderPDF')).default;

            // Obtener datos del cliente
            const clientData = await supabase
                .from('clients')
                .select('nombre, telefono, direccion, cedula')
                .eq('id', selectedOrder.clientId)
                .single();

            const pdfDocument = IndividualOrderPDF({
                order: selectedOrder,
                client: clientData.data as any
            });

            const blob = await pdf(pdfDocument as any).toBlob();

            // Crear enlace de descarga
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Pedido-${selectedOrder.orderNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            handleError(error, 'generar el PDF');
        }
    };

    // Función para traducir estados al español
    const getStatusInSpanish = (status: string): string => {
        switch (status) {
            case 'pending':
                return 'Pendiente';
            case 'ready':
                return 'Pagado';
            case 'delivered':
                return 'Entregado';
            case 'cancelled':
                return 'Cancelado';
            default:
                return status;
        }
    };

    // Funciones para previsualización de rutas
    const openRoutePreviewModal = (routeId: string) => {
        setSelectedRoute(routeId);
        setShowRoutePreviewModal(true);
    };

    const generateRoutePDF = async () => {
        if (!selectedRoute || !routePreviewRef.current) return;

        try {
            // Importar dinámicamente para evitar errores de SSR
            const jsPDF = (await import('jspdf')).default;
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(routePreviewRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a5');

            const imgWidth = 210;
            const pageHeight = 148;
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

            const route = routes.find(r => r.id === selectedRoute);
            pdf.save(`Guia-Ruta-${route?.identificador}-${route?.nombre}.pdf`);
        } catch (error) {
            console.error('Error generando PDF de ruta:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al generar el PDF de la ruta',
                text: 'Por favor, inténtalo de nuevo.',
                confirmButtonColor: '#3085d6'
            });
        }
    };

    // Obtener datos de la ruta seleccionada
    const getRouteData = () => {
        if (!selectedRoute) return { route: null, clients: [], orders: [], products: new Set() };

        const route = routes.find(r => r.id === selectedRoute);
        const routeClients = clients.filter(client => client.routeId === selectedRoute);
        const routeOrders = orders.filter(order => order.routeId === selectedRoute);

        // Obtener productos únicos de los pedidos de la ruta
        const routeProducts = new Set<string>();
        routeOrders.forEach(order => {
            order.items?.forEach(item => {
                routeProducts.add(`${item.productName} - ${item.productCategory} - ${item.productVariant}`);
            });
        });

        return { route, clients: routeClients, orders: routeOrders, products: routeProducts };
    };

    // Funciones para exportación y filtros
    const openExportModal = () => {
        setShowExportModal(true);
    };

    // Función para generar nombre del archivo PDF masivo
    const generateBulkPDFFileName = (): string => {
        const filters = [];

        if (searchTerm) {
            filters.push(`Busqueda-${searchTerm.replace(/[^a-zA-Z0-9]/g, '-')}`);
        }

        if (routeFilter) {
            const route = routes.find(r => r.id === routeFilter);
            filters.push(`Ruta-${route?.identificador || routeFilter}`);
        }

        if (dateFilterValue) {
            const filterType = dateFilterType === 'registration' ? 'Registro' : 'Entrega';
            const dateStr = dateFilterValue.toLocaleDateString('es-ES').replace(/\//g, '-');
            filters.push(`${filterType}-${dateStr}`);
        }

        const filterText = filters.length > 0 ? `-${filters.join('-')}` : '';
        const orderCount = filteredOrders.length;

        return `Notas-Pedido-Masivas${filterText}-${orderCount}-pedidos-${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`;
    };

    // Función para manejar la descarga del PDF masivo
    const handleBulkPDFDownload = async () => {
        if (isGeneratingBulkPDF) return;

        setIsGeneratingBulkPDF(true);

        try {
            // Importar dinámicamente para evitar errores de SSR
            const { pdf } = await import('@react-pdf/renderer');
            const BulkOrderNotesPDF = (await import('@/components/pdf/BulkOrderNotesPDF')).default;

            // Crear el documento PDF
            const pdfDocument = (
                <BulkOrderNotesPDF
                    orders={filteredOrders}
                    clients={clients}
                    routes={routes}
                    dateFilterType={dateFilterType}
                    dateFilterValue={dateFilterValue}
                    routeFilter={routeFilter}
                    searchTerm={searchTerm}
                />
            );

            // Generar y descargar el PDF
            const blob = await pdf(pdfDocument).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = generateBulkPDFFileName();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generando PDF masivo:', error);
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al generar el PDF. Inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsGeneratingBulkPDF(false);
        }
    };

    const generateExportPDF = async () => {
        if (!exportRef.current) return;

        try {
            // Importar dinámicamente para evitar errores de SSR
            const jsPDF = (await import('jspdf')).default;
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(exportRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a5');

            const imgWidth = 210;
            const pageHeight = 148;
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

            const routeFilterText = routeFilter ? `-Ruta-${routes.find(r => r.id === routeFilter)?.identificador}` : '';
            const dateFilterText = dateFilterValue ? `-${dateFilterType === 'registration' ? 'Registro' : 'Entrega'}-${dateFilterValue.toLocaleDateString('es-ES').replace(/\//g, '-')}` : '';
            const filterText = routeFilterText + dateFilterText;
            pdf.save(`Reporte-Pedidos${filterText}-${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`);
        } catch (error) {
            console.error('Error generando PDF de exportación:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al generar el PDF de exportación',
                text: 'Por favor, inténtalo de nuevo.',
                confirmButtonColor: '#3085d6'
            });
        }
    };

    // Obtener pedidos filtrados
    const getFilteredOrdersForExport = () => {
        let filtered = orders;

        // Aplicar filtro de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(order => {
                const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (order.clientName && order.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (order.routeName && order.routeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (order.routeId && routes.find(route => route.id === order.routeId)?.identificador.toLowerCase().includes(searchTerm.toLowerCase()));

                return matchesSearch;
            });
        }

        // Aplicar filtro de ruta
        if (routeFilter) {
            filtered = filtered.filter(order => order.routeId === routeFilter);
        }

        // Aplicar filtro de fecha
        if (dateFilterValue) {
            filtered = filtered.filter(order => orderMatchesDateFilter(order, dateFilterValue, dateFilterType));
        }

        return filtered;
    };

    // Con paginación del servidor, usamos directamente los pedidos cargados
    const filteredOrders = orders;
    const totalPages = Math.ceil(totalOrders / itemsPerPage);
    const paginatedOrders = orders; // Ya están paginados del servidor

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'ready': return 'bg-green-100 text-green-800';
            case 'delivered': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col">
            {/* Estilos personalizados para scroll y zoom */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 12px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #3b82f6;
                    border-radius: 6px;
                    border: 2px solid #f1f5f9;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #2563eb;
                }
                .custom-scrollbar::-webkit-scrollbar-corner {
                    background: #f1f5f9;
                }
                
                .shadow-left::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 20px;
                    height: 100%;
                    background: linear-gradient(to right, rgba(0, 0, 0, 0.1), transparent);
                    pointer-events: none;
                    z-index: 10;
                }
                
                .shadow-right::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 20px;
                    height: 100%;
                    background: linear-gradient(to left, rgba(0, 0, 0, 0.1), transparent);
                    pointer-events: none;
                    z-index: 10;
                }
                
                /* Estilos para mejorar la apariencia de la tabla con zoom */
                .zoom-friendly-table {
                    border-collapse: separate;
                    border-spacing: 0;
                }
                
                .zoom-friendly-table th,
                .zoom-friendly-table td {
                    border-right: 1px solid #e5e7eb;
                    border-bottom: 1px solid #e5e7eb;
                    position: relative;
                }
                
                .zoom-friendly-table th:last-child,
                .zoom-friendly-table td:last-child {
                    border-right: none;
                }
                
                .zoom-friendly-table tbody tr:last-child td {
                    border-bottom: none;
                }
                
                /* Mejorar la apariencia de las líneas divisorias con zoom */
                .zoom-friendly-table th::after,
                .zoom-friendly-table td::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 1px;
                    height: 100%;
                    background-color: #e5e7eb;
                    transform: scaleX(0.5);
                    transform-origin: right center;
                }
                
                .zoom-friendly-table th:last-child::after,
                .zoom-friendly-table td:last-child::after {
                    display: none;
                }
                
                /* Ajustar el grosor de las líneas para diferentes niveles de zoom */
                @media screen and (min-resolution: 1.5dppx) {
                    .zoom-friendly-table th,
                    .zoom-friendly-table td {
                        border-right: 0.5px solid #e5e7eb;
                        border-bottom: 0.5px solid #e5e7eb;
                    }
                }
                
                @media screen and (min-resolution: 2dppx) {
                    .zoom-friendly-table th,
                    .zoom-friendly-table td {
                        border-right: 0.5px solid #e5e7eb;
                        border-bottom: 0.5px solid #e5e7eb;
                    }
                }
            `}</style>
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
                                <ShoppingCart className="h-8 w-8 text-orange-500" />
                                <h1 className="text-2xl font-bold text-gray-900">Gestión de pedidos</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Nuevo pedido</span>
                            </button>
                            <button
                                onClick={() => setShowRoutePreviewModal(true)}
                                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <MapPinIcon className="h-4 w-4" />
                                <span>Guías de rutas</span>
                            </button>

                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="space-y-4">
                            {/* Primera fila: Búsqueda y Ruta */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por número de pedido, cliente, teléfono, estado o código de ruta..."
                                            value={tempSearchTerm}
                                            onChange={(e) => setTempSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-700"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                                    >
                                        <Search className="h-4 w-4" />
                                        Buscar
                                    </button>
                                    {searchTerm && (
                                        <button
                                            onClick={handleClearSearch}
                                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            Limpiar
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <select
                                        value={routeFilter}
                                        onChange={(e) => setRouteFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                                    >
                                        <option value="">Todas las rutas</option>
                                        {routes.filter(route => route.isActive).map((route) => (
                                            <option key={route.id} value={route.id}>
                                                {route.identificador} - {route.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Segunda fila: Filtro de fecha y botones */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Filtrar por fecha</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <select
                                            value={dateFilterType}
                                            onChange={(e) => setDateFilterType(e.target.value as 'registration' | 'delivery')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm"
                                        >
                                            <option value="registration">Fecha de registro</option>
                                            <option value="delivery">Fecha de entrega</option>
                                        </select>
                                        <DatePicker
                                            selected={dateFilterValue}
                                            onChange={(date) => setDateFilterValue(date)}
                                            placeholderText="Seleccionar fecha"
                                            dateFormat="dd/MM/yyyy"
                                            isClearable
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={openExportModal}
                                        className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                                    >
                                        <Printer className="h-4 w-4" />
                                        <span>Exportar</span>
                                    </button>

                                    {/* Botón de descarga masiva de notas de pedido */}
                                    {filteredOrders.length > 0 && (
                                        <button
                                            onClick={handleBulkPDFDownload}
                                            disabled={isGeneratingBulkPDF}
                                            className="flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span>
                                                {isGeneratingBulkPDF ? 'Generando PDF...' : `Descargar Notas (${filteredOrders.length})`}
                                            </span>
                                        </button>
                                    )}

                                    {selectedOrders.length > 0 && (
                                        <button
                                            onClick={() => setShowBulkActionsModal(true)}
                                            className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                        >
                                            <Check className="h-4 w-4" />
                                            <span>Acciones ({selectedOrders.length})</span>
                                        </button>
                                    )}
                                    {(searchTerm || routeFilter || dateFilterValue) && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setTempSearchTerm('');
                                                setRouteFilter('');
                                                setDateFilterValue(null);
                                            }}
                                            className="flex items-center justify-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                                        >
                                            <X className="h-4 w-4" />
                                            <span>Limpiar</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {/* Controles de scroll horizontal */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">Navegación horizontal:</span>
                                <button
                                    onClick={() => scrollTable('left')}
                                    disabled={!canScrollLeft}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    title="Desplazar hacia la izquierda"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => scrollTable('right')}
                                    disabled={!canScrollRight}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    title="Desplazar hacia la derecha"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                            <div className="text-xs text-gray-500">
                                Usa los botones o la barra de scroll azul para navegar
                            </div>
                        </div>

                        <div
                            ref={tableScrollRef}
                            className={`overflow-x-auto custom-scrollbar relative ${canScrollLeft ? 'shadow-left' : ''
                                } ${canScrollRight ? 'shadow-right' : ''
                                }`}
                            onScroll={checkScrollButtons}
                        >
                            <table className="min-w-full divide-y divide-gray-200 zoom-friendly-table">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                                onChange={(e) => handleSelectAllOrders(e.target.checked)}
                                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Número de pedido
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ruta
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha de registro
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha de entrega
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Opciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.includes(order.id)}
                                                    onChange={(e) => handleOrderSelection(order.id, e.target.checked)}
                                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                            <ShoppingCart className="h-5 w-5 text-orange-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.orderNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.clientName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {/* Teléfono del cliente no disponible en el tipo Order */}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                                            <MapPinIcon className="h-4 w-4 text-yellow-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.routeName || 'Sin asignar'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.orderDate.toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.deliveryDate ? order.deliveryDate.toLocaleDateString('es-ES') : 'Sin fecha'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])}
                                                        disabled={updatingStatus.has(order.id)}
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-none ${getStatusColor(order.status)} ${updatingStatus.has(order.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <option value="pending">Pendiente</option>
                                                        <option value="ready">Listo</option>
                                                        <option value="delivered">Entregado</option>
                                                        <option value="cancelled">Cancelado</option>
                                                    </select>
                                                    {updatingStatus.has(order.id) && (
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-1">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        ${order.totalAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button
                                                        onClick={() => handlePrint(order)}
                                                        className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                                        title="Imprimir pedido"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(order)}
                                                        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded text-xs font-medium border border-blue-200 hover:bg-blue-50"
                                                        title="Editar pedido"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="text-red-600 hover:text-red-900 px-3 py-1 rounded text-xs font-medium border border-red-200 hover:bg-red-50"
                                                        title="Eliminar pedido"
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

                        {/* Controles de paginación */}
                        {totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => {
                                            const newPage = Math.max(1, currentPage - 1);
                                            setCurrentPage(newPage);
                                            fetchOrdersWithPagination(newPage, itemsPerPage, true);
                                        }}
                                        disabled={currentPage === 1 || isLoadingMore}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => {
                                            const newPage = Math.min(totalPages, currentPage + 1);
                                            setCurrentPage(newPage);
                                            fetchOrdersWithPagination(newPage, itemsPerPage, true);
                                        }}
                                        disabled={currentPage === totalPages || isLoadingMore}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoadingMore ? 'Cargando...' : 'Siguiente'}
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Mostrando{' '}
                                            <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>
                                            {' '}a{' '}
                                            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalOrders)}</span>
                                            {' '}de{' '}
                                            <span className="font-medium">{totalOrders}</span>
                                            {' '}resultados
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button
                                                onClick={() => {
                                                    const newPage = Math.max(1, currentPage - 1);
                                                    setCurrentPage(newPage);
                                                    fetchOrdersWithPagination(newPage, itemsPerPage, true);
                                                }}
                                                disabled={currentPage === 1 || isLoadingMore}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Anterior</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {/* Números de página */}
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => {
                                                            setCurrentPage(pageNum);
                                                            fetchOrdersWithPagination(pageNum, itemsPerPage, true);
                                                        }}
                                                        disabled={isLoadingMore}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                                                            ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}

                                            <button
                                                onClick={() => {
                                                    const newPage = Math.min(totalPages, currentPage + 1);
                                                    setCurrentPage(newPage);
                                                    fetchOrdersWithPagination(newPage, itemsPerPage, true);
                                                }}
                                                disabled={currentPage === totalPages || isLoadingMore}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Siguiente</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Statistics */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total pedidos</p>
                                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                                </div>
                                <ShoppingCart className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pedidos pendientes</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {orders.filter(order => order.status === 'pending').length}
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-yellow-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pedidos pagados</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {orders.filter(order => order.status === 'ready').length}
                                    </p>
                                </div>
                                <Package className="h-8 w-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ventas totales</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        ${orders.filter(order => order.status === 'ready').reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Order Modal - Single Dynamic Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
                    onClick={handleModalBackdropClick}
                >
                    <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
                        {/* Header */}
                        <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                                    {editingOrder ? 'Editar Pedido' : 'Crear Nuevo Pedido'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                                {/* Left Column - Route, Client and Order Information */}
                                <div className="space-y-4 sm:space-y-6">
                                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Pedido</h4>
                                    {/* Route Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ruta de Entrega *
                                        </label>
                                        <select
                                            value={selectedRouteForOrder?.id || ''}
                                            onChange={(e) => {
                                                const route = routes.find(r => r.id === e.target.value);
                                                setSelectedRouteForOrder(route || null);
                                                setSelectedClient(null);
                                                setClientSearchTerm('');
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                                        >
                                            <option value="">Seleccionar una ruta... ({routes.length} disponibles)</option>
                                            {routes.map(route => (
                                                <option key={route.id} value={route.id}>
                                                    {route.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Client Search */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Buscar Cliente *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={clientSearchTerm}
                                                onChange={(e) => setClientSearchTerm(e.target.value)}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm sm:text-base"
                                                placeholder="Buscar cliente..."
                                                disabled={!selectedRouteForOrder}
                                            />
                                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        </div>

                                        {filteredClients.length > 0 && (
                                            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                                                {filteredClients.map((client) => (
                                                    <button
                                                        key={client.id}
                                                        onClick={() => setSelectedClient(client)}
                                                        className={`w-full text-left p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${selectedClient?.id === client.id ? 'bg-orange-50 border-orange-200' : ''
                                                            }`}
                                                    >
                                                        <div className="font-medium text-gray-900">{client.nombre}</div>
                                                        <div className="text-sm text-gray-600">{client.telefono || 'Sin teléfono'}</div>
                                                        <div className="text-sm text-gray-600">{client.direccion || 'Sin dirección'}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {selectedClient && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                <h5 className="font-medium text-blue-900 mb-2">Cliente Seleccionado:</h5>
                                                <p className="text-blue-800">{selectedClient.nombre}</p>
                                                <p className="text-sm text-blue-700">{selectedClient.telefono}</p>
                                                <p className="text-sm text-blue-700">{selectedClient.direccion}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Information */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Fecha del Pedido *
                                                </label>
                                                <DatePicker
                                                    selected={orderDate}
                                                    onChange={(date: Date | null) => date && setOrderDate(date)}
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm sm:text-base"
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="Seleccionar fecha"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Fecha de Entrega
                                                </label>
                                                <DatePicker
                                                    selected={deliveryDate}
                                                    onChange={(date: Date | null) => setDeliveryDate(date)}
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm sm:text-base"
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="Seleccionar fecha (opcional)"
                                                    minDate={orderDate}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Método de Pago *
                                            </label>
                                            <select
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm sm:text-base"
                                            >
                                                {paymentMethods.map((method) => (
                                                    <option key={method} value={method}>
                                                        {method}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Notas Adicionales
                                            </label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                rows={3}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm sm:text-base resize-none"
                                                placeholder="Observaciones especiales del pedido..."
                                            />
                                        </div>
                                    </div>

                                </div>

                                {/* Second Column - Products */}
                                <div className="space-y-4 sm:space-y-6">
                                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Productos del Pedido</h4>

                                    {/* Product Search */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Buscar Productos
                                        </label>
                                        <input
                                            type="text"
                                            value={productSearchTerm}
                                            onChange={(e) => setProductSearchTerm(e.target.value)}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm sm:text-base"
                                            placeholder={`Buscar productos... (${products.filter(p => p.isActive).length} disponibles)`}
                                        />
                                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    </div>

                                    {/* Current Products Info (when editing) */}
                                    {editingOrder && selectedItems.length > 0 && (
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <h5 className="font-medium text-blue-900 mb-2">Productos actuales del pedido:</h5>
                                            <div className="space-y-1">
                                                {selectedItems.map((item) => (
                                                    <div key={item.product.id} className="flex justify-between text-sm">
                                                        <span className="text-blue-800">{item.product.name} x {item.quantity}</span>
                                                        <span className="text-blue-700 font-medium">${item.usesSpecialPrice ? item.totalPrice.toString() : item.totalPrice.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Product Results */}
                                    {productSearchTerm && filteredProducts.length > 0 && (
                                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                                            {filteredProducts.map((product) => (
                                                <button
                                                    key={product.id}
                                                    onClick={async () => {
                                                        try {
                                                            await addProduct(product, 1);
                                                        } catch (error) {
                                                            console.error('Error adding product:', error);
                                                        }
                                                    }}
                                                    className="w-full text-left p-2 sm:p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{product.name}</div>
                                                            <div className="text-xs sm:text-sm text-gray-600 truncate">{product.categoryName} - {product.variant}</div>
                                                        </div>
                                                        <div className="text-right ml-2 flex-shrink-0">
                                                            <div className="font-medium text-green-600 text-sm sm:text-base">${product.priceRegular?.toFixed(2) || '0.00'}</div>
                                                            <div className="text-xs text-gray-500">Click para agregar</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Selected Products */}
                                    {selectedItems.length > 0 ? (
                                        <div className="space-y-3">
                                            <h5 className="font-medium text-gray-900">Productos Seleccionados ({selectedItems.length})</h5>
                                            <div className="max-h-64 overflow-y-auto space-y-2 sm:space-y-3">
                                                {selectedItems.map((item) => (
                                                    <div key={item.product.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.product.name}</div>
                                                            <div className="text-xs sm:text-sm text-gray-600 truncate">{item.product.categoryName}</div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 sm:space-x-3 ml-2">
                                                            <div className="flex items-center space-x-1 sm:space-x-2">
                                                                <label className="text-xs sm:text-sm text-gray-700">Cant:</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="0"
                                                                    value={quantityInputs[item.product.id] || ''}
                                                                    onChange={(e) => updateQuantity(item.product.id, e.target.value)}
                                                                    className="w-12 sm:w-16 px-1 sm:px-2 py-1 border border-gray-300 rounded text-center text-xs sm:text-sm"
                                                                />
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs sm:text-sm text-gray-600">
                                                                    ${item.usesSpecialPrice ? item.unitPrice.toString() : item.unitPrice.toFixed(2)} c/u
                                                                    {item.usesSpecialPrice && (
                                                                        <span className="ml-1 text-orange-600 font-medium">(Especial)</span>
                                                                    )}
                                                                </div>
                                                                <div className="font-medium text-green-600 text-sm sm:text-base">${item.usesSpecialPrice ? item.totalPrice.toString() : item.totalPrice.toFixed(2)}</div>
                                                            </div>
                                                            <button
                                                                onClick={() => removeProduct(item.product.id)}
                                                                className="text-red-500 hover:text-red-700 p-1"
                                                            >
                                                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="p-3 sm:p-4 bg-orange-50 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-base sm:text-lg font-semibold text-gray-900">Total:</span>
                                                    <span className="text-lg sm:text-xl font-bold text-orange-600">${selectedItems.some(item => item.usesSpecialPrice) ? calculateSubtotal().toString() : calculateSubtotal().toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 sm:py-8 text-gray-500">
                                            <Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
                                            <p className="text-sm sm:text-base">No hay productos agregados</p>
                                            <p className="text-xs sm:text-sm">Busca y agrega productos al pedido</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                                <button
                                    onClick={closeModal}
                                    className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancelar</span>
                                </button>
                                <button
                                    onClick={handleCreateOrder}
                                    disabled={!selectedClient || selectedItems.length === 0}
                                    className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    <Check className="h-4 w-4" />
                                    <span>{editingOrder ? 'Actualizar Pedido' : 'Crear Pedido'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Modal */}
            {showPrintModal && selectedOrder && (
                <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
                        <div className="mb-4 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Vista previa de impresión</h3>
                            <div className="space-x-2">
                                <button
                                    onClick={generatePDF}
                                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Descargar PDF
                                </button>
                                <button
                                    onClick={() => setShowPrintModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>

                        {/* Contenido a imprimir */}
                        <div ref={printRef} style={{
                            color: '#000000',
                            backgroundColor: '#ffffff',
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '11px',
                            lineHeight: '1.2',
                            padding: '15px',
                            border: '1px solid #d1d5db',
                            width: '210mm',
                            minHeight: '148mm',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Header */}
                            <div style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
                                <h1 style={{ color: '#000000', fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0' }}>Mega Donut</h1>
                                <p style={{ color: '#374151', margin: '0', fontSize: '14px' }}>Nota de Pedido</p>
                            </div>

                            {/* Pedido # */}
                            <div style={{ textAlign: 'center', marginBottom: '10px', padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                                <h2 style={{ color: '#000000', fontSize: '16px', fontWeight: 'bold', margin: '0' }}>
                                    Pedido #{(() => {
                                        // Función para generar identificador de 5 dígitos del ID del pedido
                                        const numbers = selectedOrder.id.replace(/\D/g, '');
                                        const firstFiveNumbers = numbers.substring(0, 5);
                                        return firstFiveNumbers.padStart(5, '0');
                                    })()}
                                </h2>
                            </div>

                            {/* Información del Cliente */}
                            <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                                <h3 style={{ color: '#000000', fontWeight: '600', marginBottom: '6px', margin: '0 0 6px 0', fontSize: '12px' }}>Cliente</h3>
                                <p style={{ color: '#111827', margin: '3px 0', fontSize: '9px' }}><strong>Nombre:</strong> {selectedOrder.clientName || 'No disponible'}</p>
                                {selectedOrder.deliveryDate && (
                                    <p style={{ color: '#111827', margin: '3px 0', fontSize: '9px' }}><strong>Fecha de entrega:</strong> {selectedOrder.deliveryDate.toLocaleDateString('es-ES')}</p>
                                )}
                                {selectedOrder.clientPhone && (
                                    <p style={{ color: '#111827', margin: '3px 0', fontSize: '9px' }}><strong>Teléfono:</strong> {selectedOrder.clientPhone}</p>
                                )}
                                {selectedOrder.clientAddress && (
                                    <p style={{ color: '#111827', margin: '3px 0', fontSize: '9px' }}><strong>Dirección:</strong> {selectedOrder.clientAddress}</p>
                                )}
                                {selectedOrder.clientCedula && (
                                    <p style={{ color: '#111827', margin: '3px 0', fontSize: '9px' }}><strong>Cédula:</strong> {selectedOrder.clientCedula}</p>
                                )}
                            </div>

                            {/* Productos */}
                            <div style={{ marginBottom: '10px' }}>
                                <h3 style={{ color: '#000000', fontWeight: '600', marginBottom: '8px', margin: '0 0 8px 0', fontSize: '11px' }}>Detalle de Productos</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                                            <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'left', fontWeight: '600', color: '#000000', fontSize: '9px' }}>Producto</th>
                                            <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', fontWeight: '600', color: '#000000', fontSize: '9px' }}>Cantidad</th>
                                            <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right', fontWeight: '600', color: '#000000', fontSize: '9px' }}>Precio Unit.</th>
                                            <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right', fontWeight: '600', color: '#000000', fontSize: '9px' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            selectedOrder.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td style={{ border: '1px solid #d1d5db', padding: '6px' }}>
                                                        <div>
                                                            <div style={{ color: '#000000', fontWeight: '500', fontSize: '9px' }}>{item.productName}</div>
                                                        </div>
                                                    </td>
                                                    <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', color: '#000000', fontSize: '9px' }}>{item.quantity}</td>
                                                    <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right', color: '#000000', fontSize: '9px' }}>${item.unitPrice.toFixed(2)}</td>
                                                    <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right', fontWeight: '500', color: '#000000', fontSize: '9px' }}>${item.totalPrice.toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', color: '#6b7280', fontSize: '9px' }}>
                                                    No hay productos en este pedido
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                                            <td colSpan={3} style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right', fontWeight: 'bold', color: '#000000', fontSize: '9px' }}>TOTAL A CANCELAR:</td>
                                            <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right', fontWeight: 'bold', fontSize: '11px', color: '#000000' }}>${selectedOrder.totalAmount.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Notas */}
                            {selectedOrder.notes && (
                                <div style={{ marginBottom: '10px' }}>
                                    <h3 style={{ color: '#000000', fontWeight: '600', marginBottom: '6px', margin: '0 0 6px 0', fontSize: '11px' }}>Notas adicionales</h3>
                                    <p style={{ color: '#111827', margin: '0', fontSize: '9px' }}>{selectedOrder.notes}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div style={{ marginTop: '10px', paddingTop: '6px', borderTop: '1px solid #d1d5db' }}>
                                <p style={{ textAlign: 'center', fontSize: '7px', fontWeight: '500', color: '#374151', margin: '0 0 3px 0', lineHeight: '1.2' }}>
                                    Gracias por su preferencia - Mega Donut<br />
                                    Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                                </p>
                                <p style={{ textAlign: 'center', fontSize: '6px', marginTop: '3px', fontWeight: '500', color: '#dc2626', margin: '3px 0 0 0', lineHeight: '1.2' }}>
                                    En caso de incumplimiento en el pago del valor establecido en la nota de pedido emitida por MEGA DONUT, el cliente se someterá a las acciones legales correspondientes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Previsualización de Rutas */}
            {showRoutePreviewModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={handleModalBackdropClick}
                >
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Guía de Ruta</h2>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={generateRoutePDF}
                                        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        <Printer className="h-4 w-4" />
                                        <span>Generar PDF</span>
                                    </button>
                                    <button
                                        onClick={() => setShowRoutePreviewModal(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Selector de Ruta */}
                        <div className="p-6 border-b border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccionar Ruta
                            </label>
                            <select
                                value={selectedRoute}
                                onChange={(e) => setSelectedRoute(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="">Seleccionar una ruta</option>
                                {routes.filter(route => route.isActive).map((route) => (
                                    <option key={route.id} value={route.id}>
                                        {route.identificador} - {route.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Contenido de la Guía */}
                        {selectedRoute && (
                            <div ref={routePreviewRef} className="p-6">
                                {(() => {
                                    const { route, clients, orders, products } = getRouteData();
                                    if (!route) return <p className="text-gray-500">Ruta no encontrada</p>;

                                    return (
                                        <div className="space-y-6">
                                            {/* Header de la Guía */}
                                            <div className="text-center border-b border-gray-200 pb-4">
                                                <h1 className="text-2xl font-bold text-black">Mega Donut</h1>
                                                <h2 className="text-xl font-semibold text-gray-800">Guía de Reparto - Ruta {route.identificador}</h2>
                                                <p className="text-lg text-gray-600">{route.nombre}</p>
                                                <p className="text-sm text-gray-500">
                                                    Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                                                </p>
                                            </div>

                                            {/* Resumen de la Ruta */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                                                    <p className="text-2xl font-bold text-blue-600">{clients.length}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                                                    <p className="text-2xl font-bold text-green-600">{orders.length}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-gray-600">Productos Únicos</p>
                                                    <p className="text-2xl font-bold text-orange-600">{products.size}</p>
                                                </div>
                                            </div>

                                            {/* Lista de Clientes */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Clientes de la Ruta</h3>
                                                <div className="space-y-3">
                                                    {clients.length > 0 ? (
                                                        clients.map((client, index) => (
                                                            <div key={client.id} className="border border-gray-200 rounded-lg p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <h4 className="font-medium text-gray-900">{index + 1}. {client.nombre}</h4>
                                                                        <p className="text-sm text-gray-600">Contacto: {client.nombre}</p>
                                                                        <p className="text-sm text-gray-600">Teléfono: {client.telefono}</p>
                                                                        <p className="text-sm text-gray-600">Dirección: {client.direccion}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                            }`}>
                                                                            {client.isActive ? 'Activo' : 'Inactivo'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 text-center py-4">No hay clientes asignados a esta ruta</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Lista de Productos */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos de la Ruta</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {Array.from(products).map((product, index) => (
                                                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                                                            <p className="font-medium text-gray-900">{product}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {products.size === 0 && (
                                                    <p className="text-gray-500 text-center py-4">No hay productos en pedidos de esta ruta</p>
                                                )}
                                            </div>

                                            {/* Detalle de Pedidos */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Pedidos</h3>
                                                <div className="space-y-3">
                                                    {orders.length > 0 ? (
                                                        orders.map((order, index) => (
                                                            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h4 className="font-medium text-gray-900">Pedido {order.orderNumber}</h4>
                                                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                                        {getStatusInSpanish(order.status)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600">Cliente: {order.clientName}</p>
                                                                <p className="text-sm text-gray-600">Fecha: {order.orderDate.toLocaleDateString('es-ES')}</p>
                                                                <p className="text-sm text-gray-600">Total: ${order.totalAmount.toFixed(2)}</p>
                                                                <div className="mt-2">
                                                                    <p className="text-sm font-medium text-gray-700">Productos:</p>
                                                                    <ul className="text-sm text-gray-600 list-disc list-inside">
                                                                        {order.items?.map((item, itemIndex) => (
                                                                            <li key={itemIndex}>
                                                                                {item.productName} - Cantidad: {item.quantity} - ${item.individualValue.toFixed(2)}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 text-center py-4">No hay pedidos en esta ruta</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="mt-8 pt-4 border-t border-gray-300">
                                                <p className="text-center text-sm text-gray-800 font-medium">
                                                    Guía de reparto generada para Mega Donut<br />
                                                    Ruta {route.identificador} - {route.nombre}
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

            {/* Modal de Exportación */}
            {showExportModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={handleModalBackdropClick}
                >
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Exportar Información de Pedidos</h2>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={generateExportPDF}
                                        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        <Printer className="h-4 w-4" />
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

                        {/* Contenido de Exportación */}
                        <div ref={exportRef} className="p-6">
                            {(() => {
                                const exportOrders = getFilteredOrdersForExport();
                                const totalAmount = exportOrders.reduce((sum, order) => sum + order.totalAmount, 0);
                                const routeFilterInfo = routeFilter ? routes.find(r => r.id === routeFilter) : null;

                                return (
                                    <div className="space-y-6">
                                        {/* Header del Reporte */}
                                        <div className="text-center border-b border-gray-200 pb-4">
                                            <h1 className="text-2xl font-bold text-black">Mega Donut</h1>
                                            <h2 className="text-xl font-semibold text-gray-800">Reporte de Pedidos</h2>
                                            <p className="text-sm text-gray-500">
                                                Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                                            </p>
                                            {(searchTerm || routeFilter || dateFilterValue) && (
                                                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                                    <p className="text-sm font-medium text-gray-700">Filtros aplicados:</p>
                                                    {searchTerm && <p className="text-sm text-gray-600">• Búsqueda: "{searchTerm}"</p>}
                                                    {routeFilterInfo && <p className="text-sm text-gray-600">• Ruta: {routeFilterInfo.identificador} - {routeFilterInfo.nombre}</p>}
                                                    {dateFilterValue && (
                                                        <p className="text-sm text-gray-600">
                                                            • Fecha de {dateFilterType === 'registration' ? 'registro' : 'entrega'}: {dateFilterValue.toLocaleDateString('es-ES')}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Resumen */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                                                <p className="text-2xl font-bold text-blue-600">{exportOrders.length}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                                                <p className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-600">Pedidos Pendientes</p>
                                                <p className="text-2xl font-bold text-yellow-600">
                                                    {exportOrders.filter(o => o.status === 'pending').length}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-600">Pedidos Pagados</p>
                                                <p className="text-2xl font-bold text-gray-600">
                                                    {exportOrders.filter(o => o.status === 'ready').length}
                                                </p>
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
                                                            <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">Ruta</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">Fecha</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">Estado</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-right text-black font-semibold">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {exportOrders.map((order, index) => (
                                                            <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                <td className="border border-gray-300 px-3 py-2 text-black">{order.orderNumber}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-black">{order.clientName}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-black">{order.routeName || 'Sin asignar'}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-black">{order.orderDate.toLocaleDateString('es-ES')}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-black">
                                                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                                        {getStatusInSpanish(order.status)}
                                                                    </span>
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-2 text-right font-medium text-black">${order.totalAmount.toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-gray-100">
                                                            <td colSpan={5} className="border border-gray-300 px-3 py-2 text-right font-bold text-black">TOTAL:</td>
                                                            <td className="border border-gray-300 px-3 py-2 text-right font-bold text-lg text-black">${totalAmount.toFixed(2)}</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-8 pt-4 border-t border-gray-300">
                                            <p className="text-center text-sm text-gray-800 font-medium">
                                                Reporte generado para Mega Donut<br />
                                                {exportOrders.length} pedidos encontrados
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Actions Modal */}
            {showBulkActionsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Acciones Masivas ({selectedOrders.length} pedidos)
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de acción
                                    </label>
                                    <select
                                        value={bulkActionType}
                                        onChange={(e) => setBulkActionType(e.target.value as 'status' | 'delivery_date')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="status">Cambiar estado</option>
                                        <option value="delivery_date">Cambiar fecha de entrega</option>
                                    </select>
                                </div>

                                {bulkActionType === 'status' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nuevo estado
                                        </label>
                                        <select
                                            value={bulkStatus}
                                            onChange={(e) => setBulkStatus(e.target.value as Order['status'])}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value="pending">Pendiente</option>
                                            <option value="ready">Listo</option>
                                            <option value="delivered">Entregado</option>
                                            <option value="cancelled">Cancelado</option>
                                        </select>
                                    </div>
                                )}

                                {bulkActionType === 'delivery_date' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nueva fecha de entrega
                                        </label>
                                        <DatePicker
                                            selected={bulkDeliveryDate}
                                            onChange={(date) => setBulkDeliveryDate(date)}
                                            placeholderText="Seleccionar fecha"
                                            dateFormat="dd/MM/yyyy"
                                            isClearable
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowBulkActionsModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleBulkAction}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Aplicar
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