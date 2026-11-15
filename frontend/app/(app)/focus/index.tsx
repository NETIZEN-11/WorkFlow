import { AppState, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../src/utils/api';
import * as Notifications from 'expo-notifications';
import { useAppStore } from '../../../src/store/appStore';
import { useTheme } from '../../../src/contexts/ThemeContext';

interface FocusSession {
  sessionType: 'focus';
  duration: number; // in minutes
  completed: boolean;
  actualDuration: number;
  startTime: string;
}

export default function FocusScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const [sessionType, setSessionType] = useState<'setup' | 'active'>('setup');
  const [duration, setDuration] = useState(25); // Pomodoro default
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const { notificationsEnabled } = useAppStore();
  const deadlineRef = useRef<number | null>(null);
  const sessionStartedAtRef = useRef<string | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  const completingRef = useRef(false);

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: FocusSession) => {
      const response = await api.post('/focus', sessionData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save focus session');
    },
  });
  const saveFocusSession = createSessionMutation.mutate;

  const cancelCompletionNotification = useCallback(async () => {
    if (notificationIdRef.current) {
      await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  }, []);

  const scheduleCompletionNotification = useCallback(async (seconds: number) => {
    if (!notificationsEnabled) return;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Notifications disabled', 'The timer will run without a completion notification.');
      return;
    }

    notificationIdRef.current = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Focus Session Complete',
        body: `Great work! Your ${duration}-minute session is complete.`,
      },
      trigger: { seconds, channelId: 'default' },
    });
  }, [duration, notificationsEnabled]);

  const handleSessionComplete = useCallback(async () => {
    if (completingRef.current) return;
    completingRef.current = true;
    setIsRunning(false);
    deadlineRef.current = null;
    try {
      await cancelCompletionNotification();
    } catch {
      Alert.alert('Notification unavailable', 'The timer completed, but its scheduled notification could not be cleared.');
    }

    saveFocusSession({
      sessionType: 'focus',
      duration,
      completed: true,
      actualDuration: duration,
      startTime: sessionStartedAtRef.current || new Date().toISOString(),
    });

    setSessionsCompleted((prev) => prev + 1);
    setTimeLeft(duration * 60);
    setSessionType('setup');
  }, [cancelCompletionNotification, duration, saveFocusSession]);

  useEffect(() => {
    if (!isRunning || deadlineRef.current === null) return;

    const updateRemainingTime = () => {
      const remaining = Math.max(0, Math.ceil((deadlineRef.current! - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        void handleSessionComplete();
      }
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [handleSessionComplete, isRunning]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isRunning && deadlineRef.current !== null) {
        const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          void handleSessionComplete();
        }
      }
    });

    return () => subscription.remove();
  }, [handleSessionComplete, isRunning]);

  const handleStart = async () => {
    completingRef.current = false;
    sessionStartedAtRef.current = new Date().toISOString();
    deadlineRef.current = Date.now() + duration * 60 * 1000;
    setSessionType('active');
    setTimeLeft(duration * 60);
    setIsRunning(true);
    try {
      await scheduleCompletionNotification(duration * 60);
    } catch {
      Alert.alert('Notification unavailable', 'The timer will run, but its completion notification could not be scheduled.');
    }
  };

  const handlePause = async () => {
    if (deadlineRef.current !== null) {
      setTimeLeft(Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)));
    }
    deadlineRef.current = null;
    setIsRunning(false);
    try {
      await cancelCompletionNotification();
    } catch {
      Alert.alert('Notification unavailable', 'The timer is paused, but its scheduled notification could not be cleared.');
    }
  };

  const handleResume = async () => {
    deadlineRef.current = Date.now() + timeLeft * 1000;
    setIsRunning(true);
    try {
      await scheduleCompletionNotification(timeLeft);
    } catch {
      Alert.alert('Notification unavailable', 'The timer will resume, but its completion notification could not be scheduled.');
    }
  };

  const handleStop = async () => {
    deadlineRef.current = null;
    setIsRunning(false);
    setSessionType('setup');
    setTimeLeft(duration * 60);
    try {
      await cancelCompletionNotification();
    } catch {
      Alert.alert('Notification unavailable', 'The timer stopped, but its scheduled notification could not be cleared.');
    }
  };

  const changeDuration = (newDuration: number) => {
    if (sessionType === 'setup') {
      setDuration(newDuration);
      setTimeLeft(newDuration * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>🎯 Focus Timer</Text>
          <TouchableOpacity 
            onPress={() => router.push('/(app)/focus/habits')}
            style={styles.habitButton}
          >
            <Text style={styles.habitLink}>📊 Habits</Text>
          </TouchableOpacity>
        </View>

        {/* Timer Display */}
        <View style={[styles.timerCard, { backgroundColor: colors.card }]}>
          <View style={styles.progressCircleContainer}>
            <View style={[styles.progressCircle, { backgroundColor: colors.background }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    height: `${progressPercent}%`,
                    backgroundColor: '#60A5FA', // Soft blue
                  },
                ]}
              />
              <View style={styles.timerOverlay}>
                <Text style={[styles.timer, { color: colors.text }]}>
                  {formatTime(timeLeft)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>
            {sessionType === 'setup' ? `${duration}-Minute Session` : isRunning ? '⏱ Session Running' : '⏸ Session Paused'}
          </Text>
        </View>

        {/* Duration Presets */}
        {sessionType === 'setup' && (
          <View style={styles.presetsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Duration</Text>
            <View style={styles.presetButtons}>
              <TouchableOpacity
                style={[
                  styles.presetButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  duration === 5 && { backgroundColor: '#60A5FA', borderColor: '#60A5FA' }
                ]}
                onPress={() => changeDuration(5)}
              >
                <Text style={[
                  styles.presetButtonText,
                  { color: duration === 5 ? '#FFFFFF' : colors.text }
                ]}>
                  5 min
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.presetButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  duration === 15 && { backgroundColor: '#60A5FA', borderColor: '#60A5FA' }
                ]}
                onPress={() => changeDuration(15)}
              >
                <Text style={[
                  styles.presetButtonText,
                  { color: duration === 15 ? '#FFFFFF' : colors.text }
                ]}>
                  15 min
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.presetButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  duration === 25 && { backgroundColor: '#60A5FA', borderColor: '#60A5FA' }
                ]}
                onPress={() => changeDuration(25)}
              >
                <Text style={[
                  styles.presetButtonText,
                  { color: duration === 25 ? '#FFFFFF' : colors.text }
                ]}>
                  25 min
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.presetButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  duration === 45 && { backgroundColor: '#60A5FA', borderColor: '#60A5FA' }
                ]}
                onPress={() => changeDuration(45)}
              >
                <Text style={[
                  styles.presetButtonText,
                  { color: duration === 45 ? '#FFFFFF' : colors.text }
                ]}>
                  45 min
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controlsSection}>
          {sessionType === 'setup' ? (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={handleStart}
              disabled={createSessionMutation.isPending}
            >
              {createSessionMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>▶  Start Session</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, isRunning ? styles.pauseButton : styles.resumeButton]}
                onPress={isRunning ? handlePause : handleResume}
              >
                <Text style={styles.buttonText}>
                  {isRunning ? '⏸  Pause' : '▶  Resume'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.stopButton]}
                onPress={handleStop}
              >
                <Text style={styles.buttonText}>⏹  Stop</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Progress</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Text style={styles.statValue}>{sessionsCompleted}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sessions</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Text style={styles.statValue}>{sessionsCompleted * duration}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Minutes</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Text style={styles.statValue}>
                {(sessionsCompleted * duration / 60).toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hours</Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={[styles.tipsContainer, { backgroundColor: '#FEF3C7' }]}>
          <Text style={styles.tipsTitle}>💡 Focus Tips</Text>
          <Text style={styles.tipText}>• Find a quiet, comfortable workspace</Text>
          <Text style={styles.tipText}>• Turn off distracting notifications</Text>
          <Text style={styles.tipText}>• Take short breaks between sessions</Text>
          <Text style={styles.tipText}>• Stay hydrated and stretch regularly</Text>
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
    padding: 12,
    paddingTop: 4,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  habitButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  habitLink: {
    fontSize: 13,
    color: '#60A5FA',
    fontWeight: '600',
  },
  timerCard: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  progressCircleContainer: {
    marginBottom: 6,
  },
  progressCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderRadius: 110,
  },
  timerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  presetsContainer: {
    marginBottom: 10,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  presetButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  controlsSection: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  startButton: {
    backgroundColor: '#34D399', // Soft green
  },
  resumeButton: {
    backgroundColor: '#60A5FA', // Soft blue
  },
  pauseButton: {
    backgroundColor: '#FBBF24', // Soft yellow
  },
  stopButton: {
    backgroundColor: '#F87171', // Soft red
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statBox: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#60A5FA',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '500',
  },
  tipsContainer: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  tipsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 10,
    color: '#B45309',
    marginBottom: 2,
    lineHeight: 14,
  },
});
