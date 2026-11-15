import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../src/utils/api';
import { useTheme } from '../../../src/contexts/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddMeetingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData: any) => {
      const response = await api.post('/meetings', meetingData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      Alert.alert('Success ✅', 'Meeting created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create meeting');
    },
  });

  const handleCreateMeeting = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Meeting title is required');
      return;
    }

    // Combine date with time
    const startDateTime = new Date(meetingDate);
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    const endDateTime = new Date(meetingDate);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    if (endDateTime <= startDateTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    createMeetingMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>📅 New Meeting</Text>
        </View>

        {/* Form */}
        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Meeting Title *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.background, 
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Team Standup"
            placeholderTextColor={colors.textSecondary}
            editable={!createMeetingMutation.isPending}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { 
              backgroundColor: colors.background, 
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Meeting agenda and details..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!createMeetingMutation.isPending}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Location</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.background, 
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Conference Room A or Zoom"
            placeholderTextColor={colors.textSecondary}
            editable={!createMeetingMutation.isPending}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
          <TouchableOpacity
            style={[styles.dateTimeButton, { 
              backgroundColor: colors.background, 
              borderColor: colors.border 
            }]}
            onPress={() => setShowDatePicker(true)}
            disabled={createMeetingMutation.isPending}
          >
            <Text style={[styles.dateTimeText, { color: colors.text }]}>
              📅  {formatDate(meetingDate)}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={meetingDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setMeetingDate(selectedDate);
                }
              }}
              minimumDate={new Date()}
            />
          )}

          <View style={styles.timeRow}>
            <View style={styles.timeColumn}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Start Time</Text>
              <TouchableOpacity
                style={[styles.dateTimeButton, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border 
                }]}
                onPress={() => setShowStartTimePicker(true)}
                disabled={createMeetingMutation.isPending}
              >
                <Text style={[styles.dateTimeText, { color: colors.text }]}>
                  🕐  {formatTime(startTime)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeColumn}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>End Time</Text>
              <TouchableOpacity
                style={[styles.dateTimeButton, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border 
                }]}
                onPress={() => setShowEndTimePicker(true)}
                disabled={createMeetingMutation.isPending}
              >
                <Text style={[styles.dateTimeText, { color: colors.text }]}>
                  🕐  {formatTime(endTime)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedTime) => {
                setShowStartTimePicker(Platform.OS === 'ios');
                if (selectedTime) {
                  setStartTime(selectedTime);
                  // Auto-adjust end time to be 1 hour after start time
                  const newEndTime = new Date(selectedTime.getTime() + 60 * 60 * 1000);
                  setEndTime(newEndTime);
                }
              }}
            />
          )}

          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedTime) => {
                setShowEndTimePicker(Platform.OS === 'ios');
                if (selectedTime) {
                  setEndTime(selectedTime);
                }
              }}
            />
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.createButton, createMeetingMutation.isPending && styles.buttonDisabled]}
            onPress={handleCreateMeeting}
            disabled={createMeetingMutation.isPending}
          >
            <Text style={styles.createButtonText}>
              {createMeetingMutation.isPending ? 'Creating...' : '✓  Create Meeting'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.card }]}
            onPress={() => router.back()}
            disabled={createMeetingMutation.isPending}
          >
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipText}>• Use clear, descriptive titles</Text>
          <Text style={styles.tipText}>• Add meeting links in description</Text>
          <Text style={styles.tipText}>• Set realistic time durations</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#60A5FA',
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  formCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  dateTimeText: {
    fontSize: 15,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeColumn: {
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#34D399',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 13,
    color: '#B45309',
    marginBottom: 6,
    lineHeight: 20,
  },
});
