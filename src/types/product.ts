export type ProductCategory = 
  | 'Donut'
  | 'Rellenas'
  | 'Mini donut'
  | 'Mini rellenas'
  | 'Orejas'
  | 'Pizzas'
  | 'Pan choco'
  | 'Melvas'
  | 'Muffins'
  | 'Panes'
  | 'Pasteles chocolate'
  | 'Pasteles de naranja';

export type ProductVariant = 
  // Donut variants
  | 'choco' | 'choco grajeas' | 'choco coco' | 'glase' | 'glase grajeas' | 'glase coco'
  // Rellenas variants
  | 'chantilly' | 'manjar'
  // Orejas variants
  | 'orejas' | 'mini orejas'
  // Pizza variants
  | 'cuadrada' | 'redonda' | 'mini'
  // Bread variants
  | 'panes' | 'mini panes'
  // Melvas variants
  | 'melvas' | 'mini melvas'
  // Muffins variants
  | 'normales' | 'manjar'
  // Panes variants
  | 'hamburguesa' | 'mini hamburguesa' | 'hot dog' | 'mini hot dog' | 'gusano' | 'mini gusano'
  // Pasteles variants
  | 'normales' | 'choco grajeas' | 'sin cortar (s/c)' | 'x12' | 'x14' | 'decorados';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  variant: ProductVariant;
  priceRegular: number;
  pricePage?: number; // Precio especial para PAGINA
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateProductData {
  name: string;
  category: ProductCategory;
  variant: ProductVariant;
  priceRegular: number;
  pricePage?: number;
  description?: string;
}

export interface UpdateProductData {
  name?: string;
  category?: ProductCategory;
  variant?: ProductVariant;
  priceRegular?: number;
  pricePage?: number;
  description?: string;
  isActive?: boolean;
} 