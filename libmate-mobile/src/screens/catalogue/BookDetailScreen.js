/**
 * BookDetailScreen
 *
 * Used as a full-screen Modal (not a navigation stack screen).
 * Receives: book (object), onClose (function)
 * Matches wireframe: cover LEFT, info RIGHT, Reserve + Wishlist buttons,
 * Description card, Reviews list, Write a Review button.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MOCK_REVIEWS, MOCK_WISHLIST } from '@/data/mockData';

const PLACEHOLDER = require('../../../assets/icon.png');

function StarRating({ rating }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <MaterialCommunityIcons
          key={s}
          name={s <= Math.round(rating) ? 'star' : 'star-outline'}
          size={14}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

function ReviewRow({ review }) {
  const date = new Date(review.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewAvatar}>
        <Text style={styles.reviewAvatarText}>
          {review.reviewer_name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
          <Text style={styles.reviewDash}>—</Text>
          <StarRating rating={review.rating} />
        </View>
        <Text style={styles.reviewText}>{review.review_text}</Text>
        <Text style={styles.reviewDate}>{date}</Text>
      </View>
    </View>
  );
}

export default function BookDetailScreen({ book, onClose }) {
  const [inWishlist, setInWishlist] = useState(
    MOCK_WISHLIST.some((b) => b.book_id === book.book_id)
  );

  const available = book.available_copies > 0;

  function handleWishlistToggle() {
    setInWishlist((prev) => !prev);
    Alert.alert(
      inWishlist ? 'Removed' : 'Saved',
      inWishlist
        ? `"${book.title}" removed from wishlist.`
        : `"${book.title}" added to your wishlist.`
    );
  }

  function handleReserve() {
    if (!available) {
      Alert.alert('Not available', 'All copies are currently borrowed.');
      return;
    }
    Alert.alert('Reserve Book', `"${book.title}" has been reserved. Collect it at the front desk.`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Book Details</Text>
        <View style={{ width: 38 }} />
      </View>
      <View style={styles.topDivider} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Hero: cover LEFT, info RIGHT ── */}
        <View style={styles.hero}>
          <Image
            source={book.cover_image ? { uri: book.cover_image } : PLACEHOLDER}
            style={styles.cover}
            resizeMode="cover"
          />
          <View style={styles.heroInfo}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.authorYear}>
              {book.author}{book.published_year ? `.${book.published_year}` : ''}
            </Text>
            {book.avg_rating > 0 && <StarRating rating={book.avg_rating} />}
            <View style={styles.copiesRow}>
              <Text style={styles.copiesText}>
                {book.available_copies}/{book.total_copies} copies
              </Text>
              <View style={[styles.availDot, { backgroundColor: available ? '#10B981' : '#EF4444' }]} />
            </View>
          </View>
        </View>
        <View style={styles.heroDivider} />

        {/* ── Reserve | Wishlist ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.reserveBtn, !available && styles.btnDisabled]}
            onPress={handleReserve}
            activeOpacity={0.8}
          >
            <Text style={styles.reserveBtnText}>Reserve Book</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.wishlistBtn, inWishlist && styles.wishlistBtnActive]}
            onPress={handleWishlistToggle}
            activeOpacity={0.8}
          >
            <Text style={[styles.wishlistBtnText, inWishlist && styles.wishlistBtnTextActive]}>
              {inWishlist ? '♥ Saved' : '+ Wishlist'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Description ── */}
        <View style={styles.descCard}>
          <Text style={styles.cardTitle}>Description</Text>
          <View style={styles.descBox}>
            <Text style={styles.descText}>{book.description}</Text>
          </View>
        </View>

        {/* ── Reviews ── */}
        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsTitle}>Reviews</Text>
          {MOCK_REVIEWS.map((r, i) => (
            <View key={r.review_id}>
              <ReviewRow review={r} />
              {i < MOCK_REVIEWS.length - 1 && <View style={styles.reviewDivider} />}
            </View>
          ))}
          {MOCK_REVIEWS.length === 0 && (
            <Text style={styles.noReviews}>No reviews yet.</Text>
          )}
        </View>

        {/* ── Write a Review ── */}
        <TouchableOpacity
          style={styles.writeReviewBtn}
          onPress={() => Alert.alert('Write a Review', 'Review functionality coming soon.')}
          activeOpacity={0.8}
        >
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  backBtn: { padding: 4 },
  topBarTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  topDivider: { height: 1, backgroundColor: '#E5E7EB' },

  content: { paddingBottom: 40 },

  hero: { flexDirection: 'row', padding: 20, gap: 16, backgroundColor: '#F5F5F5' },
  cover: { width: 110, height: 150, borderRadius: 10, backgroundColor: '#D1D5DB', flexShrink: 0 },
  heroInfo: { flex: 1, gap: 6, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: '#111827', lineHeight: 22 },
  authorYear: { fontSize: 13, color: '#9CA3AF' },
  copiesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  copiesText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  availDot: { width: 8, height: 8, borderRadius: 4 },
  heroDivider: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 16 },

  actionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  reserveBtn: {
    flex: 1, backgroundColor: '#E8E8E8', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  reserveBtnText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  wishlistBtn: {
    flex: 1, backgroundColor: '#E8E8E8', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
  },
  wishlistBtnActive: { backgroundColor: '#FEE2E2' },
  wishlistBtnText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  wishlistBtnTextActive: { color: '#EF4444' },

  descCard: {
    backgroundColor: '#EBEBEB', marginHorizontal: 16,
    borderRadius: 12, padding: 16, marginBottom: 20,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  descBox: { backgroundColor: '#D4D4D4', borderRadius: 8, padding: 12 },
  descText: { fontSize: 13, color: '#374151', lineHeight: 20 },

  reviewsSection: { paddingHorizontal: 16, marginBottom: 16 },
  reviewsTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 14 },
  reviewRow: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  reviewAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#C4C4C4',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  reviewAvatarText: { fontWeight: '700', fontSize: 15, color: '#555' },
  reviewerName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  reviewDash: { fontSize: 12, color: '#9CA3AF' },
  reviewText: { fontSize: 13, color: '#374151', lineHeight: 19 },
  reviewDate: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
  reviewDivider: { height: 1, backgroundColor: '#E5E7EB' },
  noReviews: { fontSize: 14, color: '#9CA3AF' },

  writeReviewBtn: {
    backgroundColor: '#E8E8E8', marginHorizontal: 16, borderRadius: 10,
    paddingVertical: 15, alignItems: 'center', marginBottom: 8,
  },
  writeReviewText: { fontSize: 15, fontWeight: '600', color: '#111827' },
});
