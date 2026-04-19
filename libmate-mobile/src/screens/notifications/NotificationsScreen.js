import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MOCK_NOTIFICATIONS } from '@/data/mockData';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/api/users';

function formatTimestamp(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen({ onClose }) {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await getNotifications();
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else {
          setItems(MOCK_NOTIFICATIONS);
        }
      } catch {
        setItems(MOCK_NOTIFICATIONS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  async function handleMarkAllRead() {
    try { await markAllNotificationsRead(); } catch { /* ignore */ }
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function handleMarkRead(id) {
    try { await markNotificationRead(id); } catch { /* ignore */ }
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
        <TouchableOpacity onPress={handleMarkAllRead} disabled={unreadCount === 0}>
          <Text style={[styles.readAll, unreadCount === 0 && { color: '#D1D5DB' }]}>Read all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <>
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
                {items.map((item, idx) => {
                  const timestamp = item.timestamp || formatTimestamp(item.created_at);
                  return (
                    <View key={item.notification_id}>
                      <TouchableOpacity
                        style={styles.notifRow}
                        onPress={() => handleMarkRead(item.notification_id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.dotWrap}>
                          <View style={[styles.dot, item.is_read && styles.dotRead]} />
                        </View>
                        <View style={{ flex: 1 }}>
                          {item.title && (
                            <Text style={[styles.notifTitle, item.is_read && styles.notifTitleRead]}>
                              {item.title}
                            </Text>
                          )}
                          <Text style={[styles.message, item.is_read && styles.messageRead]}>
                            {item.message}
                          </Text>
                          <Text style={styles.timestamp}>{timestamp}</Text>
                        </View>
                      </TouchableOpacity>
                      {idx < items.length - 1 && <View style={styles.rowDivider} />}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </>
      )}
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
  title:   { fontSize: 18, fontWeight: '800', color: '#111827' },
  readAll: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },
  divider: { height: 1, backgroundColor: '#E5E7EB' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  unreadHint: {
    fontSize: 12, color: '#6B7280', fontWeight: '600',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4,
  },

  scroll: { padding: 16, paddingBottom: 32 },

  card: { backgroundColor: '#E8E8E8', borderRadius: 16, overflow: 'hidden' },

  notifRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  dotWrap: { paddingTop: 5 },
  dot:     { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4F46E5' },
  dotRead: { backgroundColor: '#D1D5DB' },

  notifTitle:     { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
  notifTitleRead: { fontWeight: '600', color: '#374151' },
  message:        { fontSize: 13, fontWeight: '500', color: '#374151', lineHeight: 19, marginBottom: 4 },
  messageRead:    { color: '#6B7280' },
  timestamp:      { fontSize: 11, color: '#9CA3AF' },

  rowDivider: { height: 1, backgroundColor: '#D5D5D5', marginHorizontal: 16 },

  empty:      { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#374151', marginTop: 8 },
  emptySub:   { fontSize: 14, color: '#9CA3AF' },
});
