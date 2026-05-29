import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { ChevronLeft, ChevronRight, Search, Heart, Gift, Bell, BellOff, Users, ArrowLeft } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

interface CalendarScreenProps {
  searchQuery?: string;
  onWishClick?: (name: string, userId?: string) => void;
  onGiftClick?: () => void;
  friendsBirthdays?: any[];
  onToggleReminder?: (userId: string) => void;
  onNavigate?: (screen: string) => void;
  onBack?: () => void;
  unreadCount?: number;
}

export default function CalendarScreen({ 
  searchQuery = "",
  onWishClick,
  onGiftClick,
  friendsBirthdays = [],
  onToggleReminder,
  onNavigate,
  onBack,
  unreadCount = 0
}: CalendarScreenProps) {
  const { theme, darkMode } = useTheme();
  const [internalSearch, setInternalSearch] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const events = [
    { id: 1, name: "Julia Mason's Birthday", date: "09", time: "7:00 PM", type: "Birthday", userId: "user_2", reminderSet: true },
    { id: 2, name: "Kevin Hart's Party", date: "21", time: "8:30 PM", type: "Party", userId: "user_3", reminderSet: false },
    { id: 3, name: "Samantha Lee's Surprise", date: "25", time: "6:00 PM", type: "Surprise", userId: "user_4", reminderSet: true },
  ];

  const allEvents = [...events, ...friendsBirthdays.map((b, idx) => ({
    id: 100 + idx,
    name: `${b.name}'s Birthday`,
    date: new Date(b.date).getDate().toString().padStart(2, '0'),
    time: "All day",
    type: "Birthday",
    userId: b.userId,
    reminderSet: b.reminderSet
  }))];

  const effectiveSearch = internalSearch || searchQuery;
  const filteredEvents = allEvents.filter(event => 
    event.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
    event.type.toLowerCase().includes(effectiveSearch.toLowerCase())
  );

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => null);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getEventsForDay = (day: number) => {
    const dayStr = day.toString().padStart(2, '0');
    return allEvents.filter(e => e.date === dayStr);
  };

  const handleDayPress = (day: number) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      const eventNames = dayEvents.map(e => e.name).join('\n');
      Alert.alert(`Events on ${months[currentMonth]} ${day}`, eventNames);
    }
  };

  const handleFindFriends = () => {
    if (onNavigate) {
      onNavigate('friends');
    }
  };

  const handleNotifications = () => {
    if (onNavigate) {
      onNavigate('notifications');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Calendar</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleFindFriends} style={styles.headerBtn}>
            <Users size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNotifications} style={styles.notificationBtn}>
            <Bell size={20} color={theme.subText} />
            {unreadCount > 0 && (
              <View style={[styles.notificationDot, { backgroundColor: theme.primary }]}>
                <Text style={styles.notificationCount}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Search size={18} color={theme.subText} />
          <TextInput 
            placeholder="Search events..." 
            style={[styles.searchInput, { color: theme.text }]}
            placeholderTextColor={theme.subText}
            value={internalSearch}
            onChangeText={setInternalSearch}
          />
        </View>

        <View style={styles.monthNav}>
          <Text style={[styles.monthTitle, { color: theme.text }]}>{months[currentMonth]} {currentYear}</Text>
          <View style={styles.navBtns}>
            <TouchableOpacity onPress={handlePrevMonth} style={[styles.navBtn, { backgroundColor: theme.itemBg }]}>
              <ChevronLeft size={20} color={theme.subText} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextMonth} style={[styles.navBtn, { backgroundColor: theme.itemBg }]}>
              <ChevronRight size={20} color={theme.subText} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.calendarGrid}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <View key={`${day}-${index}`} style={styles.dayHeader}>
              <Text style={[styles.dayHeaderText, { color: theme.subText }]}>{day}</Text>
            </View>
          ))}
          
          {blanks.map((_, i) => <View key={`blank-${i}`} style={styles.dayCell} />)}
          
          {daysArray.map((dayNum) => {
            const hasEvent = getEventsForDay(dayNum).length > 0;
            const eventsForDay = getEventsForDay(dayNum);
            const hasBirthday = eventsForDay.some(e => e.type === 'Birthday');
            
            return (
              <TouchableOpacity 
                key={dayNum} 
                style={[
                  styles.dayCell,
                  { backgroundColor: theme.itemBg },
                  hasEvent && [styles.dayCellEvent, { backgroundColor: hasBirthday ? theme.primary : theme.secondary + '20' }]
                ]}
                onPress={() => handleDayPress(dayNum)}
              >
                <Text style={[styles.dayText, { color: theme.text }, hasEvent && styles.dayTextEvent]}>{dayNum}</Text>
                {hasEvent && <View style={styles.eventDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
        
        <View style={[styles.eventsSection, { borderTopColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Celebrations this month</Text>
          {filteredEvents.map((event) => {
            const nameBase = event.name.includes("'s") ? event.name.split("'s")[0] : event.name;
            return (
              <View key={event.id} style={[styles.eventCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.eventLeft}>
                  <View style={[styles.eventDate, { backgroundColor: darkMode ? theme.itemBg : theme.primary + '15' }]}>
                    <Text style={[styles.eventDateText, { color: theme.primary }]}>{event.date}</Text>
                  </View>
                  <View>
                    <Text style={[styles.eventName, { color: theme.text }]}>{event.name}</Text>
                    <Text style={[styles.eventMeta, { color: theme.subText }]}>{event.type} • {event.time}</Text>
                  </View>
                </View>
                <View style={styles.eventActions}>
                  {event.userId && onToggleReminder && (
                    <TouchableOpacity onPress={() => onToggleReminder(event.userId!)} style={[styles.smallAction, { backgroundColor: theme.itemBg }]}>
                      {event.reminderSet ? <Bell size={14} color={theme.primary} /> : <BellOff size={14} color={theme.subText} />}
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => onWishClick?.(nameBase, event.userId)} style={[styles.smallAction, { backgroundColor: theme.itemBg }]}>
                    <Heart size={14} color={theme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onGiftClick} style={[styles.smallAction, { backgroundColor: theme.itemBg }]}>
                    <Gift size={14} color={darkMode ? theme.secondary : "#ec4899"} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8, borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBtn: { padding: 8, borderRadius: 20 },
  notificationBtn: { padding: 8, borderRadius: 20, position: 'relative' },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationCount: { color: '#fff', fontSize: 9, fontWeight: '900' },
  scrollContent: { padding: 20, paddingBottom: 40, maxWidth: 600, alignSelf: 'center', width: '100%' },
  searchBar: { borderRadius: 20, paddingHorizontal: 16, height: 56, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, marginBottom: 24 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  monthTitle: { fontSize: 22, fontWeight: '900' },
  navBtns: { flexDirection: 'row', gap: 8 },
  navBtn: { padding: 10, borderRadius: 12 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayHeader: { width: '12.5%', alignItems: 'center', paddingVertical: 8 },
  dayHeaderText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  dayCell: { width: '12.5%', aspectRatio: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  dayCellEvent: { shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 4 },
  dayText: { fontSize: 14, fontWeight: '700' },
  dayTextEvent: { color: '#fff' },
  eventDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff', marginTop: 2 },
  eventsSection: { marginTop: 32, paddingTop: 24, borderTopWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 20 },
  eventCard: { borderRadius: 20, padding: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eventLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  eventDate: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  eventDateText: { fontSize: 14, fontWeight: '900' },
  eventName: { fontSize: 14, fontWeight: '700' },
  eventMeta: { fontSize: 12, marginTop: 2 },
  eventActions: { flexDirection: 'row', gap: 8 },
  smallAction: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
