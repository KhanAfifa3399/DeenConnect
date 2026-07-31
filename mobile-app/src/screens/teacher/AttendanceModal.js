import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ActivityIndicator, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getSessionAttendance, markAttendance } from '../../api/attendanceApi';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
];

function AttendanceModal({ visible, session, onClose }) {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (visible && session) {
      loadRoster();
    }
  }, [visible, session]);

  async function loadRoster() {
    setLoading(true);
    try {
      const data = await getSessionAttendance(session.id);
      setRoster(data);
    } catch (err) {
      console.error('Failed to load roster:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMark(studentId, status) {
    setSavingId(studentId);
    try {
      await markAttendance(session.id, studentId, status);
      setRoster((prev) => prev.map((s) => (s.student_id === studentId ? { ...s, status } : s)));
    } catch (err) {
      console.error('Failed to mark attendance:', err);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={onClose} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.gray900} />
          </Pressable>
          <Text style={styles.topBarTitle} numberOfLines={1}>{session?.title} — Attendance</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.space10 }} />
        ) : (
          <FlatList
            data={roster}
            keyExtractor={(item) => String(item.student_id)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.rosterRow}>
                <Text style={styles.studentName} numberOfLines={1}>{item.student_name}</Text>
                <View style={styles.statusButtons}>
                  {STATUS_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[styles.statusBtn, item.status === opt.value && styles[`active_${opt.value}`]]}
                      onPress={() => handleMark(item.student_id, opt.value)}
                      disabled={savingId === item.student_id}
                    >
                      <Text style={[styles.statusBtnText, item.status === opt.value && styles.statusBtnTextActive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No students enrolled in this course.</Text>}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50, paddingTop: 50 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, paddingHorizontal: spacing.space4, paddingBottom: spacing.space3, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  backButton: { padding: 4 },
  topBarTitle: { flex: 1, fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold, color: colors.gray900 },
  listContent: { padding: spacing.space5 },
  rosterRow: { backgroundColor: colors.white, borderRadius: spacing.radiusLg, padding: spacing.space4, marginBottom: spacing.space3, gap: spacing.space3 },
  studentName: { fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium, color: colors.gray900 },
  statusButtons: { flexDirection: 'row', gap: spacing.space2, flexWrap: 'wrap' },
  statusBtn: { paddingHorizontal: spacing.space3, paddingVertical: spacing.space2, borderRadius: spacing.radiusFull, borderWidth: 1, borderColor: colors.gray200 },
  statusBtnText: { fontSize: 11, color: colors.gray600 },
  statusBtnTextActive: { color: colors.white, fontWeight: typography.weightMedium },
  active_present: { backgroundColor: colors.success, borderColor: colors.success },
  active_late: { backgroundColor: colors.warning, borderColor: colors.warning },
  active_absent: { backgroundColor: colors.error, borderColor: colors.error },
  active_excused: { backgroundColor: colors.gray500, borderColor: colors.gray500 },
  emptyText: { textAlign: 'center', color: colors.gray500, marginTop: spacing.space8 },
});

export default AttendanceModal;