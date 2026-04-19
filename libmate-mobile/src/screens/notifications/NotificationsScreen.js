import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MOCK_NOTIFICATIONS } from '@/data/mockData';

// Icon per notification type
const TYPE_ICONS = {
  reservation: 'bookmark-check-outline',
  overdue:     'alert-circle-outline',
  renewal:     'refresh',
  membership:  'card-account-details-outline',
};

export default function NotificationsScreen({ onClose }) {
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = items.filter((n) => !n.is_read).length;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  function markRead(id) {
    setItems((prev) => prev.map((n) => n.notification_id === id ? { ...n, is_read: true } : n));
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.readAll}>Read all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />

      {unreadCount > 0 && (
        <Text style={styles.unreadHint}>{unreadCount} unread</Text>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="bell-off-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySub}>You're all caught up.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {items.map((item, idx) => (
              <View key={item.notification_id}>
                <TouchableOpacity
                  style={styles.notifRow}
                  onPress={() => markRead(item.notification_id)}
                  activeOpacity={0.7}
                >
                  {/* Unread dot */}
                  <View style={styles.dotWrap}>
                    <View style={[styles.dot, item.is_read && styles.dotRead]} />
                  </View>

                  {/* Message + time */}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.message, item.is_read && styles.messageRead]}>
                      {item.message}
                    </Text>
                    <Text style={styles.timestamp}>{item.timestamp}</Text>
                  </View>
                </TouchableOpacity>

                {idx < items.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  readAll: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },
  divider: { height: 1, backgroundColor: '#E5E7EB' },

  unreadHint: {
    fontSize: 12, color: '#6B7280', fontWeight: '600',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4,
  },

  scroll: { padding: 16, paddingBottom: 32 },

  card: {
    backgroundColor: '#E8E8E8',
    borderRadius: 16,
    overflow: 'hidden',
  },

  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  dotWrap: { paddingTop: 5 },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#4F46E5',
  },
  dotRead: { backgroundColor: '#D1D5DB' },

  message: {
    fontSize: 14, fontWeight: '600', color: '#111827',
    lineHeight: 20, marginBottom: 4,
  },
  messageRead: { fontWeight: '400', color: '#374151' },

  timestamp: { fontSize: 12, color: '#9CA3AF' },

  rowDivider: { height: 1, backgroundColor: '#D5D5D5', marginHorizontal: 16 },

  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#374151', marginTop: 8 },
  emptySub: { fontSize: 14, color: '#9CA3AF' },
});
