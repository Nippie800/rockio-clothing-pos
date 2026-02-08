// app/index.tsx
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Rockio, shadow } from '../constants/rockioTheme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>ROCKIO CLOTHING</Text>
      <Text style={styles.tagline}>PEACE • LOVE • ROCK & ROLL</Text>

      <View style={styles.divider} />

      <Text style={styles.subtitle}>Choose a station</Text>

      <Link href="/sales/new-sale" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>🔥 NEW SALE</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/products/index2" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>👕 PRODUCTS + STOCK</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/bookings/index1" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>🖋️ TATTOO BOOKINGS</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/bookings/reports" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>📊 REPORTS</Text>
        </TouchableOpacity>
      </Link>

      <Text style={styles.footer}>Built for Rockio • Local Store Mode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: Rockio.bg },
  brand: { color: Rockio.text, fontSize: 26, fontWeight: '900', letterSpacing: 1.5 },
  tagline: { color: Rockio.orange, marginTop: 6, fontWeight: '900', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: Rockio.border, marginVertical: 18 },

  subtitle: { color: Rockio.muted, marginBottom: 14, fontWeight: '800' },

  button: {
    backgroundColor: Rockio.surface,
    borderWidth: 1,
    borderColor: Rockio.border,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
    ...shadow.card,
  },
  primary: { borderColor: Rockio.red },
  buttonText: { color: Rockio.text, fontSize: 16, fontWeight: '900', letterSpacing: 0.6 },

  footer: { marginTop: 14, color: Rockio.muted, fontWeight: '800', textAlign: 'center' },
});
