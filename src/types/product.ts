export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductCategoryData {
  name: string;
  description?: string;
}

export interface UpdateProductCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  variant: string;
  priceRegular: number;
  pricePage?: number;
  specialPrice?: number; // Precio especial opcional
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  name: string;
  categoryId: string;
  price: number | string;
  specialPrice?: number | string;
  description?: string;
  imageBase64?: string;
}

export interface UpdateProductData {
  name?: string;
  categoryId?: string;
  variant?: string;
  priceRegular?: number;
  pricePage?: number;
  specialPrice?: number; // Precio especial opcional
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
} 