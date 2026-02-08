// app/_layout.tsx
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Rockio } from '../constants/rockioTheme';
import { AdminProvider } from '../context/AdminContext';
import { initDbSafe } from '../db';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initDbSafe();
        console.log('✅ SQLite database initialized');
        setDbReady(true);
      } catch (error) {
        console.error('❌ SQLite init failed:', error);
      }
    })();
  }, []);

  if (!dbReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Rockio.bg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator />
        <Text
          style={{
            marginTop: 12,
            color: Rockio.muted,
            fontWeight: '900',
          }}
        >
          Loading Rockio POS…
        </Text>
      </View>
    );
  }

  return (
    <AdminProvider>
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: Rockio.bg },
          headerTintColor: Rockio.text,
          headerTitleStyle: { fontWeight: '900' },
          contentStyle: { backgroundColor: Rockio.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'ROCKIO POS' }} />
        <Stack.Screen name="new-sale" options={{ title: 'NEW SALE' }} />
        <Stack.Screen name="products" options={{ title: 'PRODUCTS + STOCK' }} />
        <Stack.Screen name="bookings/index1" options={{ title: 'TATTOO BOOKINGS' }} />
        <Stack.Screen name="bookings/add" options={{ title: 'ADD BOOKING' }} />
        <Stack.Screen name="bookings/[id]" options={{ title: 'BOOKING' }} />
        <Stack.Screen name="reports" options={{ title: 'REPORTS' }} />
        <Stack.Screen name="sales/index3" options={{ title: 'SALES HISTORY' }} />

        {/* 🔐 Admin routes */}
        <Stack.Screen name="admin/login" options={{ title: 'ADMIN ACCESS' }} />
        <Stack.Screen name="admin/index" options={{ title: 'ADMIN PANEL' }} />
      </Stack>
    </AdminProvider>
  );
}
