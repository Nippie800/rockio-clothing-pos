// db/sales.ts
import { getDb } from './database';

export type PaymentMethod = 'Cash' | 'Card';

export type NewSale = {
  date_time: string; // ISO
  product_id: number | null;
  description?: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method: PaymentMethod;
};

export type SaleRow = {
  id: number;
  date_time: string;
  product_id: number | null;
  description: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method: PaymentMethod;
  created_at: string;

  // joined fields:
  product_name: string | null;
  product_type: string | null;
};

export type TodaySummary = {
  total_sales: number;
  cash_total: number;
  card_total: number;
  sale_count: number;
};

export async function addSale(s: NewSale): Promise<void> {
  const db = getDb();

  await db.runAsync(
    `INSERT INTO sales (date_time, product_id, description, quantity, unit_price, total_amount, payment_method)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      s.date_time,
      s.product_id,
      s.description ?? null,
      s.quantity,
      s.unit_price,
      s.total_amount,
      s.payment_method,
    ]
  );
}

// ✅ Get today’s sales list (with product name)
export async function getTodaySales(): Promise<SaleRow[]> {
  const db = getDb();

  return await db.getAllAsync<SaleRow>(
    `
    SELECT
      s.*,
      p.name as product_name,
      p.type as product_type
    FROM sales s
    LEFT JOIN products p ON p.id = s.product_id
    WHERE date(s.date_time) = date('now', 'localtime')
    ORDER BY s.id DESC;
    `
  );
}

// ✅ Today totals: total, cash, card, count
export async function getTodaySummary(): Promise<TodaySummary> {
  const db = getDb();

  const row = await db.getFirstAsync<any>(
    `
    SELECT
      COALESCE(SUM(total_amount), 0) as total_sales,
      COALESCE(SUM(CASE WHEN payment_method = 'Cash' THEN total_amount ELSE 0 END), 0) as cash_total,
      COALESCE(SUM(CASE WHEN payment_method = 'Card' THEN total_amount ELSE 0 END), 0) as card_total,
      COALESCE(COUNT(*), 0) as sale_count
    FROM sales
    WHERE date(date_time) = date('now', 'localtime');
    `
  );

  return {
    total_sales: Number(row?.total_sales ?? 0),
    cash_total: Number(row?.cash_total ?? 0),
    card_total: Number(row?.card_total ?? 0),
    sale_count: Number(row?.sale_count ?? 0),
  };
  
}
export async function getSaleById(id: number): Promise<SaleRow | null> {
  const db = getDb();

  const row = await db.getFirstAsync<SaleRow>(
    `
    SELECT
      s.*,
      p.name as product_name,
      p.type as product_type
    FROM sales s
    LEFT JOIN products p ON p.id = s.product_id
    WHERE s.id = ?
    LIMIT 1;
    `,
    [id]
  );

  return row ?? null;
}
export async function voidSale(saleId: number): Promise<void> {
  const db = getDb();

  await db.runAsync(
    `UPDATE sales
     SET description = '[VOIDED]'
     WHERE id = ?;`,
    [saleId]
  );
}
export type DateFilter = 'today' | 'yesterday' | 'week';

export async function getSalesByRange(filter: DateFilter): Promise<SaleRow[]> {
  const db = getDb();

  let where = '';
  if (filter === 'today') {
    where = `date(s.date_time) = date('now', 'localtime')`;
  } else if (filter === 'yesterday') {
    where = `date(s.date_time) = date('now', 'localtime', '-1 day')`;
  } else {
    where = `date(s.date_time) >= date('now', 'localtime', '-6 days')`;
  }

  return await db.getAllAsync<SaleRow>(
    `
    SELECT
      s.*,
      p.name as product_name
    FROM sales s
    LEFT JOIN products p ON p.id = s.product_id
    WHERE ${where}
    ORDER BY s.id DESC;
    `
  );
}
