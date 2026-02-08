import { getDb } from './database';

export type BookingStatus = 'Booked' | 'Completed' | 'Cancelled';

export type Booking = {
  id: number;
  client_name: string;
  date_time: string;        // ISO string
  description: string | null;
  price: number;
  status: BookingStatus;
  created_at: string;
};


export async function getAllBookings(): Promise<Booking[]> {
  const db = getDb();
  return await db.getAllAsync<Booking>(
    `SELECT * FROM bookings ORDER BY datetime(date_time) DESC, id DESC;`
  );
}

export type NewBooking = {
  client_name: string;
  client_phone?: string | null;
  date_time: string;
  tattoo_description: string;
  estimated_price?: number | null;
  deposit_paid?: number;
};

export async function addBooking(b: NewBooking): Promise<void> {
  const db = getDb();

  await db.runAsync(
    `
    INSERT INTO bookings
      (client_name, client_phone, date_time, tattoo_description, estimated_price, deposit_paid, status)
    VALUES (?, ?, ?, ?, ?, ?, 'Booked');
    `,
    [
      b.client_name.trim(),
      b.client_phone?.trim() || null,
      b.date_time,
      b.tattoo_description.trim(),
      b.estimated_price ?? null,
      b.deposit_paid ?? 0,
    ]
  );
}


export async function getBookingById(id: number): Promise<Booking | null> {
  const db = getDb();
  const row = await db.getFirstAsync<Booking>(
    `SELECT * FROM bookings WHERE id = ? LIMIT 1;`,
    [id]
  );
  return row ?? null;
}

export async function updateBookingStatus(id: number, status: BookingStatus): Promise<void> {
  const db = getDb();
  await db.runAsync(`UPDATE bookings SET status = ? WHERE id = ?;`, [status, id]);
}
