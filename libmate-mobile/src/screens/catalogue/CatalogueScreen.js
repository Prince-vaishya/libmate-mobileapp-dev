import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MOCK_BOOKS, MOCK_GENRES } from '@/data/mockData';
import { getBooks, getGenres } from '@/api/books';
import BookDetailScreen from '@/screens/catalogue/BookDetailScreen';

const PLACEHOLDER = require('../../../assets/icon.png');
const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

function BookGridCard({ book, onPress }) {
  const available = book.available_copies > 0;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={book.cover_image ? { uri: book.cover_image } : PLACEHOLDER}
        style={styles.cardCover}
        resizeMode="cover"
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.cardAuthor} numberOfLines={1}>{book.author}</Text>
        <View style={[styles.availBadge, { backgroundColor: available ? '#D1FAE5' : '#FEE2E2' }]}>
          <Text style={[styles.availText, { color: available ? '#065F46' : '#991B1B' }]}>
            {available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CatalogueScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks]   = useState(MOCK_BOOKS);
  const [genres, setGenres] = useState(MOCK_GENRES);

  useEffect(() => {
    async function fetchCatalogue() {
      const [booksRes, genresRes] = await Promise.allSettled([
        getBooks({ per_page: 100 }),
        getGenres(),
      ]);
      if (booksRes.status === 'fulfilled') {
        const d = booksRes.value.data;
        setBooks(d?.books || (Array.isArray(d) ? d : MOCK_BOOKS));
      }
      if (genresRes.status === 'fulfilled') {
        const d = genresRes.value.data;
        setGenres(['All', ...(Array.isArray(d) ? d : MOCK_GENRES.slice(1))]);
      }
    }
    fetchCatalogue();
  }, []);

  const filteredBooks = useMemo(() => {
    let result = books;
    if (selectedGenre !== 'All') {
      result = result.filter((b) => b.genre === selectedGenre);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.isbn && b.isbn.includes(q)) ||
          (b.genre && b.genre.toLowerCase().includes(q))
      );
    }
    return result;
  }, [books, searchQuery, selectedGenre]);

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Books</Text>
      </View>

      {/* ── Search bar ── */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Title, author, ISBN or genre..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      <View style={styles.divider} />

      {/* ── Genre chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {MOCK_GENRES.map((genre) => {
          const isActive = genre === selectedGenre;
          return (
            <TouchableOpacity
              key={genre}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setSelectedGenre(genre)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {genre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.divider} />

      {/* ── 2-column book grid ── */}
      <FlatList
        key="grid-2col"
        data={filteredBooks}
        keyExtractor={(item) => String(item.book_id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <BookGridCard book={item} onPress={() => setSelectedBook(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="book-search" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No books found</Text>
            <Text style={styles.emptySub}>Try a different search or genre</Text>
          </View>
        }
      />

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

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },

  searchRow: {
    marginHorizontal: 16,
    backgroundColor: '#EBEBEB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: { fontSize: 15, color: '#111827' },

  divider: { height: 1, backgroundColor: '#D1D5DB' },

  chipsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#DEDEDE' },
  chipActive: { backgroundColor: '#4F46E5' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: '#fff' },

  grid: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  row: { justifyContent: 'space-between', marginBottom: 12 },

  card: { width: CARD_WIDTH, backgroundColor: '#E8E8E8', borderRadius: 14, overflow: 'hidden' },
  cardCover: { width: '100%', height: 155, backgroundColor: '#C4C4C4' },
  cardInfo: { padding: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  cardAuthor: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  availBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  availText: { fontSize: 11, fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#9CA3AF', marginTop: 6 },
});
