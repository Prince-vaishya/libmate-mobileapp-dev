import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import useAuthStore from '@/store/authStore';
import { getTrending, getNewArrivals } from '@/api/trending';
import { getRecommendations, hasRecommendations } from '@/api/recommendations';
import BookCard from '@/components/BookCard';
import { HorizontalSkeletonCard } from '@/components/SkeletonCard';
import BookDetailScreen from '@/screens/catalogue/BookDetailScreen';
import NotificationsScreen from '@/screens/notifications/NotificationsScreen';
import RecommendedScreen from '@/screens/recommendations/RecommendedScreen';
import { MOCK_BOOKS, MOCK_NOTIFICATIONS } from '@/data/mockData';

function SectionHeader({ title, onSeeAll }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function HorizontalBookList({ books, loading, onPress }) {
  if (loading) {
    return (
      <FlatList
        horizontal
        data={[1, 2, 3, 4]}
        keyExtractor={(i) => String(i)}
        renderItem={() => <HorizontalSkeletonCard />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
      />
    );
  }
  if (!books.length) return null;
  return (
    <FlatList
      horizontal
      data={books}
      keyExtractor={(b) => String(b.book_id)}
      renderItem={({ item }) => (
        <BookCard book={item} horizontal onPress={() => onPress(item)} />
      )}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.hList}
    />
  );
}

function MembershipPill({ hasActiveMembership, membership }) {
  if (hasActiveMembership && membership?.card_number) {
    return (
      <View style={[styles.pill, styles.pillActive]}>
        <MaterialCommunityIcons name="card-account-details" size={13} color="#fff" />
        <Text style={styles.pillText}>Member · {membership.card_number}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.pill, styles.pillGuest]}>
      <MaterialCommunityIcons name="account-outline" size={13} color="#6B7280" />
      <Text style={[styles.pillText, { color: '#6B7280' }]}>Guest account</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user, membership, hasActiveMembership } = useAuthStore();
  const [selectedBook, setSelectedBook] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length;

  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState({ trending: true, arrivals: true, recs: true });
  const [refreshing, setRefreshing] = useState(false);

  async function fetchAll() {
    const results = await Promise.allSettled([
      getTrending(10),
      getNewArrivals(6),
      hasRecommendations().then((r) =>
        r.data?.has_recommendations ? getRecommendations(10) : Promise.resolve({ data: [] })
      ),
    ]);

    setTrending(
      results[0].status === 'fulfilled'
        ? (results[0].value.data?.books || results[0].value.data || [])
        : MOCK_BOOKS.slice(0, 8)
    );
    setNewArrivals(
      results[1].status === 'fulfilled'
        ? (results[1].value.data?.books || results[1].value.data || [])
        : MOCK_BOOKS.slice(4, 10)
    );
    setRecommendations(
      results[2].status === 'fulfilled'
        ? (results[2].value.data?.books || results[2].value.data || [])
        : MOCK_BOOKS.slice(2, 8)
    );
    setLoading({ trending: false, arrivals: false, recs: false });
  }

  useEffect(() => { fetchAll(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Reader';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Welcome banner ── */}
        <View style={styles.banner}>
          <View>
            <Text style={styles.welcome}>Good morning,</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          <View style={styles.bannerRight}>
            <TouchableOpacity style={styles.bellBtn} onPress={() => setShowNotifications(true)}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#111827" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <MembershipPill hasActiveMembership={hasActiveMembership} membership={membership} />
          </View>
        </View>

        {/* ── Search bar (decorative — tapping switches to Catalogue tab) ── */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={18} color="#9CA3AF" />
          <Text style={styles.searchPlaceholder}>Search books, authors, ISBN…</Text>
        </View>

        {/* ── Trending ── */}
        <SectionHeader title="Trending Now" onSeeAll={() => {}} />
        <HorizontalBookList books={trending} loading={loading.trending} onPress={setSelectedBook} />

        {/* ── New Arrivals ── */}
        <SectionHeader title="New Arrivals" onSeeAll={() => {}} />
        <HorizontalBookList books={newArrivals} loading={loading.arrivals} onPress={setSelectedBook} />

        {/* ── Recommended ── */}
        {(loading.recs || recommendations.length > 0) && (
          <>
            <SectionHeader title="Recommended for You" onSeeAll={() => setShowRecommended(true)} />
            <HorizontalBookList books={recommendations} loading={loading.recs} onPress={setSelectedBook} />
          </>
        )}
      </ScrollView>

      {/* ── Book Detail Modal ── */}
      <Modal
        visible={selectedBook !== null}
        animationType="slide"
        onRequestClose={() => setSelectedBook(null)}
      >
        {selectedBook && (
          <BookDetailScreen
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
          />
        )}
      </Modal>

      {/* ── Notifications Modal ── */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <NotificationsScreen onClose={() => setShowNotifications(false)} />
      </Modal>

      {/* ── Recommended Screen Modal ── */}
      <Modal
        visible={showRecommended}
        animationType="slide"
        onRequestClose={() => setShowRecommended(false)}
      >
        <RecommendedScreen onClose={() => setShowRecommended(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { flex: 1 },
  content: { paddingBottom: 32 },

  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  welcome: { fontSize: 14, color: '#6B7280' },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },

  bannerRight: { alignItems: 'flex-end', gap: 8 },
  bellBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#EF4444', borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  pillActive: { backgroundColor: '#4F46E5' },
  pillGuest: { backgroundColor: '#F3F4F6' },
  pillText: { fontSize: 11, fontWeight: '600', color: '#fff' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EBEBEB',
    marginHorizontal: 20,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  searchPlaceholder: { fontSize: 14, color: '#9CA3AF' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 13, color: '#4F46E5', fontWeight: '600' },

  hList: { paddingHorizontal: 20 },
});
