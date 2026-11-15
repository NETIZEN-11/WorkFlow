import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../../src/utils/api';

interface Habit {
  _id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
  streak: number;
  completed_today: boolean;
  createdAt: string;
}

export default function HabitsScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [newHabitCategory, setNewHabitCategory] = useState('health');

  const { data: habits = [], isLoading, refetch } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const response = await api.get('/habits');
      return response.data.data || [];
    },
  });

  const createHabitMutation = useMutation({
    mutationFn: async (habitData: any) => {
      const response = await api.post('/habits', {
        ...habitData,
        name: habitData.title,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setNewHabitTitle('');
      setNewHabitDescription('');
      setNewHabitFrequency('daily');
      setNewHabitCategory('health');
      setShowAddModal(false);
    },
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      const response = await api.post(`/habits/${habitId}/logs`, {
        date: new Date().toISOString(),
        completed: !habits.find((habit: Habit) => habit._id === habitId)?.completed_today,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      await api.delete(`/habits/${habitId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateHabit = () => {
    if (!newHabitTitle.trim()) return;

    createHabitMutation.mutate({
      title: newHabitTitle.trim(),
      description: newHabitDescription.trim(),
      frequency: newHabitFrequency,
      category: newHabitCategory,
    });
  };

  const completedTodayCount = habits.filter((h: Habit) => h.completed_today).length;
  const totalHabits = habits.length;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      health: '#10B981',
      fitness: '#EF4444',
      learning: '#3B82F6',
      productivity: '#F59E0B',
      mindfulness: '#8B5CF6',
      social: '#EC4899',
      other: '#6B7280',
    };
    return colors[category] || '#3B82F6';
  };

  const renderHabitItem = ({ item }: { item: Habit }) => (
    <View style={styles.habitItem}>
      <TouchableOpacity
        style={[
          styles.habitCheckbox,
          item.completed_today && styles.habitCheckboxCompleted,
        ]}
        onPress={() => toggleHabitMutation.mutate(item._id)}
        disabled={toggleHabitMutation.isPending}
      >
        {item.completed_today && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.habitContent}>
        <Text
          style={[
            styles.habitTitle,
            item.completed_today && styles.habitTitleCompleted,
          ]}
        >
          {item.name}
        </Text>
        {item.description && (
          <Text style={styles.habitDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}
        <View style={styles.habitMeta}>
          <View
            style={[
              styles.frequencyBadge,
              { backgroundColor: getCategoryColor(item.category) + '20' },
            ]}
          >
            <Text
              style={[
                styles.frequencyBadgeText,
                { color: getCategoryColor(item.category) },
              ]}
            >
              {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{item.streak} day streak</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => deleteHabitMutation.mutate(item._id)}
        disabled={deleteHabitMutation.isPending}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Habits</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Habit</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedTodayCount}</Text>
          <Text style={styles.statLabel}>Completed Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalHabits}</Text>
          <Text style={styles.statLabel}>Active Habits</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0}%
          </Text>
          <Text style={styles.statLabel}>Completion Rate</Text>
        </View>
      </View>

      {/* Habits List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={habits}
          renderItem={renderHabitItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No habits yet</Text>
              <Text style={styles.emptySubText}>Create your first habit to get started</Text>
            </View>
          }
        />
      )}

      {/* Add Habit Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Habit</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.label}>Habit Title *</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g., Morning Exercise"
                placeholderTextColor="#9CA3AF"
                value={newHabitTitle}
                onChangeText={setNewHabitTitle}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.inputField, styles.textArea]}
                placeholder="Optional description"
                placeholderTextColor="#9CA3AF"
                value={newHabitDescription}
                onChangeText={setNewHabitDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Frequency</Text>
              <View style={styles.frequencyGroup}>
                {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyOption,
                      newHabitFrequency === freq && styles.frequencyOptionActive,
                    ]}
                    onPress={() => setNewHabitFrequency(freq)}
                  >
                    <Text
                      style={[
                        styles.frequencyOptionText,
                        newHabitFrequency === freq && styles.frequencyOptionTextActive,
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGroup}>
                {['health', 'fitness', 'learning', 'productivity', 'mindfulness'].map(
                  (cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        {
                          backgroundColor:
                            newHabitCategory === cat
                              ? getCategoryColor(cat)
                              : getCategoryColor(cat) + '20',
                        },
                      ]}
                      onPress={() => setNewHabitCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          {
                            color:
                              newHabitCategory === cat ? '#FFFFFF' : getCategoryColor(cat),
                          },
                        ]}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  createHabitMutation.isPending && styles.createButtonDisabled,
                ]}
                onPress={handleCreateHabit}
                disabled={createHabitMutation.isPending || !newHabitTitle.trim()}
              >
                {createHabitMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>Create Habit</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                disabled={createHabitMutation.isPending}
              >
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  habitCheckbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitCheckboxCompleted: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  checkmark: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: 'bold',
  },
  habitContent: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  habitTitleCompleted: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  habitDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  habitMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  frequencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  frequencyBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakIcon: {
    fontSize: 12,
  },
  streakText: {
    fontSize: 10,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 12,
    color: '#9CA3AF',
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
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalForm: {
    paddingHorizontal: 16,
    paddingTop: 20,
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
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  frequencyGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  frequencyOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  frequencyOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  frequencyOptionTextActive: {
    color: '#FFFFFF',
  },
  categoryGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '500',
  },
});
