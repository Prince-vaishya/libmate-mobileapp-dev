/**
 * AppNavigator
 *
 * CRASH-SAFE ARCHITECTURE (Android New Architecture / Fabric):
 *
 *   • Logged IN  → NavigationContainer → Tab.Navigator (pure JS, safe)
 *   • Logged OUT → <LoginScreen /> directly (no Navigator at all)
 *
 * WHY NO AuthStack:
 *   createNativeStackNavigator renders NativeStackView, a native Android
 *   component that crashes on New Architecture with:
 *   "java.lang.String cannot be cast to java.lang.Boolean"
 *
 *   LoginScreen already contains both Login and Register as internal tabs,
 *   so no stack navigator is needed for the auth flow.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, Image, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import useAuthStore from '@/store/authStore';

import LoginScreen    from '@/screens/auth/LoginScreen';
import HomeScreen     from '@/screens/home/HomeScreen';
import CatalogueScreen from '@/screens/catalogue/CatalogueScreen';
import MyBooksScreen  from '@/screens/borrowings/MyBooksScreen';
import WishlistScreen from '@/screens/wishlist/WishlistScreen';
import ProfileScreen  from '@/screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const LOGO = require('../../assets/icon.png');

const TAB_ICONS = {
  Home:      'home-outline',
  Catalogue: 'book-open-variant',
  MyBooks:   'bookmark-multiple-outline',
  Wishlist:  'heart-outline',
  Profile:   'account-outline',
};

// ── Splash screen (shown while checking stored token) ────────────
function SplashView() {
  return (
    <View style={splashStyles.container}>
      <Image source={LOGO} style={splashStyles.logo} resizeMode="contain" />
      <Text style={splashStyles.title}>LibMate</Text>
      <Text style={splashStyles.sub}>Smart Library Management System</Text>
      <Text style={splashStyles.sub}>BSc (Hons) Artificial Intelligence</Text>
      <ActivityIndicator size="small" color="#4F46E5" style={{ marginTop: 24 }} />
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F5F5F5', paddingHorizontal: 40,
  },
  logo:  { width: 88, height: 88, borderRadius: 20, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 8 },
  sub:   { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});

// ── Main tab navigator (shown when logged in) ─────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 6,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 82 : 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={TAB_ICONS[route.name] || 'circle-outline'}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home"      component={HomeScreen}      options={{ title: 'Home' }} />
      <Tab.Screen name="Catalogue" component={CatalogueScreen} options={{ title: 'Catalogue' }} />
      <Tab.Screen name="MyBooks"   component={MyBooksScreen}   options={{ title: 'My Books' }} />
      <Tab.Screen name="Wishlist"  component={WishlistScreen}  options={{ title: 'Wishlist' }} />
      <Tab.Screen name="Profile"   component={ProfileScreen}   options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ── Root navigator ────────────────────────────────────────────────
export default function AppNavigator() {
  const { token, isLoading } = useAuthStore();

  // Still checking SecureStore / running bootstrap
  if (isLoading) return <SplashView />;

  // Not logged in: render LoginScreen directly — no native stack, no crash
  if (!token) return <LoginScreen />;

  // Logged in: wrap Tab.Navigator in NavigationContainer
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}
