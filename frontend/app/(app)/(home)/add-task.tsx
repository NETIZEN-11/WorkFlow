import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, Modal } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../src/utils/api';
import dayjs from 'dayjs';

export default function AddTaskScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState('work');
  const [error, setError] = useState('');
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const priorities = ['low', 'medium', 'high'] as const;
  const categories = ['work', 'personal', 'health', 'finance', 'learning', 'other'];

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await api.post('/tasks', taskData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todays-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-statistics'] });
      router.back();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create task');
    },
  });

  const validateForm = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!dueDate) {
      setError('Due date is required');
      return false;
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
      dayjs(dueDate).format('YYYY-MM-DD') !== dueDate
    ) {
      setError('Enter a valid due date in YYYY-MM-DD format');
      return false;
    }
    if (!startTime || !endTime) {
      setError('Start and end time are required');
      return false;
    }
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    const start = dayjs(`${dueDate} ${startTime}`);
    const end = dayjs(`${dueDate} ${endTime}`);
    if (!timePattern.test(startTime) || !timePattern.test(endTime) || !end.isAfter(start)) {
      setError('Enter valid times and make sure the end time is after the start time');
      return false;
    }
    setError('');
    return true;
  };

  const handleCreateTask = async () => {
    if (!validateForm()) return;

    Keyboard.dismiss();

    const startDateTime = dayjs(`${dueDate} ${startTime}`).toISOString();
    const endDateTime = dayjs(`${dueDate} ${endTime}`).toISOString();

    createTaskMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      startTime: startDateTime,
      endTime: endDateTime,
      dueDate,
      completed: false,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Task</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Task Title *</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Enter task title"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
          editable={!createTaskMutation.isPending}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.inputField, styles.textArea]}
          placeholder="Add task description (optional)"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          editable={!createTaskMutation.isPending}
        />

        <Text style={styles.label}>Due Date *</Text>
        <TextInput
          style={styles.dateInput}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9CA3AF"
          keyboardType="numbers-and-punctuation"
          editable={!createTaskMutation.isPending}
        />

        <View style={styles.timeRow}>
          <View style={styles.timeColumn}>
            <Text style={styles.label}>Start Time *</Text>
            <TextInput
              style={styles.timeInput}
              placeholder="09:00"
              placeholderTextColor="#9CA3AF"
              value={startTime}
              onChangeText={setStartTime}
              keyboardType="numbers-and-punctuation"
              editable={!createTaskMutation.isPending}
            />
          </View>
          <View style={styles.timeColumn}>
            <Text style={styles.label}>End Time *</Text>
            <TextInput
              style={styles.timeInput}
              placeholder="10:00"
              placeholderTextColor="#9CA3AF"
              value={endTime}
              onChangeText={setEndTime}
              keyboardType="numbers-and-punctuation"
              editable={!createTaskMutation.isPending}
            />
          </View>
        </View>

        <View style={styles.selectRow}>
          <View style={styles.selectColumn}>
            <Text style={styles.label}>Priority</Text>
            <TouchableOpacity 
              style={styles.selectInput}
              onPress={() => setShowPriorityModal(true)}
            >
              <Text style={styles.selectInputText}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Text>
              <Text style={styles.selectIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectColumn}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity 
              style={styles.selectInput}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={styles.selectInputText}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <Text style={styles.selectIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity 
          style={[styles.button, createTaskMutation.isPending && styles.buttonDisabled]} 
          onPress={handleCreateTask}
          disabled={createTaskMutation.isPending}
        >
          {createTaskMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Task</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.back()}
          disabled={createTaskMutation.isPending}
        >
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPriorityModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPriorityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Priority</Text>
            {priorities.map((p) => (
              <TouchableOpacity
                key={p}
                style={styles.modalItem}
                onPress={() => {
                  setPriority(p);
                  setShowPriorityModal(false);
                }}
              >
                <View style={[styles.priorityBadge, { backgroundColor: p === 'high' ? '#EF4444' : p === 'medium' ? '#F59E0B' : '#10B981' }]} />
                <Text style={styles.modalItemText}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                {priority === p && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.modalItem}
                onPress={() => {
                  setCategory(c);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
                {category === c && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    fontSize: 14,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 14,
    color: '#1F2937',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeColumn: {
    flex: 1,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    fontSize: 14,
    color: '#1F2937',
  },
  selectRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selectColumn: {
    flex: 1,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectInputText: {
    fontSize: 14,
    color: '#1F2937',
  },
  selectIcon: {
    fontSize: 10,
    color: '#6B7280',
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    marginLeft: 8,
  },
  priorityBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkmark: {
    fontSize: 16,
    color: '#3B82F6',
  },
});
