export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Tarjeta de crédito' | 'Tarjeta de débito' | 'Cheque';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCategory: string;
  productVariant: string;
  quantity: number;
  unitPrice: number;
  usePaginaPrice: boolean;
  individualValue: number; // quantity * unitPrice
}

export interface Order {
  id: string;
  orderNumber: string; // Número consecutivo de pedido
  
  // Información del cliente
  clientName: string;
  clientPhone: string;
  clientCity: string;
  clientAddress: string;
  
  // Información del pedido
  orderDate: Date;
  paymentMethod: PaymentMethod;
  routeId?: string; // ID de la ruta
  routeName?: string; // Nombre de la ruta para mostrar
  
  // Productos
  items: OrderItem[];
  
  // Valores calculados
  subtotal: number;
  totalAmount: number;
  
  // Estado
  status: 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado' | 'Cancelado';
  isActive: boolean;
  createdAt: Date;
  
  // Notas adicionales
  notes?: string;
}

export interface CreateOrderData {
  clientName: string;
  clientPhone: string;
  clientCity: string;
  clientAddress: string;
  paymentMethod: PaymentMethod;
  routeId?: string;
  items: Omit<OrderItem, 'id' | 'individualValue'>[];
  notes?: string;
}

export interface UpdateOrderData {
  clientName?: string;
  clientPhone?: string;
  clientCity?: string;
  clientAddress?: string;
  paymentMethod?: PaymentMethod;
  routeId?: string;
  items?: Omit<OrderItem, 'id' | 'individualValue'>[];
  status?: 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado' | 'Cancelado';
  notes?: string;
} 