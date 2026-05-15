import React, { useCallback,useMemo,useState} from 'react';

// Wrap filtered with useMemo:
const filtered = useMemo(() => users.filter((u) => {
  const matchesSearch = !search.trim() ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase());
  const matchesRole = !filterRole || u.role === filterRole;
  return matchesSearch && matchesRole;
}), [users, search, filterRole]);

import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Alert,
  TextInput, Switch, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getAllUsersApi, toggleUserStatusApi, deleteUserApi } from '../../api/admin.api';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorMessages';
import Avatar from '../../components/Avatar';
import { COLORS, SHADOWS, RADIUS } from '../../constants/theme';

const ROLE_CONFIG = {
  ADMIN:            { label: 'Admin',   bg: '#1E3A5F', text: '#FFFFFF' },
  FACILITY_MANAGER: { label: 'Manager', bg: '#2DD4BF', text: '#FFFFFF' },
  WORKER:           { label: 'Worker',  bg: '#F97316', text: '#FFFFFF' },
  COMMUNITY_MEMBER: { label: 'Member',  bg: '#94A3B8', text: '#FFFFFF' },
};

const ROLE_FILTERS = ['All', 'Admin', 'Manager', 'Worker', 'Member'];
const ROLE_FILTER_MAP = {
  'All': null,
  'Admin': 'ADMIN',
  'Manager': 'FACILITY_MANAGER',
  'Worker': 'WORKER',
  'Member': 'COMMUNITY_MEMBER',
};

export default function AdminUsersScreen() {
  const { user: me, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchUsers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await getAllUsersApi();
      setUsers(data);
    } catch {
      Alert.alert('Error', 'Failed to load users.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchUsers(); }, []));

  const confirmLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const doToggle = async (user) => {
    setTogglingId(user.id);
    try {
      const { data } = await toggleUserStatusApi(user.id);
      setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)));
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggle = (user) => {
    if (user.id === me?.id) {
      return Alert.alert('Not allowed', 'You cannot change your own account status.');
    }
    Alert.alert(
      user.isActive ? 'Deactivate Account' : 'Activate Account',
      user.isActive
        ? `Are you sure you want to deactivate ${user.name}'s account?`
        : `Are you sure you want to activate ${user.name}'s account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: user.isActive ? 'destructive' : 'default', onPress: () => doToggle(user) },
      ]
    );
  };

  const handleDeleteUser = async (id) => {
    setDeletingId(id);
    try {
      await deleteUserApi(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDeleteUser = (user) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to permanently delete ${user.name}'s account? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteUser(user.id) },
      ]
    );
  };

  const filterRole = ROLE_FILTER_MAP[roleFilter];
  const filtered = users.filter((u) => {
    const matchesSearch = !search.trim() ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !filterRole || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const renderItem = ({ item }) => {
    const role = ROLE_CONFIG[item.role] ?? { label: item.role, bg: '#64748B', text: '#FFFFFF' };
    const isSelf = item.id === me?.id;
    const isToggling = togglingId === item.id;
    const isDeleting = deletingId === item.id;

    return (
      <View style={[styles.card, !item.isActive && styles.cardInactive]}>
        <Avatar name={item.name} size={48} />
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: role.bg }]}>
            <Text style={[styles.roleText, { color: role.text }]}>{role.label}</Text>
          </View>
        </View>
        <View style={styles.right}>
          {isSelf ? (
            <Text style={styles.lockIcon}>🔒</Text>
          ) : (
            <>
              {isToggling || isDeleting ? (
                <ActivityIndicator size="small" color={COLORS.accent} />
              ) : (
                <>
                  <Switch
                    value={item.isActive}
                    onValueChange={() => handleToggle(item)}
                    thumbColor="#FFFFFF"
                    trackColor={{ false: '#CBD5E0', true: COLORS.accent }}
                  />
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmDeleteUser(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteBtnText}>🗑 Delete</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>User Management 👥</Text>
        <TouchableOpacity onPress={confirmLogout} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      {/* Role filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterRow}
      >
        {ROLE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, roleFilter === f && styles.filterChipActive]}
            onPress={() => setRoleFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, roleFilter === f && styles.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchUsers(true)} tintColor={COLORS.accent} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No users found</Text>
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
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  signOutText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2DD4BF',
    borderColor: '#2DD4BF',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: { backgroundColor: COLORS.background, flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  emptyContainer: { flexGrow: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  cardInactive: { opacity: 0.6 },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  userEmail: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 },
  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roleText: { fontSize: 11, fontWeight: '700' },
  right: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    gap: 6,
  },
  lockIcon: { fontSize: 20, color: COLORS.textLight },
  deleteBtn: {
    marginTop: 4,
  },
  deleteBtnText: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: '600',
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
});
