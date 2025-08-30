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
    orderDate: Date;
    status: string;
    totalAmount: number;
    items: OrderItem[];
}

export interface OrderItem {
    productId: string;
    productName: string;
    productCategory: string;
    productVariant: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
