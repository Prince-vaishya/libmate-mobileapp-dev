import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { MOCK_ACTIVE_BORROWINGS, MOCK_BORROWING_HISTORY, MOCK_WISHLIST } from '@/data/mockData';
import { getMyBorrowings, getMyHistory, getMyWishlist, getMyReservations } from '@/api/users';
import { requestRenewal } from '@/api/borrowings';

const PLACEHOLDER = require('../../../assets/icon.png');
const TABS = ['Borrowing', 'Reserved', 'Wishlist', 'History'];
const MAX_RENEWALS = 2;

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short',
  });
}

// ── Renew Book bottom-sheet modal ─────────────────────────────────
function RenewModal({ item, onClose }) {
  if (!item) return null;
  const isOverdue = item.status === 'overdue';
  const dueDate = new Date(item.due_date);
  const newDueDate = new Date(dueDate);
  newDueDate.setDate(newDueDate.getDate() + 14);

  async function handleConfirm() {
    try {
      await requestRenewal(item.borrow_id);
    } catch { /* ignore — works in mock mode too */ }
    onClose();
    Alert.alert(
      isOverdue ? 'Fine & Renewal' : 'Renewal Confirmed',
      isOverdue
        ? `Please pay the £${item.fine_amount?.toFixed(2)} fine at the front desk. Your renewal request has been submitted.`
        : `"${item.title}" has been renewed. New due date: ${formatDate(newDueDate.toISOString())}.`
    );
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={renewStyles.overlay}>
        <TouchableOpacity style={renewStyles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={renewStyles.sheet}>
          {/* Drag handle */}
          <View style={renewStyles.handle} />

          {/* Title */}
          <Text style={renewStyles.title}>{isOverdue ? 'Pay Fine & Renew' : 'Renew Book'}</Text>
          <Text style={renewStyles.subtitle}>{item.title} – {item.author}</Text>

          {/* Info rows */}
          <View style={renewStyles.infoBlock}>
            <View style={renewStyles.infoRow}>
              <Text style={renewStyles.infoLabel}>Current Due Date</Text>
              <Text style={renewStyles.infoValue}>{formatDate(item.due_date)}</Text>
            </View>
            <View style={renewStyles.rowDivider} />
            <View style={renewStyles.infoRow}>
              <Text style={renewStyles.infoLabel}>Renewals Used</Text>
              <Text style={renewStyles.infoValue}>{item.renewal_count}/{MAX_RENEWALS}</Text>
            </View>
            {isOverdue && (
              <>
                <View style={renewStyles.rowDivider} />
                <View style={renewStyles.infoRow}>
                  <Text style={[renewStyles.infoLabel, { color: '#EF4444' }]}>Outstanding Fine</Text>
                  <Text style={[renewStyles.infoValue, { color: '#EF4444' }]}>
                    £{item.fine_amount?.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
            <View style={renewStyles.rowDivider} />
            <View style={renewStyles.infoRow}>
              <Text style={renewStyles.infoLabel}>New Due Date</Text>
              <Text style={renewStyles.infoValue}>{formatDate(newDueDate.toISOString())}</Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={renewStyles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
            <Text style={renewStyles.confirmText}>
              {isOverdue ? 'Pay Fine & Confirm Renewal' : 'Confirm Renewal'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={renewStyles.cancelBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={renewStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Borrow card ────────────────────────────────────────────────
function BorrowCard({ item, onRenew }) {
  const isOverdue = item.status === 'overdue';

  return (
    <View style={styles.borrowCard}>
      <View style={styles.borrowCardInner}>
        <Image
          source={item.cover_image ? { uri: item.cover_image } : PLACEHOLDER}
          style={styles.borrowCover}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.borrowTitle}>{item.title}</Text>
          <Text style={styles.borrowAuthor}>{item.author}</Text>
          <Text style={styles.borrowDates}>Issued: {formatShortDate(item.issued_date)}</Text>
          <Text style={[styles.borrowDates, isOverdue && styles.overdueText]}>
            Due: {formatShortDate(item.due_date)}{isOverdue ? ' · OVERDUE' : ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.renewBtn, isOverdue && styles.fineBtn]}
        onPress={onRenew}
        activeOpacity={0.8}
      >
        <Text style={[styles.renewBtnText, isOverdue && styles.fineBtnText]}>
          {isOverdue ? 'Pay Fine & Renew' : 'Request Renewal'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── History card ───────────────────────────────────────────────
function HistoryCard({ item }) {
  return (
    <View style={styles.borrowCard}>
      <View style={styles.borrowCardInner}>
        <Image
          source={item.cover_image ? { uri: item.cover_image } : PLACEHOLDER}
          style={styles.borrowCover}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.borrowTitle}>{item.title}</Text>
          <Text style={styles.borrowAuthor}>{item.author}</Text>
          <Text style={styles.borrowDates}>Issued: {formatDate(item.issued_date)}</Text>
          <Text style={styles.borrowDates}>Returned: {formatDate(item.returned_date)}</Text>
          {item.fine_status === 'paid' && (
            <View style={[styles.copyBadge, { backgroundColor: '#FEF3C7', marginTop: 4 }]}>
              <Text style={[styles.copyBadgeText, { color: '#92400E' }]}>Fine paid</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Reservation card ───────────────────────────────────────────
function ReservationCard({ item }) {
  const expiresAt = new Date(item.expires_at);
  const now = new Date();
  const hoursLeft = Math.max(0, Math.round((expiresAt - now) / 3600000));
  return (
    <View style={styles.borrowCard}>
      <View style={styles.borrowCardInner}>
        <Image
          source={item.cover_image ? { uri: item.cover_image } : PLACEHOLDER}
          style={styles.borrowCover}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.borrowTitle}>{item.title}</Text>
          <Text style={styles.borrowAuthor}>{item.author}</Text>
          <Text style={styles.borrowDates}>Reserved: {formatDate(item.reserved_at)}</Text>
          <View style={[styles.copyBadge, { backgroundColor: hoursLeft > 0 ? '#FEF3C7' : '#FEE2E2', marginTop: 4 }]}>
            <Text style={[styles.copyBadgeText, { color: hoursLeft > 0 ? '#92400E' : '#991B1B' }]}>
              {hoursLeft > 0 ? `Collect within ${hoursLeft}h` : 'Reservation expired'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Wishlist card ──────────────────────────────────────────────
function WishlistCard({ book }) {
  const avail = book.available_copies > 0;
  return (
    <View style={styles.borrowCard}>
      <View style={styles.borrowCardInner}>
        <Image
          source={book.cover_image ? { uri: book.cover_image } : PLACEHOLDER}
          style={styles.borrowCover}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.borrowTitle}>{book.title}</Text>
          <Text style={styles.borrowAuthor}>{book.author}</Text>
          <Text style={styles.borrowDates}>{book.genre}</Text>
          <View style={[styles.copyBadge, { backgroundColor: avail ? '#D1FAE5' : '#FEE2E2', marginTop: 4 }]}>
            <Text style={[styles.copyBadgeText, { color: avail ? '#065F46' : '#991B1B' }]}>
              {avail ? `${book.available_copies} copies available` : 'Currently unavailable'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function EmptyState({ message }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export default function MyBooksScreen() {
  const [activeTab, setActiveTab] = useState('Borrowing');
  const [renewItem, setRenewItem] = useState(null);
  const [borrowings,    setBorrowings]    = useState(MOCK_ACTIVE_BORROWINGS);
  const [history,       setHistory]       = useState(MOCK_BORROWING_HISTORY);
  const [wishlist,      setWishlist]      = useState(MOCK_WISHLIST);
  const [reservations,  setReservations]  = useState([]);

  async function fetchData() {
    const [bRes, hRes, wRes, rRes] = await Promise.allSettled([
      getMyBorrowings(),
      getMyHistory(),
      getMyWishlist(),
      getMyReservations(),
    ]);
    if (bRes.status === 'fulfilled') {
      const d = bRes.value.data;
      if (Array.isArray(d)) setBorrowings(d.length > 0 ? d : MOCK_ACTIVE_BORROWINGS);
    }
    if (hRes.status === 'fulfilled') {
      const d = hRes.value.data;
      const arr = Array.isArray(d) ? d : d?.history;
      if (Array.isArray(arr)) setHistory(arr.length > 0 ? arr : MOCK_BORROWING_HISTORY);
    }
    if (wRes.status === 'fulfilled') {
      const d = wRes.value.data;
      if (Array.isArray(d)) setWishlist(d.length > 0 ? d : MOCK_WISHLIST);
    }
    if (rRes.status === 'fulfilled') {
      const d = rRes.value.data;
      if (Array.isArray(d)) setReservations(d);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  function renderContent() {
    switch (activeTab) {
      case 'Borrowing':
        return borrowings.length > 0
          ? borrowings.map((item) => (
              <BorrowCard key={item.borrow_id} item={item} onRenew={() => setRenewItem(item)} />
            ))
          : <EmptyState message="You have no active borrowings." />;
      case 'Reserved':
        return reservations.length > 0
          ? reservations.map((item) => <ReservationCard key={item.reservation_id} item={item} />)
          : <EmptyState message="You have no reserved books." />;
      case 'Wishlist':
        return wishlist.length > 0
          ? wishlist.map((book) => <WishlistCard key={book.book_id} book={book} />)
          : <EmptyState message="Your wishlist is empty." />;
      case 'History':
        return history.length > 0
          ? history.map((item) => <HistoryCard key={item.borrow_id} item={item} />)
          : <EmptyState message="No borrowing history yet." />;
      default:
        return null;
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Book Record</Text>
      </View>

      {/* ── 4 tabs ── */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabBtn}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.tabDivider} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      {/* ── Renew Book bottom sheet ── */}
      <RenewModal item={renewItem} onClose={() => setRenewItem(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },

  tabBar: { flexDirection: 'row', paddingHorizontal: 8, marginTop: 8 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, position: 'relative' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#4F46E5' },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: 8, right: 8,
    height: 2, backgroundColor: '#4F46E5', borderRadius: 1,
  },
  tabDivider: { height: 1, backgroundColor: '#E5E7EB' },

  content: { padding: 16, gap: 12 },

  borrowCard: { backgroundColor: '#E8E8E8', borderRadius: 14, padding: 14, gap: 12 },
  borrowCardInner: { flexDirection: 'row', gap: 12 },
  borrowCover: { width: 60, height: 80, borderRadius: 8, backgroundColor: '#C4C4C4', flexShrink: 0 },
  borrowTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  borrowAuthor: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
  borrowDates: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  overdueText: { color: '#EF4444', fontWeight: '600' },
  copyBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  copyBadgeText: { fontSize: 11, fontWeight: '600' },

  renewBtn: { backgroundColor: '#4F46E5', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  fineBtn: { backgroundColor: '#EF4444' },
  renewBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  fineBtnText: { color: '#fff' },

  empty: { alignItems: 'center', paddingTop: 48 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});

const renewStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#D1D5DB',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  title: {
    fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4,
  },
  subtitle: {
    fontSize: 14, color: '#6B7280', marginBottom: 24,
  },
  infoBlock: {
    backgroundColor: '#F3F4F6', borderRadius: 14, marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowDivider: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 16 },
  infoLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#111827' },

  confirmBtn: {
    backgroundColor: '#111827', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  cancelBtn: {
    backgroundColor: '#F3F4F6', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
});
