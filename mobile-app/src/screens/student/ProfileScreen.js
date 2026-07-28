import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getUser, clearAuth } from '../../utils/secureStorage';
import { getFileUrl } from '../../utils/urls';

function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await clearAuth();
          navigation.getParent()?.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  }

  const menuItems = [
    { icon: 'user', label: 'Edit Profile' },
    { icon: 'lock', label: 'Change Password' },
    { icon: 'bell', label: 'Notifications' },
    { icon: 'help-circle', label: 'Help & Support' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.profileCard}>
        {user?.profile_picture ? (
          <Image source={{ uri: getFileUrl(user.profile_picture) }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{user?.full_name?.charAt(0) || 'S'}</Text>
          </View>
        )}
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{user?.role}</Text>
        </View>
      </View>

      <View style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <Pressable key={item.label} style={[styles.menuRow, index < menuItems.length - 1 && styles.menuRowBorder]}>
            <View style={styles.menuIconWrap}>
              <Feather name={item.icon} size={17} color={colors.primaryDark} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Feather name="chevron-right" size={16} color={colors.gray300} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Feather name="log-out" size={17} color={colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: {
    fontSize: typography.fontSizeXl, fontWeight: typography.weightBold, color: colors.primaryDark,
    paddingHorizontal: spacing.space5, paddingTop: spacing.space4, paddingBottom: spacing.space3,
  },
  profileCard: {
    alignItems: 'center', backgroundColor: colors.white, borderRadius: spacing.radiusLg,
    marginHorizontal: spacing.space5, padding: spacing.space6, marginBottom: spacing.space5,
  },
  avatarImg: { width: 80, height: 80, borderRadius: spacing.radiusFull, marginBottom: spacing.space3 },
  avatarFallback: {
    width: 80, height: 80, borderRadius: spacing.radiusFull, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.space3,
  },
  avatarText: { color: colors.white, fontSize: 32, fontWeight: typography.weightBold },
  name: { fontSize: typography.fontSizeLg, fontWeight: typography.weightBold, color: colors.gray900 },
  email: { fontSize: typography.fontSizeSm, color: colors.gray500, marginTop: 2, marginBottom: spacing.space3 },
  roleBadge: { backgroundColor: colors.accentLight, paddingHorizontal: spacing.space3, paddingVertical: 3, borderRadius: spacing.radiusFull },
  roleBadgeText: { fontSize: typography.fontSizeXs, color: colors.primaryDark, fontWeight: typography.weightMedium, textTransform: 'capitalize' },
  menuCard: {
    backgroundColor: colors.white, borderRadius: spacing.radiusLg,
    marginHorizontal: spacing.space5, marginBottom: spacing.space5, overflow: 'hidden',
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, padding: spacing.space4 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  menuIconWrap: {
    width: 34, height: 34, borderRadius: spacing.radiusMd, backgroundColor: colors.gray50,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: typography.fontSizeSm, color: colors.gray900 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.space2,
    marginHorizontal: spacing.space5, backgroundColor: colors.white, borderRadius: spacing.radiusLg,
    padding: spacing.space4,
  },
  logoutText: { fontSize: typography.fontSizeSm, fontWeight: typography.weightSemibold, color: colors.error },
});

export default ProfileScreen;