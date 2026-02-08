// db/products.web.ts
export type ProductType = 'Clothing' | 'Tattoo' | 'Accessory';

export type Product = {
  id: number;
  name: string;
  type: ProductType;
  size: string | null;
  colour: string | null;
  price: number;
  stock: number;
  created_at: string;
};

export type NewProduct = {
  name: string;
  type: ProductType;
  size?: string;
  colour?: string;
  price: number;
  stock: number;
};

export async function getAllProducts(): Promise<Product[]> {
  // Web preview only
  return [];
}

export async function addProduct(_p: NewProduct): Promise<void> {
  // Web preview only
  return;
}
