import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { markInProgressApi } from '../../api/issues.api';
import { addCommentApi, getCommentsApi } from '../../api/comments.api';
import { compressImage } from '../../utils/imageUtils';
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



export default function WorkerIssueScreen({ route }) {
  const { issue: initial } = route.params;
  const [issue, setIssue] = useState(initial);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentPhoto, setCommentPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [markingProgress, setMarkingProgress] = useState(false);
  const [commentFocused, setCommentFocused] = useState(false);

  const fetchComments = async () => {
    try {
      const { data } = await getCommentsApi(issue.id);
      setComments(data);
    } catch {
      Alert.alert('Error', 'Failed to load comments.');
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => { fetchComments(); }, [issue.id]);

  const handleMarkInProgress = async () => {
    setMarkingProgress(true);
    try {
      const { data } = await markInProgressApi(issue.id);
      setIssue(data);
      Alert.alert('Updated', 'Issue marked as In Progress.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status.');
    } finally {
      setMarkingProgress(false);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access in your phone settings to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled) {
      const compressed = await compressImage(result.assets[0].uri);
      setCommentPhoto(compressed);
    }
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled) {
      const compressed = await compressImage(result.assets[0].uri);
      setCommentPhoto(compressed);
    }
  };

  const showPhotoActionSheet = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: '📷 Take Photo', onPress: () => handleTakePhoto() },
        { text: '🖼 Choose from Gallery', onPress: () => handlePickFromGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      return Alert.alert('Empty comment', 'Please write something before submitting.');
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('content', commentText.trim());
      if (commentPhoto) {
        data.append('photo', {
          uri: commentPhoto.uri,
          name: 'completion.jpg',
          type: 'image/jpeg',
        });
      }
      await addCommentApi(issue.id, data);
      setCommentText('');
      setCommentPhoto(null);
      await fetchComments();
      Alert.alert('Done', 'Update submitted.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
              <Avatar name={issue.submittedBy?.name ?? '?'} size={34} />
              <View style={styles.submitterInfo}>
                <Text style={styles.submitterName}>{issue.submittedBy?.name ?? 'Unknown'}</Text>
                <Text style={styles.submitterEmail}>{issue.submittedBy?.email ?? ''}</Text>
              </View>
            </View>

            {issue.photoUrl ? (
              <Image source={{ uri: issue.photoUrl }} style={styles.photo} resizeMode="cover" />
            ) : null}
          </View>

          {/* Action card */}
          <View style={styles.card}>
            {issue.status === 'PENDING' && (
              <TouchableOpacity
                style={[styles.inProgressBtn, markingProgress && styles.btnDisabled]}
                onPress={handleMarkInProgress}
                disabled={markingProgress}
                activeOpacity={0.8}
              >
                {markingProgress
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.inProgressText}>Mark as In Progress 🔧</Text>
                }
              </TouchableOpacity>
            )}
            {issue.status === 'IN_PROGRESS' && (
              <View style={styles.inProgressStatus}>
                <Text style={styles.inProgressStatusText}>✓ Currently In Progress</Text>
              </View>
            )}
            {(issue.status === 'RESOLVED' || issue.status === 'CLOSED') && (
              <View style={styles.finalStatus}>
                <StatusBadge status={issue.status} />
                <Text style={styles.finalStatusText}>
                  This issue has been {issue.status.toLowerCase()}.
                </Text>
              </View>
            )}
          </View>

          {/* Add comment */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add Update</Text>
            <TextInput
              style={[styles.commentInput, commentFocused && styles.inputFocused]}
              placeholder="Describe what you found or did..."
              placeholderTextColor={COLORS.textLight}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              textAlignVertical="top"
              onFocus={() => setCommentFocused(true)}
              onBlur={() => setCommentFocused(false)}
            />
            <View style={styles.commentActions}>
              <TouchableOpacity onPress={showPhotoActionSheet} activeOpacity={0.8} style={styles.attachBtn}>
                <Text style={styles.attachText}>📎 Attach Photo</Text>
              </TouchableOpacity>

              {commentPhoto && (
                <View style={styles.thumbnailWrapper}>
                  <Image source={{ uri: commentPhoto.uri }} style={styles.thumbnail} />
                  <TouchableOpacity
                    style={styles.thumbnailRemove}
                    onPress={() => setCommentPhoto(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.thumbnailRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[styles.sendBtn, submitting && styles.btnDisabled]}
                onPress={handleSubmitComment}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.sendBtnText}>Send</Text>
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* Updates / Comments */}
          <Text style={styles.updatesHeader}>UPDATES</Text>
          {loadingComments ? (
            <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 16 }} />
          ) : comments.length === 0 ? (
            <Text style={styles.emptyText}>No updates yet.</Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} style={styles.commentCard}>
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
        </ScrollView>
      </KeyboardAvoidingView>
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
  issueTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 8,
    marginBottom: 8,
  },
  issueDescription: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  submitterRow: { flexDirection: 'row', alignItems: 'center' },
  submitterInfo: { marginLeft: 10 },
  submitterName: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  submitterEmail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  photo: { width: '100%', height: 200, borderRadius: RADIUS.md, marginTop: 12 },
  inProgressBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inProgressText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  inProgressStatus: {
    backgroundColor: COLORS.inProgressBg,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
  },
  inProgressStatusText: { color: COLORS.inProgressText, fontWeight: '700', fontSize: 14 },
  finalStatus: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  finalStatusText: { fontSize: 13, color: COLORS.textSecondary },
  btnDisabled: { opacity: 0.65 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 12 },
  commentInput: {
    height: 80,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.inputBg,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  inputFocused: { borderColor: COLORS.accent },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attachBtn: { flex: 1 },
  attachText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  thumbnailWrapper: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  thumbnailRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailRemoveText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  sendBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  updatesHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  emptyText: { fontSize: 13, color: COLORS.textLight, marginBottom: 16 },
  commentCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 8,
    ...SHADOWS.card,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  commentMeta: { flex: 1, marginLeft: 10 },
  commentAuthor: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  roleBadge: {
    backgroundColor: COLORS.inProgressBg,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  roleBadgeText: { fontSize: 11, color: COLORS.inProgressText, fontWeight: '600' },
  commentTime: { fontSize: 11, color: COLORS.textLight },
  commentContent: { fontSize: 14, color: '#4A5568', lineHeight: 20, marginTop: 8 },
  commentPhoto: { width: '100%', height: 160, borderRadius: RADIUS.sm, marginTop: 8 },
});
