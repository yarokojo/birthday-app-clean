import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { ArrowLeft, Calendar, Cake, Bell, BellOff } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface Birthday {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  date: string;
  daysLeft: number;
  reminderSet: boolean;
}

interface BirthdayCalendarScreenProps {
  onBack: () => void;
  birthdays: Birthday[];
  onToggleReminder: (userId: string) => void;
  onWish: (userId: string, name: string) => void;
}

export default function BirthdayCalendarScreen({ 
  onBack, 
  birthdays, 
  onToggleReminder,
  onWish 
}: BirthdayCalendarScreenProps) {
  const { theme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const upcomingBirthdays = [...birthdays]
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .filter(b => b.daysLeft >= 0)
    .slice(0, 10);

  const birthdaysByMonth = birthdays.reduce((acc, b) => {
    const month = new Date(b.date).getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(b);
    return acc;
  }, {} as Record<number, Birthday[]>);

  const renderBirthdayItem = ({ item }: { item: Birthday }) => (
    <View style={[styles.birthdayCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.birthdayInfo}>
        <View style={[styles.dayBadge, { backgroundColor: item.daysLeft === 0 ? theme.primary : theme.itemBg }]}>
          <Text style={[styles.dayText, { color: item.daysLeft === 0 ? '#fff' : theme.text }]}>
            {item.daysLeft === 0 ? 'Today!' : `${item.daysLeft}d`}
          </Text>
        </View>
        <View>
          <Text style={[styles.birthdayName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.birthdayDate, { color: theme.subText }]}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.birthdayActions}>
        <TouchableOpacity 
          style={[styles.reminderBtn, { backgroundColor: theme.itemBg }]}
          onPress={() => onToggleReminder(item.userId)}
        >
          {item.reminderSet ? <Bell size={18} color={theme.primary} /> : <BellOff size={18} color={theme.subText} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.wishBtn, { backgroundColor: theme.primary }]}
          onPress={() => onWish(item.userId, item.name)}
        >
          <Cake size={16} color="#fff" />
          <Text style={styles.wishBtnText}>Wish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Birthday Calendar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Upcoming Birthdays */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Cake size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Birthdays</Text>
          </View>
          {upcomingBirthdays.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Calendar size={48} color={theme.subText} strokeWidth={1.5} />
              <Text style={[styles.emptyText, { color: theme.subText }]}>No upcoming birthdays</Text>
            </View>
          ) : (
            <FlatList
              data={upcomingBirthdays}
              keyExtractor={(item) => item.id}
              renderItem={renderBirthdayItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          )}
        </View>

        {/* Monthly View */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>By Month</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
            {months.map((month, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedMonth(idx)}
                style={[
                  styles.monthTab,
                  selectedMonth === idx && styles.monthTabActive,
                  { backgroundColor: selectedMonth === idx ? theme.primary : theme.card, borderColor: theme.border }
                ]}
              >
                <Text style={[styles.monthText, { color: selectedMonth === idx ? '#fff' : theme.text }]}>{month}</Text>
                {birthdaysByMonth[idx] && (
                  <View style={[styles.monthBadge, { backgroundColor: selectedMonth === idx ? '#fff' : theme.primary }]}>
                    <Text style={[styles.monthBadgeText, { color: selectedMonth === idx ? theme.primary : '#fff' }]}>
                      {birthdaysByMonth[idx].length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.monthlyList}>
            {(birthdaysByMonth[selectedMonth] || []).map((birthday) => (
              <View key={birthday.id} style={[styles.monthlyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.monthlyDay, { color: theme.text }]}>{new Date(birthday.date).getDate()}</Text>
                <View style={styles.monthlyInfo}>
                  <Text style={[styles.monthlyName, { color: theme.text }]}>{birthday.name}</Text>
                  <Text style={[styles.monthlyUsername, { color: theme.subText }]}>{birthday.username}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.monthlyWishBtn, { backgroundColor: theme.primary + '15' }]}
                  onPress={() => onWish(birthday.userId, birthday.name)}
                >
                  <Cake size={14} color={theme.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1 },
  backBtn: { padding: 8, borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '900' },
  birthdayCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, borderWidth: 1 },
  birthdayInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, minWidth: 60, alignItems: 'center' },
  dayText: { fontSize: 12, fontWeight: '900' },
  birthdayName: { fontSize: 14, fontWeight: '700' },
  birthdayDate: { fontSize: 11, marginTop: 2 },
  birthdayActions: { flexDirection: 'row', gap: 8 },
  reminderBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  wishBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  wishBtnText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  emptyContainer: { padding: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 1, borderStyle: 'dashed' },
  emptyText: { fontSize: 14, marginTop: 12 },
  monthScroll: { flexDirection: 'row', marginBottom: 16 },
  monthTab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthTabActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  monthText: { fontSize: 14, fontWeight: '700' },
  monthBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  monthBadgeText: { fontSize: 10, fontWeight: '900' },
  monthlyList: { gap: 8 },
  monthlyCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, gap: 12 },
  monthlyDay: { fontSize: 20, fontWeight: '900', width: 40, textAlign: 'center' },
  monthlyInfo: { flex: 1 },
  monthlyName: { fontSize: 14, fontWeight: '700' },
  monthlyUsername: { fontSize: 11, marginTop: 2 },
  monthlyWishBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
