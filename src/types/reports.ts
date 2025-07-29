export interface SalesReport {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: ProductSalesData[];
  salesByRoute: RouteSalesData[];
  salesByPaymentMethod: PaymentMethodSalesData[];
}

export interface ProductSalesData {
  productId: string;
  productName: string;
  category: string;
  variant: string;
  quantitySold: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface RouteSalesData {
  routeId: string;
  routeName: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: ProductSalesData[];
}

export interface PaymentMethodSalesData {
  paymentMethod: string;
  totalSales: number;
  orderCount: number;
  percentage: number;
}

export interface ProductionReport {
  id: string;
  date: Date;
  plannedProduction: ProductionItem[];
  actualProduction: ProductionItem[];
  variance: ProductionVariance[];
  efficiency: number;
  totalCost: number;
}

export interface ProductionItem {
  productId: string;
  productName: string;
  category: string;
  variant: string;
  plannedQuantity: number;
  actualQuantity?: number;
  unitCost: number;
  totalCost: number;
}

export interface ProductionVariance {
  productId: string;
  productName: string;
  plannedQuantity: number;
  actualQuantity: number;
  variance: number;
  variancePercentage: number;
}

export interface InventoryReport {
  id: string;
  date: Date;
  products: InventoryItem[];
  totalValue: number;
  lowStockItems: InventoryItem[];
}

export interface InventoryItem {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unitValue: number;
  totalValue: number;
  status: 'normal' | 'low' | 'out-of-stock';
}

export interface RouteReport {
  id: string;
  routeId: string;
  routeName: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalClients: number;
  activeClients: number;
  totalSales: number;
  averageSalePerClient: number;
  topProducts: ProductSalesData[];
  deliveryEfficiency: number;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  routeIds?: string[];
  productCategories?: string[];
  paymentMethods?: string[];
  clientIds?: string[];
}

export type ReportType = 'sales' | 'production' | 'inventory' | 'routes' | 'products' | 'comparative'; 