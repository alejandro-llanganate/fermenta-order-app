import { Product } from '@/types/product';

export const mockProducts: Product[] = [
  // Donut products
  {
    id: '1',
    name: 'Donut Chocolate',
    category: 'Donut',
    variant: 'choco',
    priceRegular: 0.40,
    pricePage: 0.50,
    description: 'Donut cubierto con chocolate',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Donut Chocolate con Grajeas',
    category: 'Donut',
    variant: 'choco grajeas',
    priceRegular: 0.40,
    pricePage: 0.50,
    description: 'Donut cubierto con chocolate y grajeas de colores',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Donut Chocolate Coco',
    category: 'Donut',
    variant: 'choco coco',
    priceRegular: 0.40,
    pricePage: 0.50,
    description: 'Donut cubierto con chocolate y coco rallado',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Donut Glaseado',
    category: 'Donut',
    variant: 'glase',
    priceRegular: 0.40,
    pricePage: 0.50,
    description: 'Donut con glaseado dulce',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '5',
    name: 'Donut Glaseado con Grajeas',
    category: 'Donut',
    variant: 'glase grajeas',
    priceRegular: 0.40,
    pricePage: 0.50,
    description: 'Donut glaseado con grajeas de colores',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '6',
    name: 'Donut Glaseado Coco',
    category: 'Donut',
    variant: 'glase coco',
    priceRegular: 0.40,
    pricePage: 0.50,
    description: 'Donut glaseado con coco rallado',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },

  // Rellenas products
  {
    id: '7',
    name: 'Dona Rellena Chantilly',
    category: 'Rellenas',
    variant: 'chantilly',
    priceRegular: 0.40,
    pricePage: 0.50,
    description: 'Dona rellena con crema chantilly',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '8',
    name: 'Dona Rellena Manjar',
    category: 'Rellenas',
    variant: 'manjar',
    priceRegular: 0.40,
    pricePage: 0.50,
    description: 'Dona rellena con manjar dulce',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },

  // Mini donut products
  {
    id: '9',
    name: 'Mini Donut Chocolate',
    category: 'Mini donut',
    variant: 'choco',
    priceRegular: 0.20,
    pricePage: 0.25,
    description: 'Mini donut cubierto con chocolate',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '10',
    name: 'Mini Donut Chocolate Grajeas',
    category: 'Mini donut',
    variant: 'choco grajeas',
    priceRegular: 0.20,
    pricePage: 0.25,
    description: 'Mini donut con chocolate y grajeas',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '11',
    name: 'Mini Donut Chocolate Coco',
    category: 'Mini donut',
    variant: 'choco coco',
    priceRegular: 0.20,
    pricePage: 0.25,
    description: 'Mini donut con chocolate y coco',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '12',
    name: 'Mini Donut Glaseado',
    category: 'Mini donut',
    variant: 'glase',
    priceRegular: 0.20,
    pricePage: 0.25,
    description: 'Mini donut glaseado',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '13',
    name: 'Mini Donut Glase Grajeas',
    category: 'Mini donut',
    variant: 'glase grajeas',
    priceRegular: 0.20,
    pricePage: 0.25,
    description: 'Mini donut glaseado con grajeas',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '14',
    name: 'Mini Donut Glase Coco',
    category: 'Mini donut',
    variant: 'glase coco',
    priceRegular: 0.20,
    pricePage: 0.25,
    description: 'Mini donut glaseado con coco',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },

  // Mini rellenas products
  {
    id: '15',
    name: 'Mini Rellena Chantilly',
    category: 'Mini rellenas',
    variant: 'chantilly',
    priceRegular: 0.20,
    pricePage: 0.25,
    description: 'Mini dona rellena con chantilly',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '16',
    name: 'Mini Rellena Manjar',
    category: 'Mini rellenas',
    variant: 'manjar',
    priceRegular: 0.20,
    pricePage: 0.25,
    description: 'Mini dona rellena con manjar',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },

  // Orejas products
  {
    id: '17',
    name: 'Orejas',
    category: 'Orejas',
    variant: 'orejas',
    priceRegular: 0.50,
    description: 'Masa hojaldrada en forma de oreja',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '18',
    name: 'Mini Orejas',
    category: 'Orejas',
    variant: 'mini orejas',
    priceRegular: 0.25,
    description: 'Versión mini de las orejas - POR VERIFICAR',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },

  // Pizzas products
  {
    id: '19',
    name: 'Pizza Cuadrada',
    category: 'Pizzas',
    variant: 'cuadrada',
    priceRegular: 0.70,
    description: 'Pizza de forma cuadrada',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '20',
    name: 'Pizza Redonda',
    category: 'Pizzas',
    variant: 'redonda',
    priceRegular: 0.70,
    description: 'Pizza de forma redonda',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '21',
    name: 'Mini Pizza',
    category: 'Pizzas',
    variant: 'mini',
    priceRegular: 0.55,
    description: 'Pizza en tamaño mini',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },

  // Pan choco products
  {
    id: '22',
    name: 'Pan Chocolate',
    category: 'Pan choco',
    variant: 'panes',
    priceRegular: 0.35,
    description: 'Pan relleno de chocolate',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '23',
    name: 'Mini Pan Chocolate',
    category: 'Pan choco',
    variant: 'mini panes',
    priceRegular: 0.20,
    description: 'Versión mini del pan de chocolate',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },

  // Melvas products
  {
    id: '24',
    name: 'Melvas',
    category: 'Melvas',
    variant: 'melvas',
    priceRegular: 0.35,
    description: 'Dulce tradicional melvas',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '25',
    name: 'Mini Melvas',
    category: 'Melvas',
    variant: 'mini melvas',
    priceRegular: 0.25,
    description: 'Versión mini de las melvas',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },

  // Muffins products
  {
    id: '26',
    name: 'Muffin Normal',
    category: 'Muffins',
    variant: 'normales',
    priceRegular: 0.25,
    description: 'Muffin tradicional',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '27',
    name: 'Muffin Manjar',
    category: 'Muffins',
    variant: 'manjar',
    priceRegular: 0.30,
    description: 'Muffin con manjar',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },

  // Panes products
  {
    id: '28',
    name: 'Pan Hamburguesa',
    category: 'Panes',
    variant: 'hamburguesa',
    priceRegular: 0.20,
    description: 'Pan para hamburguesa',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '29',
    name: 'Mini Pan Hamburguesa',
    category: 'Panes',
    variant: 'mini hamburguesa',
    priceRegular: 0.12,
    description: 'Mini pan para hamburguesa',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '30',
    name: 'Pan Hot Dog',
    category: 'Panes',
    variant: 'hot dog',
    priceRegular: 0.20,
    description: 'Pan para hot dog',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '31',
    name: 'Mini Pan Hot Dog',
    category: 'Panes',
    variant: 'mini hot dog',
    priceRegular: 0.12,
    description: 'Mini pan para hot dog',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '32',
    name: 'Pan Gusano',
    category: 'Panes',
    variant: 'gusano',
    priceRegular: 0.20,
    description: 'Pan en forma de gusano',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '33',
    name: 'Mini Pan Gusano',
    category: 'Panes',
    variant: 'mini gusano',
    priceRegular: 0.12,
    description: 'Mini pan en forma de gusano',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },

  // Pasteles chocolate products
  {
    id: '34',
    name: 'Pastel Chocolate Normal',
    category: 'Pasteles chocolate',
    variant: 'normales',
    priceRegular: 5.00,
    description: 'Pastel de chocolate tradicional',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '35',
    name: 'Pastel Chocolate Grajeas',
    category: 'Pasteles chocolate',
    variant: 'choco grajeas',
    priceRegular: 5.00,
    description: 'Pastel de chocolate con grajeas',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '36',
    name: 'Pastel Chocolate Sin Cortar',
    category: 'Pasteles chocolate',
    variant: 'sin cortar (s/c)',
    priceRegular: 5.00,
    description: 'Pastel de chocolate sin cortar',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '37',
    name: 'Pastel Chocolate x12',
    category: 'Pasteles chocolate',
    variant: 'x12',
    priceRegular: 5.00,
    description: 'Pastel de chocolate para 12 porciones',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '38',
    name: 'Pastel Chocolate x14',
    category: 'Pasteles chocolate',
    variant: 'x14',
    priceRegular: 5.00,
    description: 'Pastel de chocolate para 14 porciones',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '39',
    name: 'Pastel Chocolate Decorado',
    category: 'Pasteles chocolate',
    variant: 'decorados',
    priceRegular: 6.00,
    description: 'Pastel de chocolate con decoración especial',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },

  // Pasteles naranja products
  {
    id: '40',
    name: 'Pastel Naranja Normal',
    category: 'Pasteles de naranja',
    variant: 'normales',
    priceRegular: 5.00,
    description: 'Pastel de naranja tradicional',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '41',
    name: 'Pastel Naranja Sin Cortar',
    category: 'Pasteles de naranja',
    variant: 'sin cortar (s/c)',
    priceRegular: 5.00,
    description: 'Pastel de naranja sin cortar',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '42',
    name: 'Pastel Naranja x12',
    category: 'Pasteles de naranja',
    variant: 'x12',
    priceRegular: 5.00,
    description: 'Pastel de naranja para 12 porciones',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '43',
    name: 'Pastel Naranja x14',
    category: 'Pasteles de naranja',
    variant: 'x14',
    priceRegular: 5.00,
    description: 'Pastel de naranja para 14 porciones',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '44',
    name: 'Pastel Naranja Decorado',
    category: 'Pasteles de naranja',
    variant: 'decorados',
    priceRegular: 6.00,
    description: 'Pastel de naranja con decoración especial',
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
]; 