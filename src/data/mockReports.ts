import { SalesReport, ProductionReport, InventoryReport, RouteReport } from '@/types/reports';

// Reporte de ventas semanal
export const mockSalesReport: SalesReport = {
  id: '1',
  period: 'weekly',
  startDate: new Date('2024-03-11'),
  endDate: new Date('2024-03-17'),
  totalSales: 2580.50,
  totalOrders: 45,
  averageOrderValue: 57.34,
  topProducts: [
    {
      productId: '1',
      productName: 'Donut Chocolate',
      category: 'Donut',
      variant: 'choco',
      quantitySold: 240,
      totalRevenue: 96.00,
      averagePrice: 0.40
    },
    {
      productId: '7',
      productName: 'Dona Rellena Chantilly',
      category: 'Rellenas',
      variant: 'chantilly',
      quantitySold: 180,
      totalRevenue: 72.00,
      averagePrice: 0.40
    },
    {
      productId: '34',
      productName: 'Pastel Chocolate Normal',
      category: 'Pasteles chocolate',
      variant: 'normales',
      quantitySold: 25,
      totalRevenue: 125.00,
      averagePrice: 5.00
    },
    {
      productId: '19',
      productName: 'Pizza Cuadrada',
      category: 'Pizzas',
      variant: 'cuadrada',
      quantitySold: 85,
      totalRevenue: 59.50,
      averagePrice: 0.70
    },
    {
      productId: '28',
      productName: 'Pan Hamburguesa',
      category: 'Panes',
      variant: 'hamburguesa',
      quantitySold: 320,
      totalRevenue: 64.00,
      averagePrice: 0.20
    }
  ],
  salesByRoute: [
    {
      routeId: '1',
      routeName: 'NORTE',
      totalSales: 580.20,
      totalOrders: 12,
      averageOrderValue: 48.35,
      topProducts: [
        {
          productId: '1',
          productName: 'Donut Chocolate',
          category: 'Donut',
          variant: 'choco',
          quantitySold: 60,
          totalRevenue: 24.00,
          averagePrice: 0.40
        }
      ]
    },
    {
      routeId: '2',
      routeName: 'CENTRO',
      totalSales: 720.80,
      totalOrders: 15,
      averageOrderValue: 48.05,
      topProducts: [
        {
          productId: '34',
          productName: 'Pastel Chocolate Normal',
          category: 'Pasteles chocolate',
          variant: 'normales',
          quantitySold: 8,
          totalRevenue: 40.00,
          averagePrice: 5.00
        }
      ]
    },
    {
      routeId: '3',
      routeName: 'CARAPUNGO',
      totalSales: 465.30,
      totalOrders: 8,
      averageOrderValue: 58.16,
      topProducts: [
        {
          productId: '9',
          productName: 'Mini Donut Chocolate',
          category: 'Mini donut',
          variant: 'choco',
          quantitySold: 96,
          totalRevenue: 24.00,
          averagePrice: 0.25
        }
      ]
    },
    {
      routeId: '6',
      routeName: 'CUMBAYA',
      totalSales: 380.10,
      totalOrders: 6,
      averageOrderValue: 63.35,
      topProducts: [
        {
          productId: '28',
          productName: 'Pan Hamburguesa',
          category: 'Panes',
          variant: 'hamburguesa',
          quantitySold: 80,
          totalRevenue: 16.00,
          averagePrice: 0.20
        }
      ]
    },
    {
      routeId: '11',
      routeName: 'PAGINA',
      totalSales: 434.10,
      totalOrders: 4,
      averageOrderValue: 108.53,
      topProducts: [
        {
          productId: '1',
          productName: 'Donut Chocolate',
          category: 'Donut',
          variant: 'choco',
          quantitySold: 48,
          totalRevenue: 24.00,
          averagePrice: 0.50
        }
      ]
    }
  ],
  salesByPaymentMethod: [
    {
      paymentMethod: 'Efectivo',
      totalSales: 1548.30,
      orderCount: 28,
      percentage: 60.0
    },
    {
      paymentMethod: 'Transferencia',
      totalSales: 516.10,
      orderCount: 9,
      percentage: 20.0
    },
    {
      paymentMethod: 'Tarjeta de crédito',
      totalSales: 309.66,
      orderCount: 5,
      percentage: 12.0
    },
    {
      paymentMethod: 'Tarjeta de débito',
      totalSales: 206.44,
      orderCount: 3,
      percentage: 8.0
    }
  ]
};

