import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Modal, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { uploadLecture } from '../../api/lecturesApi';

function UploadLectureModal({ visible, weekId, nextOrder, onClose, onUploaded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function pickVideo() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
    if (result.canceled) return;
    setFile(result.assets[0]);
  }

  async function handleSubmit() {
    setError('');
    if (!title.trim()) {
      setError('Please enter a lecture title.');
      return;
    }
    if (!file) {
      setError('Please select a video file.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('week_id', String(weekId));
    formData.append('title', title);
    formData.append('description', description);
    formData.append('lecture_order', String(nextOrder));
    formData.append('video', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'video/mp4',
    });

    try {
      await uploadLecture(formData);
      setTitle('');
      setDescription('');
      setFile(null);
      onUploaded();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrapper}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Upload Lecture</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={18} color={colors.gray600} />
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Lecture Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Introduction to Makharij"
                placeholderTextColor={colors.gray400}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Brief summary of this lecture"
                placeholderTextColor={colors.gray400}
                multiline
                numberOfLines={2}
              />
            </View>

            <Pressable style={styles.filePicker} onPress={pickVideo}>
              <Feather name={file ? 'check-circle' : 'upload'} size={18} color={file ? colors.success : colors.primary} />
              <Text style={styles.filePickerText} numberOfLines={1}>
                {file ? file.name : 'Select video file'}
              </Text>
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Upload Lecture</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(10,46,54,0.5)', justifyContent: 'flex-end' },
  sheetWrapper: { justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: spacing.radiusXl, borderTopRightRadius: spacing.radiusXl, padding: spacing.space5, paddingBottom: spacing.space8 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.space4 },
  sheetTitle: { fontSize: typography.fontSizeLg, fontWeight: typography.weightBold, color: colors.gray900 },
  closeButton: { width: 30, height: 30, borderRadius: spacing.radiusFull, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  field: { marginBottom: spacing.space4 },
  label: { fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium, color: colors.gray700, marginBottom: spacing.space2 },
  input: { borderWidth: 1.5, borderColor: colors.gray200, borderRadius: spacing.radiusMd, paddingHorizontal: spacing.space4, paddingVertical: spacing.space3, fontSize: typography.fontSizeBase, color: colors.gray900 },
  textarea: { height: 70, textAlignVertical: 'top' },
  filePicker: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.space3, borderWidth: 1.5, borderColor: colors.gray200,
    borderStyle: 'dashed', borderRadius: spacing.radiusMd, padding: spacing.space4, marginBottom: spacing.space3,
  },
  filePickerText: { flex: 1, fontSize: typography.fontSizeSm, color: colors.gray700 },
  errorText: { color: colors.error, fontSize: typography.fontSizeSm, marginBottom: spacing.space3 },
  submitButton: { backgroundColor: colors.primary, borderRadius: spacing.radiusFull, paddingVertical: spacing.space4, alignItems: 'center' },
  submitButtonText: { color: colors.white, fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold },
});

export default UploadLectureModal;