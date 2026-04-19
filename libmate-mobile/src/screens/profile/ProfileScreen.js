import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import useAuthStore from '@/store/authStore';
import EditProfileScreen from '@/screens/profile/EditProfileScreen';
import MembershipScreen from '@/screens/profile/MembershipScreen';
import ChangePasswordScreen from '@/screens/auth/ChangePasswordScreen';

const MENU_ITEMS = [
  { key: 'EditProfile',    label: 'Edit Personal Details', icon: 'account-edit-outline' },
  { key: 'ChangePassword', label: 'Change Password',       icon: 'lock-outline' },
  { key: 'Membership',     label: 'My Membership',         icon: 'card-account-details-outline' },
  { key: 'HelpFaq',        label: 'Help & FAQ',            icon: 'help-circle-outline' },
];

// Wrapper so each sub-screen gets a back button inside the modal
function ModalScreen({ title, onClose, children }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={modalStyles.topBar}>
        <TouchableOpacity onPress={onClose} style={modalStyles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={modalStyles.topBarTitle}>{title}</Text>
        <View style={{ width: 38 }} />
      </View>
      <View style={{ height: 1, backgroundColor: '#E5E7EB' }} />
      {children}
    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  topBarTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
});

export default function ProfileScreen() {
  const { user, hasActiveMembership, clearAuth } = useAuthStore();
  const [openModal, setOpenModal] = useState(null); // 'EditProfile' | 'ChangePassword' | 'Membership' | null

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  function handleMenuPress(key) {
    if (key === 'HelpFaq') {
      Alert.alert('Help & FAQ', 'Help content coming soon.');
      return;
    }
    setOpenModal(key);
  }

  function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => clearAuth() },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => setOpenModal('EditProfile')}>
          <Text style={styles.editBtn}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* ── Profile banner ── */}
      <View style={styles.banner}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.full_name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        {hasActiveMembership && (
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>Active member</Text>
          </View>
        )}
      </View>

      {/* ── Menu list ── */}
      <View style={styles.menuCard}>
        {MENU_ITEMS.map((item, idx) => (
          <View key={item.key}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => handleMenuPress(item.key)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBox}>
                <MaterialCommunityIcons name={item.icon} size={22} color="#6B7280" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>&gt;</Text>
            </TouchableOpacity>
            {idx < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
          </View>
        ))}
      </View>

      {/* ── Log out ── */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      {/* ── Sub-screen Modals ── */}
      <Modal visible={openModal === 'EditProfile'} animationType="slide" onRequestClose={() => setOpenModal(null)}>
        <ModalScreen title="Edit Personal Details" onClose={() => setOpenModal(null)}>
          <EditProfileScreen onSuccess={() => setOpenModal(null)} />
        </ModalScreen>
      </Modal>

      <Modal visible={openModal === 'ChangePassword'} animationType="slide" onRequestClose={() => setOpenModal(null)}>
        <ModalScreen title="Change Password" onClose={() => setOpenModal(null)}>
          <ChangePasswordScreen onSuccess={() => setOpenModal(null)} />
        </ModalScreen>
      </Modal>

      <Modal visible={openModal === 'Membership'} animationType="slide" onRequestClose={() => setOpenModal(null)}>
        <ModalScreen title="My Membership" onClose={() => setOpenModal(null)}>
          <MembershipScreen />
        </ModalScreen>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  topBarTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  editBtn: { fontSize: 16, fontWeight: '700', color: '#4F46E5' },

  banner: {
    backgroundColor: '#C4C4C4', alignItems: 'center',
    paddingVertical: 32, paddingHorizontal: 20,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#A0A0A0',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  email: { fontSize: 13, color: '#555', marginBottom: 8 },
  memberBadge: {
    borderRadius: 20, borderWidth: 1.5, borderColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 5,
  },
  memberBadgeText: { fontSize: 12, fontWeight: '600', color: '#111827' },

  menuCard: {
    backgroundColor: '#DCDCDC', borderRadius: 16,
    marginHorizontal: 16, marginTop: 24, paddingHorizontal: 4,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 18,
  },
  menuIconBox: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#C8C8C8',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827' },
  menuChevron: { fontSize: 18, color: '#9CA3AF', fontWeight: '300' },
  menuDivider: { height: 1, backgroundColor: '#C4C4C4', marginHorizontal: 16 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 28, paddingVertical: 14,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
