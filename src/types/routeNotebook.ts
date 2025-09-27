export interface Route {
    id: string;
    identificador: string;
    nombre: string;
    isActive: boolean;
}

export interface Client {
    id: string;
    nombre: string;
    routeId: string;
    isActive: boolean;
    telefono?: string;
    direccion?: string;
    cedula?: string;
    email?: string;
}

export interface Product {
    id: string;
    name: string;
    categoryName: string;
    variant: string;
    priceRegular: number;
    isActive: boolean;
}

export interface ProductCategory {
    name: string;
    products: Product[];
}

export interface Order {
    id: string;
    orderNumber: string;
    clientId: string;
    clientName: string;
    routeId: string;
    routeName: string;
    routeIdentifier: string;
    orderDate: Date;
    deliveryDate?: Date;
    status: string;
    totalAmount: number;
    shippingSurcharge: number;
    notes?: string;
    paymentMethod?: string;
    items: OrderItem[];
    itemsCount: number;
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    productCategory: string;
    productVariant: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
