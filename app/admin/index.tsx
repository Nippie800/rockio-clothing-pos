import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAdmin } from '../../context/AdminContext';

export default function AdminDashboard() {
  const { logout } = useAdmin();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>

      <Pressable style={styles.card} onPress={() => router.push('../products')}>
        <Text style={styles.cardText}>Manage Products & Stock</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => router.push('../reports')}>
        <Text style={styles.cardText}>Reports</Text>
      </Pressable>

      <Pressable style={[styles.card, styles.logout]} onPress={logout}>
        <Text style={styles.logoutText}>Exit Admin</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#020617' },
  title: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 16 },
  card: { backgroundColor: '#111827', padding: 16, borderRadius: 14, marginBottom: 12 },
  cardText: { color: '#fff', fontWeight: '800' },
  logout: { backgroundColor: '#7f1d1d' },
  logoutText: { color: '#fff', fontWeight: '900', textAlign: 'center' },
});
