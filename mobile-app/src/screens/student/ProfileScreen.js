import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getUser, clearAuth, setUser as saveUser } from '../../utils/secureStorage';
import { getFileUrl } from '../../utils/urls';
import { uploadProfilePhoto } from '../../api/usersApi';

export default function ProfileScreen({ navigation }) {
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
      Alert.alert(
        'Permission Needed',
        'Please allow photo library access to change your profile picture.'
      );
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
    formData.append('photo', {
      uri: asset.uri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });

    try {
      const updated = await uploadProfilePhoto(formData);
      const currentUser = await getUser();
      const merged = { ...currentUser, profile_picture: updated.profile_picture };
      await saveUser(merged);
      setUser(merged);
    } catch (err) {
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
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

  const accountSettings = [
    { icon: 'user', label: 'Edit Profile', screen: 'EditProfile' },
    { icon: 'lock', label: 'Change Password', screen: 'ChangePassword' },
  ];

  const appSettings = [
    { icon: 'help-circle', label: 'Help & Support', screen: null },
    { icon: 'shield', label: 'Privacy Policy', screen: null },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Feather name="settings" size={20} color={colors.primary || '#0D9488'} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Identity Banner Card */}
        <View style={styles.profileCard}>
          <Pressable onPress={handlePickPhoto} style={styles.avatarWrapper}>
            {user?.profile_picture ? (
              <Image
                source={{ uri: getFileUrl(user.profile_picture) }}
                style={styles.avatarImg}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {user?.full_name?.charAt(0) || 'S'}
                </Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather name="camera" size={13} color="#FFFFFF" />
              )}
            </View>
          </Pressable>

          <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>

          {user?.role ? (
            <View style={styles.roleBadge}>
              <Feather name="award" size={12} color={colors.primary || '#0D9488'} />
              <Text style={styles.roleBadgeText}>{user.role}</Text>
            </View>
          ) : null}
        </View>

        {/* Account Section */}
        <Text style={styles.sectionHeaderTitle}>ACCOUNT SETTINGS</Text>
        <View style={styles.menuCard}>
          {accountSettings.map((item, index) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.menuRow,
                index < accountSettings.length - 1 && styles.menuRowBorder,
                pressed && styles.rowPressed,
              ]}
              onPress={() => item.screen && navigation.navigate(item.screen)}
            >
              <View style={styles.menuIconWrap}>
                <Feather name={item.icon} size={18} color={colors.primary || '#0D9488'} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color={colors.gray400 || '#9CA3AF'} />
            </Pressable>
          ))}
        </View>

        {/* General Support Section */}
        <Text style={styles.sectionHeaderTitle}>SUPPORT & INFORMATION</Text>
        <View style={styles.menuCard}>
          {appSettings.map((item, index) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.menuRow,
                index < appSettings.length - 1 && styles.menuRowBorder,
                pressed && styles.rowPressed,
              ]}
              onPress={() => item.screen && navigation.navigate(item.screen)}
            >
              <View style={styles.menuIconWrap}>
                <Feather name={item.icon} size={18} color={colors.primary || '#0D9488'} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color={colors.gray400 || '#9CA3AF'} />
            </Pressable>
          ))}
        </View>

        {/* Action Button */}
        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.rowPressed]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: typography.fontSizeXl || 22,
    fontWeight: '700',
    color: colors.primaryDark || '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },

  /* Identity Card Styling */
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
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
    fontWeight: '700',
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
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900 || '#111827',
  },
  userEmail: {
    fontSize: 13,
    color: colors.gray500 || '#6B7280',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentLight || '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    color: colors.primary || '#0D9488',
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  /* Group Headers & List Section Card */
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray400 || '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100 || '#F3F4F6',
  },
  rowPressed: {
    backgroundColor: colors.gray50 || '#F9FAFB',
    opacity: 0.8,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentLight || '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray900 || '#111827',
  },

  /* Logout Button */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 4,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
});