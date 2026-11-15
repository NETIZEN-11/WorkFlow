import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import api from '../../../src/utils/api';
import dayjs from 'dayjs';

interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  dueDate: string;
}

export default function PlannerScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [refreshing, setRefreshing] = useState(false);

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ['planner-tasks', selectedDate],
    queryFn: async () => {
      const response = await api.get('/tasks', { params: { date: selectedDate } });
      return response.data.data || [];
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const completedCount = tasks.filter((t: Task) => t.completed).length;
  const pendingCount = tasks.filter((t: Task) => !t.completed).length;

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#F87171';
      case 'medium':
        return '#FBBF24';
      case 'low':
        return '#34D399';
      default:
        return '#60A5FA';
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.taskCard, item.completed && styles.completedTask]}
      activeOpacity={0.7}
    >
      <View style={styles.taskHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: priorityColor(item.priority) + '20' }]}>
          <Text style={[styles.priorityText, { color: priorityColor(item.priority) }]}>
            {item.priority.toUpperCase()}
          </Text>
        </View>
        <View style={[styles.statusBadge, item.completed && styles.completedBadge]}>
          <Text style={styles.statusText}>{item.completed ? '✓' : '○'}</Text>
        </View>
      </View>
      <Text style={[styles.taskTitle, item.completed && styles.completedText]}>{item.title}</Text>
      <View style={styles.taskFooter}>
        <Text style={styles.taskTime}>
          🕐 {dayjs(item.startTime).format('HH:mm')} - {dayjs(item.endTime).format('HH:mm')}
        </Text>
      </View>
      {item.description && (
        <Text style={styles.taskDescription} numberOfLines={2}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );

  const renderDatePicker = () => {
    const dates = Array.from({ length: 7 }, (_, i) => dayjs().add(i, 'day'));

    return (
      <FlatList
        data={dates}
        keyExtractor={(date) => date.format('YYYY-MM-DD')}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datePickerContainer}
        renderItem={({ item: date }) => {
          const isSelected = selectedDate === date.format('YYYY-MM-DD');
          const isToday = date.isSame(dayjs(), 'day');
          return (
            <TouchableOpacity
              style={[styles.dateButton, isSelected && styles.selectedDateButton]}
              onPress={() => setSelectedDate(date.format('YYYY-MM-DD'))}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateDayText, isSelected && styles.selectedDateText]}>
                {date.format('ddd')}
              </Text>
              <Text style={[styles.dateNumberText, isSelected && styles.selectedDateText]}>
                {date.format('DD')}
              </Text>
              {isToday && !isSelected && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📋 Daily Planner</Text>
          <Text style={styles.subtitle}>{dayjs(selectedDate).format('MMMM YYYY')}</Text>
        </View>

        {renderDatePicker()}

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
            <Text style={[styles.statNumber, { color: '#1E40AF' }]}>{completedCount}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.statNumber, { color: '#B45309' }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E0E7FF' }]}>
            <Text style={[styles.statNumber, { color: '#4338CA' }]}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#60A5FA" />
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item._id}
            renderItem={renderTaskItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyText}>No tasks for this day</Text>
                <Text style={styles.emptySubText}>Start planning your day!</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  datePickerContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  dateButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minWidth: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedDateButton: {
    backgroundColor: '#60A5FA',
  },
  dateDayText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  dateNumberText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: 'bold',
    marginTop: 2,
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#60A5FA',
    marginTop: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  completedTask: {
    opacity: 0.6,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 14,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskFooter: {
    marginBottom: 6,
  },
  taskTime: {
    fontSize: 12,
    color: '#64748B',
  },
  taskDescription: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
