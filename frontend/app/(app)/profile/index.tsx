import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store/authStore';
import { useAppStore } from '../../../src/store/appStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import api from '../../../src/utils/api';
import { useTheme } from '../../../src/contexts/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, logout, setUser, setTheme: setUserTheme } = useAuthStore();
  const { theme, notificationsEnabled, setTheme, setNotificationsEnabled } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState(user?.firstName || '');
  const [editedLastName, setEditedLastName] = useState(user?.lastName || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);
  const timezones = [
    'UTC',
    'America/Los_Angeles',
    'America/New_York',
    'Europe/London',
    'Europe/Paris',
    'Asia/Kolkata',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  useEffect(() => {
    if (user) {
      setTheme(user.theme);
      setNotificationsEnabled(user.notificationsEnabled);
    }
  }, [setNotificationsEnabled, setTheme, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await api.put('/auth/profile', profileData);
      return response.data.user;
    },
    onSuccess: (data) => {
      setUser(data);
      setIsEditing(false);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => api.delete('/auth/account'),
    onSuccess: () => {
      logout();
      router.replace('/');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete account');
    },
  });

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  const handleSaveProfile = () => {
    if (!editedFirstName.trim() || !editedLastName.trim() || !editedEmail.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedEmail.trim())) {
      Alert.alert('Error', 'Enter a valid email address');
      return;
    }

    updateProfileMutation.mutate({
      firstName: editedFirstName.trim(),
      lastName: editedLastName.trim(),
      email: editedEmail.trim(),
      timezone,
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]} edges={['top']}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>👤 Profile</Text>
        </View>

        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card }]}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>
              {user.firstName.charAt(0).toUpperCase()}
              {user.lastName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
            <Text style={[styles.userTimezone, { color: colors.textSecondary }]}>
              🌍 {user.timezone}
            </Text>
          </View>
        </View>

        {/* Edit Profile Section */}
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>✏️  Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.editForm, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Edit Profile</Text>

            <Text style={[styles.label, { color: colors.textSecondary }]}>First Name</Text>
            <TextInput
              style={[styles.inputField, { 
                backgroundColor: colors.background, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={editedFirstName}
              onChangeText={setEditedFirstName}
              placeholder="First name"
              placeholderTextColor={colors.textSecondary}
              editable={!updateProfileMutation.isPending}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Last Name</Text>
            <TextInput
              style={[styles.inputField, { 
                backgroundColor: colors.background, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={editedLastName}
              onChangeText={setEditedLastName}
              placeholder="Last name"
              placeholderTextColor={colors.textSecondary}
              editable={!updateProfileMutation.isPending}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.inputField, { 
                backgroundColor: colors.background, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={editedEmail}
              onChangeText={setEditedEmail}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              editable={!updateProfileMutation.isPending}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Timezone</Text>
            <TouchableOpacity
              style={[styles.selectInput, { 
                backgroundColor: colors.background, 
                borderColor: colors.border 
              }]}
              onPress={() => setShowTimezonePicker(true)}
              disabled={updateProfileMutation.isPending}
            >
              <Text style={[styles.selectInputText, { color: colors.text }]}>{timezone}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, updateProfileMutation.isPending && styles.buttonDisabled]}
              onPress={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsEditing(false)}
              disabled={updateProfileMutation.isPending}
            >
              <Text style={[styles.cancelButton, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⚙️ Settings</Text>

          <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.themeToggle, theme === 'dark' && styles.themeToggleDark]}
                onPress={async () => {
                  const nextTheme = theme === 'light' ? 'dark' : 'light';
                  try {
                    const response = await api.put('/auth/profile', { theme: nextTheme });
                    setUser(response.data.user);
                    setUserTheme(nextTheme);
                    setTheme(nextTheme);
                  } catch (error: any) {
                    Alert.alert('Error', error.response?.data?.message || 'Failed to update theme');
                  }
                }}
              >
                <View
                  style={[
                    styles.themeToggleCircle,
                    theme === 'dark' && styles.themeToggleCircleDark,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {notificationsEnabled ? '🔔 Enabled' : '🔕 Disabled'}
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={async (enabled) => {
                  if (enabled) {
                    const { status } = await Notifications.requestPermissionsAsync();
                    if (status !== 'granted') {
                      Alert.alert('Permission required', 'Enable notifications in system settings to receive reminders.');
                      return;
                    }
                  }

                  try {
                    const response = await api.put('/auth/profile', { notificationsEnabled: enabled });
                    setUser(response.data.user);
                    setNotificationsEnabled(enabled);
                  } catch (error: any) {
                    Alert.alert('Error', error.response?.data?.message || 'Failed to update notification settings');
                  }
                }}
                trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                thumbColor={notificationsEnabled ? '#34D399' : '#9CA3AF'}
              />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>ℹ️ About</Text>
          
          <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Privacy Policy', 'A privacy policy has not been configured for this application.')}
            >
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy Policy</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  View our privacy policy
                </Text>
              </View>
              <Text style={[styles.arrow, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Terms & Conditions', 'Terms of service have not been configured for this application.')}
            >
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Terms & Conditions</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  View terms of service
                </Text>
              </View>
              <Text style={[styles.arrow, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('About DailyFlow', 'DailyFlow v1.0.0\n\nYour personal productivity companion')}
            >
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>About DailyFlow</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Version 1.0.0
                </Text>
              </View>
              <Text style={[styles.arrow, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleLogout}
          >
            <Text style={styles.dangerButtonText}>🚪  Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={() => Alert.alert(
              'Delete account',
              'This permanently deletes your account and all associated data.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteAccountMutation.mutate() },
              ]
            )}
            disabled={deleteAccountMutation.isPending}
          >
            {deleteAccountMutation.isPending
              ? <ActivityIndicator color="#F87171" />
              : <Text style={styles.deleteAccountButtonText}>🗑️  Delete Account</Text>}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>DailyFlow v1.0.0</Text>
          <Text style={[styles.footerDate, { color: colors.textSecondary }]}>
            Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : '—'}
          </Text>
        </View>
      </ScrollView>

      {/* Timezone Picker Modal */}
      <Modal
        visible={showTimezonePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimezonePicker(false)}
      >
        <View style={styles.timezoneOverlay}>
          <View style={[styles.timezoneModal, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Timezone</Text>
            <ScrollView style={styles.timezoneList}>
              {timezones.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.timezoneOption, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setTimezone(item);
                    setShowTimezonePicker(false);
                  }}
                >
                  <Text style={[styles.timezoneText, { color: colors.text }]}>{item}</Text>
                  {timezone === item && <Text style={styles.timezoneCheckmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowTimezonePicker(false)}>
              <Text style={[styles.cancelButton, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 12,
    paddingTop: 4,
    paddingBottom: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#60A5FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatar: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 11,
    marginBottom: 2,
  },
  userTimezone: {
    fontSize: 10,
  },
  editButton: {
    backgroundColor: '#60A5FA',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  editForm: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    marginBottom: 8,
  },
  selectInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectInputText: {
    fontSize: 12,
  },
  button: {
    backgroundColor: '#60A5FA',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 5,
    fontWeight: '500',
  },
  section: {
    marginBottom: 10,
  },
  settingCard: {
    borderRadius: 12,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 10,
  },
  themeToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
    padding: 2,
    justifyContent: 'center',
  },
  themeToggleDark: {
    backgroundColor: '#60A5FA',
  },
  themeToggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  themeToggleCircleDark: {
    alignSelf: 'flex-end',
  },
  divider: {
    height: 1,
    marginHorizontal: 10,
  },
  arrow: {
    fontSize: 16,
    marginLeft: 8,
  },
  dangerZone: {
    marginBottom: 10,
  },
  dangerButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButtonText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteAccountButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteAccountButtonText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },
  timezoneOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timezoneModal: {
    maxHeight: '70%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
  },
  timezoneList: {
    maxHeight: 360,
  },
  timezoneOption: {
    minHeight: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 2,
  },
  timezoneText: {
    fontSize: 12,
  },
  timezoneCheckmark: {
    fontSize: 14,
    color: '#60A5FA',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    marginTop: 8,
  },
  footerText: {
    fontSize: 10,
    marginBottom: 2,
  },
  footerDate: {
    fontSize: 9,
  },
});
