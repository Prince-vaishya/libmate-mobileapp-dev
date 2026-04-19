import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';

import useAuthStore from '@/store/authStore';
import { updateProfile } from '@/api/users';

function Field({ label, error, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#BDBDBD"
        {...inputProps}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default function EditProfileScreen({ onSuccess }) {
  const { user, token, membership, hasActiveMembership, setAuth } = useAuthStore();

  const [form, setForm] = useState({
    full_name: user?.full_name  || '',
    email:     user?.email      || '',
    phone:     user?.phone      || '',
    address:   user?.address    || '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: null }));
  }

  function validate() {
    const e = {};
    if (!form.full_name.trim())       e.full_name = 'Full name is required';
    if (!form.email.trim())           e.email     = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setLoading(true);
    try {
      await updateProfile({ full_name: form.full_name, phone: form.phone, address: form.address });
      // Update the local store so the UI reflects changes immediately
      setAuth(token, { ...user, ...form }, membership, hasActiveMembership);
      Alert.alert('Profile Updated', 'Your details have been saved.', [
        { text: 'OK', onPress: onSuccess },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Field
          label="FULL NAME"
          placeholder="Jane Doe"
          value={form.full_name}
          onChangeText={(v) => setField('full_name', v)}
          error={errors.full_name}
          returnKeyType="next"
          autoCapitalize="words"
        />
        <Field
          label="EMAIL"
          placeholder="you@example.com"
          value={form.email}
          onChangeText={(v) => setField('email', v)}
          error={errors.email}
          returnKeyType="next"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="PHONE (OPTIONAL)"
          placeholder="+44 7911 000000"
          value={form.phone}
          onChangeText={(v) => setField('phone', v)}
          error={errors.phone}
          returnKeyType="next"
          keyboardType="phone-pad"
        />
        <Field
          label="ADDRESS (OPTIONAL)"
          placeholder="42 University Road, Bristol"
          value={form.address}
          onChangeText={(v) => setField('address', v)}
          error={errors.address}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          autoCapitalize="words"
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Save Changes</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },

  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 0.8, marginBottom: 6 },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
  },
  inputError: { borderWidth: 1.5, borderColor: '#EF4444' },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 4 },

  btn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
});
