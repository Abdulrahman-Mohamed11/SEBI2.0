import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getAllIssuesApi } from '../../api/issues.api';
import { useAuth } from '../../context/AuthContext';
import { timeAgo } from '../../utils/timeAgo';
import StatusBadge from '../../components/StatusBadge';
import Avatar from '../../components/Avatar';
import CategoryChip from '../../components/CategoryChip';
import { COLORS, SHADOWS, RADIUS } from '../../constants/theme';

const FILTERS = ['All', 'Pending', 'In Progress', 'Resolved', 'Closed'];
const FILTER_MAP = {
  'All': null,
  'Pending': 'PENDING',
  'In Progress': 'IN_PROGRESS',
  'Resolved': 'RESOLVED',
  'Closed': 'CLOSED',
};

const CATEGORY_ICONS = {
  ELECTRICAL: '⚡', PLUMBING: '🔧', CLEANING: '🧹',
  STRUCTURAL: '🏗️', HVAC: '❄️', OTHER: '📦',
};

export default function AllIssuesScreen({ navigation }) {
  const { logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchIssues = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await getAllIssuesApi();
      setIssues(data);
    } catch {
      Alert.alert('Error', 'Failed to load issues.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchIssues(); }, []));

  const confirmLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const filterStatus = FILTER_MAP[activeFilter];
  const filtered = filterStatus ? issues.filter((i) => i.status === filterStatus) : issues;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('IssueManage', { issue: item })}
      activeOpacity={0.8}
    >
      <View style={styles.cardTop}>
        <Avatar name={item.submittedBy?.name ?? '?'} size={40} />
        <View style={styles.cardMeta}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardSubmitter}>by {item.submittedBy?.name ?? 'Unknown'}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.cardLocation}>📍 {item.location}</Text>
        <CategoryChip
          label={item.category.charAt(0) + item.category.slice(1).toLowerCase()}
          icon={CATEGORY_ICONS[item.category]}
          selected={false}
        />
      </View>
      <Text style={styles.timeAgoText}>{timeAgo(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Issues Dashboard</Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{issues.length}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={confirmLogout} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchIssues(true)} tintColor={COLORS.accent} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No issues found</Text>
            <Text style={styles.emptySubtitle}>All submitted issues will appear here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.primary,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  countPill: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countPillText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  signOutText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  filterBar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: COLORS.border },
  filterScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: COLORS.background,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterChipTextActive: { color: '#FFFFFF' },
  list: { backgroundColor: COLORS.background },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  emptyContainer: { flexGrow: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  cardMeta: { flex: 1, marginLeft: 12, marginRight: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  cardSubmitter: { fontSize: 12, color: COLORS.textSecondary },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLocation: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  timeAgoText: { fontSize: 11, color: COLORS.textLight, marginTop: 8 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
});
