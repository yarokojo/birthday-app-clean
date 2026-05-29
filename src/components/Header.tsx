import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { Bell, Search, PlusCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onNavigate?: (screen: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  userProfileImage?: string;
  unreadCount?: number;
}

export default function Header({ onNavigate, searchQuery, onSearchChange, userProfileImage, unreadCount = 0 }: HeaderProps) {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      <View style={styles.contentWrap}>
        <View style={styles.left}>
          <View style={[styles.logoSquare, { backgroundColor: theme.primary }]}>
            <View style={styles.logoDot} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>BirthDayApp</Text>
        </View>
        <View style={styles.right}>
          <TouchableOpacity onPress={() => onNavigate?.('post')} style={styles.iconButton}>
            <PlusCircle size={22} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate?.('search')} style={styles.iconButton}>
            <Search size={22} color={theme.subText} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate?.('notifications')} style={styles.iconButton}>
            <Bell size={22} color={theme.subText} />
            {unreadCount > 0 && (
              <View style={[styles.notificationDot, { backgroundColor: theme.primary }]}>
                <Text style={styles.notificationCount}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate?.('profile')} style={styles.profileButton}>
            <Image source={{ uri: userProfileImage || 'https://via.placeholder.com/40' }} style={styles.profileImage} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: Platform.OS === 'ios' ? 100 : 70, paddingTop: Platform.OS === 'ios' ? 40 : 10, borderBottomWidth: 1, zIndex: 1000 },
  contentWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoSquare: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoDot: { width: 12, height: 12, backgroundColor: '#fff', borderRadius: 6 },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { padding: 8, position: 'relative' },
  notificationDot: { position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  notificationCount: { color: '#fff', fontSize: 9, fontWeight: '900' },
  profileButton: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  profileImage: { width: '100%', height: '100%' },
});
