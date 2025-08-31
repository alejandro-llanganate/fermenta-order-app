export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Tarjeta de crédito' | 'Tarjeta de débito' | 'Cheque';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productCategory: string;
  productVariant: string;
  quantity: number;
  unitPrice: number;
  usePaginaPrice: boolean;
  usesSpecialPrice: boolean; // Indica si usa precio especial
  individualValue: number;
  totalPrice: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName?: string;
  routeId?: string;
  routeIdentifier?: string;
  routeName?: string;
  orderDate: Date;
  deliveryDate?: Date;
  status: 'pending' | 'ready' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  items?: OrderItem[];
  totalItems?: number;
  productsSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderData {
  orderNumber: string;
  clientId: string;
  routeId?: string;
  orderDate: Date;
  deliveryDate?: Date;
  status?: 'pending' | 'ready' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateOrderData {
  orderNumber?: string;
  clientId?: string;
  routeId?: string;
  orderDate?: Date;
  deliveryDate?: Date;
  status?: 'pending' | 'ready' | 'delivered' | 'cancelled';
  totalAmount?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface CreateOrderItemData {
  orderId: string;
  productId: string;
  productName: string;
  productCategory: string;
  productVariant: string;
  quantity: number;
  unitPrice: number;
  usePaginaPrice: boolean;
  usesSpecialPrice: boolean; // Indica si usa precio especial
  individualValue: number;
  totalPrice: number;
} 