import React, { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Rockio, shadow } from '../constants/rockioTheme';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (pin: string) => void;
};

export default function AdminPinModal({ visible, onCancel, onConfirm }: Props) {
  const [pin, setPin] = useState('');
  const inputRef = useRef<TextInput>(null);

  // ✅ FORCE FOCUS ON ANDROID
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [visible]);

  const submit = () => {
    onConfirm(pin);
    setPin('');
  };

  const cancel = () => {
    setPin('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <Text style={styles.title}>ADMIN ACCESS</Text>
          <Text style={styles.subtitle}>Enter admin PIN</Text>

          <TextInput
            ref={inputRef}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            secureTextEntry
            autoFocus
            maxLength={6}
            placeholder="••••"
            placeholderTextColor={Rockio.muted}
            style={styles.input}
          />

          <View style={styles.actions}>
            <Pressable onPress={cancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable onPress={submit} style={styles.confirmBtn}>
              <Text style={styles.confirmText}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: Rockio.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Rockio.border,
    ...shadow.card,
  },
  title: {
    fontWeight: '900',
    fontSize: 16,
    color: Rockio.orange,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 6,
    color: Rockio.muted,
    fontWeight: '800',
  },
  input: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: Rockio.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: Rockio.text,
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 6,
    backgroundColor: Rockio.surface2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelText: {
    color: Rockio.muted,
    fontWeight: '900',
  },
  confirmBtn: {
    backgroundColor: Rockio.red,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  confirmText: {
    color: Rockio.text,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
