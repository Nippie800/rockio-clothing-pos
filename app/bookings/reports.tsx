import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { getTodaySummary, type TodaySummary } from '../../db/sales';

export default function ReportsScreen() {
  const isWeb = Platform.OS === 'web';

  const [summary, setSummary] = useState<TodaySummary>({
    total_sales: 0,
    cash_total: 0,
    card_total: 0,
    sale_count: 0,
  });

  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const s = await getTodaySummary();
      setSummary(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      {isWeb ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Web Preview</Text>
          <Text style={styles.noticeText}>Reports run on mobile (SQLite).</Text>
        </View>
      ) : null}

      <Text style={styles.title}>Today’s Summary</Text>

      {loading ? (
        <Text style={styles.info}>Loading…</Text>
      ) : (
        <View style={styles.card}>
          <Row label="Total Sales" value={`R ${summary.total_sales.toFixed(2)}`} />
          <Row label="Cash Total" value={`R ${summary.cash_total.toFixed(2)}`} />
          <Row label="Card Total" value={`R ${summary.card_total.toFixed(2)}`} />
          <Row label="Number of Sales" value={`${summary.sale_count}`} />
        </View>
      )}

      <Pressable style={styles.primaryBtn} onPress={() => router.push('../sales/index3')}>
        <Text style={styles.primaryBtnText}>View Today’s Receipts</Text>
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={load}>
        <Text style={styles.secondaryBtnText}>Refresh</Text>
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
  title: { fontSize: 22, fontWeight: '900', marginBottom: 12 },
  info: { marginTop: 20, textAlign: 'center', color: '#555' },

  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontWeight: '800', color: '#555' },
  rowValue: { fontWeight: '900' },

  primaryBtn: { backgroundColor: '#111827', padding: 14, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '900' },

  secondaryBtn: { backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  secondaryBtnText: { color: '#111827', fontWeight: '900' },

  notice: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12 },
  noticeTitle: { fontWeight: '900', marginBottom: 4 },
  noticeText: { color: '#555' },
});
