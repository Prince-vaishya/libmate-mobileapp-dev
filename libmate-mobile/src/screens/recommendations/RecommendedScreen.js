import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MOCK_BOOKS, MOCK_ACTIVE_BORROWINGS } from '@/data/mockData';
import BookDetailScreen from '@/screens/catalogue/BookDetailScreen';

const PLACEHOLDER = require('../../../assets/icon.png');

// ── Horizontal book card (portrait) ────────────────────────────
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

// ── New arrival row (list-style) ────────────────────────────────
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

  // Use the currently-borrowed book for personalised section heading
  const basedOnTitle = MOCK_ACTIVE_BORROWINGS[0]?.title || 'Your reading history';

  // Derive recommendation groups from MOCK_BOOKS
  const similarBooks  = MOCK_BOOKS.filter((b) => b.genre === 'Technology').slice(0, 3);
  const trendingBooks = MOCK_BOOKS.slice(3, 6);
  const newArrivals   = MOCK_BOOKS.slice(6, 10);

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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── AI-Powered Picks banner ── */}
        <View style={styles.aiBanner}>
          <MaterialCommunityIcons name="robot-outline" size={28} color="#4F46E5" />
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>AI-Powered Picks</Text>
            <Text style={styles.aiSub}>Based on your borrow history and ratings</Text>
          </View>
        </View>

        {/* ── Based on current borrow ── */}
        <Text style={styles.sectionTitle}>Based on "{basedOnTitle}"</Text>
        <FlatList
          horizontal
          data={similarBooks}
          keyExtractor={(b) => String(b.book_id)}
          renderItem={({ item }) => (
            <BookCard book={item} onPress={() => setSelectedBook(item)} />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
        />

        {/* ── Trending this month ── */}
        <Text style={styles.sectionTitle}>Trending This Month</Text>
        <FlatList
          horizontal
          data={trendingBooks}
          keyExtractor={(b) => String(b.book_id)}
          renderItem={({ item }) => (
            <BookCard book={item} onPress={() => setSelectedBook(item)} />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
        />

        {/* ── New Arrivals (list) ── */}
        <Text style={styles.sectionTitle}>New Arrivals</Text>
        <View style={styles.newArrivalsCard}>
          {newArrivals.map((book, idx) => (
            <View key={book.book_id}>
              <NewArrivalRow book={book} onPress={() => setSelectedBook(book)} />
              {idx < newArrivals.length - 1 && <View style={rowStyles.divider} />}
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ── Book Detail Modal ── */}
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

  scroll: { padding: 16, paddingBottom: 40 },

  aiBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#EEF2FF', borderRadius: 14,
    padding: 16, marginBottom: 24,
  },
  aiTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  aiSub:   { fontSize: 13, color: '#6B7280' },

  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: '#111827',
    marginBottom: 12, marginTop: 8,
  },

  hList: { paddingRight: 16, paddingBottom: 16 },

  newArrivalsCard: {
    backgroundColor: '#E8E8E8', borderRadius: 14, overflow: 'hidden',
  },
});

const cardStyles = StyleSheet.create({
  card: {
    width: 140, marginRight: 12,
    backgroundColor: '#E8E8E8', borderRadius: 12, overflow: 'hidden',
  },
  cover: { width: '100%', height: 160, backgroundColor: '#C4C4C4' },
  info:  { padding: 10 },
  title: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
  author:{ fontSize: 11, color: '#6B7280' },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  thumb: { width: 52, height: 70, borderRadius: 8, backgroundColor: '#C4C4C4', flexShrink: 0 },
  title: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  author:{ fontSize: 12, color: '#6B7280', marginBottom: 2 },
  genre: { fontSize: 11, color: '#9CA3AF' },
  newBadge: {
    backgroundColor: '#4F46E5', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, flexShrink: 0,
  },
  newText:  { fontSize: 11, fontWeight: '700', color: '#fff' },
  divider:  { height: 1, backgroundColor: '#D5D5D5', marginHorizontal: 14 },
});
