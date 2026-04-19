import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import useAuthStore from './src/store/authStore';
import { MOCK_USER, MOCK_MEMBERSHIP } from './src/data/mockData';

// ─────────────────────────────────────────────────────────────────
// MOCK_MODE: true  → skips login, uses mock data (no backend needed)
//            false → real backend; set your IP in src/api/client.js
// ─────────────────────────────────────────────────────────────────
const MOCK_MODE = false;

export default function App() {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    async function bootstrap() {
      if (MOCK_MODE) {
        setAuth('mock-token', MOCK_USER, MOCK_MEMBERSHIP, true);
        setLoading(false);
        return;
      }
      try {
        const SecureStore = await import('expo-secure-store');
        const { getMe } = await import('./src/api/auth');
        const token = await SecureStore.default.getItemAsync('auth_token');
        if (token) {
          const { data } = await getMe();
          setAuth(token, data.user, data.membership, data.has_active_membership);
        }
      } catch {
        await clearAuth();
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
