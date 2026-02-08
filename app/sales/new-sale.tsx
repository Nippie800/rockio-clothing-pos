import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getAllProducts, type Product, reduceStock } from '../../db/products';
import { addSale, type PaymentMethod } from '../../db/sales';

export default function NewSaleScreen() {
  const isWeb = Platform.OS === 'web';

  const [products, setProducts] = useState<Product[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [selected, setSelected] = useState<Product | null>(null);
  const [qtyText, setQtyText] = useState('1');
  const [payment, setPayment] = useState<PaymentMethod>('Cash');
  const [saving, setSaving] = useState(false);

  const qty = useMemo(() => {
    const n = Number(qtyText);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  }, [qtyText]);

  const total = useMemo(() => {
    if (!selected) return 0;
    return qty * Number(selected.price);
  }, [qty, selected]);

  const loadProducts = useCallback(async () => {
    const list = await getAllProducts();
    setProducts(list);

    // keep selection valid if product removed later
    if (selected) {
      const stillExists = list.find((p) => p.id === selected.id);
      if (!stillExists) setSelected(null);
    }
  }, [selected]);

  useFocusEffect(
    useCallback(() => {
      // Refresh products when screen is focused
      loadProducts();
    }, [loadProducts])
  );

  const openPicker = () => setPickerOpen(true);
  const closePicker = () => setPickerOpen(false);

  const onPick = (p: Product) => {
    setSelected(p);
    closePicker();
  };

  const onSaveSale = async () => {
    if (isWeb) return;

    if (!selected) {
      Alert.alert('Select a product', 'Please choose a product to sell.');
      return;
    }

    if (qty <= 0) {
      Alert.alert('Invalid quantity', 'Quantity must be 1 or more.');
      return;
    }

    // Stock check for stock-tracked products
    const tracksStock = selected.type === 'Clothing' || selected.type === 'Accessory';
    if (tracksStock && qty > selected.stock) {
      Alert.alert(
        'Not enough stock',
        `You only have ${selected.stock} in stock for this item.`
      );
      return;
    }

    try {
      setSaving(true);

      const now = new Date().toISOString();
      const unit = Number(selected.price);
      const saleTotal = qty * unit;

      await addSale({
        date_time: now,
        product_id: selected.id,
        description: null,
        quantity: qty,
        unit_price: unit,
        total_amount: saleTotal,
        payment_method: payment,
      });

      // Reduce stock if needed
      if (tracksStock) {
        await reduceStock(selected.id, qty);
      }

      Alert.alert('Sale recorded ✅', `Total: R ${saleTotal.toFixed(2)} (${payment})`);

      // Reset form
      setQtyText('1');
      setPayment('Cash');

      // Reload to show updated stock in picker + keep selected updated
      await loadProducts();

      // Update selected reference from latest list
      const updated = products.find((p) => p.id === selected.id);
      if (updated) setSelected(updated);
    } catch (e) {
      console.error(e);
      Alert.alert('Save failed', 'Could not record sale. Check logs.');
    } finally {
      setSaving(false);
    }
  };

  const ProductRow = ({ item }: { item: Product }) => (
    <Pressable style={styles.pickRow} onPress={() => onPick(item)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.pickName}>{item.name}</Text>
        <Text style={styles.pickMeta}>
          {item.type}
          {item.size ? ` • ${item.size}` : ''}
          {item.colour ? ` • ${item.colour}` : ''}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.pickPrice}>R {Number(item.price).toFixed(2)}</Text>
        {item.type === 'Tattoo' ? (
          <Text style={styles.pickStockMuted}>No stock</Text>
        ) : (
          <Text style={styles.pickStock}>Stock: {item.stock}</Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {isWeb ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Web Preview</Text>
          <Text style={styles.noticeText}>
            Sales + SQLite run on mobile only. Use Expo Go on Android to test the full POS flow.
          </Text>
        </View>
      ) : null}

      {/* Product picker */}
      <Text style={styles.label}>Product *</Text>
      <Pressable style={styles.picker} onPress={openPicker}>
        <Text style={styles.pickerText}>
          {selected ? `${selected.name} (R ${Number(selected.price).toFixed(2)})` : 'Select a product'}
        </Text>
      </Pressable>

      {/* Quantity */}
      <Text style={styles.label}>Quantity *</Text>
      <View style={styles.qtyRow}>
        <Pressable
          style={[styles.qtyBtn, qty <= 1 ? styles.qtyBtnDisabled : null]}
          disabled={qty <= 1}
          onPress={() => setQtyText(String(Math.max(1, qty - 1)))}
        >
          <Text style={styles.qtyBtnText}>−</Text>
        </Pressable>

        <TextInput
          value={qtyText}
          onChangeText={setQtyText}
          keyboardType="number-pad"
          style={styles.qtyInput}
          placeholder="1"
        />

        <Pressable style={styles.qtyBtn} onPress={() => setQtyText(String(qty + 1))}>
          <Text style={styles.qtyBtnText}>+</Text>
        </Pressable>
      </View>

      {/* Payment method */}
      <Text style={styles.label}>Payment *</Text>
      <View style={styles.payRow}>
        <Pressable
          style={[styles.payChip, payment === 'Cash' ? styles.payChipActive : null]}
          onPress={() => setPayment('Cash')}
        >
          <Text style={[styles.payChipText, payment === 'Cash' ? styles.payChipTextActive : null]}>
            Cash
          </Text>
        </Pressable>

        <Pressable
          style={[styles.payChip, payment === 'Card' ? styles.payChipActive : null]}
          onPress={() => setPayment('Card')}
        >
          <Text style={[styles.payChipText, payment === 'Card' ? styles.payChipTextActive : null]}>
            Card
          </Text>
        </Pressable>
      </View>

      {/* Total */}
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>R {total.toFixed(2)}</Text>
      </View>

      {/* Save */}
      <Pressable
        style={[styles.saveBtn, (saving || isWeb) ? styles.saveBtnDisabled : null]}
        disabled={saving || isWeb}
        onPress={onSaveSale}
      >
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Record Sale'}</Text>
      </Pressable>

      {/* Modal picker */}
      <Modal visible={pickerOpen} animationType="slide" onRequestClose={closePicker}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Product</Text>
            <Pressable onPress={closePicker}>
              <Text style={styles.modalClose}>Close</Text>
            </Pressable>
          </View>

          <FlatList
            data={products}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ProductRow item={item} />}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <Pressable style={styles.modalFooterBtn} onPress={() => router.push('/products/add')}>
            <Text style={styles.modalFooterBtnText}>+ Add New Product</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f7f7' },

  notice: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12 },
  noticeTitle: { fontWeight: '900', marginBottom: 4 },
  noticeText: { color: '#555' },

  label: { fontWeight: '900', marginTop: 10, marginBottom: 6 },

  picker: { backgroundColor: '#fff', padding: 12, borderRadius: 10 },
  pickerText: { fontWeight: '700' },

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyBtnText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  qtyInput: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 10, textAlign: 'center' },

  payRow: { flexDirection: 'row', gap: 10 },
  payChip: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 999 },
  payChipActive: { backgroundColor: '#111827' },
  payChipText: { fontWeight: '900', color: '#111827' },
  payChipTextActive: { color: '#fff' },

  totalBox: {
    marginTop: 14,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: { fontWeight: '900', color: '#555' },
  totalValue: { fontWeight: '900', fontSize: 16 },

  saveBtn: { backgroundColor: '#111827', padding: 14, borderRadius: 12, marginTop: 18, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontWeight: '900' },

  modalContainer: { flex: 1, backgroundColor: '#f7f7f7', padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  modalClose: { fontWeight: '900', color: '#111827' },

  pickRow: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, flexDirection: 'row', gap: 12 },
  pickName: { fontWeight: '900', marginBottom: 2 },
  pickMeta: { color: '#555' },
  pickPrice: { fontWeight: '900' },
  pickStock: { marginTop: 6, fontWeight: '700' },
  pickStockMuted: { marginTop: 6, color: '#666' },

  modalFooterBtn: { backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  modalFooterBtnText: { fontWeight: '900', color: '#111827' },
});
