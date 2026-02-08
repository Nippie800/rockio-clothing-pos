import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { addBooking } from '../../db/bookings';

export default function AddBookingScreen() {
  const isWeb = Platform.OS === 'web';

  const [client, setClient] = useState('');
  const [phone, setPhone] = useState('');

  const [bookingDate, setBookingDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const [tattooDesc, setTattooDesc] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [saving, setSaving] = useState(false);

  const toNumberOrNull = (v: string) => {
    const cleaned = v.trim().replace(',', '.');
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  };

  const onSave = async () => {
    const clientName = client.trim();
    const desc = tattooDesc.trim();

    if (!clientName) return Alert.alert('Missing info', 'Client name is required.');
    if (!desc) return Alert.alert('Missing info', 'Tattoo description is required.');

    // bookingDate is already a Date object (from picker)
    if (Number.isNaN(bookingDate.getTime())) {
      return Alert.alert('Invalid date/time', 'Please pick a valid date and time.');
    }

    const priceNum = toNumberOrNull(estimatedPrice); // nullable
    const depositNum = toNumberOrNull(deposit) ?? 0;

    if (depositNum < 0) return Alert.alert('Invalid deposit', 'Deposit cannot be negative.');
    if (priceNum !== null && priceNum <= 0) {
      return Alert.alert('Invalid price', 'Estimated price must be greater than 0 (or leave empty).');
    }

    try {
      setSaving(true);

      await addBooking({
        client_name: clientName,
        client_phone: phone.trim() ? phone.trim() : null,
        date_time: bookingDate.toISOString(),
        tattoo_description: desc,
        estimated_price: priceNum,
        deposit_paid: depositNum,
      });

      Alert.alert('Saved ✅', 'Booking created.');
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Save failed', 'Could not save booking.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {isWeb ? (
        <Text style={styles.webNote}>Bookings save on mobile (SQLite).</Text>
      ) : null}

      <Text style={styles.label}>Client Name *</Text>
      <TextInput
        style={styles.input}
        value={client}
        onChangeText={setClient}
        placeholder="e.g. Thabo"
      />

      <Text style={styles.label}>Client Phone (optional)</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="e.g. 071 234 5678"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Date & Time *</Text>

      {isWeb ? (
        // Web preview: allow manual ISO editing
        <TextInput
          style={styles.input}
          value={bookingDate.toISOString()}
          onChangeText={(v) => {
            const d = new Date(v);
            if (!Number.isNaN(d.getTime())) setBookingDate(d);
          }}
          placeholder="Use ISO date on web"
        />
      ) : (
        <>
          <Pressable
            style={styles.dateBtn}
            onPress={() => {
              setPickerMode('date');
              setShowPicker(true);
            }}
          >
            <Text style={styles.dateBtnText}>📅 {bookingDate.toLocaleDateString()}</Text>
          </Pressable>

          <Pressable
            style={styles.dateBtn}
            onPress={() => {
              setPickerMode('time');
              setShowPicker(true);
            }}
          >
            <Text style={styles.dateBtnText}>
              ⏰ {bookingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={bookingDate}
              mode={pickerMode}
              is24Hour
              display="default"
              onChange={(_, selected) => {
                setShowPicker(false);
                if (selected) setBookingDate(selected);
              }}
            />
          )}
        </>
      )}

      <Text style={styles.label}>Tattoo Description *</Text>
      <TextInput
        style={[styles.input, { height: 90 }]}
        value={tattooDesc}
        onChangeText={setTattooDesc}
        placeholder="e.g. Forearm rose + shading"
        multiline
      />

      <Text style={styles.label}>Estimated Price (R) (optional)</Text>
      <TextInput
        style={styles.input}
        value={estimatedPrice}
        onChangeText={setEstimatedPrice}
        placeholder="e.g. 900"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Deposit Paid (R) (optional)</Text>
      <TextInput
        style={styles.input}
        value={deposit}
        onChangeText={setDeposit}
        placeholder="e.g. 200"
        keyboardType="decimal-pad"
      />

      <Pressable
        style={[styles.saveBtn, (saving || isWeb) ? styles.saveBtnDisabled : null]}
        disabled={saving || isWeb}
        onPress={onSave}
      >
        <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Booking'}</Text>
      </Pressable>

      <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f7f7' },
  webNote: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12, color: '#555' },

  label: { fontWeight: '900', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 10 },

  dateBtn: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 },
  dateBtnText: { fontWeight: '900', color: '#111827' },

  saveBtn: { backgroundColor: '#111827', padding: 14, borderRadius: 12, marginTop: 18, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontWeight: '900' },

  cancelBtn: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginTop: 10, alignItems: 'center' },
  cancelBtnText: { color: '#111827', fontWeight: '900' },
});
