import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getAssignedIssuesApi } from '../../api/issues.api';
import { useAuth } from '../../context/AuthContext';
import { timeAgo } from '../../utils/timeAgo';
import StatusBadge from '../../components/StatusBadge';
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

export default function AssignedIssuesScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIssues = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await getAssignedIssuesApi();
      setIssues(data);
    } catch {
      Alert.alert('Error', 'Failed to load assigned issues.');
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

  const total = issues.length;
  const inProgress = issues.filter((i) => i.status === 'IN_PROGRESS').length;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('WorkerIssue', { issue: item })}
      activeOpacity={0.8}
    >
      <View style={[styles.leftBorder, { backgroundColor: STATUS_LEFT_COLOR[item.status] ?? '#9CA3AF' }]} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardLocation}>📍 {item.location}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.categoryLabel}>
            {CATEGORY_ICONS[item.category]} {item.category.charAt(0) + item.category.slice(1).toLowerCase()}
          </Text>
          <StatusBadge status={item.status} />
          <Text style={styles.timeAgoText}>{timeAgo(item.createdAt)}</Text>
        </View>
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
          <Text style={styles.headerTitle}>My Tasks 🔧</Text>
          <Text style={styles.headerSubtitle}>Hello, {user?.name}</Text>
        </View>
        <TouchableOpacity onPress={confirmLogout} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <StatCard count={total} label="Total Assigned" color={COLORS.primary} />
        <StatCard count={inProgress} label="In Progress" color={COLORS.accent} />
      </View>

      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={issues.length === 0 ? styles.emptyContainer : styles.listContent}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchIssues(true)} tintColor={COLORS.accent} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>All clear!</Text>
            <Text style={styles.emptySubtitle}>No tasks assigned to you yet</Text>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.primary,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  signOutText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.primary,
  },
  list: { backgroundColor: COLORS.background },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
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
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  cardLocation: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  categoryLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  timeAgoText: { fontSize: 11, color: COLORS.textLight, marginLeft: 'auto' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary },
});