// Reporte de producción diario
export const mockProductionReport: ProductionReport = {
  id: '1',
  date: new Date('2024-03-17'),
  plannedProduction: [
    {
      productId: '1',
      productName: 'Donut Chocolate',
      category: 'Donut',
      variant: 'choco',
      plannedQuantity: 200,
      actualQuantity: 195,
      unitCost: 0.15,
      totalCost: 30.00
    },
    {
      productId: '7',
      productName: 'Dona Rellena Chantilly',
      category: 'Rellenas',
      variant: 'chantilly',
      plannedQuantity: 150,
      actualQuantity: 160,
      unitCost: 0.18,
      totalCost: 27.00
    },
    {
      productId: '34',
      productName: 'Pastel Chocolate Normal',
      category: 'Pasteles chocolate',
      variant: 'normales',
      plannedQuantity: 20,
      actualQuantity: 18,
      unitCost: 2.50,
      totalCost: 50.00
    },
    {
      productId: '19',
      productName: 'Pizza Cuadrada',
      category: 'Pizzas',
      variant: 'cuadrada',
      plannedQuantity: 100,
      actualQuantity: 105,
      unitCost: 0.35,
      totalCost: 35.00
    },
    {
      productId: '28',
      productName: 'Pan Hamburguesa',
      category: 'Panes',
      variant: 'hamburguesa',
      plannedQuantity: 300,
      actualQuantity: 285,
      unitCost: 0.08,
      totalCost: 24.00
    }
  ],
  actualProduction: [
    {
      productId: '1',
      productName: 'Donut Chocolate',
      category: 'Donut',
      variant: 'choco',
      plannedQuantity: 200,
      actualQuantity: 195,
      unitCost: 0.15,
      totalCost: 29.25
    },
    {
      productId: '7',
      productName: 'Dona Rellena Chantilly',
      category: 'Rellenas',
      variant: 'chantilly',
      plannedQuantity: 150,
      actualQuantity: 160,
      unitCost: 0.18,
      totalCost: 28.80
    },
    {
      productId: '34',
      productName: 'Pastel Chocolate Normal',
      category: 'Pasteles chocolate',
      variant: 'normales',
      plannedQuantity: 20,
      actualQuantity: 18,
      unitCost: 2.50,
      totalCost: 45.00
    },
    {
      productId: '19',
      productName: 'Pizza Cuadrada',
      category: 'Pizzas',
      variant: 'cuadrada',
      plannedQuantity: 100,
      actualQuantity: 105,
      unitCost: 0.35,
      totalCost: 36.75
    },
    {
      productId: '28',
      productName: 'Pan Hamburguesa',
      category: 'Panes',
      variant: 'hamburguesa',
      plannedQuantity: 300,
      actualQuantity: 285,
      unitCost: 0.08,
      totalCost: 22.80
    }
  ],
  variance: [
    {
      productId: '1',
      productName: 'Donut Chocolate',
      plannedQuantity: 200,
      actualQuantity: 195,
      variance: -5,
      variancePercentage: -2.5
    },
    {
      productId: '7',
      productName: 'Dona Rellena Chantilly',
      plannedQuantity: 150,
      actualQuantity: 160,
      variance: 10,
      variancePercentage: 6.7
    },
    {
      productId: '34',
      productName: 'Pastel Chocolate Normal',
      plannedQuantity: 20,
      actualQuantity: 18,
      variance: -2,
      variancePercentage: -10.0
    },
    {
      productId: '19',
      productName: 'Pizza Cuadrada',
      plannedQuantity: 100,
      actualQuantity: 105,
      variance: 5,
      variancePercentage: 5.0
    },
    {
      productId: '28',
      productName: 'Pan Hamburguesa',
      plannedQuantity: 300,
      actualQuantity: 285,
      variance: -15,
      variancePercentage: -5.0
    }
  ],
  efficiency: 96.2,
  totalCost: 162.60
};

