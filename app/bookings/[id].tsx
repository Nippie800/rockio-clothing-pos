import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { getBookingById, updateBookingStatus, type Booking, type BookingStatus } from '../../db/bookings';

const STATUSES: BookingStatus[] = ['Booked', 'Completed', 'Cancelled'];

// Widen locally so TS won't complain if your exported Booking type is behind
type BookingView = Booking & {
  client_phone?: string | null;
  tattoo_description?: string;
  estimated_price?: number | null;
  deposit_paid?: number | null;
};

function moneyOrLabel(v: unknown, emptyLabel = 'Quote pending') {
  if (v === null || v === undefined) return emptyLabel;
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return emptyLabel;
  return `R ${n.toFixed(2)}`;
}

export default function BookingDetailScreen() {
  const isWeb = Platform.OS === 'web';
  const { id } = useLocalSearchParams();
  const bookingId = useMemo(() => Number(id), [id]);

  const [booking, setBooking] = useState<BookingView | null>(null);

  const load = async () => {
    const b = (await getBookingById(bookingId)) as BookingView | null;
    setBooking(b);
  };

  useEffect(() => {
    if (!Number.isFinite(bookingId)) {
      router.back();
      return;
    }
    load();
  }, [bookingId]);

  const setStatus = async (s: BookingStatus) => {
    if (!booking) return;
    try {
      await updateBookingStatus(booking.id, s);
      setBooking({ ...booking, status: s });
      Alert.alert('Updated ✅', `Status set to ${s}`);
    } catch (e) {
      console.error(e);
      Alert.alert('Update failed', 'Could not update booking status.');
    }
  };

  if (isWeb) {
    return (
      <View style={styles.container}>
        <Text>Booking details available on mobile.</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <Text>Loading booking…</Text>
      </View>
    );
  }

  const estimatedPriceText = moneyOrLabel(booking.estimated_price, 'Quote pending');
  const depositText = moneyOrLabel(booking.deposit_paid ?? 0, 'R 0.00');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{booking.client_name}</Text>
      <Text style={styles.meta}>{new Date(booking.date_time).toLocaleString()}</Text>

      {booking.client_phone ? (
        <Text style={styles.meta}>📞 {booking.client_phone}</Text>
      ) : null}

      {booking.tattoo_description ? (
        <Text style={styles.desc}>{booking.tattoo_description}</Text>
      ) : null}

      <View style={styles.card}>
        <Row label="Estimated Price" value={estimatedPriceText} />
        <Row label="Deposit Paid" value={depositText} />
        <Row label="Status" value={booking.status} />
      </View>

      <Text style={styles.section}>Update Status</Text>
      <View style={styles.chips}>
        {STATUSES.map((s) => (
          <Pressable
            key={s}
            style={[styles.chip, booking.status === s ? styles.chipActive : null]}
            onPress={() => setStatus(s)}
          >
            <Text style={[styles.chipText, booking.status === s ? styles.chipTextActive : null]}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Back</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f7f7' },
  title: { fontSize: 22, fontWeight: '900' },
  meta: { marginTop: 6, color: '#555', fontWeight: '700' },
  desc: { marginTop: 10, color: '#333' },

  card: { marginTop: 14, backgroundColor: '#fff', padding: 14, borderRadius: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontWeight: '800', color: '#555' },
  rowValue: { fontWeight: '900' },

  section: { marginTop: 16, fontWeight: '900', marginBottom: 10 },

  chips: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  chip: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999 },
  chipActive: { backgroundColor: '#111827' },
  chipText: { fontWeight: '900', color: '#111827' },
  chipTextActive: { color: '#fff' },

  backBtn: { marginTop: 18, backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center' },
  backBtnText: { fontWeight: '900', color: '#111827' },
});
