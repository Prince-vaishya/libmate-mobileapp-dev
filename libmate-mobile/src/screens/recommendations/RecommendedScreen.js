import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MOCK_BOOKS } from '@/data/mockData';
import { getRecommendations } from '@/api/recommendations';
import { getTrending, getNewArrivals } from '@/api/trending';
import BookDetailScreen from '@/screens/catalogue/BookDetailScreen';

const PLACEHOLDER = require('../../../assets/icon.png');

function BookCard({ book, onPress }) {
  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={book.cover_image ? { uri: book.cover_image } : PLACEHOLDER}
        style={cardStyles.cover}
        resizeMode="cover"
      />
      <View style={cardStyles.info}>
        <Text style={cardStyles.title} numberOfLines={2}>{book.title}</Text>
        <Text style={cardStyles.author} numberOfLines={1}>{book.author}</Text>
      </View>
    </TouchableOpacity>
  );
}

function NewArrivalRow({ book, onPress }) {
  return (
    <TouchableOpacity style={rowStyles.row} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={book.cover_image ? { uri: book.cover_image } : PLACEHOLDER}
        style={rowStyles.thumb}
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text style={rowStyles.title} numberOfLines={2}>{book.title}</Text>
        <Text style={rowStyles.author} numberOfLines={1}>{book.author}</Text>
        <Text style={rowStyles.genre}>{book.genre}</Text>
      </View>
      <View style={rowStyles.newBadge}>
        <Text style={rowStyles.newText}>New</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function RecommendedScreen({ onClose }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending]               = useState([]);
  const [newArrivals, setNewArrivals]         = useState([]);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const [recRes, trendRes, arrRes] = await Promise.allSettled([
        getRecommendations(10),
        getTrending(6),
        getNewArrivals(6),
      ]);

      const pick = (res, fallback) => {
        if (res.status !== 'fulfilled') return fallback;
        const d = res.value.data;
        const arr = d?.books || (Array.isArray(d) ? d : []);
        return arr.length > 0 ? arr : fallback;
      };

      setRecommendations(pick(recRes,  MOCK_BOOKS.slice(0, 6)));
      setTrending(       pick(trendRes, MOCK_BOOKS.slice(3, 9)));
      setNewArrivals(    pick(arrRes,  MOCK_BOOKS.slice(6, 12)));
      setLoading(false);
    }
    fetchAll();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Recommended for You</Text>
        <View style={{ width: 38 }} />
      </View>
      <View style={styles.divider} />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── AI banner ── */}
          <View style={styles.aiBanner}>
            <MaterialCommunityIcons name="robot-outline" size={28} color="#4F46E5" />
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>AI-Powered Picks</Text>
              <Text style={styles.aiSub}>Based on your borrow history and ratings</Text>
            </View>
          </View>

          {/* ── Recommended ── */}
          {recommendations.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <FlatList
                horizontal
                data={recommendations}
                keyExtractor={(b) => String(b.book_id)}
                renderItem={({ item }) => <BookCard book={item} onPress={() => setSelectedBook(item)} />}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hList}
              />
            </>
          )}

          {/* ── Trending ── */}
          {trending.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Trending This Month</Text>
              <FlatList
                horizontal
                data={trending}
                keyExtractor={(b) => String(b.book_id)}
                renderItem={({ item }) => <BookCard book={item} onPress={() => setSelectedBook(item)} />}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hList}
              />
            </>
          )}

          {/* ── New Arrivals ── */}
          {newArrivals.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
              <View style={styles.newArrivalsCard}>
                {newArrivals.map((book, idx) => (
                  <View key={book.book_id}>
                    <NewArrivalRow book={book} onPress={() => setSelectedBook(book)} />
                    {idx < newArrivals.length - 1 && <View style={rowStyles.divider} />}
                  </View>
                ))}
              </View>
            </>
          )}

        </ScrollView>
      )}

      <Modal
        visible={selectedBook !== null}
        animationType="slide"
        onRequestClose={() => setSelectedBook(null)}
      >
        {selectedBook && (
          <BookDetailScreen book={selectedBook} onClose={() => setSelectedBook(null)} />
        )}
      </Modal>
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
  topBarTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  divider: { height: 1, backgroundColor: '#E5E7EB' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  scroll: { padding: 16, paddingBottom: 40 },

  aiBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#EEF2FF', borderRadius: 14,
    padding: 16, marginBottom: 24,
  },
  aiTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  aiSub:   { fontSize: 13, color: '#6B7280' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 8 },

  hList: { paddingRight: 16, paddingBottom: 16 },

  newArrivalsCard: { backgroundColor: '#E8E8E8', borderRadius: 14, overflow: 'hidden' },
});

const cardStyles = StyleSheet.create({
  card: { width: 140, marginRight: 12, backgroundColor: '#E8E8E8', borderRadius: 12, overflow: 'hidden' },
  cover: { width: '100%', height: 160, backgroundColor: '#C4C4C4' },
  info:  { padding: 10 },
  title: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
  author:{ fontSize: 11, color: '#6B7280' },
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  thumb: { width: 52, height: 70, borderRadius: 8, backgroundColor: '#C4C4C4', flexShrink: 0 },
  title: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  author:{ fontSize: 12, color: '#6B7280', marginBottom: 2 },
  genre: { fontSize: 11, color: '#9CA3AF' },
  newBadge: { backgroundColor: '#4F46E5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexShrink: 0 },
  newText:  { fontSize: 11, fontWeight: '700', color: '#fff' },
  divider:  { height: 1, backgroundColor: '#D5D5D5', marginHorizontal: 14 },
});
