import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store/authStore';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Modern Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting}</Text>
              <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/(app)/profile')}
            >
              <LinearGradient
                colors={['#FF6B9D', '#C06CC3']}
                style={styles.profileGradient}
              >
                <Text style={styles.profileInitial}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Glassmorphism Clock Card */}
          <View style={styles.glassCard}>
            <View style={styles.glassCardInner}>
              <Text style={styles.dateText}>{dayjs().format('dddd, MMMM D')}</Text>
              <Text style={styles.clock}>{now.format('HH:mm')}</Text>
              <Text style={styles.secondsText}>{now.format('ss')}</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBarGlass}>
                  <View style={[styles.progressFillGlass, { width: `${completionRate}%` }]} />
                </View>
                <Text style={styles.progressTextGlass}>
                  {completionRate}% Complete
                </Text>
              </View>
            </View>
          </View>

          {/* Curved Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitleWhite}>Today's Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCardModern}>
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statGradient}
                >
                  <Text style={styles.statIconLarge}>✓</Text>
                  <Text style={styles.statNumberWhite}>{completedTodayCount}</Text>
                  <Text style={styles.statLabelWhite}>Completed</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCardModern}>
                <LinearGradient
                  colors={['#fa709a', '#fee140']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statGradient}
                >
                  <Text style={styles.statIconLarge}>⏳</Text>
                  <Text style={styles.statNumberWhite}>{pendingTodayCount}</Text>
                  <Text style={styles.statLabelWhite}>Pending</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCardModern}>
                <LinearGradient
                  colors={['#a8edea', '#fed6e3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statGradient}
                >
                  <Text style={styles.statIconLarge}>🎯</Text>
                  <Text style={styles.statNumberWhite}>{taskStats?.totalTasks || 0}</Text>
                  <Text style={styles.statLabelWhite}>Total</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCardModern}>
                <LinearGradient
                  colors={['#fccb90', '#d57eeb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statGradient}
                >
                  <Text style={styles.statIconLarge}>📅</Text>
                  <Text style={styles.statNumberWhite}>{upcomingMeetings?.length || 0}</Text>
                  <Text style={styles.statLabelWhite}>Meetings</Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* White Content Section */}
          <View style={styles.whiteSection}>
            {/* Quick Actions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
              </View>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity 
                  style={styles.actionCardNew}
                  onPress={() => router.push('/(app)/(home)/add-task')}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.actionIconNew}
                  >
                    <Text style={styles.actionEmojiNew}>➕</Text>
                  </LinearGradient>
                  <Text style={styles.actionTextNew}>Add Task</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCardNew}
                  onPress={() => router.push('./add-meeting')}
                >
                  <LinearGradient
                    colors={['#f093fb', '#f5576c']}
                    style={styles.actionIconNew}
                  >
                    <Text style={styles.actionEmojiNew}>📅</Text>
                  </LinearGradient>
                  <Text style={styles.actionTextNew}>Meeting</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCardNew}
                  onPress={() => router.push('/(app)/focus')}
                >
                  <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    style={styles.actionIconNew}
                  >
                    <Text style={styles.actionEmojiNew}>⏱️</Text>
                  </LinearGradient>
                  <Text style={styles.actionTextNew}>Focus</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCardNew}
                  onPress={() => router.push('/(app)/calendar')}
                >
                  <LinearGradient
                    colors={['#fa709a', '#fee140']}
                    style={styles.actionIconNew}
                  >
                    <Text style={styles.actionEmojiNew}>📆</Text>
                  </LinearGradient>
                  <Text style={styles.actionTextNew}>Calendar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Today's Tasks */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📝 Today's Tasks</Text>
                <TouchableOpacity onPress={() => router.push('/(app)/planner')}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.viewAllButton}
                  >
                    <Text style={styles.viewAllTextNew}>View All →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={styles.tasksContainer}>
                {todaysTasks && todaysTasks.length > 0 ? (
                  todaysTasks.slice(0, 4).map((task: any) => (
                    <View key={task._id} style={styles.taskCardNew}>
                      <View style={styles.taskLeftStripe} />
                      <View style={styles.taskContent}>
                        <View style={styles.taskHeader}>
                          <View style={[
                            styles.priorityBadgeNew,
                            { 
                              backgroundColor: 
                                task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 
                                task.priority === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                            }
                          ]}>
                            <Text style={[
                              styles.priorityTextNew,
                              { 
                                color: 
                                  task.priority === 'high' ? '#ef4444' : 
                                  task.priority === 'medium' ? '#f59e0b' : '#3b82f6'
                              }
                            ]}>
                              {task.priority?.toUpperCase() || 'LOW'}
                            </Text>
                          </View>
                          <View style={[
                            styles.statusDotNew,
                            { backgroundColor: task.completed ? '#10b981' : '#f59e0b' }
                          ]} />
                        </View>
                        <Text style={styles.taskTitleNew} numberOfLines={2}>{task.title}</Text>
                        <View style={styles.taskFooter}>
                          <Text style={styles.taskTimeNew}>
                            🕐 {dayjs(task.startTime).format('HH:mm')} - {dayjs(task.endTime).format('HH:mm')}
                          </Text>
                          <Text style={[
                            styles.taskStatusNew,
                            { color: task.completed ? '#10b981' : '#f59e0b' }
                          ]}>
                            {task.completed ? '✓ Done' : '○ Pending'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyStateNew}>
                    <Text style={styles.emptyEmojiNew}>📭</Text>
                    <Text style={styles.emptyTextNew}>No tasks for today</Text>
                    <TouchableOpacity 
                      onPress={() => router.push('/(app)/(home)/add-task')}
                    >
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.addButtonNew}
                      >
                        <Text style={styles.addButtonTextNew}>+ Add Task</Text>
                      </LinearGradient>
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
                  <LinearGradient
                    colors={['#f093fb', '#f5576c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.viewAllButton}
                  >
                    <Text style={styles.viewAllTextNew}>View All →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={styles.meetingsContainer}>
                {upcomingMeetings && upcomingMeetings.length > 0 ? (
                  upcomingMeetings.slice(0, 3).map((meeting: any) => (
                    <View key={meeting._id} style={styles.meetingCardNew}>
                      <LinearGradient
                        colors={['#4facfe', '#00f2fe']}
                        style={styles.meetingIconNew}
                      >
                        <Text style={styles.meetingIconTextNew}>📹</Text>
                      </LinearGradient>
                      <View style={styles.meetingContentNew}>
                        <Text style={styles.meetingTitleNew} numberOfLines={1}>{meeting.title}</Text>
                        <Text style={styles.meetingTimeNew}>
                          📅 {dayjs(meeting.startTime).format('MMM D')} at {dayjs(meeting.startTime).format('HH:mm')}
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
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  glassCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  glassCardInner: {
    padding: 24,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500',
  },
  clock: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  secondsText: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginTop: -8,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarGlass: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFillGlass: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 10,
  },
  progressTextGlass: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsSection: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  sectionTitleWhite: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  statCardModern: {
    flex: 0.48,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
  statIconLarge: {
    fontSize: 36,
    marginBottom: 10,
  },
  statNumberWhite: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabelWhite: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  whiteSection: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 20,
    paddingTop: 8,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  viewAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewAllTextNew: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  actionCardNew: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconNew: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  actionEmojiNew: {
    fontSize: 28,
  },
  actionTextNew: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  tasksContainer: {
    gap: 14,
  },
  taskCardNew: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    flexDirection: 'row',
  },
  taskLeftStripe: {
    width: 5,
    backgroundColor: '#667eea',
  },
  taskContent: {
    flex: 1,
    padding: 18,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadgeNew: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityTextNew: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusDotNew: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  taskTitleNew: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    lineHeight: 24,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTimeNew: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  taskStatusNew: {
    fontSize: 13,
    fontWeight: '700',
  },
  meetingsContainer: {
    gap: 14,
  },
  meetingCardNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  meetingIconNew: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  meetingIconTextNew: {
    fontSize: 28,
  },
  meetingContentNew: {
    flex: 1,
  },
  meetingTitleNew: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  meetingTimeNew: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyStateNew: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyEmojiNew: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTextNew: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  addButtonNew: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  addButtonTextNew: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyStateMini: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
  },
  emptyTextMini: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
});
