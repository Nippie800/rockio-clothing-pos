// db/sales.web.ts
export type PaymentMethod = 'Cash' | 'Card';

export type NewSale = {
  date_time: string;
  product_id: number | null;
  description?: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method: PaymentMethod;
};

export type SaleRow = any;

export type TodaySummary = {
  total_sales: number;
  cash_total: number;
  card_total: number;
  sale_count: number;
};

export async function addSale(_s: NewSale): Promise<void> {
  return;
}

export async function getTodaySales(): Promise<SaleRow[]> {
  return [];
}

export async function getTodaySummary(): Promise<TodaySummary> {
  return { total_sales: 0, cash_total: 0, card_total: 0, sale_count: 0 };
}
