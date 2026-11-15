import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import api from '../../../src/utils/api';
import dayjs from 'dayjs';

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-events', selectedDate.format('YYYY-MM-DD')],
    queryFn: async () => {
      const response = await api.get('/meetings', {
        params: { date: selectedDate.format('YYYY-MM-DD') }
      });
      return response.data.data || [];
    },
  });

  const getDaysInMonth = () => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');
    
    const days = [];
    let day = startDate;
    
    while (day.isBefore(endDate)) {
      days.push(day);
      day = day.add(1, 'day');
    }
    
    return days;
  };

  const isToday = (date: any) => date.isSame(dayjs(), 'day');
  const isSelected = (date: any) => date.isSame(selectedDate, 'day');
  const isCurrentMonth = (date: any) => date.month() === currentMonth.month();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📅 Calendar</Text>
          <Text style={styles.subtitle}>{currentMonth.format('MMMM YYYY')}</Text>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.todayButton}
            onPress={() => {
              setCurrentMonth(dayjs());
              setSelectedDate(dayjs());
            }}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentMonth(currentMonth.add(1, 'month'))}
          >
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Weekday Headers */}
        <View style={styles.weekdays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <View key={day} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {getDaysInMonth().map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isSelected(date) && styles.selectedDay,
                isToday(date) && !isSelected(date) && styles.todayDay,
              ]}
              onPress={() => setSelectedDate(date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  !isCurrentMonth(date) && styles.otherMonthText,
                  isSelected(date) && styles.selectedDayText,
                  isToday(date) && !isSelected(date) && styles.todayDayText,
                ]}
              >
                {date.date()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Events for Selected Date */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>
            Events for {selectedDate.format('MMM D, YYYY')}
          </Text>
          
          {isLoading ? (
            <ActivityIndicator color="#60A5FA" style={{ marginTop: 20 }} />
          ) : events.length > 0 ? (
            <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
              {events.map((event: any) => (
                <View key={event._id} style={styles.eventCard}>
                  <View style={styles.eventTime}>
                    <Text style={styles.eventTimeText}>
                      {dayjs(event.startTime).format('HH:mm')}
                    </Text>
                    <Text style={styles.eventDivider}>-</Text>
                    <Text style={styles.eventTimeText}>
                      {dayjs(event.endTime).format('HH:mm')}
                    </Text>
                  </View>
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {event.description && (
                      <Text style={styles.eventDescription} numberOfLines={2}>
                        {event.description}
                      </Text>
                    )}
                  </View>
                  <View style={styles.eventIcon}>
                    <Text style={styles.eventIconText}>📹</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyEvents}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>No events scheduled</Text>
            </View>
          )}
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(app)/calendar/add-meeting')}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
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
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  navButtonText: {
    fontSize: 18,
    color: '#475569',
  },
  todayButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#60A5FA',
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weekdays: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  selectedDay: {
    backgroundColor: '#60A5FA',
    borderRadius: 10,
  },
  todayDay: {
    backgroundColor: '#E0E7FF',
    borderRadius: 10,
  },
  dayText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  todayDayText: {
    color: '#4338CA',
    fontWeight: 'bold',
  },
  otherMonthText: {
    color: '#CBD5E1',
  },
  eventsSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 5,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  eventsList: {
    flex: 1,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  eventTime: {
    alignItems: 'center',
    marginRight: 12,
  },
  eventTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#60A5FA',
  },
  eventDivider: {
    fontSize: 11,
    color: '#94A3B8',
    marginVertical: 2,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 3,
  },
  eventDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  eventIconText: {
    fontSize: 18,
  },
  emptyEvents: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: -2,
  },
});
