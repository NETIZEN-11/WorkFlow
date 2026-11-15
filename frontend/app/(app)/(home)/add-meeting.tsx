import { useState } from 'react';
import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../../../src/utils/api';

export default function AddMeetingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [error, setError] = useState('');

  const createMeetingMutation = useMutation({
    mutationFn: async () => {
      const start = new Date(`${date}T${startTime}:00`);
      const end = new Date(`${date}T${endTime}:00`);
      const response = await api.post('/meetings', {
        title: title.trim(),
        description: description.trim(),
        date: start.toISOString(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-meetings'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-meetings'] });
      router.back();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create meeting');
    },
  });

  const handleCreateMeeting = () => {
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (!title.trim()) {
      setError('Meeting title is required');
      return;
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(start.getTime()) ||
      dayjs(date).format('YYYY-MM-DD') !== date
    ) {
      setError('Enter a valid date in YYYY-MM-DD format');
      return;
    }
    if (!timePattern.test(startTime) || !timePattern.test(endTime) || end <= start) {
      setError('Enter valid times and make sure the end time is after the start time');
      return;
    }

    setError('');
    Keyboard.dismiss();
    createMeetingMutation.mutate();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={createMeetingMutation.isPending}>
          <Text style={styles.closeButton}>×</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Meeting</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Meeting Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter meeting title"
          placeholderTextColor="#9CA3AF"
          editable={!createMeetingMutation.isPending}
        />
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.description]}
          value={description}
          onChangeText={setDescription}
          placeholder="Optional description"
          placeholderTextColor="#9CA3AF"
          multiline
          editable={!createMeetingMutation.isPending}
        />
        <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9CA3AF"
          keyboardType="numbers-and-punctuation"
          editable={!createMeetingMutation.isPending}
        />
        <View style={styles.timeRow}>
          <View style={styles.timeColumn}>
            <Text style={styles.label}>Start (HH:mm) *</Text>
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="09:00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numbers-and-punctuation"
              editable={!createMeetingMutation.isPending}
            />
          </View>
          <View style={styles.timeColumn}>
            <Text style={styles.label}>End (HH:mm) *</Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="10:00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numbers-and-punctuation"
              editable={!createMeetingMutation.isPending}
            />
          </View>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleCreateMeeting}
          disabled={createMeetingMutation.isPending}
        >
          {createMeetingMutation.isPending
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.submitText}>Create Meeting</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  closeButton: { color: '#6B7280', fontSize: 28, width: 24 },
  title: { color: '#1F2937', fontSize: 20, fontWeight: '600' },
  headerSpacer: { width: 24 },
  form: { gap: 12 },
  label: { color: '#1F2937', fontSize: 14, fontWeight: '600', marginBottom: -6 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F9FAFB', color: '#1F2937', fontSize: 14 },
  description: { minHeight: 80, textAlignVertical: 'top' },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeColumn: { flex: 1, gap: 12 },
  error: { color: '#EF4444', fontSize: 12 },
  submitButton: { backgroundColor: '#3B82F6', borderRadius: 8, paddingVertical: 13, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
