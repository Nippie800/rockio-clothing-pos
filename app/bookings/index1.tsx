import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { getAllBookings, type Booking } from '../../db/bookings';

/**
 * 👇 Extend the Booking type locally so TS knows about new fields
 * (runtime already has them, this is just typing)
 */
type BookingView = Booking & {
  tattoo_description?: string;
  estimated_price?: number | null;
  deposit_paid?: number | null;
  client_phone?: string | null;
};

export default function BookingsScreen() {
  const isWeb = Platform.OS === 'web';
  const [items, setItems] = useState<BookingView[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = (await getAllBookings()) as BookingView[];
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const badgeStyle = (status: Booking['status']) => {
    if (status === 'Completed') return styles.badgeCompleted;
    if (status === 'Cancelled') return styles.badgeCancelled;
    return styles.badgeBooked;
  };

  const formatMoney = (v?: number | null) => {
    if (typeof v !== 'number' || !Number.isFinite(v)) return null;
    return `R ${v.toFixed(2)}`;
  };

  const renderItem = ({ item }: { item: BookingView }) => {
    const price = formatMoney(item.estimated_price);
    const deposit = formatMoney(item.deposit_paid ?? 0);

    return (
      <Pressable onPress={() => router.push(`/bookings/${item.id}`)}>
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.client_name}</Text>
            <Text style={styles.meta}>
              {new Date(item.date_time).toLocaleString()}
            </Text>

            {item.tattoo_description ? (
              <Text style={styles.desc}>{item.tattoo_description}</Text>
            ) : null}

            {item.client_phone ? (
              <Text style={styles.metaSmall}>📞 {item.client_phone}</Text>
            ) : null}
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.price}>{price ?? 'Quote pending'}</Text>
            <Text style={styles.metaSmall}>Deposit: {deposit ?? 'R 0.00'}</Text>

            <View style={[styles.badge, badgeStyle(item.status)]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {isWeb ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Web Preview</Text>
          <Text style={styles.noticeText}>Bookings run on mobile (SQLite).</Text>
        </View>
      ) : null}

      <View style={styles.headerRow}>
        <Text style={styles.title}>Tattoo Bookings</Text>
        <Pressable style={styles.addBtn} onPress={() => router.push('/bookings/add')}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {loading ? (
        <Text style={styles.info}>Loading…</Text>
      ) : items.length === 0 ? (
        <Text style={styles.info}>No bookings yet. Tap “+ Add”.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f7f7' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '900' },
  addBtn: { backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '900' },
  info: { marginTop: 24, textAlign: 'center', color: '#555' },

  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, flexDirection: 'row', gap: 12 },
  name: { fontWeight: '900', marginBottom: 4 },
  meta: { color: '#555', fontWeight: '700' },
  metaSmall: { color: '#777', marginTop: 6, fontWeight: '700' },
  desc: { marginTop: 6, color: '#444' },
  price: { fontWeight: '900' },

  badge: { marginTop: 8, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  badgeText: { fontWeight: '900', color: '#fff' },
  badgeBooked: { backgroundColor: '#111827' },
  badgeCompleted: { backgroundColor: '#15803d' },
  badgeCancelled: { backgroundColor: '#b91c1c' },

  notice: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12 },
  noticeTitle: { fontWeight: '900', marginBottom: 4 },
  noticeText: { color: '#555' },
});
