import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  updateIssueStatusApi,
  assignWorkerApi,
  getWorkersApi,
  deleteIssueManagerApi,
} from '../../api/issues.api';
import { getErrorMessage } from '../../utils/errorMessages';
import StatusBadge from '../../components/StatusBadge';
import Avatar from '../../components/Avatar';
import CategoryChip from '../../components/CategoryChip';
import { COLORS, SHADOWS, RADIUS } from '../../constants/theme';

const STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const CATEGORY_ICONS = {
  ELECTRICAL: '⚡', PLUMBING: '🔧', CLEANING: '🧹',
  STRUCTURAL: '🏗️', HVAC: '❄️', OTHER: '📦',
};

export default function IssueManageScreen({ route, navigation }) {
  const { issue: initial } = route.params;
  const [issue, setIssue] = useState(initial);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(initial.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getWorkersApi()
      .then(({ data }) => {
        setWorkers(data);
        if (data.length > 0) setSelectedWorker(data[0].id);
      })
      .catch(() => Alert.alert('Warning', 'Could not load workers.'))
      .finally(() => setLoadingWorkers(false));
  }, []);

  const doUpdateStatus = async () => {
    setUpdatingStatus(true);
    try {
      const { data } = await updateIssueStatusApi(issue.id, selectedStatus);
      setIssue(data);
      Alert.alert('Updated', `Status changed to ${STATUSES.find((s) => s.value === data.status)?.label}.`);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateStatus = () => {
    if (selectedStatus === issue.status) {
      return Alert.alert('No change', 'Please select a different status.');
    }
    if (selectedStatus === 'CLOSED') {
      Alert.alert(
        'Close Issue',
        'Are you sure you want to close this issue? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Close Issue', style: 'destructive', onPress: doUpdateStatus },
        ]
      );
    } else {
      doUpdateStatus();
    }
  };

  const handleAssign = async () => {
    if (!selectedWorker) return Alert.alert('No worker', 'No active workers available.');
    setAssigning(true);
    try {
      await assignWorkerApi(issue.id, selectedWorker);
      const workerObj = workers.find((w) => w.id === selectedWorker);
      const alreadyAssigned = issue.assignments?.some((a) => a.workerId === selectedWorker);
      if (!alreadyAssigned) {
        setIssue((prev) => ({
          ...prev,
          assignments: [
            ...(prev.assignments ?? []),
            { id: Date.now().toString(), workerId: selectedWorker, worker: { name: workerObj?.name } },
          ],
        }));
      }
      Alert.alert('Assigned', `${workerObj?.name} has been assigned to this issue.`);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to assign worker.');
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteIssue = async () => {
    setDeleting(true);
    try {
      await deleteIssueManagerApi(issue.id);
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
      'Are you sure you want to permanently delete this issue? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDeleteIssue },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Issue detail card */}
        <View style={styles.card}>
          <View style={styles.detailTop}>
            <StatusBadge status={issue.status} />
          </View>
          <Text style={styles.issueTitle}>{issue.title}</Text>
          <Text style={styles.issueDescription}>{issue.description}</Text>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>📍 {issue.location}</Text>
            <CategoryChip
              label={issue.category.charAt(0) + issue.category.slice(1).toLowerCase()}
              icon={CATEGORY_ICONS[issue.category]}
              selected={false}
            />
          </View>

          <View style={styles.submitterRow}>
            <Avatar name={issue.submittedBy?.name ?? '?'} size={36} />
            <View style={styles.submitterInfo}>
              <Text style={styles.submitterName}>{issue.submittedBy?.name ?? 'Unknown'}</Text>
              <Text style={styles.submitterEmail}>{issue.submittedBy?.email ?? ''}</Text>
            </View>
          </View>

          {issue.photoUrl ? (
            <Image source={{ uri: issue.photoUrl }} style={styles.photo} resizeMode="cover" />
          ) : null}
        </View>

        {/* Assign Worker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assign Worker</Text>

          {loadingWorkers ? (
            <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 16 }} />
          ) : workers.length === 0 ? (
            <Text style={styles.emptyText}>No active workers available.</Text>
          ) : (
            <>
              {issue.assignments?.length > 0 && (
                <View style={styles.assignedRow}>
                  <Text style={styles.assignedCheck}>✓ Assigned to </Text>
                  {issue.assignments.map((a) => (
                    <Text key={a.id} style={styles.assignedName}>{a.worker?.name}</Text>
                  ))}
                </View>
              )}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.workerScroll}>
                {workers.map((w) => {
                  const isSelected = selectedWorker === w.id;
                  return (
                    <TouchableOpacity
                      key={w.id}
                      style={styles.workerCard}
                      onPress={() => setSelectedWorker(w.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.workerAvatarWrap, isSelected && styles.workerAvatarSelected]}>
                        <Avatar name={w.name} size={48} />
                      </View>
                      <Text style={styles.workerName} numberOfLines={1}>{w.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                style={[styles.actionBtn, styles.accentBtn, assigning && styles.btnDisabled]}
                onPress={handleAssign}
                disabled={assigning}
                activeOpacity={0.8}
              >
                {assigning
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.actionBtnText}>Assign</Text>
                }
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Update Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Update Status</Text>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={styles.statusRow}
              onPress={() => setSelectedStatus(s.value)}
              activeOpacity={0.8}
            >
              <View style={[styles.radio, selectedStatus === s.value && styles.radioSelected]}>
                {selectedStatus === s.value && <View style={styles.radioDot} />}
              </View>
              <StatusBadge status={s.value} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.actionBtn, styles.navyBtn, updatingStatus && styles.btnDisabled]}
            onPress={handleUpdateStatus}
            disabled={updatingStatus}
            activeOpacity={0.8}
          >
            {updatingStatus
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.actionBtnText}>Update Status</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Comments read-only */}
        {issue.comments?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Comments ({issue.comments.length})</Text>
            {issue.comments.map((c) => (
              <View key={c.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Avatar name={c.author?.name ?? '?'} size={32} />
                  <View style={styles.commentMeta}>
                    <Text style={styles.commentAuthor}>{c.author?.name}</Text>
                    <Text style={styles.commentRole}>{c.author?.role?.replace(/_/g, ' ')}</Text>
                  </View>
                </View>
                <Text style={styles.commentContent}>{c.content}</Text>
                {c.photoUrl && (
                  <Image source={{ uri: c.photoUrl }} style={styles.commentPhoto} resizeMode="cover" />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Delete Issue button */}
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

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 16, paddingBottom: 48 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  detailTop: { alignItems: 'flex-end', marginBottom: 8 },
  issueTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary, marginTop: 8, marginBottom: 8 },
  issueDescription: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 4 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  metaText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  submitterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  submitterInfo: { marginLeft: 10 },
  submitterName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  submitterEmail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  photo: { width: '100%', height: 200, borderRadius: RADIUS.md, marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 12 },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.resolvedBg,
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 12,
  },
  assignedCheck: { fontSize: 13, color: COLORS.resolvedText, fontWeight: '600' },
  assignedName: { fontSize: 13, color: COLORS.resolvedText, fontWeight: '700' },
  workerScroll: { marginBottom: 12 },
  workerCard: { width: 80, alignItems: 'center', marginRight: 12 },
  workerAvatarWrap: {
    borderRadius: RADIUS.full,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 6,
  },
  workerAvatarSelected: { borderColor: COLORS.accent },
  workerName: { fontSize: 12, color: COLORS.textPrimary, textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  actionBtn: {
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  accentBtn: { backgroundColor: COLORS.accent },
  navyBtn: { backgroundColor: COLORS.primary },
  btnDisabled: { opacity: 0.65 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyText: { fontSize: 13, color: COLORS.textLight },
  commentCard: {
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  commentMeta: { marginLeft: 10 },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  commentRole: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  commentContent: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
  commentPhoto: { width: '100%', height: 160, borderRadius: RADIUS.sm, marginTop: 8 },
  deleteBtn: {
    height: 54,
    backgroundColor: COLORS.danger,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  deleteBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
