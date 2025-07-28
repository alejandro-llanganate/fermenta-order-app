'use client';

import { useState, useRef } from 'react';
import {
    ShoppingCart,
    Plus,
    Search,
    ArrowLeft,
    Check,
    X,
    UserCheck,
    UserX,
    Calendar,
    DollarSign,
    Printer,
    Eye,
    Trash2,
    Edit3,
    Building,
    Phone,
    MapPin as MapPinIcon,
    CreditCard,
    Package
} from 'lucide-react';
import { Order, CreateOrderData, UpdateOrderData, PaymentMethod, OrderItem } from '@/types/order';
import { Product } from '@/types/product';
import { Client } from '@/types/client';
import { Route } from '@/types/route';
import { mockOrders } from '@/data/mockOrders';
import { mockProducts } from '@/data/mockProducts';
import { mockClients } from '@/data/mockClients';
import { mockRoutes } from '@/data/mockRoutes';
import Footer from './Footer';

interface OrdersManagementProps {
    onBack: () => void;
}

export default function OrdersManagement({ onBack }: OrdersManagementProps) {
    const [orders, setOrders] = useState<Order[]>(mockOrders);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

      // Estados para el formulario
  const [formData, setFormData] = useState<CreateOrderData>({
    clientName: '',
    clientPhone: '',
    clientCity: '',
    clientAddress: '',
    paymentMethod: 'Efectivo',
    routeId: '',
    items: [],
    notes: ''
  });

    // Estados para búsquedas
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);

    const paymentMethods: PaymentMethod[] = ['Efectivo', 'Transferencia', 'Tarjeta de crédito', 'Tarjeta de débito', 'Cheque'];

    const filteredClients = mockClients.filter(client =>
        client.institucionEducativa.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        client.nombreCompleto.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        client.telefono.includes(clientSearchTerm)
    ).slice(0, 5);

    const filteredProducts = mockProducts.filter(product =>
        product.isActive && (
            product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
            product.variant.toLowerCase().includes(productSearchTerm.toLowerCase())
        )
    ).slice(0, 10);

    const generateOrderNumber = () => {
        const lastOrder = orders.sort((a, b) => parseInt(b.orderNumber.split('-')[1]) - parseInt(a.orderNumber.split('-')[1]))[0];
        const lastNumber = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[1]) : 0;
        return `PED-${String(lastNumber + 1).padStart(3, '0')}`;
    };

    const calculateTotals = (items: OrderItem[]) => {
        const subtotal = items.reduce((sum, item) => sum + item.individualValue, 0);
        return { subtotal, totalAmount: subtotal };
    };

    const selectClient = (client: Client) => {
        setFormData({
            ...formData,
            clientName: client.nombreCompleto,
            clientPhone: client.telefono,
            clientCity: 'Quito', // Por defecto
            clientAddress: client.direccion
        });
        setClientSearchTerm(client.nombreCompleto);
        setShowClientDropdown(false);
    };

    const addProduct = (product: Product) => {
        const newItem: OrderItem = {
            id: Date.now().toString(),
            productId: product.id,
            productName: product.name,
            productCategory: product.category,
            productVariant: product.variant,
            quantity: 1,
            unitPrice: product.priceRegular,
            usePaginaPrice: false,
            individualValue: product.priceRegular
        };

        setSelectedItems([...selectedItems, newItem]);
        setProductSearchTerm('');
        setShowProductDropdown(false);
    };

    const updateItemQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(itemId);
            return;
        }

        setSelectedItems(selectedItems.map(item =>
            item.id === itemId
                ? { ...item, quantity, individualValue: quantity * item.unitPrice }
                : item
        ));
    };

    const togglePaginaPrice = (itemId: string, product: Product) => {
        setSelectedItems(selectedItems.map(item => {
            if (item.id === itemId) {
                const usePagina = !item.usePaginaPrice;
                const unitPrice = usePagina && product.pricePage ? product.pricePage : product.priceRegular;
                return {
                    ...item,
                    usePaginaPrice: usePagina,
                    unitPrice,
                    individualValue: item.quantity * unitPrice
                };
            }
            return item;
        }));
    };

    const removeItem = (itemId: string) => {
        setSelectedItems(selectedItems.filter(item => item.id !== itemId));
    };

      const handleCreateOrder = () => {
    if (selectedItems.length === 0 || !formData.clientName.trim()) return;

    const { subtotal, totalAmount } = calculateTotals(selectedItems);
    const selectedRoute = mockRoutes.find(route => route.id === formData.routeId);
    
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: generateOrderNumber(),
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      clientCity: formData.clientCity,
      clientAddress: formData.clientAddress,
      orderDate: new Date(),
      paymentMethod: formData.paymentMethod,
      routeId: formData.routeId,
      routeName: selectedRoute?.nombre,
      items: selectedItems,
      subtotal,
      totalAmount,
      status: 'Pendiente',
      isActive: true,
      createdAt: new Date(),
      notes: formData.notes
    };

    setOrders([newOrder, ...orders]);
    setShowCreateModal(false);
    resetForm();
  };

      const handleUpdateOrder = () => {
    if (!editingOrder || selectedItems.length === 0) return;

    const { subtotal, totalAmount } = calculateTotals(selectedItems);
    const selectedRoute = mockRoutes.find(route => route.id === formData.routeId);
    
    const updatedOrders = orders.map(order =>
      order.id === editingOrder.id
        ? { 
            ...order, 
            ...formData,
            routeName: selectedRoute?.nombre,
            items: selectedItems,
            subtotal,
            totalAmount
          }
        : order
    );

    setOrders(updatedOrders);
    setEditingOrder(null);
    resetForm();
  };

    const handleDeleteOrder = (orderId: string) => {
        if (confirm('¿Está seguro de que desea eliminar este pedido? Esta acción no se puede deshacer.')) {
            setOrders(orders.filter(order => order.id !== orderId));
        }
    };

    const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
        setOrders(orders.map(order =>
            order.id === orderId
                ? { ...order, status: newStatus }
                : order
        ));
    };

      const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      clientName: order.clientName,
      clientPhone: order.clientPhone,
      clientCity: order.clientCity,
      clientAddress: order.clientAddress,
      paymentMethod: order.paymentMethod,
      routeId: order.routeId || '',
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productCategory: item.productCategory,
        productVariant: item.productVariant,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        usePaginaPrice: item.usePaginaPrice
      })),
      notes: order.notes || ''
    });
    setSelectedItems([...order.items]);
    setClientSearchTerm(order.clientName);
  };

      const resetForm = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      clientCity: '',
      clientAddress: '',
      paymentMethod: 'Efectivo',
      routeId: '',
      items: [],
      notes: ''
    });
    setSelectedItems([]);
    setClientSearchTerm('');
    setProductSearchTerm('');
  };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingOrder(null);
        resetForm();
    };

    const handleModalBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const handlePrint = async (order: Order) => {
        setSelectedOrder(order);
        setShowPrintModal(true);
    };

    const generatePDF = async () => {
        if (!selectedOrder || !printRef.current) return;

        try {
            // Importar dinámicamente para evitar errores de SSR
            const jsPDF = (await import('jspdf')).default;
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(printRef.current, {
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

            pdf.save(`Pedido-${selectedOrder.orderNumber}.pdf`);
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.clientPhone.includes(searchTerm) ||
            order.status.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
            case 'En preparación': return 'bg-blue-100 text-blue-800';
            case 'Listo': return 'bg-green-100 text-green-800';
            case 'Entregado': return 'bg-gray-100 text-gray-800';
            case 'Cancelado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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
                                <ShoppingCart className="h-8 w-8 text-orange-500" />
                                <h1 className="text-2xl font-bold text-gray-900">Gestión de pedidos</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Nuevo pedido</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                          <input
                type="text"
                placeholder="Buscar por número de pedido, cliente, teléfono o estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-700"
              />
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
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
                      Fecha
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
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
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
                            {order.clientPhone}
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])}
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-none ${getStatusColor(order.status)}`}
                                                >
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="En preparación">En preparación</option>
                                                    <option value="Listo">Listo</option>
                                                    <option value="Entregado">Entregado</option>
                                                    <option value="Cancelado">Cancelado</option>
                                                </select>
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
                                        {orders.filter(order => order.status === 'Pendiente').length}
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-yellow-500" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pedidos entregados</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {orders.filter(order => order.status === 'Entregado').length}
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
                                        ${orders.filter(order => order.status === 'Entregado').reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingOrder) && (
                <div
                    className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
                    onClick={handleModalBackdropClick}
                >
                    <div className="relative top-20 mx-auto p-5 border w-[900px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingOrder ? 'Modificar pedido' : 'Crear nuevo pedido'}
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Información del Cliente */}
                                <div className="space-y-4">
                                    <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Información del Cliente</h4>

                                    {/* Búsqueda de Cliente */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Buscar cliente existente
                                        </label>
                                                            <input
                      type="text"
                      value={clientSearchTerm}
                      onChange={(e) => {
                        setClientSearchTerm(e.target.value);
                        setShowClientDropdown(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowClientDropdown(clientSearchTerm.length > 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-700"
                      placeholder="Buscar por nombre o institución..."
                    />

                                        {showClientDropdown && filteredClients.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {filteredClients.map((client) => (
                                                    <button
                                                        key={client.id}
                                                        type="button"
                                                        onClick={() => selectClient(client)}
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="font-medium text-gray-900">{client.nombreCompleto}</div>
                                                        <div className="text-sm text-gray-600">{client.institucionEducativa}</div>
                                                        <div className="text-xs text-gray-500">{client.telefono}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Campos del Cliente */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre del cliente *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.clientName}
                                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-700"
                                            placeholder="Nombre completo del cliente"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono *
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.clientPhone}
                                                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-700"
                                                placeholder="0999999999"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ciudad *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.clientCity}
                                                onChange={(e) => setFormData({ ...formData, clientCity: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-700"
                                                placeholder="Ciudad"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dirección *
                                        </label>
                                        <textarea
                                            value={formData.clientAddress}
                                            onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-700"
                                            placeholder="Dirección completa"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Forma de pago *
                                            </label>
                                            <select
                                                value={formData.paymentMethod}
                                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                                            >
                                                {paymentMethods.map(method => (
                                                    <option key={method} value={method}>{method}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ruta de entrega
                                            </label>
                                            <select
                                                value={formData.routeId || ''}
                                                onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                                            >
                                                <option value="">Seleccionar ruta...</option>
                                                {mockRoutes.filter(route => route.isActive).map(route => (
                                                    <option key={route.id} value={route.id}>
                                                        {route.identificador} - {route.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notas adicionales
                                        </label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-700"
                                            placeholder="Observaciones del pedido..."
                                        />
                                    </div>
                                </div>

                                {/* Productos del Pedido */}
                                <div className="space-y-4">
                                    <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Productos del Pedido</h4>

                                    {/* Búsqueda de Productos */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Agregar productos
                                        </label>
                                        <input
                                            type="text"
                                            value={productSearchTerm}
                                            onChange={(e) => {
                                                setProductSearchTerm(e.target.value);
                                                setShowProductDropdown(e.target.value.length > 0);
                                            }}
                                            onFocus={() => setShowProductDropdown(productSearchTerm.length > 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-700"
                                            placeholder="Buscar productos..."
                                        />

                                        {showProductDropdown && filteredProducts.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {filteredProducts.map((product) => (
                                                    <button
                                                        key={product.id}
                                                        type="button"
                                                        onClick={() => addProduct(product)}
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-sm text-gray-600">{product.category} - {product.variant}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Regular: ${product.priceRegular.toFixed(2)}
                                                            {product.pricePage && ` | PAGINA: $${product.pricePage.toFixed(2)}`}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Lista de Productos Seleccionados */}
                                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                                        {selectedItems.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                No hay productos agregados
                                            </div>
                                        ) : (
                                            <div className="space-y-2 p-3">
                                                {selectedItems.map((item) => {
                                                    const product = mockProducts.find(p => p.id === item.productId);
                                                    return (
                                                        <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-gray-900">{item.productName}</div>
                                                                    <div className="text-sm text-gray-600">{item.productCategory} - {item.productVariant}</div>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>

                                                            <div className="mt-2 grid grid-cols-3 gap-2 items-end">
                                                                <div>
                                                                    <label className="text-xs text-gray-600">Cantidad</label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={item.quantity}
                                                                        onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 text-gray-900"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="text-xs text-gray-600">Precio Unit.</label>
                                                                    <div className="text-sm font-medium">${item.unitPrice.toFixed(2)}</div>
                                                                </div>

                                                                <div>
                                                                    <label className="text-xs text-gray-600">Total</label>
                                                                    <div className="text-sm font-bold">${item.individualValue.toFixed(2)}</div>
                                                                </div>
                                                            </div>

                                                            {product?.pricePage && (
                                                                <div className="mt-2">
                                                                    <label className="flex items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={item.usePaginaPrice}
                                                                            onChange={() => togglePaginaPrice(item.id, product)}
                                                                            className="mr-2"
                                                                        />
                                                                        <span className="text-xs text-orange-600">Usar precio PAGINA (${product.pricePage.toFixed(2)})</span>
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {/* Total */}
                                                <div className="border-t pt-2 mt-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-gray-900">TOTAL:</span>
                                                        <span className="font-bold text-lg text-orange-600">
                                                            ${calculateTotals(selectedItems).totalAmount.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                    onClick={editingOrder ? handleUpdateOrder : handleCreateOrder}
                                    disabled={!formData.clientName.trim() || selectedItems.length === 0}
                                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Check className="h-4 w-4" />
                                    <span>{editingOrder ? 'Guardar cambios' : 'Crear pedido'}</span>
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
                        <div ref={printRef} className="bg-white p-8 border border-gray-300">
                            {/* Header */}
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold text-black">Panadería Encarnación</h1>
                                <p className="text-gray-800">Sistema Qitson - Nota de Pedido</p>
                            </div>

                            {/* Información del Pedido */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-semibold text-black mb-2">Información del Pedido</h3>
                                    <p className="text-gray-900"><strong>Número:</strong> {selectedOrder.orderNumber}</p>
                                    <p className="text-gray-900"><strong>Fecha:</strong> {selectedOrder.orderDate.toLocaleDateString('es-ES')}</p>
                                    <p className="text-gray-900"><strong>Estado:</strong> {selectedOrder.status}</p>
                                    <p className="text-gray-900"><strong>Forma de pago:</strong> {selectedOrder.paymentMethod}</p>
                                    {selectedOrder.routeName && (
                                        <p className="text-gray-900"><strong>Ruta:</strong> {selectedOrder.routeName}</p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-black mb-2">Información del Cliente</h3>
                                    <p className="text-gray-900"><strong>Nombre:</strong> {selectedOrder.clientName}</p>
                                    <p className="text-gray-900"><strong>Teléfono:</strong> {selectedOrder.clientPhone}</p>
                                    <p className="text-gray-900"><strong>Ciudad:</strong> {selectedOrder.clientCity}</p>
                                    <p className="text-gray-900"><strong>Dirección:</strong> {selectedOrder.clientAddress}</p>
                                </div>
                            </div>

                            {/* Productos */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-black mb-3">Detalle de Productos</h3>
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 px-3 py-2 text-left text-black font-semibold">Producto</th>
                                            <th className="border border-gray-300 px-3 py-2 text-center text-black font-semibold">Cantidad</th>
                                            <th className="border border-gray-300 px-3 py-2 text-right text-black font-semibold">Precio Unit.</th>
                                            <th className="border border-gray-300 px-3 py-2 text-right text-black font-semibold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="border border-gray-300 px-3 py-2">
                                                    <div>
                                                        <div className="font-medium text-black">{item.productName}</div>
                                                        <div className="text-sm text-gray-800">{item.productCategory} - {item.productVariant}</div>
                                                        {item.usePaginaPrice && <div className="text-xs text-orange-800 font-medium">Precio PAGINA</div>}
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 px-3 py-2 text-center text-black">{item.quantity}</td>
                                                <td className="border border-gray-300 px-3 py-2 text-right text-black">${item.unitPrice.toFixed(2)}</td>
                                                <td className="border border-gray-300 px-3 py-2 text-right font-medium text-black">${item.individualValue.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-100">
                                            <td colSpan={3} className="border border-gray-300 px-3 py-2 text-right font-bold text-black">TOTAL A CANCELAR:</td>
                                            <td className="border border-gray-300 px-3 py-2 text-right font-bold text-lg text-black">${selectedOrder.totalAmount.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Notas */}
                            {selectedOrder.notes && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-black mb-2">Notas adicionales</h3>
                                    <p className="text-gray-900">{selectedOrder.notes}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="mt-8 pt-4 border-t border-gray-300">
                                <p className="text-center text-sm text-gray-800 font-medium">
                                    Gracias por su preferencia - Panadería Encarnación<br />
                                    Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
} 