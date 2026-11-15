import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store/authStore';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import api from '../../../src/utils/api';
import dayjs from 'dayjs';
import { useEffect, useState, useMemo } from 'react';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme, colors: themeColors } = useTheme();
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch today's tasks and statistics
  const { data: taskStats } = useQuery({
    queryKey: ['task-statistics'],
    queryFn: async () => {
      const response = await api.get('/tasks/statistics');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: todaysTasks } = useQuery({
    queryKey: ['todays-tasks', dayjs().format('YYYY-MM-DD')],
    queryFn: async () => {
      const today = dayjs().format('YYYY-MM-DD');
      const response = await api.get('/tasks', { params: { date: today } });
      return response.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: upcomingMeetings } = useQuery({
    queryKey: ['upcoming-meetings'],
    queryFn: async () => {
      const response = await api.get('/meetings/upcoming');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const completedTodayCount = useMemo(() => 
    todaysTasks?.filter((t: any) => t.completed).length || 0, 
    [todaysTasks]
  );
  
  const pendingTodayCount = useMemo(() => 
    todaysTasks?.filter((t: any) => !t.completed).length || 0, 
    [todaysTasks]
  );
  
  const totalTasks = todaysTasks?.length || 0;
  
  const completionRate = useMemo(() => 
    totalTasks > 0 ? Math.round((completedTodayCount / totalTasks) * 100) : 0,
    [completedTodayCount, totalTasks]
  );

  const getGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ Good Morning';
    if (hour < 17) return '🌤️ Good Afternoon';
    return '🌙 Good Evening';
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.backgroundSecondary }]} edges={['top']}>
      <ScrollView 
        style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient Header */}
        <View style={styles.headerGradient}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting}</Text>
              <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/(app)/profile')}
            >
              <Text style={styles.profileInitial}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Live Clock Card */}
          <View style={styles.clockCard}>
            <Text style={styles.dateText}>{dayjs().format('dddd, MMMM D, YYYY')}</Text>
            <Text style={styles.clock}>{now.format('HH:mm:ss')}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {completionRate}% Daily Progress
            </Text>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.sectionTitle}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>📊 Today's Overview</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardBlue]}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statNumber}>{completedTodayCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={[styles.statCard, styles.statCardOrange]}>
              <Text style={styles.statIcon}>⏳</Text>
              <Text style={styles.statNumber}>{pendingTodayCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={[styles.statCard, styles.statCardGreen]}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={styles.statNumber}>{taskStats?.totalTasks || 0}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
            <View style={[styles.statCard, styles.statCardPurple]}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statNumber}>{upcomingMeetings?.length || 0}</Text>
              <Text style={styles.statLabel}>Meetings</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(app)/(home)/add-task')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.actionEmoji}>➕</Text>
              </View>
              <Text style={styles.actionText}>Add Task</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('./add-meeting')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                <Text style={styles.actionEmoji}>📅</Text>
              </View>
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(app)/focus')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.actionEmoji}>⏱️</Text>
              </View>
              <Text style={styles.actionText}>Focus</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(app)/calendar')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.actionEmoji}>📆</Text>
              </View>
              <Text style={styles.actionText}>Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📝 Today's Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/planner')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tasksContainer}>
            {todaysTasks && todaysTasks.length > 0 ? (
              todaysTasks.slice(0, 4).map((task: any) => (
                <View key={task._id} style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: 
                        task.priority === 'high' ? '#FEE2E2' : 
                        task.priority === 'medium' ? '#FEF3C7' : '#DBEAFE'
                      }
                    ]}>
                      <Text style={[
                        styles.priorityText,
                        { color: 
                          task.priority === 'high' ? '#DC2626' : 
                          task.priority === 'medium' ? '#F59E0B' : '#2563EB'
                        }
                      ]}>
                        {task.priority?.toUpperCase() || 'LOW'}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: task.completed ? '#10B981' : '#F59E0B' }
                    ]} />
                  </View>
                  <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
                  <View style={styles.taskFooter}>
                    <Text style={styles.taskTime}>
                      🕐 {dayjs(task.startTime).format('HH:mm')} - {dayjs(task.endTime).format('HH:mm')}
                    </Text>
                    <Text style={[
                      styles.taskStatus,
                      { color: task.completed ? '#10B981' : '#F59E0B' }
                    ]}>
                      {task.completed ? '✓ Done' : '○ Pending'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyText}>No tasks scheduled for today</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => router.push('/(app)/(home)/add-task')}
                >
                  <Text style={styles.addButtonText}>+ Add Your First Task</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Upcoming Meetings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎬 Upcoming Meetings</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/calendar')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.meetingsContainer}>
            {upcomingMeetings && upcomingMeetings.length > 0 ? (
              upcomingMeetings.slice(0, 3).map((meeting: any) => (
                <View key={meeting._id} style={styles.meetingCard}>
                  <View style={styles.meetingIcon}>
                    <Text style={styles.meetingIconText}>📹</Text>
                  </View>
                  <View style={styles.meetingContent}>
                    <Text style={styles.meetingTitle} numberOfLines={1}>{meeting.title}</Text>
                    <Text style={styles.meetingTime}>
                      📅 {dayjs(meeting.startTime).format('MMM D, YYYY')} at {dayjs(meeting.startTime).format('HH:mm')}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyStateMini}>
                <Text style={styles.emptyTextMini}>No upcoming meetings</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  content: {
    paddingBottom: 100,
  },
  headerGradient: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#DBEAFE',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  clockCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#DBEAFE',
    marginBottom: 8,
  },
  clock: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 0.48,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardBlue: {
    backgroundColor: '#EFF6FF',
  },
  statCardOrange: {
    backgroundColor: '#FFF7ED',
  },
  statCardGreen: {
    backgroundColor: '#F0FDF4',
  },
  statCardPurple: {
    backgroundColor: '#FAF5FF',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  tasksContainer: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    lineHeight: 22,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTime: {
    fontSize: 13,
    color: '#64748B',
  },
  taskStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  meetingsContainer: {
    gap: 12,
  },
  meetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  meetingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  meetingIconText: {
    fontSize: 24,
  },
  meetingContent: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  meetingTime: {
    fontSize: 13,
    color: '#64748B',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateMini: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyTextMini: {
    fontSize: 14,
    color: '#94A3B8',
  },
  bottomSpacer: {
    height: 40,
  },
});
