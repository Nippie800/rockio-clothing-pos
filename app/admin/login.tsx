import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLoginScreen() {
  const { login } = useAdmin();
  const [pin, setPin] = useState('');

  const submit = () => {
    if (!login(pin)) {
      Alert.alert('Invalid PIN', 'Incorrect admin PIN');
      return;
    }
    router.replace('../admin');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Access</Text>

      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        placeholder="Enter Admin PIN"
        keyboardType="numeric"
        secureTextEntry
      />

      <Pressable style={styles.btn} onPress={submit}>
        <Text style={styles.btnText}>Unlock</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0f172a' },
  title: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 16 },
  btn: { backgroundColor: '#22c55e', padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { fontWeight: '900', color: '#0f172a' },
});
