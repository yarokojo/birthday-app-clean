import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Calendar, Gift, Video, Users, User } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

type TabId = 'home' | 'calendar' | 'video' | 'gift_shop' | 'friends' | 'profile';

interface BottomNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const { theme } = useTheme();
  
  const tabs = [
    { id: "home", icon: Home, label: "Feeds" },
    { id: "calendar", icon: Calendar, label: "Events" },
    { id: "video", icon: Video, label: "Video" },
    { id: "gift_shop", icon: Gift, label: "Gifts" },
    { id: "friends", icon: Users, label: "Friends" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <View style={[styles.nav, { backgroundColor: theme.headerBg, borderTopColor: theme.border }]}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id as TabId)} style={styles.tab} activeOpacity={0.7}>
            <Icon size={24} color={isActive ? theme.primary : theme.subText} strokeWidth={isActive ? 2.5 : 2} />
            <Text style={[styles.label, { color: isActive ? theme.primary : theme.subText }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { height: Platform.OS === 'ios' ? 85 : 75, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8, paddingBottom: Platform.OS === 'ios' ? 25 : 8 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { fontSize: 10, fontWeight: '700' },
});
