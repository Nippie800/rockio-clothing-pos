import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Rockio, shadow } from '../../constants/rockioTheme';
import { useAdmin } from '../../context/AdminContext';
import { getAllProducts, seedDemoProducts, updateProductStock, type Product } from '../../db/products';

export default function ProductsScreen() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const isWeb = Platform.OS === 'web';

  const { requireAdmin } = useAdmin();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
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

  const changeStock = async (item: Product, delta: number) => {
    if (item.type === 'Tattoo') return;

    const newStock = Math.max(0, item.stock + delta);

    try {
      await updateProductStock(item.id, newStock);
      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, stock: newStock } : p))
      );
    } catch (e) {
      console.error(e);
      Alert.alert('Update failed', 'Could not update stock.');
    }
  };

  const onSeed = async () => {
    if (Platform.OS === 'web') return;

    requireAdmin(async () => {
      const result = await seedDemoProducts(true);
      Alert.alert('Done', result === 'seeded' ? 'Demo products added ✅' : 'Skipped');
      load();
    });
  };

  const renderItem = ({ item }: { item: Product }) => (
    <Pressable onPress={() => router.push(`../products/${item.id}`)}>
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.type}
            {item.size ? ` • Size: ${item.size}` : ''}
            {item.colour ? ` • ${item.colour}` : ''}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.price}>R {Number(item.price).toFixed(2)}</Text>

          {item.type === 'Tattoo' ? (
            <Text style={styles.stockMuted}>No stock</Text>
          ) : (
            <>
              <Text
                style={[
                  styles.stock,
                  item.stock <= 3 ? styles.lowStock : null,
                ]}
              >
                Stock: {item.stock}
              </Text>

              <View style={styles.stockRow}>
                <Pressable
                  style={[
                    styles.stockBtn,
                    item.stock <= 0 ? styles.stockBtnDisabled : null,
                  ]}
                  disabled={item.stock <= 0}
                  onPress={(e) => {
                    e.stopPropagation();
                    requireAdmin(() => changeStock(item, -1));
                  }}
                >
                  <Text style={styles.stockBtnText}>−</Text>
                </Pressable>

                <Pressable
                  style={styles.stockBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    requireAdmin(() => changeStock(item, +1));
                  }}
                >
                  <Text style={styles.stockBtnText}>+</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>ROCKIO CLOTHING</Text>
      <Text style={styles.title}>PRODUCTS + STOCK</Text>

      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            style={[styles.secondaryBtn, isWeb && styles.disabled]}
            onPress={onSeed}
            disabled={isWeb}
          >
            <Text style={styles.secondaryBtnText}>SEED DEMO</Text>
          </Pressable>

          <Pressable
            style={styles.addBtn}
            onPress={() => requireAdmin(() => router.push('/products/add'))}
          >
            <Text style={styles.addBtnText}>+ ADD</Text>
          </Pressable>
        </View>
      </View>

      {isWeb && (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>WEB PREVIEW</Text>
          <Text style={styles.noticeText}>
            SQLite features run on mobile only.
          </Text>
        </View>
      )}

      {loading ? (
        <Text style={styles.info}>Loading products…</Text>
      ) : items.length === 0 ? (
        <Text style={styles.info}>
          No products yet. Tap “SEED DEMO” or “+ ADD”.
        </Text>
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

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },

  addBtn: { backgroundColor: Rockio.red, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  addBtnText: { color: Rockio.text, fontWeight: '900', letterSpacing: 1 },

  secondaryBtn: {
    backgroundColor: Rockio.surface,
    borderWidth: 1,
    borderColor: Rockio.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  secondaryBtnText: { color: Rockio.text, fontWeight: '900', letterSpacing: 1 },
  disabled: { opacity: 0.5 },

  info: { marginTop: 24, textAlign: 'center', color: Rockio.muted, fontWeight: '800' },

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
  name: { fontSize: 16, fontWeight: '900', color: Rockio.text, marginBottom: 2 },
  meta: { color: Rockio.muted, fontWeight: '800' },
  price: { fontSize: 14, fontWeight: '900', color: Rockio.green },

  stock: { marginTop: 6, fontWeight: '900', color: Rockio.text },
  lowStock: { color: Rockio.orange },
  stockMuted: { marginTop: 6, color: Rockio.muted, fontWeight: '800' },

  stockRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  stockBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Rockio.surface2,
    borderWidth: 1,
    borderColor: Rockio.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockBtnDisabled: { opacity: 0.4 },
  stockBtnText: { color: Rockio.text, fontSize: 18, fontWeight: '900' },

  notice: {
    backgroundColor: Rockio.surface,
    borderWidth: 1,
    borderColor: Rockio.border,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  noticeTitle: { fontWeight: '900', marginBottom: 4, color: Rockio.orange },
  noticeText: { color: Rockio.muted },
});
