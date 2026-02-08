export type BookingStatus = 'Booked' | 'Completed' | 'Cancelled';

export type Booking = {
  id: number;
  client_name: string;
  date_time: string;
  description: string | null;
  price: number;
  status: BookingStatus;
  created_at: string;
};

export type NewBooking = {
  client_name: string;
  date_time: string;
  description?: string;
  price: number;
};

export async function getAllBookings(): Promise<Booking[]> {
  return [];
}
export async function addBooking(_b: NewBooking): Promise<void> {
  return;
}
export async function getBookingById(_id: number): Promise<Booking | null> {
  return null;
}
export async function updateBookingStatus(_id: number, _status: BookingStatus): Promise<void> {
  return;
}
