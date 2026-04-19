import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import useAuthStore from '@/store/authStore';

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function MembershipScreen() {
  const { membership, hasActiveMembership } = useAuthStore();

  if (!membership || !hasActiveMembership) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="card-off-outline" size={56} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No active membership</Text>
        <Text style={styles.emptySub}>Contact the library to sign up for a membership plan.</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => Alert.alert('Membership', 'Please visit the library desk to purchase a membership.')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Learn More</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isActive = membership.status === 'active';

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

      {/* ── Membership card ── */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardIconBox}>
            <MaterialCommunityIcons name="card-account-details" size={28} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>LibMate Library Card</Text>
            <Text style={styles.cardNumber}>{membership.card_number}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isActive ? '#D1FAE5' : '#FEE2E2' }]}>
            <Text style={[styles.statusText, { color: isActive ? '#065F46' : '#991B1B' }]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Details ── */}
      <View style={styles.detailCard}>
        <Text style={styles.sectionLabel}>MEMBERSHIP DETAILS</Text>
        <InfoRow label="Status"          value={isActive ? 'Active' : 'Inactive'} />
        <View style={styles.rowDivider} />
        <InfoRow label="Payment"         value={membership.payment_status === 'paid' ? 'Paid' : 'Pending'} />
        <View style={styles.rowDivider} />
        <InfoRow label="Plan duration"   value={`${membership.duration_months} months`} />
        <View style={styles.rowDivider} />
        <InfoRow label="Expiry date"     value={formatDate(membership.expiry_date)} />
      </View>

      {/* ── Benefits ── */}
      <View style={styles.detailCard}>
        <Text style={styles.sectionLabel}>MEMBER BENEFITS</Text>
        {[
          'Borrow up to 5 books at a time',
          'Up to 2 renewals per book',
          'Priority reservation on new arrivals',
          'Access to digital reading resources',
        ].map((benefit, i) => (
          <View key={i} style={styles.benefitRow}>
            <MaterialCommunityIcons name="check-circle-outline" size={18} color="#4F46E5" />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => Alert.alert('Renew Membership', 'Please visit the library desk to renew your membership.')}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText}>Renew Membership</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },

  card: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIconBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  cardTitle:  { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  cardNumber: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  statusText:  { fontSize: 12, fontWeight: '700' },

  detailCard: {
    backgroundColor: '#F3F4F6', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 8,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#6B7280',
    letterSpacing: 0.8, paddingVertical: 12,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13,
  },
  infoLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  rowDivider: { height: 1, backgroundColor: '#E5E7EB' },

  benefitRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, paddingVertical: 10,
  },
  benefitText: { fontSize: 14, color: '#374151', flex: 1 },

  btn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 12 },
  emptySub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
});
