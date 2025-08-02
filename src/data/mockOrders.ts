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
  },
  {
    id: '5',
    orderNumber: 'PED-005',
    clientName: 'Carmen Isabel Flores Morales',
    clientPhone: '0954321098',
    clientCity: 'Quito',
    clientAddress: 'Calle García Moreno S1-47 y Sucre, Quito',
    orderDate: new Date('2024-03-17T09:15:00'),
    paymentMethod: 'Transferencia',
    routeId: '4',
    routeName: 'OFELIA',
    items: [
      {
        id: '8',
        productId: '1',
        productName: 'Donut Chocolate',
        productCategory: 'Donut',
        productVariant: 'choco',
        quantity: 15,
        unitPrice: 0.40,
        usePaginaPrice: false,
        individualValue: 6.00
      },
      {
        id: '9',
        productId: '9',
        productName: 'Mini Donut Chocolate',
        productCategory: 'Mini donut',
        productVariant: 'choco',
        quantity: 30,
        unitPrice: 0.25,
        usePaginaPrice: true,
        individualValue: 7.50
      }
    ],
    subtotal: 13.50,
    totalAmount: 13.50,
    status: 'Pendiente',
    isActive: true,
    createdAt: new Date('2024-03-17T09:15:00'),
    notes: 'Entrega para las 3:00 PM'
  },
  {
    id: '6',
    orderNumber: 'PED-006',
    clientName: 'Roberto Miguel Castillo Núñez',
    clientPhone: '0943210987',
    clientCity: 'Quito',
    clientAddress: 'Av. América y Universitaria, Ciudad Universitaria, Quito',
    orderDate: new Date('2024-03-17T14:20:00'),
    paymentMethod: 'Tarjeta de débito',
    routeId: '5',
    routeName: 'MDM',
    items: [
      {
        id: '10',
        productId: '34',
        productName: 'Pastel Chocolate Normal',
        productCategory: 'Pasteles chocolate',
        productVariant: 'normales',
        quantity: 2,
        unitPrice: 5.00,
        usePaginaPrice: false,
        individualValue: 10.00
      },
      {
        id: '11',
        productId: '26',
        productName: 'Muffin Normal',
        productCategory: 'Muffins',
        productVariant: 'normales',
        quantity: 12,
        unitPrice: 0.25,
        usePaginaPrice: false,
        individualValue: 3.00
      }
    ],
    subtotal: 13.00,
    totalAmount: 13.00,
    status: 'En preparación',
    isActive: true,
    createdAt: new Date('2024-03-17T14:20:00')
  },
  {
    id: '7',
    orderNumber: 'PED-007',
    clientName: 'Patricia Alejandra Ramírez Silva',
    clientPhone: '0932109876',
    clientCity: 'Quito',
    clientAddress: 'Calle Cuenca N4-23 y Mideros, Quito',
    orderDate: new Date('2024-03-18T08:45:00'),
    paymentMethod: 'Efectivo',
    routeId: '7',
    routeName: 'SUR',
    items: [
      {
        id: '12',
        productId: '7',
        productName: 'Dona Rellena Chantilly',
        productCategory: 'Rellenas',
        productVariant: 'chantilly',
        quantity: 8,
        unitPrice: 0.40,
        usePaginaPrice: false,
        individualValue: 3.20
      },
      {
        id: '13',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 6,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 4.20
      }
    ],
    subtotal: 7.40,
    totalAmount: 7.40,
    status: 'Listo',
    isActive: true,
    createdAt: new Date('2024-03-18T08:45:00')
  },
  {
    id: '8',
    orderNumber: 'PED-008',
    clientName: 'Fernando José Aguirre Moreno',
    clientPhone: '0921098765',
    clientCity: 'Quito',
    clientAddress: 'Av. Mariscal Sucre y Antisana, Quito',
    orderDate: new Date('2024-03-18T12:30:00'),
    paymentMethod: 'Cheque',
    routeId: '8',
    routeName: 'AUX. SUR',
    items: [
      {
        id: '14',
        productId: '1',
        productName: 'Donut Chocolate',
        productCategory: 'Donut',
        productVariant: 'choco',
        quantity: 25,
        unitPrice: 0.40,
        usePaginaPrice: false,
        individualValue: 10.00
      },
      {
        id: '15',
        productId: '28',
        productName: 'Pan Hamburguesa',
        productCategory: 'Panes',
        productVariant: 'hamburguesa',
        quantity: 15,
        unitPrice: 0.20,
        usePaginaPrice: false,
        individualValue: 3.00
      }
    ],
    subtotal: 13.00,
    totalAmount: 13.00,
    status: 'Pendiente',
    isActive: true,
    createdAt: new Date('2024-03-18T12:30:00')
  },
  {
    id: '9',
    orderNumber: 'PED-009',
    clientName: 'María Elena González Pérez',
    clientPhone: '0998765432',
    clientCity: 'Quito',
    clientAddress: 'Av. 10 de Agosto N24-15 y Cordero, Quito',
    orderDate: new Date('2024-03-19T10:00:00'),
    paymentMethod: 'Efectivo',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '16',
        productId: '9',
        productName: 'Mini Donut Chocolate',
        productCategory: 'Mini donut',
        productVariant: 'choco',
        quantity: 50,
        unitPrice: 0.25,
        usePaginaPrice: true,
        individualValue: 12.50
      },
      {
        id: '17',
        productId: '26',
        productName: 'Muffin Normal',
        productCategory: 'Muffins',
        productVariant: 'normales',
        quantity: 20,
        unitPrice: 0.25,
        usePaginaPrice: false,
        individualValue: 5.00
      }
    ],
    subtotal: 17.50,
    totalAmount: 17.50,
    status: 'En preparación',
    isActive: true,
    createdAt: new Date('2024-03-19T10:00:00'),
    notes: 'Cliente preferencial PAGINA'
  },
  {
    id: '10',
    orderNumber: 'PED-010',
    clientName: 'Carlos Roberto Martínez López',
    clientPhone: '0987654321',
    clientCity: 'Quito',
    clientAddress: 'Calle Venezuela N8-45 y Chile, Quito',
    orderDate: new Date('2024-03-19T15:45:00'),
    paymentMethod: 'Transferencia',
    routeId: '2',
    routeName: 'CENTRO',
    items: [
      {
        id: '18',
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
        id: '19',
        productId: '7',
        productName: 'Dona Rellena Chantilly',
        productCategory: 'Rellenas',
        productVariant: 'chantilly',
        quantity: 10,
        unitPrice: 0.40,
        usePaginaPrice: false,
        individualValue: 4.00
      },
      {
        id: '20',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 8,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 5.60
      }
    ],
    subtotal: 14.60,
    totalAmount: 14.60,
    status: 'Listo',
    isActive: true,
    createdAt: new Date('2024-03-19T15:45:00')
  }
]; 