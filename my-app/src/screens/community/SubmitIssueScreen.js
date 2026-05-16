import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, Image, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { createIssueApi } from '../../api/issues.api';
import { validateIssueForm } from '../../utils/validation';
import { compressImage } from '../../utils/imageUtils';
import CategoryChip from '../../components/CategoryChip';
import FieldError from '../../components/FieldError';
import { COLORS, SHADOWS, RADIUS } from '../../constants/theme';

const CATEGORIES = [
  { value: 'ELECTRICAL', label: 'Electrical', icon: '⚡' },
  { value: 'PLUMBING', label: 'Plumbing', icon: '🔧' },
  { value: 'CLEANING', label: 'Cleaning', icon: '🧹' },
  { value: 'STRUCTURAL', label: 'Structural', icon: '🏗️' },
  { value: 'HVAC', label: 'HVAC', icon: '❄️' },
  { value: 'OTHER', label: 'Other', icon: '📦' },
];

const MAX_DESC = 500;

export default function SubmitIssueScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ELECTRICAL');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [locFocused, setLocFocused] = useState(false);

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
      setImage(compressed);
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
      setImage(compressed);
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

  const handleSubmit = async () => {
    const errs = validateIssueForm(title, description, location);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (description.length > MAX_DESC) {
      setErrors({ description: `Description must be ${MAX_DESC} characters or less` });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('location', location.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      if (image) {
        formData.append('photo', {
          uri: image.uri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        });
      }
      await createIssueApi(formData);
      Alert.alert('Submitted!', 'Your issue has been reported.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit issue.');
    } finally {
      setLoading(false);
    }
  };

  const descOverLimit = description.length > MAX_DESC;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeader}>ISSUE DETAILS</Text>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={[
                styles.input,
                titleFocused && styles.inputFocused,
                errors.title && styles.inputError,
              ]}
              placeholder="e.g. Broken light in hallway"
              placeholderTextColor={COLORS.textLight}
              value={title}
              onChangeText={(v) => { setTitle(v); setErrors((p) => ({ ...p, title: null })); }}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
            />
            <FieldError message={errors.title} />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                descFocused && styles.inputFocused,
                (errors.description || descOverLimit) && styles.inputError,
              ]}
              placeholder="Describe the issue in detail..."
              placeholderTextColor={COLORS.textLight}
              value={description}
              onChangeText={(v) => { setDescription(v); setErrors((p) => ({ ...p, description: null })); }}
              multiline
              textAlignVertical="top"
              onFocus={() => setDescFocused(true)}
              onBlur={() => setDescFocused(false)}
            />
            <View style={styles.charCountRow}>
              <FieldError message={errors.description} />
              <Text style={[styles.charCount, descOverLimit && styles.charCountOver]}>
                {description.length} / {MAX_DESC} characters
              </Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>LOCATION</Text>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Location</Text>
            <View style={[
              styles.locInputRow,
              locFocused && styles.inputFocused,
              errors.location && styles.inputError,
            ]}>
              <Text style={styles.locIcon}>📍</Text>
              <TextInput
                style={styles.locInput}
                placeholder="e.g. Block B, Floor 2"
                placeholderTextColor={COLORS.textLight}
                value={location}
                onChangeText={(v) => { setLocation(v); setErrors((p) => ({ ...p, location: null })); }}
                onFocus={() => setLocFocused(true)}
                onBlur={() => setLocFocused(false)}
              />
            </View>
            <FieldError message={errors.location} />
          </View>

          <Text style={styles.sectionHeader}>CATEGORY</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {CATEGORIES.map((c) => (
              <CategoryChip
                key={c.value}
                label={c.label}
                icon={c.icon}
                selected={category === c.value}
                onPress={() => setCategory(c.value)}
              />
            ))}
          </ScrollView>

          <Text style={styles.sectionHeader}>PHOTO</Text>
          <View style={styles.photoSection}>
            {image ? (
              <View style={styles.photoPreviewWrapper}>
                <Image source={{ uri: image.uri }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.changePhotoBtn} onPress={showPhotoActionSheet} activeOpacity={0.8}>
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoPicker}>
                <Text style={styles.photoPickerIcon}>🖼️</Text>
                <Text style={styles.photoPickerText}>Add a photo</Text>
                <Text style={styles.photoPickerHint}>Optional</Text>
                <View style={styles.photoButtonRow}>
                  <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto} activeOpacity={0.8}>
                    <Text style={styles.photoBtnText}>📷 Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoBtn} onPress={handlePickFromGallery} activeOpacity={0.8}>
                    <Text style={styles.photoBtnText}>🖼 Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View style={styles.submitSpacer} />
        </ScrollView>

        <View style={styles.submitBar}>
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>Submit Issue</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { paddingBottom: 20 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 20,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    borderRadius: RADIUS.lg,
    padding: 16,
    ...SHADOWS.card,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: COLORS.inputBg,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  inputFocused: { borderColor: COLORS.accent },
  inputError: { borderColor: COLORS.danger },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  charCountOver: { color: COLORS.danger, fontWeight: '600' },
  locInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    backgroundColor: COLORS.inputBg,
    marginBottom: 4,
  },
  locIcon: { fontSize: 16, marginRight: 8 },
  locInput: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  chipRow: { paddingHorizontal: 16, paddingVertical: 4 },
  photoSection: { marginHorizontal: 16 },
  photoPicker: {
    borderWidth: 2,
    borderColor: '#CBD5E0',
    borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPickerIcon: { fontSize: 32 },
  photoPickerText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
  photoPickerHint: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  photoButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 16,
    width: '100%',
  },
  photoBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  photoBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  photoPreviewWrapper: { position: 'relative' },
  photoPreview: { width: '100%', height: 200, borderRadius: RADIUS.lg },
  changePhotoBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changePhotoText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  submitSpacer: { height: 100 },
  submitBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  submitBtn: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
