import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAdmin } from '../../context/AdminContext';
import { getProductById, setProductStock, type Product } from '../../db/products';

export default function ProductDetailScreen() {
  const { requireAdmin } = useAdmin();

  const params = useLocalSearchParams();
  const id = useMemo(() => Number(params.id), [params.id]);

  const [item, setItem] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [stockInput, setStockInput] = useState('0');

  const load = async () => {
    try {
      setLoading(true);
      const p = await getProductById(id);
      setItem(p);
      setStockInput(String(p?.stock ?? 0));
    } catch {
      Alert.alert('Error', 'Could not load product.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(id)) {
      Alert.alert('Invalid product');
      router.back();
      return;
    }
    load();
  }, [id]);

  const updateStock = async (next: number) => {
    if (!item) return;
    await setProductStock(item.id, next);
    setItem({ ...item, stock: next });
    setStockInput(String(next));
  };

  const changeStock = (delta: number) => {
    if (!item || item.type === 'Tattoo') return;

    const next = Math.max(0, item.stock + delta);

    requireAdmin(async () => {
      try {
        await updateStock(next);
      } catch {
        Alert.alert('Failed', 'Could not update stock');
      }
    });
  };

  const saveStock = () => {
    if (!item || item.type === 'Tattoo') return;

    const n = Number(stockInput);
    if (!Number.isFinite(n) || n < 0) {
      Alert.alert('Invalid stock');
      return;
    }

    requireAdmin(async () => {
      try {
        await updateStock(Math.floor(n));
        Alert.alert('Saved', 'Stock updated');
      } catch {
        Alert.alert('Failed', 'Could not save stock');
      }
    });
  };

  if (loading) {
    return <View style={styles.container}><Text>Loading…</Text></View>;
  }

  if (!item) {
    return <View style={styles.container}><Text>Not found</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.meta}>{item.type}</Text>

      <View style={styles.card}>
        <Text style={styles.price}>R {Number(item.price).toFixed(2)}</Text>

        {item.type === 'Tattoo' ? (
          <Text style={styles.noStock}>Tattoo services don’t track stock</Text>
        ) : (
          <>
            <Text style={styles.stock}>Stock: {item.stock}</Text>

            <View style={styles.row}>
              <Pressable style={styles.btn} onPress={() => changeStock(-1)}>
                <Text style={styles.btnText}>−</Text>
              </Pressable>
              <Pressable style={styles.btn} onPress={() => changeStock(+1)}>
                <Text style={styles.btnText}>+</Text>
              </Pressable>
            </View>

            <TextInput
              value={stockInput}
              onChangeText={setStockInput}
              keyboardType="number-pad"
              style={styles.input}
            />

            <Pressable style={styles.saveBtn} onPress={saveStock}>
              <Text style={styles.saveText}>Save Stock (Admin)</Text>
            </Pressable>
          </>
        )}
      </View>

      <Pressable onPress={() => router.back()}>
        <Text style={{ marginTop: 16 }}>← Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '900' },
  meta: { color: '#666', marginBottom: 10 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12 },
  price: { fontWeight: '900', marginBottom: 8 },
  stock: { fontWeight: '900', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10 },
  btn: { backgroundColor: '#111', padding: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontSize: 18 },
  input: { backgroundColor: '#eee', padding: 10, borderRadius: 10, marginTop: 10 },
  saveBtn: { backgroundColor: '#111', padding: 14, borderRadius: 12, marginTop: 10 },
  saveText: { color: '#fff', fontWeight: '900', textAlign: 'center' },
  noStock: { color: '#666' },
});
