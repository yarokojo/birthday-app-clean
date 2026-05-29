import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../context/ThemeContext';

interface BirthdayCountdownProps {
  birthdayDate: string;
  name: string;
}

export default function BirthdayCountdown({ birthdayDate, name }: BirthdayCountdownProps) {
  const { theme } = useTheme();
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [hoursLeft, setHoursLeft] = useState<number>(0);
  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    const calculateDaysLeft = () => {
      const today = new Date();
      const birthday = new Date(birthdayDate);
      birthday.setFullYear(today.getFullYear());
      
      if (birthday < today) {
        birthday.setFullYear(today.getFullYear() + 1);
      }
      
      const diffTime = birthday.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setDaysLeft(diffDays);
      setHoursLeft(diffHours);
      setIsToday(diffDays === 0);
    };
    
    calculateDaysLeft();
    const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [birthdayDate]);

  if (isToday) {
    return (
      <MotiView
        from={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ loop: true, duration: 1000 }}
        style={[styles.container, styles.todayContainer, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.todayText}>🎂 Today is {name}'s Birthday! 🎉</Text>
      </MotiView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.label, { color: theme.subText }]}>Birthday in</Text>
      <View style={styles.countdown}>
        <View style={styles.countdownUnit}>
          <Text style={[styles.countdownNumber, { color: theme.text }]}>{daysLeft}</Text>
          <Text style={[styles.countdownLabel, { color: theme.subText }]}>Days</Text>
        </View>
        <Text style={[styles.separator, { color: theme.text }]}>:</Text>
        <View style={styles.countdownUnit}>
          <Text style={[styles.countdownNumber, { color: theme.text }]}>{hoursLeft}</Text>
          <Text style={[styles.countdownLabel, { color: theme.subText }]}>Hours</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  todayContainer: {
    backgroundColor: '#4f46e5',
    borderWidth: 0,
  },
  todayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  countdownUnit: {
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 32,
    fontWeight: '900',
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  separator: {
    fontSize: 28,
    fontWeight: '900',
  },
});
