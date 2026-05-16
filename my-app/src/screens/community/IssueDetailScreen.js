import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Image, ActivityIndicator, Alert, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCommentsApi } from '../../api/comments.api';
import { deleteIssueApi } from '../../api/issues.api';
import { getErrorMessage } from '../../utils/errorMessages';
import { timeAgo } from '../../utils/timeAgo';
import StatusBadge from '../../components/StatusBadge';
import Avatar from '../../components/Avatar';
import CategoryChip from '../../components/CategoryChip';
import { COLORS, SHADOWS, RADIUS } from '../../constants/theme';

const CATEGORY_ICONS = {
  ELECTRICAL: '⚡', PLUMBING: '🔧', CLEANING: '🧹',
  STRUCTURAL: '🏗️', HVAC: '❄️', OTHER: '📦',
};

const ROLE_LABELS = {
  COMMUNITY_MEMBER: 'Member',
  FACILITY_MANAGER: 'Manager',
  WORKER: 'Worker',
  ADMIN: 'Admin',
};

const TIMELINE_STEPS = [
  { key: 'PENDING', label: 'Submitted' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
];

const STATUS_ORDER = { PENDING: 0, IN_PROGRESS: 1, RESOLVED: 2, CLOSED: 3 };

export default function IssueDetailScreen({ route, navigation }) {
  const { issue } = route.params;
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getCommentsApi(issue.id)
      .then(({ data }) => setComments(data))
      .catch(() => Alert.alert('Error', 'Failed to load comments.'))
      .finally(() => setLoadingComments(false));
  }, [issue.id]);

  const handleDeleteIssue = async () => {
    setDeleting(true);
    try {
      await deleteIssueApi(issue.id);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Issue',
      'Are you sure you want to delete this issue? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDeleteIssue },
      ]
    );
  };

 const currentOrder = useMemo(
  () => STATUS_ORDER[issue.status] ?? 0,
  [issue.status]
);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header card */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <StatusBadge status={issue.status} />
          </View>
          <Text style={styles.issueTitle}>{issue.title}</Text>

          <View style={styles.chipRow}>
            <CategoryChip
              label={issue.category.charAt(0) + issue.category.slice(1).toLowerCase()}
              icon={CATEGORY_ICONS[issue.category]}
              selected={false}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={styles.metaText}>{issue.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.metaText}>Submitted {timeAgo(issue.createdAt)}</Text>
          </View>

          <View style={[styles.metaRow, { alignItems: 'flex-start', marginTop: 8 }]}>
            <Text style={styles.metaIcon}>📝</Text>
            <Text style={[styles.metaText, { flex: 1, lineHeight: 22 }]}>{issue.description}</Text>
          </View>

          {issue.photoUrl ? (
            <Image source={{ uri: issue.photoUrl }} style={styles.photo} resizeMode="cover" />
          ) : null}
        </View>

        {/* Assignment card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assignment</Text>
          {issue.assignments?.length > 0 ? (
            issue.assignments.map((a) => (
              <View key={a.id} style={styles.workerRow}>
                <Avatar name={a.worker?.name ?? '?'} size={36} />
                <Text style={styles.workerName}>Assigned to: {a.worker?.name}</Text>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            ))
          ) : (
            <View style={styles.notAssignedRow}>
              <Text style={styles.notAssignedText}>⏳ Not yet assigned</Text>
            </View>
          )}
        </View>

        {/* Comments / Updates card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Updates</Text>
          {loadingComments ? (
            <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 16 }} />
          ) : comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyCommentsText}>💬 No updates yet</Text>
            </View>
          ) : (
            comments.map((c, idx) => (
              <View
                key={c.id}
                style={[
                  styles.commentItem,
                  idx < comments.length - 1 && styles.commentBorder,
                ]}
              >
                <View style={styles.commentHeader}>
                  <Avatar name={c.author?.name ?? '?'} size={36} />
                  <View style={styles.commentMeta}>
                    <Text style={styles.commentAuthor}>{c.author?.name}</Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>
                        {ROLE_LABELS[c.author?.role] ?? c.author?.role}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.commentTime}>{timeAgo(c.createdAt)}</Text>
                </View>
                <Text style={styles.commentContent}>{c.content}</Text>
                {c.photoUrl && (
                  <Image source={{ uri: c.photoUrl }} style={styles.commentPhoto} resizeMode="cover" />
                )}
              </View>
            ))
          )}
        </View>

        {/* Status timeline card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status Timeline</Text>
          {TIMELINE_STEPS.map((step, idx) => {
            const reached = STATUS_ORDER[step.key] <= currentOrder;
            const isLast = idx === TIMELINE_STEPS.length - 1;
            const nextReached = !isLast && STATUS_ORDER[TIMELINE_STEPS[idx + 1].key] <= currentOrder;
            return (
              <View key={step.key} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, reached && styles.timelineDotActive]} />
                  {!isLast && (
                    <View style={[styles.timelineLine, nextReached && styles.timelineLineActive]} />
                  )}
                </View>
                <Text style={[styles.timelineLabel, reached && styles.timelineLabelActive]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Delete button — only for PENDING issues */}
        {issue.status === 'PENDING' && (
          <TouchableOpacity
            style={[styles.deleteBtn, deleting && styles.btnDisabled]}
            onPress={confirmDelete}
            disabled={deleting}
            activeOpacity={0.8}
          >
            {deleting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.deleteBtnText}>🗑 Delete Issue</Text>
            }
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  badgeRow: { alignItems: 'flex-end' },
  issueTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 8,
    lineHeight: 28,
  },
  chipRow: { marginTop: 8, flexDirection: 'row' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  metaIcon: { fontSize: 14, marginRight: 8, width: 20 },
  metaText: { fontSize: 14, color: COLORS.textSecondary },
  photo: { width: '100%', height: 220, borderRadius: RADIUS.md, marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 12 },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.resolvedBg,
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 8,
  },
  workerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.resolvedText,
    marginLeft: 10,
  },
  checkmark: { fontSize: 16, color: COLORS.success, fontWeight: '700' },
  notAssignedRow: {
    backgroundColor: COLORS.closedBg,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
  },
  notAssignedText: { fontSize: 14, color: COLORS.closedText, fontWeight: '500' },
  emptyComments: { alignItems: 'center', paddingVertical: 16 },
  emptyCommentsText: { fontSize: 14, color: COLORS.textSecondary },
  commentItem: { paddingVertical: 12 },
  commentBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.background },
  commentHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  commentMeta: { flex: 1, marginLeft: 10 },
  commentAuthor: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.inProgressBg,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  roleBadgeText: { fontSize: 11, color: COLORS.inProgressText, fontWeight: '600' },
  commentTime: { fontSize: 11, color: COLORS.textLight },
  commentContent: { fontSize: 14, color: '#4A5568', marginTop: 6, lineHeight: 20 },
  commentPhoto: { width: '100%', height: 160, borderRadius: RADIUS.sm, marginTop: 8 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 44 },
  timelineLeft: { alignItems: 'center', width: 24, marginRight: 14 },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    marginTop: 2,
  },
  timelineDotActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  timelineLine: { width: 2, flex: 1, minHeight: 28, backgroundColor: COLORS.border, marginTop: 2 },
  timelineLineActive: { backgroundColor: COLORS.accent },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, paddingTop: 2, flex: 1 },
  timelineLabelActive: { color: COLORS.primary },
  deleteBtn: {
    height: 54,
    backgroundColor: COLORS.danger,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  btnDisabled: { opacity: 0.7 },
  deleteBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