// Reporte de inventario
export const mockInventoryReport: InventoryReport = {
  id: '1',
  date: new Date('2024-03-17'),
  products: [
    {
      productId: '1',
      productName: 'Donut Chocolate',
      category: 'Donut',
      currentStock: 45,
      minimumStock: 20,
      unitValue: 0.40,
      totalValue: 18.00,
      status: 'normal'
    },
    {
      productId: '7',
      productName: 'Dona Rellena Chantilly',
      category: 'Rellenas',
      currentStock: 15,
      minimumStock: 20,
      unitValue: 0.40,
      totalValue: 6.00,
      status: 'low'
    },
    {
      productId: '34',
      productName: 'Pastel Chocolate Normal',
      category: 'Pasteles chocolate',
      currentStock: 8,
      minimumStock: 5,
      unitValue: 5.00,
      totalValue: 40.00,
      status: 'normal'
    },
    {
      productId: '19',
      productName: 'Pizza Cuadrada',
      category: 'Pizzas',
      currentStock: 0,
      minimumStock: 10,
      unitValue: 0.70,
      totalValue: 0.00,
      status: 'out-of-stock'
    },
    {
      productId: '28',
      productName: 'Pan Hamburguesa',
      category: 'Panes',
      currentStock: 125,
      minimumStock: 50,
      unitValue: 0.20,
      totalValue: 25.00,
      status: 'normal'
    }
  ],
  totalValue: 89.00,
  lowStockItems: [
    {
      productId: '7',
      productName: 'Dona Rellena Chantilly',
      category: 'Rellenas',
      currentStock: 15,
      minimumStock: 20,
      unitValue: 0.40,
      totalValue: 6.00,
      status: 'low'
    },
    {
      productId: '19',
      productName: 'Pizza Cuadrada',
      category: 'Pizzas',
      currentStock: 0,
      minimumStock: 10,
      unitValue: 0.70,
      totalValue: 0.00,
      status: 'out-of-stock'
    }
  ]
};

// Reporte por ruta
export const mockRouteReports: RouteReport[] = [
  {
    id: '1',
    routeId: '1',
    routeName: 'NORTE',
    period: 'weekly',
    startDate: new Date('2024-03-11'),
    endDate: new Date('2024-03-17'),
    totalClients: 45,
    activeClients: 38,
    totalSales: 580.20,
    averageSalePerClient: 15.27,
    topProducts: [
      {
        productId: '1',
        productName: 'Donut Chocolate',
        category: 'Donut',
        variant: 'choco',
        quantitySold: 60,
        totalRevenue: 24.00,
        averagePrice: 0.40
      },
      {
        productId: '28',
        productName: 'Pan Hamburguesa',
        category: 'Panes',
        variant: 'hamburguesa',
        quantitySold: 45,
        totalRevenue: 9.00,
        averagePrice: 0.20
      }
    ],
    deliveryEfficiency: 95.2
  },
  {
    id: '2',
    routeId: '11',
    routeName: 'PAGINA',
    period: 'weekly',
    startDate: new Date('2024-03-11'),
    endDate: new Date('2024-03-17'),
    totalClients: 25,
    activeClients: 22,
    totalSales: 434.10,
    averageSalePerClient: 19.73,
    topProducts: [
      {
        productId: '1',
        productName: 'Donut Chocolate',
        category: 'Donut',
        variant: 'choco',
        quantitySold: 48,
        totalRevenue: 24.00,
        averagePrice: 0.50
      },
      {
        productId: '9',
        productName: 'Mini Donut Chocolate',
        category: 'Mini donut',
        variant: 'choco',
        quantitySold: 96,
        totalRevenue: 24.00,
        averagePrice: 0.25
      }
    ],
    deliveryEfficiency: 88.0
  }
]; 