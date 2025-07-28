import { Order } from '@/types/order';

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'PED-001',
    clientName: 'María Elena González',
    clientPhone: '0998765432',
    clientCity: 'Quito',
    clientAddress: 'Av. 10 de Agosto N24-15 y Cordero',
    orderDate: new Date('2024-03-15T10:30:00'),
    paymentMethod: 'Efectivo',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Donut Chocolate',
        productCategory: 'Donut',
        productVariant: 'choco',
        quantity: 12,
        unitPrice: 0.40,
        usePaginaPrice: false,
        individualValue: 4.80
      },
      {
        id: '2',
        productId: '7',
        productName: 'Dona Rellena Chantilly',
        productCategory: 'Rellenas',
        productVariant: 'chantilly',
        quantity: 6,
        unitPrice: 0.40,
        usePaginaPrice: false,
        individualValue: 2.40
      }
    ],
    subtotal: 7.20,
    totalAmount: 7.20,
    status: 'Pendiente',
    isActive: true,
    createdAt: new Date('2024-03-15T10:30:00'),
    notes: 'Entrega para las 2:00 PM'
  },
  {
    id: '2',
    orderNumber: 'PED-002',
    clientName: 'Carlos Roberto Martínez',
    clientPhone: '0987654321',
    clientCity: 'Quito',
    clientAddress: 'Calle Venezuela N8-45 y Chile',
    orderDate: new Date('2024-03-15T14:15:00'),
    paymentMethod: 'Transferencia',
    routeId: '2',
    routeName: 'CENTRO',
    items: [
      {
        id: '3',
        productId: '34',
        productName: 'Pastel Chocolate Normal',
        productCategory: 'Pasteles chocolate',
        productVariant: 'normales',
        quantity: 1,
        unitPrice: 5.00,
        usePaginaPrice: false,
        individualValue: 5.00
      },
      {
        id: '4',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 4,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 2.80
      }
    ],
    subtotal: 7.80,
    totalAmount: 7.80,
    status: 'En preparación',
    isActive: true,
    createdAt: new Date('2024-03-15T14:15:00')
  },
  {
    id: '3',
    orderNumber: 'PED-003',
    clientName: 'Ana Patricia Rodríguez',
    clientPhone: '0976543210',
    clientCity: 'Quito',
    clientAddress: 'Av. Amazonas N32-86 y Mariana de Jesús',
    orderDate: new Date('2024-03-16T09:00:00'),
    paymentMethod: 'Tarjeta de crédito',
    routeId: '3',
    routeName: 'CARAPUNGO',
    items: [
      {
        id: '5',
        productId: '9',
        productName: 'Mini Donut Chocolate',
        productCategory: 'Mini donut',
        productVariant: 'choco',
        quantity: 24,
        unitPrice: 0.25,
        usePaginaPrice: true,
        individualValue: 6.00
      },
      {
        id: '6',
        productId: '26',
        productName: 'Muffin Normal',
        productCategory: 'Muffins',
        productVariant: 'normales',
        quantity: 8,
        unitPrice: 0.25,
        usePaginaPrice: false,
        individualValue: 2.00
      }
    ],
    subtotal: 8.00,
    totalAmount: 8.00,
    status: 'Listo',
    isActive: true,
    createdAt: new Date('2024-03-16T09:00:00'),
    notes: 'Cliente preferencial PAGINA'
  },
  {
    id: '4',
    orderNumber: 'PED-004',
    clientName: 'Luis Fernando Herrera',
    clientPhone: '0965432109',
    clientCity: 'Quito',
    clientAddress: 'Av. 6 de Diciembre N26-145 y Colón',
    orderDate: new Date('2024-03-16T11:30:00'),
    paymentMethod: 'Efectivo',
    routeId: '6',
    routeName: 'CUMBAYA',
    items: [
      {
        id: '7',
        productId: '28',
        productName: 'Pan Hamburguesa',
        productCategory: 'Panes',
        productVariant: 'hamburguesa',
        quantity: 20,
        unitPrice: 0.20,
        usePaginaPrice: false,
        individualValue: 4.00
      }
    ],
    subtotal: 4.00,
    totalAmount: 4.00,
    status: 'Entregado',
    isActive: true,
    createdAt: new Date('2024-03-16T11:30:00')
  }
]; 