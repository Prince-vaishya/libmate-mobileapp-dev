import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getBook, addReview } from '@/api/books';
import { addToWishlist, removeFromWishlist, createReservation } from '@/api/users';
import useWishlistStore from '@/store/wishlistStore';

const PLACEHOLDER = require('../../../assets/icon.png');

function StarRating({ rating, size = 14 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <MaterialCommunityIcons
          key={s}
          name={s <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

function StarPicker({ rating, onSelect }) {
  return (
    <View style={reviewModal.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity key={s} onPress={() => onSelect(s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons
            name={s <= rating ? 'star' : 'star-outline'}
            size={36}
            color="#F59E0B"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ReviewRow({ review }) {
  const name = review.full_name || review.reviewer_name || 'Reader';
  const date = new Date(review.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewAvatar}>
        <Text style={styles.reviewAvatarText}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <Text style={styles.reviewerName}>{name}</Text>
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
  const { isInWishlist, addBook, removeBook } = useWishlistStore();
  const [inWishlist, setInWishlist]           = useState(() => isInWishlist(book.book_id));
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviews, setReviews]                 = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating]       = useState(5);
  const [reviewText, setReviewText]           = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const available = book.available_copies > 0;

  useEffect(() => {
    async function loadDetails() {
      try {
        const { data } = await getBook(book.book_id);
        if (Array.isArray(data.reviews)) setReviews(data.reviews);
      } catch { /* keep empty */ }
    }
    loadDetails();
  }, [book.book_id]);

  async function handleWishlistToggle() {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(book.book_id);
        setInWishlist(false);
        removeBook(book.book_id);          // update global store instantly
      } else {
        await addToWishlist(book.book_id);
        setInWishlist(true);
        addBook(book.book_id);             // update global store instantly
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Could not update wishlist.');
    } finally {
      setWishlistLoading(false);
    }
  }

  async function handleReserve() {
    if (!available) {
      Alert.alert('Not Available', 'All copies are currently borrowed.');
      return;
    }
    try {
      await createReservation(book.book_id);
      Alert.alert('Reserved!', `"${book.title}" is reserved for you. Collect it at the front desk within 48 hours.`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not reserve book.';
      Alert.alert('Reservation Failed', msg);
    }
  }

  async function handleSubmitReview() {
    if (!reviewText.trim()) {
      Alert.alert('Missing Review', 'Please write something before submitting.');
      return;
    }
    setReviewSubmitting(true);
    try {
      await addReview(book.book_id, { rating: reviewRating, review_text: reviewText.trim() });
      setShowReviewModal(false);
      setReviewText('');
      setReviewRating(5);
      Alert.alert('Review Submitted', 'Thank you for your feedback!');
      // Reload reviews
      const { data } = await getBook(book.book_id);
      if (Array.isArray(data.reviews)) setReviews(data.reviews);
    } catch (err) {
      Alert.alert('Cannot Submit', err.response?.data?.error || 'Something went wrong.');
    } finally {
      setReviewSubmitting(false);
    }
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

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Image
            source={book.cover_image ? { uri: book.cover_image } : PLACEHOLDER}
            style={styles.cover}
            resizeMode="cover"
          />
          <View style={styles.heroInfo}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.authorYear}>
              {book.author}{book.published_year ? ` · ${book.published_year}` : ''}
            </Text>
            {book.avg_rating > 0 && <StarRating rating={book.avg_rating} />}
            <View style={styles.copiesRow}>
              <Text style={styles.copiesText}>{book.available_copies}/{book.total_copies} copies</Text>
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
            disabled={wishlistLoading}
            activeOpacity={0.8}
          >
            {wishlistLoading
              ? <ActivityIndicator size="small" color="#EF4444" />
              : <Text style={[styles.wishlistBtnText, inWishlist && styles.wishlistBtnTextActive]}>
                  {inWishlist ? '♥ Saved' : '+ Wishlist'}
                </Text>
            }
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
          {reviews.length > 0
            ? reviews.map((r, i) => (
                <View key={r.review_id}>
                  <ReviewRow review={r} />
                  {i < reviews.length - 1 && <View style={styles.reviewDivider} />}
                </View>
              ))
            : <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
          }
        </View>

        {/* ── Write a Review ── */}
        <TouchableOpacity
          style={styles.writeReviewBtn}
          onPress={() => setShowReviewModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Write Review bottom sheet ── */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={reviewModal.overlay}>
            <TouchableOpacity style={reviewModal.backdrop} onPress={() => setShowReviewModal(false)} activeOpacity={1} />
            <View style={reviewModal.sheet}>
              <View style={reviewModal.handle} />
              <Text style={reviewModal.title}>Write a Review</Text>
              <Text style={reviewModal.subtitle}>{book.title}</Text>
              <StarPicker rating={reviewRating} onSelect={setReviewRating} />
              <TextInput
                style={reviewModal.input}
                placeholder="Share your thoughts about this book..."
                placeholderTextColor="#9CA3AF"
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[reviewModal.submitBtn, reviewSubmitting && { opacity: 0.6 }]}
                onPress={handleSubmitReview}
                disabled={reviewSubmitting}
                activeOpacity={0.85}
              >
                {reviewSubmitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={reviewModal.submitText}>Submit Review</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity style={reviewModal.cancelBtn} onPress={() => setShowReviewModal(false)} activeOpacity={0.85}>
                <Text style={reviewModal.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F5F5F5',
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

const reviewModal = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#D1D5DB',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  title:    { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  input: {
    backgroundColor: '#F3F4F6', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#111827', minHeight: 100,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#111827', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  submitText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  cancelBtn: {
    backgroundColor: '#F3F4F6', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
});
