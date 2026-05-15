import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Alert,
  TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getMyIssuesApi, deleteIssueApi } from '../../api/issues.api';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorMessages';
import { timeAgo } from '../../utils/timeAgo';
import StatusBadge from '../../components/StatusBadge';
import CategoryChip from '../../components/CategoryChip';
import StatCard from '../../components/StatCard';
import { COLORS, SHADOWS, RADIUS } from '../../constants/theme';

const STATUS_LEFT_COLOR = {
  PENDING: '#D69E2E',
  IN_PROGRESS: '#2DD4BF',
  RESOLVED: '#38A169',
  CLOSED: '#9CA3AF',
};

const CATEGORY_ICONS = {
  ELECTRICAL: '⚡', PLUMBING: '🔧', CLEANING: '🧹',
  STRUCTURAL: '🏗️', HVAC: '❄️', OTHER: '📦',
};

const FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
];

export default function MyIssuesScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const fetchIssues = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await getMyIssuesApi();
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

  const handleDeleteIssue = async (id) => {
    try {
      await deleteIssueApi(id);
      setIssues((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    }
  };

  const confirmDeleteIssue = (id) => {
    Alert.alert(
      'Delete Issue',
      'Are you sure you want to delete this issue? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteIssue(id) },
      ]
    );
  };

  const pending = issues.filter((i) => i.status === 'PENDING').length;
  const inProgress = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolved = issues.filter((i) => i.status === 'RESOLVED').length;

  const filtered = issues
    .filter((i) => filter === 'ALL' || i.status === filter)
    .filter((i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase())
    );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('IssueDetail', { issue: item })}
      activeOpacity={0.8}
    >
      <View style={[styles.leftBorder, { backgroundColor: STATUS_LEFT_COLOR[item.status] ?? '#9CA3AF' }]} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardLocation}>📍 {item.location}</Text>
        <View style={styles.cardBottom}>
          <CategoryChip
            label={item.category.charAt(0) + item.category.slice(1).toLowerCase()}
            icon={CATEGORY_ICONS[item.category]}
            selected={false}
          />
          <StatusBadge status={item.status} />
          <Text style={styles.timeAgoText}>{timeAgo(item.createdAt)}</Text>
        </View>
        {item.status === 'PENDING' && (
          <TouchableOpacity
            style={styles.deleteIssueBtn}
            onPress={(e) => { e.stopPropagation(); confirmDeleteIssue(item.id); }}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteIssueBtnText}>🗑 Delete</Text>
          </TouchableOpacity>
        )}
      </View>
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
        <View>
          <Text style={styles.greeting}>Hello, {user?.name} 👋</Text>
          <Text style={styles.greetingSubtitle}>Track your reported issues</Text>
        </View>
        <TouchableOpacity onPress={confirmLogout} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <StatCard count={pending} label="Pending" color={COLORS.warning} />
        <StatCard count={inProgress} label="In Progress" color={COLORS.accent} />
        <StatCard count={resolved} label="Resolved" color={COLORS.success} />
      </View>

      <View style={styles.content}>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search my issues..."
            placeholderTextColor={COLORS.textLight}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={styles.filterRow}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
              onPress={() => setFilter(f.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, filter === f.value && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchIssues(true)} tintColor={COLORS.accent} />
          }
          ListHeaderComponent={
            filtered.length > 0 ? <Text style={styles.sectionHeader}>My Reports</Text> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>
                {search || filter !== 'ALL' ? 'No matching issues' : 'No issues yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {search || filter !== 'ALL' ? 'Try a different search or filter' : 'Tap + to report your first issue'}
              </Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity
        style={[styles.fab, SHADOWS.button]}
        onPress={() => navigation.navigate('SubmitIssue')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.primary,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  greetingSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  signOutText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.primary,
  },
  content: { flex: 1, backgroundColor: COLORS.background },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 46,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  filterRow: { marginTop: 10 },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filterChip: {
    height: 36,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 12,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyContainer: { flexGrow: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  leftBorder: { width: 4 },
  cardContent: { flex: 1, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  cardLocation: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, marginBottom: 12 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  timeAgoText: { fontSize: 11, color: COLORS.textLight, marginLeft: 'auto' },
  deleteIssueBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  deleteIssueBtnText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
