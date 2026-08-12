import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getUser, clearAuth, setUser as saveUser } from '../../utils/secureStorage';
import { getFileUrl } from '../../utils/urls';
import { uploadProfilePhoto } from '../../api/usersApi';

function TeacherProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getUser().then(setUser);
    }, [])
  );

  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Needed', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', { uri: asset.uri, name: 'profile.jpg', type: 'image/jpeg' });

    try {
      const updated = await uploadProfilePhoto(formData);
      const currentUser = await getUser();
      const merged = { ...currentUser, profile_picture: updated.profile_picture };
      await saveUser(merged);
      setUser(merged);
    } catch (err) {
      Alert.alert('Error', 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await clearAuth();
          navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  }

  const menuItems = [
    { icon: 'user', label: 'Edit Profile', screen: 'EditProfile' },
    { icon: 'lock', label: 'Change Password', screen: 'ChangePassword' },
    { icon: 'help-circle', label: 'Help & Support', screen: null },
  ];

  return (
    <View style={styles.container}>
      {/* Top Banner Gradient Background */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={[colors.primaryDark || '#0F172A', '#1E293B']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.ambientGlow} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Screen Header */}
          <Text style={styles.headerTitle}>Profile</Text>

          {/* Profile Card / Hero Section */}
          <View style={styles.profileCard}>
            <Pressable onPress={handlePickPhoto} style={styles.avatarWrapper}>
              {user?.profile_picture ? (
                <Image source={{ uri: getFileUrl(user.profile_picture) }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{user?.full_name?.charAt(0) || 'T'}</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Feather name="camera" size={13} color={colors.white} />
                )}
              </View>
            </Pressable>

            <Text style={styles.name}>Ustadh {user?.full_name}</Text>
            <Text style={styles.email}>{user?.email}</Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user?.role || 'Teacher'}</Text>
            </View>
          </View>

          {/* Settings Menu List */}
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <Pressable
                key={item.label}
                style={[
                  styles.menuRow,
                  index < menuItems.length - 1 && styles.menuRowBorder,
                ]}
                onPress={() => item.screen && navigation.navigate(item.screen)}
              >
                <View style={styles.menuIconWrap}>
                  <Feather name={item.icon} size={18} color={colors.primaryDark || '#0F172A'} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={16} color={colors.gray400 || '#9CA3AF'} />
              </Pressable>
            ))}
          </View>

          {/* Logout Button */}
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={18} color={colors.error || '#EF4444'} />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50 || '#F8FAFC',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: colors.primaryDark || '#0F172A',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary || '#0D9488',
    opacity: 0.15,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.space6 || 24,
  },
  headerTitle: {
    fontSize: typography.fontSizeXl || 22,
    fontWeight: typography.weightBold || '700',
    color: '#FFFFFF',
    paddingHorizontal: spacing.space5 || 20,
    paddingTop: spacing.space3 || 12,
    paddingBottom: spacing.space4 || 16,
  },

  /* Card / Avatar Header */
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.white || '#FFFFFF',
    borderRadius: spacing.radiusLg || 16,
    marginHorizontal: spacing.space5 || 20,
    padding: spacing.space6 || 24,
    marginBottom: spacing.space5 || 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.space3 || 12,
  },
  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary || '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: typography.weightBold || '700',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary || '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: typography.fontSizeLg || 18,
    fontWeight: typography.weightBold || '700',
    color: colors.gray900 || '#0F172A',
  },
  email: {
    fontSize: typography.fontSizeSm || 14,
    color: colors.gray500 || '#64748B',
    marginTop: 2,
    marginBottom: spacing.space3 || 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    paddingHorizontal: spacing.space4 || 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: typography.fontSizeXs || 12,
    color: colors.primary || '#0D9488',
    fontWeight: typography.weightSemibold || '600',
    textTransform: 'capitalize',
  },

  /* Menu Items Section */
  menuCard: {
    backgroundColor: colors.white || '#FFFFFF',
    borderRadius: spacing.radiusLg || 16,
    marginHorizontal: spacing.space5 || 20,
    marginBottom: spacing.space5 || 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space3 || 12,
    padding: spacing.space4 || 16,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100 || '#F1F5F9',
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.gray50 || '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.fontSizeSm || 14,
    fontWeight: typography.weightMedium || '500',
    color: colors.gray900 || '#0F172A',
  },

  /* Action Logout */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.space2 || 8,
    marginHorizontal: spacing.space5 || 20,
    backgroundColor: colors.white || '#FFFFFF',
    borderRadius: spacing.radiusLg || 16,
    padding: spacing.space4 || 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  logoutText: {
    fontSize: typography.fontSizeSm || 14,
    fontWeight: typography.weightSemibold || '600',
    color: colors.error || '#EF4444',
  },
});

export default TeacherProfileScreen;