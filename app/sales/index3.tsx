import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Rockio, shadow } from '../../constants/rockioTheme';
import { getSalesByRange, type DateFilter, type SaleRow } from '../../db/sales';

export default function SalesHistoryScreen() {
  const isWeb = Platform.OS === 'web';
  const [items, setItems] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DateFilter>('today');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSalesByRange(filter);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const title =
    filter === 'today' ? "TODAY’S SALES" : filter === 'yesterday' ? "YESTERDAY’S SALES" : "THIS WEEK’S SALES";

  const emptyText =
    filter === 'today'
      ? 'No sales recorded today yet.'
      : filter === 'yesterday'
      ? 'No sales recorded yesterday.'
      : 'No sales recorded in the last 7 days.';

  const renderItem = ({ item }: { item: SaleRow }) => {
    const name = item.product_name ?? item.description ?? 'Sale';
    return (
      <Pressable onPress={() => router.push(`../sales/${item.id}`)}>
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.meta}>
              Qty: {item.quantity} • {item.payment_method}
            </Text>
            <Text style={styles.metaSmall}>{new Date(item.date_time).toLocaleString()}</Text>
          </View>

          <Text style={styles.amount}>R {Number(item.total_amount).toFixed(2)}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {isWeb ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>WEB PREVIEW</Text>
          <Text style={styles.noticeText}>Sales history runs on mobile (SQLite).</Text>
        </View>
      ) : null}

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>⬅ BACK</Text>
      </Pressable>

      <Text style={styles.brand}>ROCKIO CLOTHING</Text>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterChip, filter === 'today' && styles.filterChipActive]}
          onPress={() => setFilter('today')}
        >
          <Text style={[styles.filterText, filter === 'today' && styles.filterTextActive]}>Today</Text>
        </Pressable>

        <Pressable
          style={[styles.filterChip, filter === 'yesterday' && styles.filterChipActive]}
          onPress={() => setFilter('yesterday')}
        >
          <Text style={[styles.filterText, filter === 'yesterday' && styles.filterTextActive]}>Yesterday</Text>
        </Pressable>

        <Pressable
          style={[styles.filterChip, filter === 'week' && styles.filterChipActive]}
          onPress={() => setFilter('week')}
        >
          <Text style={[styles.filterText, filter === 'week' && styles.filterTextActive]}>This Week</Text>
        </Pressable>
      </View>

      {loading ? (
        <Text style={styles.info}>Loading…</Text>
      ) : items.length === 0 ? (
        <Text style={styles.info}>{emptyText}</Text>
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
  container: { flex: 1, padding: 16, backgroundColor: Rockio.bg },
  brand: { color: Rockio.text, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: Rockio.orange, fontSize: 18, fontWeight: '900', marginTop: 6, marginBottom: 12 },

  info: { marginTop: 24, textAlign: 'center', color: Rockio.muted, fontWeight: '800' },

  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  filterChip: {
    backgroundColor: Rockio.surface,
    borderWidth: 1,
    borderColor: Rockio.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  filterChipActive: { borderColor: Rockio.red },
  filterText: { fontWeight: '900', color: Rockio.text },
  filterTextActive: { color: Rockio.orange },

  card: {
    backgroundColor: Rockio.surface,
    borderWidth: 1,
    borderColor: Rockio.border,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 12,
    ...shadow.card,
  },
  name: { fontWeight: '900', color: Rockio.text, marginBottom: 4 },
  meta: { color: Rockio.muted, fontWeight: '800' },
  metaSmall: { color: Rockio.muted, marginTop: 4, opacity: 0.9 },
  amount: { fontWeight: '900', color: Rockio.green },

  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Rockio.surface,
    borderWidth: 1,
    borderColor: Rockio.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  backBtnText: { fontWeight: '900', color: Rockio.text },

  notice: { backgroundColor: Rockio.surface, borderWidth: 1, borderColor: Rockio.border, padding: 12, borderRadius: 14, marginBottom: 12 },
  noticeTitle: { fontWeight: '900', marginBottom: 4, color: Rockio.orange },
  noticeText: { color: Rockio.muted },
});
