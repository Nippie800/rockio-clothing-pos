// db/products.ts
import { getDb } from './database';

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
  const db = getDb();
  return await db.getAllAsync<Product>(`SELECT * FROM products ORDER BY id DESC;`);
}

export async function addProduct(p: NewProduct): Promise<void> {
  const db = getDb();
  const name = p.name.trim();
  const size = p.size?.trim() ? p.size.trim() : null;
  const colour = p.colour?.trim() ? p.colour.trim() : null;

  await db.runAsync(
    `INSERT INTO products (name, type, size, colour, price, stock)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [name, p.type, size, colour, p.price, p.stock]
  );
}

// ✅ Day 4: update stock by product id
export async function updateProductStock(productId: number, newStock: number): Promise<void> {
  const db = getDb();
  const safeStock = Math.max(0, Math.floor(newStock));

  await db.runAsync(
    `UPDATE products SET stock = ? WHERE id = ?;`,
    [safeStock, productId]
  );
}

// ✅ Day 4: seed demo products (only if DB is empty)
export async function seedDemoProducts(force: boolean = false): Promise<'seeded' | 'skipped'> {
  const db = getDb();

  const existing = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM products;`
  );

  if (!force && (existing?.count ?? 0) > 0) return 'skipped';

  const demo: NewProduct[] = [
    { name: 'Oversized Tee', type: 'Clothing', size: 'M', colour: 'Black', price: 350, stock: 12 },
    { name: 'Oversized Tee', type: 'Clothing', size: 'L', colour: 'White', price: 350, stock: 9 },
    { name: 'Hoodie', type: 'Clothing', size: 'XL', colour: 'Grey', price: 650, stock: 6 },
    { name: 'Cap', type: 'Accessory', colour: 'Black', price: 220, stock: 15 },
    { name: 'Beanie', type: 'Accessory', colour: 'Cream', price: 180, stock: 10 },
    { name: 'Tattoo – Small', type: 'Tattoo', price: 500, stock: 0 },
    { name: 'Tattoo – Medium', type: 'Tattoo', price: 900, stock: 0 },
    { name: 'Tattoo – Large', type: 'Tattoo', price: 1500, stock: 0 },
  ];

  for (const p of demo) {
    await addProduct(p);
  }

  return 'seeded';
}
export async function getProductById(id: number): Promise<Product | null> {
  const db = getDb();
  const row = await db.getFirstAsync<Product>(
    `SELECT * FROM products WHERE id = ? LIMIT 1;`,
    [id]
  );
  return row ?? null;
}

export async function setProductStock(id: number, stock: number): Promise<void> {
  const db = getDb();
  const safeStock = Math.max(0, Math.floor(stock));
  await db.runAsync(`UPDATE products SET stock = ? WHERE id = ?;`, [safeStock, id]);
}

export async function reduceStock(productId: number, quantity: number): Promise<void> {
  const db = getDb();

  // Reduce stock but never below 0
  await db.runAsync(
    `UPDATE products
     SET stock = CASE
       WHEN stock - ? < 0 THEN 0
       ELSE stock - ?
     END
     WHERE id = ?;`,
    [quantity, quantity, productId]
  );
}
