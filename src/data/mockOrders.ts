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
    status: 'PENDIENTE',
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
    status: 'PENDIENTE',
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
    status: 'LISTO',
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
    status: 'LISTO',
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
    status: 'PENDIENTE',
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
    status: 'PENDIENTE',
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
    status: 'LISTO',
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
    status: 'PENDIENTE',
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
    status: 'PENDIENTE',
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
    status: 'LISTO',
    isActive: true,
    createdAt: new Date('2024-03-19T15:45:00')
  },
  {
    id: '11',
    orderNumber: 'PED-011',
    clientName: 'Francisco Leoro',
    clientPhone: '0912345678',
    clientCity: 'Quito',
    clientAddress: 'Av. 10 de Agosto N24-15 y Cordero, Quito',
    orderDate: new Date(),
    paymentMethod: 'Efectivo',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '21',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 12,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 8.40
      }
    ],
    subtotal: 8.40,
    totalAmount: 8.40,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date(),
    notes: 'Entrega para las 2:00 PM'
  },
  {
    id: '12',
    orderNumber: 'PED-012',
    clientName: 'Shyris',
    clientPhone: '0923456789',
    clientCity: 'Quito',
    clientAddress: 'Av. Amazonas N32-86 y Mariana de Jesús, Quito',
    orderDate: new Date(),
    paymentMethod: 'Transferencia',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '22',
        productId: '20',
        productName: 'Pizza Redonda',
        productCategory: 'Pizzas',
        productVariant: 'redonda',
        quantity: 8,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 5.60
      },
      {
        id: '23',
        productId: '21',
        productName: 'Pizza Mini',
        productCategory: 'Pizzas',
        productVariant: 'mini',
        quantity: 15,
        unitPrice: 0.50,
        usePaginaPrice: false,
        individualValue: 7.50
      }
    ],
    subtotal: 13.10,
    totalAmount: 13.10,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '13',
    orderNumber: 'PED-013',
    clientName: 'Benjamin Carrion',
    clientPhone: '0934567890',
    clientCity: 'Quito',
    clientAddress: 'Calle Venezuela N8-45 y Chile, Quito',
    orderDate: new Date(),
    paymentMethod: 'Efectivo',
    routeId: '2',
    routeName: 'CENTRO',
    items: [
      {
        id: '24',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 6,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 4.20
      },
      {
        id: '25',
        productId: '20',
        productName: 'Pizza Redonda',
        productCategory: 'Pizzas',
        productVariant: 'redonda',
        quantity: 10,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 7.00
      }
    ],
    subtotal: 11.20,
    totalAmount: 11.20,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '14',
    orderNumber: 'PED-014',
    clientName: 'Nuevo Mundo',
    clientPhone: '0945678901',
    clientCity: 'Quito',
    clientAddress: 'Av. 10 de Agosto N24-15 y Cordero, Quito',
    orderDate: new Date(),
    paymentMethod: 'Transferencia',
    routeId: '2',
    routeName: 'CENTRO',
    items: [
      {
        id: '26',
        productId: '21',
        productName: 'Pizza Mini',
        productCategory: 'Pizzas',
        productVariant: 'mini',
        quantity: 20,
        unitPrice: 0.50,
        usePaginaPrice: false,
        individualValue: 10.00
      }
    ],
    subtotal: 10.00,
    totalAmount: 10.00,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '15',
    orderNumber: 'PED-015',
    clientName: 'Bosco Lula',
    clientPhone: '0956789012',
    clientCity: 'Quito',
    clientAddress: 'Av. 6 de Diciembre N26-145 y Colón, Quito',
    orderDate: new Date(),
    paymentMethod: 'Efectivo',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '27',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 5,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 3.50
      },
      {
        id: '28',
        productId: '21',
        productName: 'Pizza Mini',
        productCategory: 'Pizzas',
        productVariant: 'mini',
        quantity: 12,
        unitPrice: 0.50,
        usePaginaPrice: false,
        individualValue: 6.00
      }
    ],
    subtotal: 9.50,
    totalAmount: 9.50,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '16',
    orderNumber: 'PED-016',
    clientName: 'ISM Solca',
    clientPhone: '0967890123',
    clientCity: 'Quito',
    clientAddress: 'Av. Amazonas N32-86 y Mariana de Jesús, Quito',
    orderDate: new Date(),
    paymentMethod: 'Transferencia',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '29',
        productId: '20',
        productName: 'Pizza Redonda',
        productCategory: 'Pizzas',
        productVariant: 'redonda',
        quantity: 7,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 4.90
      }
    ],
    subtotal: 4.90,
    totalAmount: 4.90,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '17',
    orderNumber: 'PED-017',
    clientName: 'Esc Raul Andrade',
    clientPhone: '0978901234',
    clientCity: 'Quito',
    clientAddress: 'Calle Venezuela N8-45 y Chile, Quito',
    orderDate: new Date(),
    paymentMethod: 'Efectivo',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '30',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 3,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 2.10
      },
      {
        id: '31',
        productId: '20',
        productName: 'Pizza Redonda',
        productCategory: 'Pizzas',
        productVariant: 'redonda',
        quantity: 4,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 2.80
      },
      {
        id: '32',
        productId: '21',
        productName: 'Pizza Mini',
        productCategory: 'Pizzas',
        productVariant: 'mini',
        quantity: 8,
        unitPrice: 0.50,
        usePaginaPrice: false,
        individualValue: 4.00
      }
    ],
    subtotal: 8.90,
    totalAmount: 8.90,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '18',
    orderNumber: 'PED-018',
    clientName: 'Marista',
    clientPhone: '0989012345',
    clientCity: 'Quito',
    clientAddress: 'Av. 10 de Agosto N24-15 y Cordero, Quito',
    orderDate: new Date(),
    paymentMethod: 'Transferencia',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '33',
        productId: '21',
        productName: 'Pizza Mini',
        productCategory: 'Pizzas',
        productVariant: 'mini',
        quantity: 25,
        unitPrice: 0.50,
        usePaginaPrice: false,
        individualValue: 12.50
      }
    ],
    subtotal: 12.50,
    totalAmount: 12.50,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '19',
    orderNumber: 'PED-019',
    clientName: 'Colegio Hontanar',
    clientPhone: '0991234567',
    clientCity: 'Quito',
    clientAddress: 'Av. 10 de Agosto N24-15 y Cordero, Quito',
    orderDate: new Date(),
    paymentMethod: 'Efectivo',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '34',
        productId: '1',
        productName: 'Donut Chocolate',
        productCategory: 'Donut',
        productVariant: 'choc',
        quantity: 25,
        unitPrice: 0.40,
        usePaginaPrice: false,
        individualValue: 10.00
      },
      {
        id: '35',
        productId: '7',
        productName: 'Dona Rellena Chantilly',
        productCategory: 'Rellenas',
        productVariant: 'chantilly',
        quantity: 15,
        unitPrice: 0.40,
        usePaginaPrice: false,
        individualValue: 6.00
      }
    ],
    subtotal: 16.00,
    totalAmount: 16.00,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '20',
    orderNumber: 'PED-020',
    clientName: 'Instituto Tecnológico Isaac Newton',
    clientPhone: '0992345678',
    clientCity: 'Quito',
    clientAddress: 'Calle Venezuela N8-45 y Chile, Quito',
    orderDate: new Date(),
    paymentMethod: 'Transferencia',
    routeId: '2',
    routeName: 'CENTRO',
    items: [
      {
        id: '36',
        productId: '2',
        productName: 'Donut Grag',
        productCategory: 'Donut',
        productVariant: 'grag',
        quantity: 30,
        unitPrice: 0.40,
        usePaginaPrice: false,
        individualValue: 12.00
      },
      {
        id: '37',
        productId: '8',
        productName: 'Dona Rellena Manjar',
        productCategory: 'Rellenas',
        productVariant: 'manjar',
        quantity: 20,
        unitPrice: 0.40,
        usePaginaPrice: false,
        individualValue: 8.00
      },
      {
        id: '38',
        productId: '9',
        productName: 'Mini Donut Chocolate',
        productCategory: 'Mini donut',
        productVariant: 'choc',
        quantity: 40,
        unitPrice: 0.25,
        usePaginaPrice: false,
        individualValue: 10.00
      }
    ],
    subtotal: 30.00,
    totalAmount: 30.00,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: '21',
    orderNumber: 'PED-021',
    clientName: 'Escuela Letort',
    clientPhone: '0993456789',
    clientCity: 'Quito',
    clientAddress: 'Av. Amazonas N32-86 y Mariana de Jesús, Quito',
    orderDate: new Date(),
    paymentMethod: 'Efectivo',
    routeId: '3',
    routeName: 'CARAPUNGO',
    items: [
      {
        id: '39',
        productId: '3',
        productName: 'Donut Glace',
        productCategory: 'Donut',
        productVariant: 'glace',
        quantity: 18,
        unitPrice: 0.40,
        usePaginaPrice: false,
        individualValue: 7.20
      },
      {
        id: '40',
        productId: '10',
        productName: 'Mini Dona Rellena Chantilly',
        productCategory: 'Mini rellenas',
        productVariant: 'chantilly',
        quantity: 35,
        unitPrice: 0.25,
        usePaginaPrice: false,
        individualValue: 8.75
      }
    ],
    subtotal: 15.95,
    totalAmount: 15.95,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date()
  },
  // Pedidos de pizzas para agosto 2025
  {
    id: '22',
    orderNumber: 'PED-022',
    clientName: 'Francisco Leoro',
    clientPhone: '0912345678',
    clientCity: 'Quito',
    clientAddress: 'Av. 10 de Agosto N24-15 y Cordero, Quito',
    orderDate: new Date('2025-08-01'),
    paymentMethod: 'Efectivo',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '41',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 15,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 10.50
      }
    ],
    subtotal: 10.50,
    totalAmount: 10.50,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-01')
  },
  {
    id: '23',
    orderNumber: 'PED-023',
    clientName: 'Shyris',
    clientPhone: '0923456789',
    clientCity: 'Quito',
    clientAddress: 'Av. Amazonas N32-86 y Mariana de Jesús, Quito',
    orderDate: new Date('2025-08-01'),
    paymentMethod: 'Transferencia',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '42',
        productId: '20',
        productName: 'Pizza Redonda',
        productCategory: 'Pizzas',
        productVariant: 'redonda',
        quantity: 12,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 8.40
      },
      {
        id: '43',
        productId: '21',
        productName: 'Mini Pizza',
        productCategory: 'Pizzas',
        productVariant: 'mini',
        quantity: 20,
        unitPrice: 0.55,
        usePaginaPrice: false,
        individualValue: 11.00
      }
    ],
    subtotal: 19.40,
    totalAmount: 19.40,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-01')
  },
  {
    id: '24',
    orderNumber: 'PED-024',
    clientName: 'Benjamin Carrion',
    clientPhone: '0934567890',
    clientCity: 'Quito',
    clientAddress: 'Calle Venezuela N8-45 y Chile, Quito',
    orderDate: new Date('2025-08-02'),
    paymentMethod: 'Efectivo',
    routeId: '2',
    routeName: 'CENTRO',
    items: [
      {
        id: '44',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 8,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 5.60
      },
      {
        id: '45',
        productId: '20',
        productName: 'Pizza Redonda',
        productCategory: 'Pizzas',
        productVariant: 'redonda',
        quantity: 10,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 7.00
      }
    ],
    subtotal: 12.60,
    totalAmount: 12.60,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-02')
  },
  {
    id: '25',
    orderNumber: 'PED-025',
    clientName: 'Nuevo Mundo',
    clientPhone: '0945678901',
    clientCity: 'Quito',
    clientAddress: 'Av. 10 de Agosto N24-15 y Cordero, Quito',
    orderDate: new Date('2025-08-02'),
    paymentMethod: 'Transferencia',
    routeId: '2',
    routeName: 'CENTRO',
    items: [
      {
        id: '46',
        productId: '21',
        productName: 'Mini Pizza',
        productCategory: 'Pizzas',
        productVariant: 'mini',
        quantity: 25,
        unitPrice: 0.55,
        usePaginaPrice: false,
        individualValue: 13.75
      }
    ],
    subtotal: 13.75,
    totalAmount: 13.75,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-02')
  },
  {
    id: '26',
    orderNumber: 'PED-026',
    clientName: 'Bosco Lula',
    clientPhone: '0956789012',
    clientCity: 'Quito',
    clientAddress: 'Av. 6 de Diciembre N26-145 y Colón, Quito',
    orderDate: new Date('2025-08-03'),
    paymentMethod: 'Efectivo',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '47',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 6,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 4.20
      },
      {
        id: '48',
        productId: '21',
        productName: 'Mini Pizza',
        productCategory: 'Pizzas',
        productVariant: 'mini',
        quantity: 15,
        unitPrice: 0.55,
        usePaginaPrice: false,
        individualValue: 8.25
      }
    ],
    subtotal: 12.45,
    totalAmount: 12.45,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-03')
  },
  {
    id: '27',
    orderNumber: 'PED-027',
    clientName: 'ISM Solca',
    clientPhone: '0967890123',
    clientCity: 'Quito',
    clientAddress: 'Av. Amazonas N32-86 y Mariana de Jesús, Quito',
    orderDate: new Date('2025-08-03'),
    paymentMethod: 'Transferencia',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '49',
        productId: '20',
        productName: 'Pizza Redonda',
        productCategory: 'Pizzas',
        productVariant: 'redonda',
        quantity: 9,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 6.30
      }
    ],
    subtotal: 6.30,
    totalAmount: 6.30,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-03')
  },
  // Pedidos de pizzas para 13 de agosto 2025
  {
    id: '28',
    orderNumber: 'PED-028',
    clientName: 'Francisco Leoro',
    clientPhone: '0912345678',
    clientCity: 'Quito',
    clientAddress: 'Av. 10 de Agosto N24-15 y Cordero, Quito',
    orderDate: new Date('2025-08-13'),
    paymentMethod: 'Efectivo',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '50',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 18,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 12.60
      }
    ],
    subtotal: 12.60,
    totalAmount: 12.60,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-13')
  },
  {
    id: '29',
    orderNumber: 'PED-029',
    clientName: 'Shyris',
    clientPhone: '0923456789',
    clientCity: 'Quito',
    clientAddress: 'Av. Amazonas N32-86 y Mariana de Jesús, Quito',
    orderDate: new Date('2025-08-13'),
    paymentMethod: 'Transferencia',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '51',
        productId: '20',
        productName: 'Pizza Redonda',
        productCategory: 'Pizzas',
        productVariant: 'redonda',
        quantity: 14,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 9.80
      },
      {
        id: '52',
        productId: '21',
        productName: 'Mini Pizza',
        productCategory: 'Pizzas',
        productVariant: 'mini',
        quantity: 22,
        unitPrice: 0.55,
        usePaginaPrice: false,
        individualValue: 12.10
      }
    ],
    subtotal: 21.90,
    totalAmount: 21.90,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-13')
  },
  {
    id: '30',
    orderNumber: 'PED-030',
    clientName: 'Benjamin Carrion',
    clientPhone: '0934567890',
    clientCity: 'Quito',
    clientAddress: 'Calle Venezuela N8-45 y Chile, Quito',
    orderDate: new Date('2025-08-13'),
    paymentMethod: 'Efectivo',
    routeId: '2',
    routeName: 'CENTRO',
    items: [
      {
        id: '53',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 10,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 7.00
      },
      {
        id: '54',
        productId: '20',
        productName: 'Pizza Redonda',
        productCategory: 'Pizzas',
        productVariant: 'redonda',
        quantity: 12,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 8.40
      }
    ],
    subtotal: 15.40,
    totalAmount: 15.40,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-13')
  },
  {
    id: '31',
    orderNumber: 'PED-031',
    clientName: 'Nuevo Mundo',
    clientPhone: '0945678901',
    clientCity: 'Quito',
    clientAddress: 'Av. 10 de Agosto N24-15 y Cordero, Quito',
    orderDate: new Date('2025-08-13'),
    paymentMethod: 'Transferencia',
    routeId: '2',
    routeName: 'CENTRO',
    items: [
      {
        id: '55',
        productId: '21',
        productName: 'Mini Pizza',
        productCategory: 'Pizzas',
        productVariant: 'mini',
        quantity: 30,
        unitPrice: 0.55,
        usePaginaPrice: false,
        individualValue: 16.50
      }
    ],
    subtotal: 16.50,
    totalAmount: 16.50,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-13')
  },
  {
    id: '32',
    orderNumber: 'PED-032',
    clientName: 'Bosco Lula',
    clientPhone: '0956789012',
    clientCity: 'Quito',
    clientAddress: 'Av. 6 de Diciembre N26-145 y Colón, Quito',
    orderDate: new Date('2025-08-13'),
    paymentMethod: 'Efectivo',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '56',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 8,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 5.60
      },
      {
        id: '57',
        productId: '21',
        productName: 'Mini Pizza',
        productCategory: 'Pizzas',
        productVariant: 'mini',
        quantity: 18,
        unitPrice: 0.55,
        usePaginaPrice: false,
        individualValue: 9.90
      }
    ],
    subtotal: 15.50,
    totalAmount: 15.50,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-13')
  },
  {
    id: '33',
    orderNumber: 'PED-033',
    clientName: 'ISM Solca',
    clientPhone: '0967890123',
    clientCity: 'Quito',
    clientAddress: 'Av. Amazonas N32-86 y Mariana de Jesús, Quito',
    orderDate: new Date('2025-08-13'),
    paymentMethod: 'Transferencia',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '58',
        productId: '20',
        productName: 'Pizza Redonda',
        productCategory: 'Pizzas',
        productVariant: 'redonda',
        quantity: 11,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 7.70
      }
    ],
    subtotal: 7.70,
    totalAmount: 7.70,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-13')
  },
  {
    id: '34',
    orderNumber: 'PED-034',
    clientName: 'Esc Raul Andrade',
    clientPhone: '0978901234',
    clientCity: 'Quito',
    clientAddress: 'Calle Venezuela N8-45 y Chile, Quito',
    orderDate: new Date('2025-08-13'),
    paymentMethod: 'Efectivo',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '59',
        productId: '19',
        productName: 'Pizza Cuadrada',
        productCategory: 'Pizzas',
        productVariant: 'cuadrada',
        quantity: 5,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 3.50
      },
      {
        id: '60',
        productId: '20',
        productName: 'Pizza Redonda',
        productCategory: 'Pizzas',
        productVariant: 'redonda',
        quantity: 7,
        unitPrice: 0.70,
        usePaginaPrice: false,
        individualValue: 4.90
      },
      {
        id: '61',
        productId: '21',
        productName: 'Mini Pizza',
        productCategory: 'Pizzas',
        productVariant: 'mini',
        quantity: 12,
        unitPrice: 0.55,
        usePaginaPrice: false,
        individualValue: 6.60
      }
    ],
    subtotal: 15.00,
    totalAmount: 15.00,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-13')
  },
  {
    id: '35',
    orderNumber: 'PED-035',
    clientName: 'Marista',
    clientPhone: '0989012345',
    clientCity: 'Quito',
    clientAddress: 'Av. 10 de Agosto N24-15 y Cordero, Quito',
    orderDate: new Date('2025-08-13'),
    paymentMethod: 'Transferencia',
    routeId: '1',
    routeName: 'NORTE',
    items: [
      {
        id: '62',
        productId: '21',
        productName: 'Mini Pizza',
        productCategory: 'Pizzas',
        productVariant: 'mini',
        quantity: 28,
        unitPrice: 0.55,
        usePaginaPrice: false,
        individualValue: 15.40
      }
    ],
    subtotal: 15.40,
    totalAmount: 15.40,
    status: 'PENDIENTE',
    isActive: true,
    createdAt: new Date('2025-08-13')
  }
]; 