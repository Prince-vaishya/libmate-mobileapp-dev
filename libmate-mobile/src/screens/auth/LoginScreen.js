/**
 * LoginScreen
 *
 * Matches wireframe: logo → title → card with Login/Register tab switcher.
 * Login tab:    EMAIL, PASSWORD, Forget Password?, LOGIN button, OR, Login with biometrics
 * Register tab: Full Name, Email, Phone, Password, Confirm Password, CREATE ACCOUNT button
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { login, register } from '@/api/auth';
import { getErrorMessage } from '@/api/client';
import useAuthStore from '@/store/authStore';

const LOGO = require('../../../assets/icon.png');

// ── Reusable labelled input ────────────────────────────────────
function Field({ label, error, ...inputProps }) {
  const [secure, setSecure] = useState(inputProps.secureTextEntry || false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholderTextColor="#BDBDBD"
          {...inputProps}
          secureTextEntry={secure}
        />
        {inputProps.secureTextEntry && (
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setSecure((s) => !s)}>
            <MaterialCommunityIcons
              name={secure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ── LOGIN TAB ──────────────────────────────────────────────────
function LoginForm() {
  const { setAuth } = useAuthStore();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const passwordRef             = useRef(null);

  function validate() {
    const e = {};
    if (!email.trim())  e.email    = 'Email is required';
    if (!password)      e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await login(email.trim().toLowerCase(), password);
      await SecureStore.setItemAsync('auth_token', data.token);
      setAuth(data.token, data.user, data.membership, data.has_active_membership);
    } catch (err) {
      Alert.alert('Login failed', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Field
        label="EMAIL"
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="next"
        value={email}
        onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: null })); }}
        onSubmitEditing={() => passwordRef.current?.focus()}
        error={errors.email}
      />
      <Field
        label="PASSWORD"
        placeholder="••••••••"
        secureTextEntry
        returnKeyType="done"
        ref={passwordRef}
        value={password}
        onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: null })); }}
        onSubmitEditing={handleLogin}
        error={errors.password}
      />

      {/* Forgot password */}
      <TouchableOpacity
        style={styles.forgotWrap}
        onPress={() => Alert.alert('Forgot Password', 'Please contact the library to reset your password.')}
      >
        <Text style={styles.forgotText}>Forget Password?</Text>
      </TouchableOpacity>

      {/* LOGIN button */}
      <TouchableOpacity
        style={[styles.primaryBtn, loading && styles.btnDisabled]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.primaryBtnText}>LOGIN</Text>
        }
      </TouchableOpacity>

      {/* OR divider */}
      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.orLine} />
      </View>

      {/* Biometrics button */}
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => Alert.alert('Biometrics', 'Biometric login coming soon.')}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="fingerprint" size={20} color="#374151" style={{ marginRight: 8 }} />
        <Text style={styles.secondaryBtnText}>Login with biometrics</Text>
      </TouchableOpacity>
    </>
  );
}

// ── REGISTER TAB ───────────────────────────────────────────────
function RegisterForm() {
  const { setAuth } = useAuthStore();
  const [form, setForm]     = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: null }));
  }

  function validate() {
    const e = {};
    if (!form.full_name.trim())                              e.full_name         = 'Full name is required';
    if (!form.email.trim())                                  e.email             = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))              e.email             = 'Invalid email address';
    if (!form.password)                                      e.password          = 'Password is required';
    else if (form.password.length < 6)                       e.password          = 'At least 6 characters';
    if (form.password !== form.confirm_password)             e.confirm_password  = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await register({
        full_name: form.full_name.trim(),
        email:     form.email.trim().toLowerCase(),
        password:  form.password,
        phone:     form.phone.trim() || undefined,
      });
      await SecureStore.setItemAsync('auth_token', data.token);
      setAuth(data.token, data.user, data.membership, data.has_active_membership);
    } catch (err) {
      Alert.alert('Registration failed', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Field label="FULL NAME"        placeholder="Jane Doe"           value={form.full_name}        onChangeText={(v) => setField('full_name', v)}        error={errors.full_name}        returnKeyType="next" />
      <Field label="EMAIL"            placeholder="you@example.com"    value={form.email}            onChangeText={(v) => setField('email', v)}            error={errors.email}            returnKeyType="next" autoCapitalize="none" keyboardType="email-address" />
      <Field label="PHONE (OPTIONAL)" placeholder="+44 7911 000000"    value={form.phone}            onChangeText={(v) => setField('phone', v)}            error={errors.phone}            returnKeyType="next" keyboardType="phone-pad" />
      <Field label="PASSWORD"         placeholder="••••••••"           value={form.password}         onChangeText={(v) => setField('password', v)}         error={errors.password}         secureTextEntry returnKeyType="next" />
      <Field label="CONFIRM PASSWORD" placeholder="••••••••"           value={form.confirm_password} onChangeText={(v) => setField('confirm_password', v)} error={errors.confirm_password} secureTextEntry returnKeyType="done" onSubmitEditing={handleRegister} />

      <TouchableOpacity
        style={[styles.primaryBtn, loading && styles.btnDisabled]}
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.primaryBtnText}>CREATE ACCOUNT</Text>
        }
      </TouchableOpacity>
    </>
  );
}

// ── MAIN SCREEN ────────────────────────────────────────────────
export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState('Login'); // 'Login' | 'Register'

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo ── */}
          <View style={styles.logoWrap}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </View>

          {/* ── Title ── */}
          <Text style={styles.title}>Welcome to Libmate</Text>
          <Text style={styles.subtitle}>Sign in to access the library</Text>

          {/* ── Card ── */}
          <View style={styles.card}>

            {/* Tab switcher */}
            <View style={styles.tabRow}>
              {['Login', 'Register'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={styles.tabBtn}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab}
                  </Text>
                  {activeTab === tab && <View style={styles.tabUnderline} />}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.tabDivider} />

            {/* Form */}
            <View style={styles.form}>
              {activeTab === 'Login' ? <LoginForm /> : <RegisterForm />}
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F2F2F2' },
  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 },

  // Logo
  logoWrap: { alignItems: 'center', marginBottom: 20 },
  logo:     { width: 80, height: 80, borderRadius: 16 },

  // Title
  title:    { fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 28 },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },

  // Tabs
  tabRow:       { flexDirection: 'row' },
  tabBtn:       { flex: 1, alignItems: 'center', paddingVertical: 16, position: 'relative' },
  tabText:      { fontSize: 15, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive:{ color: '#111827' },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: 20, right: 20,
    height: 2, backgroundColor: '#111827', borderRadius: 1,
  },
  tabDivider: { height: 1, backgroundColor: '#E5E7EB' },

  form: { padding: 20 },

  // Field
  field:      { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 0.8, marginBottom: 6 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
  },
  inputError: { borderWidth: 1.5, borderColor: '#EF4444' },
  eyeBtn:     { position: 'absolute', right: 12 },
  errorText:  { fontSize: 12, color: '#EF4444', marginTop: 4 },

  // Forgot
  forgotWrap: { alignItems: 'flex-end', marginBottom: 16, marginTop: -4 },
  forgotText: { fontSize: 13, color: '#6B7280' },

  // Buttons
  primaryBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled:     { opacity: 0.6 },
  primaryBtnText:  { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },

  orRow:  { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  orLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  orText: { fontSize: 13, color: '#9CA3AF', marginHorizontal: 12 },

  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
});
