import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Rockio, shadow } from '../../constants/rockioTheme';
import { getSaleById, type SaleRow } from '../../db/sales';

function formatReceiptNumber(id: number) {
  return `#${String(id).padStart(6, '0')}`;
}

export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams();
  const saleId = Number(id);
  const isWeb = Platform.OS === 'web';
  const [sale, setSale] = useState<SaleRow | null>(null);

  const receiptNo = useMemo(() => formatReceiptNumber(saleId), [saleId]);

  useEffect(() => {
    if (!Number.isFinite(saleId)) {
      router.back();
      return;
    }
    (async () => {
      const data = await getSaleById(saleId);
      setSale(data);
    })();
  }, [saleId]);

  if (isWeb) {
    return (
      <View style={styles.container}>
        <Text style={styles.webText}>Receipt details available on mobile.</Text>
      </View>
    );
  }

  if (!sale) {
    return (
      <View style={styles.container}>
        <Text style={styles.webText}>Loading receipt…</Text>
      </View>
    );
  }

  const isVoided = sale.description === '[VOIDED]';
  const cashierName = 'Cashier: (set later)';

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.store}>ROCKIO CLOTHING</Text>
        <Text style={styles.tag}>PEACE • LOVE • ROCK & ROLL</Text>

        <View style={styles.hr} />

        <Text style={styles.receiptLine}>RECEIPT {receiptNo}</Text>
        <Text style={styles.small}>{cashierName}</Text>
        <Text style={styles.small}>{new Date(sale.date_time).toLocaleString()}</Text>
      </View>

      <View style={styles.card}>
        <Row label="Item" value={sale.product_name ?? 'Custom Sale'} />
        <Row label="Type" value={sale.product_type ?? '-'} />
        <Row label="Quantity" value={String(sale.quantity)} />
        <Row label="Unit Price" value={`R ${sale.unit_price.toFixed(2)}`} />

        <View style={styles.hr2} />

        <Row label="Payment" value={sale.payment_method} />
        <Row label="Total" value={`R ${sale.total_amount.toFixed(2)}`} big />

        {isVoided ? <Text style={styles.voided}>VOIDED</Text> : null}
      </View>

      <Pressable
        style={[styles.voidBtn, styles.voidBtnDisabled]}
        onPress={() => Alert.alert('Admin only', 'Voiding a sale requires admin authorization.')}
      >
        <Text style={styles.voidBtnText}>VOID SALE (ADMIN)</Text>
      </Pressable>

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>BACK</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, big ? styles.labelBig : null]}>{label}</Text>
      <Text style={[styles.value, big ? styles.valueBig : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Rockio.bg },

  webText: { color: Rockio.muted, fontWeight: '900' },

  headerCard: {
    backgroundColor: Rockio.surface,
    borderWidth: 1,
    borderColor: Rockio.border,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
    ...shadow.card,
  },
  store: { fontSize: 20, fontWeight: '900', color: Rockio.text, letterSpacing: 1.4 },
  tag: { color: Rockio.orange, marginTop: 4, fontWeight: '900', letterSpacing: 0.8 },
  hr: { height: 1, backgroundColor: Rockio.border, alignSelf: 'stretch', marginVertical: 12 },
  receiptLine: { fontWeight: '900', fontSize: 16, color: Rockio.green, letterSpacing: 1 },
  small: { color: Rockio.muted, marginTop: 4, fontWeight: '800' },

  card: {
    backgroundColor: Rockio.surface,
    borderWidth: 1,
    borderColor: Rockio.border,
    padding: 14,
    borderRadius: 14,
    ...shadow.card,
  },

  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontWeight: '900', color: Rockio.muted },
  value: { fontWeight: '900', color: Rockio.text },
  labelBig: { fontSize: 16, color: Rockio.text },
  valueBig: { fontSize: 16, color: Rockio.orange },

  hr2: { height: 1, backgroundColor: Rockio.border, marginVertical: 10 },

  voided: {
    marginTop: 12,
    color: Rockio.red,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 3,
  },

  voidBtn: { marginTop: 14, backgroundColor: Rockio.danger, padding: 14, borderRadius: 14, alignItems: 'center' },
  voidBtnDisabled: { opacity: 0.45 },
  voidBtnText: { color: Rockio.text, fontWeight: '900', letterSpacing: 1 },

  backBtn: {
    marginTop: 12,
    backgroundColor: Rockio.surface,
    borderWidth: 1,
    borderColor: Rockio.border,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  backBtnText: { fontWeight: '900', color: Rockio.text, letterSpacing: 1 },
});
