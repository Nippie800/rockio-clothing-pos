import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Rockio, shadow } from '../../constants/rockioTheme';
import { addProduct, type ProductType } from '../../db/products';

const TYPES: ProductType[] = ['Clothing', 'Accessory', 'Tattoo'];

export default function AddProductScreen() {
  const isWeb = Platform.OS === 'web';

  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>('Clothing');
  const [size, setSize] = useState('');
  const [colour, setColour] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [saving, setSaving] = useState(false);

  const priceNum = useMemo(() => Number(price.replace(',', '.')), [price]);
  const stockNum = useMemo(() => Number(stock), [stock]);

  const onSave = async () => {
    const cleanName = name.trim();
    if (!cleanName) return Alert.alert('Missing info', 'Product name is required.');
    if (!Number.isFinite(priceNum) || priceNum <= 0) return Alert.alert('Invalid price', 'Enter a valid price > 0.');
    if (!Number.isInteger(stockNum) || stockNum < 0) return Alert.alert('Invalid stock', 'Enter a stock number >= 0.');

    try {
      setSaving(true);
      await addProduct({
        name: cleanName,
        type,
        size,
        colour,
        price: priceNum,
        stock: type === 'Tattoo' ? 0 : stockNum,
      });
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Save failed', 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>ROCKIO CLOTHING</Text>
      <Text style={styles.title}>ADD PRODUCT</Text>

      {isWeb ? <Text style={styles.webNote}>Web preview: saving disabled (SQLite runs on mobile).</Text> : null}

      <View style={styles.card}>
        <Text style={styles.label}>Name *</Text>
        <TextInput value={name} onChangeText={setName} placeholder="e.g. Oversized Tee" placeholderTextColor={Rockio.muted} style={styles.input} />

        <Text style={styles.label}>Type *</Text>
        <View style={styles.typeRow}>
          {TYPES.map((t) => (
            <Pressable key={t} onPress={() => setType(t)} style={[styles.typeChip, type === t && styles.typeChipActive]}>
              <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Size (optional)</Text>
        <TextInput value={size} onChangeText={setSize} placeholder="e.g. M / L / XL" placeholderTextColor={Rockio.muted} style={styles.input} />

        <Text style={styles.label}>Colour (optional)</Text>
        <TextInput value={colour} onChangeText={setColour} placeholder="e.g. Black" placeholderTextColor={Rockio.muted} style={styles.input} />

        <Text style={styles.label}>Price (R) *</Text>
        <TextInput value={price} onChangeText={setPrice} placeholder="e.g. 350" placeholderTextColor={Rockio.muted} keyboardType="decimal-pad" style={styles.input} />

        <Text style={styles.label}>Stock *</Text>
        <TextInput
          value={stock}
          onChangeText={setStock}
          placeholder={type === 'Tattoo' ? '0 (no stock)' : 'e.g. 10'}
          placeholderTextColor={Rockio.muted}
          keyboardType="number-pad"
          style={[styles.input, type === 'Tattoo' && styles.inputDisabled]}
          editable={type !== 'Tattoo'}
        />

        <Pressable style={[styles.saveBtn, (saving || isWeb) && styles.disabled]} disabled={saving || isWeb} onPress={onSave}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'SAVE PRODUCT'}</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>CANCEL</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Rockio.bg },
  brand: { color: Rockio.text, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: Rockio.orange, fontSize: 18, fontWeight: '900', marginTop: 6, marginBottom: 12 },

  webNote: { color: Rockio.muted, fontWeight: '800', marginBottom: 10 },

  card: {
    backgroundColor: Rockio.surface,
    borderWidth: 1,
    borderColor: Rockio.border,
    padding: 14,
    borderRadius: 14,
    ...shadow.card,
  },

  label: { fontWeight: '900', color: Rockio.text, marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: Rockio.surface2, borderWidth: 1, borderColor: Rockio.border, color: Rockio.text, padding: 12, borderRadius: 12 },

  inputDisabled: { opacity: 0.55 },

  typeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeChip: { backgroundColor: Rockio.surface2, borderWidth: 1, borderColor: Rockio.border, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999 },
  typeChipActive: { borderColor: Rockio.red },
  typeChipText: { fontWeight: '900', color: Rockio.text },
  typeChipTextActive: { color: Rockio.orange },

  saveBtn: { backgroundColor: Rockio.red, padding: 14, borderRadius: 14, marginTop: 18, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  saveBtnText: { color: Rockio.text, fontWeight: '900', letterSpacing: 1 },

  cancelBtn: { marginTop: 10, padding: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: Rockio.border },
  cancelBtnText: { color: Rockio.text, fontWeight: '900', letterSpacing: 1 },
});
