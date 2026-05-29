import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Platform, SafeAreaView } from "react-native";
import { ArrowLeft, Bell, Gift, Heart, UserPlus, Star, X } from "lucide-react-native";
import { MotiView, AnimatePresence } from "moti";
import { useTheme } from "../context/ThemeContext";

interface Notification {
  id: string;
  type: 'wish' | 'gift' | 'follow' | 'system';
  user: string;
  avatar: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationScreenProps {
  onBack: () => void;
  notifications: Notification[];
  setNotifications: (n: Notification[] | ((prev: Notification[]) => Notification[])) => void;
}

export default function NotificationScreen({ onBack, notifications, setNotifications }: NotificationScreenProps) {
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState('all');

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'wish': return <Heart size={12} color="#ec4899" fill="#ec4899" />;
      case 'gift': return <Gift size={12} color="#f59e0b" />;
      case 'follow': return <UserPlus size={12} color="#3b82f6" />;
      default: return <Star size={12} color={theme.primary} />;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'mentions') return notif.type === 'wish' || notif.type === 'follow';
    if (activeFilter === 'gifts') return notif.type === 'gift';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Custom Header */}
      <View style={[styles.customHeader, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.actionBtn}>
              <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>Read all</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearNotifications} style={styles.actionBtn}>
              <X size={18} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Bar */}
      <View style={[styles.filterBar, { backgroundColor: theme.itemBg, borderColor: theme.border }]}>
        {['all', 'mentions', 'gifts'].map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            style={[
              styles.filterBtn,
              activeFilter === filter && [styles.filterBtnActive, { backgroundColor: theme.card, borderColor: theme.border }]
            ]}
          >
            <Text style={[
              styles.filterText,
              { color: theme.subText },
              activeFilter === filter && [styles.filterTextActive, { color: theme.primary }]
            ]}>
              {filter === 'all' ? 'All' : filter === 'mentions' ? 'Wishes & Follows' : 'Gifts'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <AnimatePresence>
          {filteredNotifications.map((notif, index) => (
            <MotiView
              key={notif.id}
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 100 }}
              style={[
                styles.notifCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                !notif.isRead && [styles.notifCardUnread, { borderColor: theme.primary, shadowColor: theme.primary }]
              ]}
            >
              <TouchableOpacity onPress={() => markAsRead(notif.id)} style={styles.notifLayout}>
                <View style={styles.avatarContainer}>
                  {notif.avatar ? (
                    <Image source={{ uri: notif.avatar }} style={[styles.avatar, { borderColor: theme.card }]} />
                  ) : (
                    <View style={[styles.avatarFallback, { backgroundColor: theme.itemBg, borderColor: theme.card }]}>
                      <Bell size={20} color={theme.primary} />
                    </View>
                  )}
                  <View style={[styles.iconBadge, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    {getIcon(notif.type)}
                  </View>
                </View>

                <View style={styles.notifInfo}>
                  <Text style={[styles.notifMessage, { color: theme.text }]}>
                    <Text style={[styles.userName, { color: theme.text }]}>{notif.user}</Text>{" "}
                    <Text style={[styles.messageBody, { color: theme.subText }]}>{notif.message}</Text>
                  </Text>
                  <Text style={[styles.notifTime, { color: theme.subText }]}>{notif.time}</Text>
                </View>

                {!notif.isRead && (
                  <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                )}
              </TouchableOpacity>
            </MotiView>
          ))}
        </AnimatePresence>

        {filteredNotifications.length === 0 && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { backgroundColor: theme.itemBg }]}>
              <Bell size={32} color={theme.subText} />
            </View>
            <Text style={[styles.emptyText, { color: theme.subText }]}>No notifications in {activeFilter}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  filterTextActive: {
    color: '#4f46e5',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  notifCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
  },
  notifCardUnread: {
    borderWidth: 2,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  notifLayout: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
  },
  notifInfo: {
    flex: 1,
  },
  notifMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  userName: {
    fontWeight: '900',
  },
  messageBody: {
    fontWeight: '500',
  },
  notifTime: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 16,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
