import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, Alert } from "react-native";
import { Clock, Heart, Gift, Calendar, ChevronRight, Crown, Sparkles, Cake } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

const UPCOMING = [
  { id: "1", name: "Alice Cooper", day: "21", daysLeft: 3, color: "#ffedd5", textColor: "#ea580c", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
  { id: "2", name: "Zoe Miller", day: "25", daysLeft: 7, color: "#f3e8ff", textColor: "#9333ea", imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
  { id: "3", name: "Tom Holland", day: "28", daysLeft: 10, color: "#dbeafe", textColor: "#2563eb", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
];

const TOP_GIVERS = [
  { id: "1", name: "Chloe Smith", gifts: 12, badge: "Legendary Giver", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", rank: 1 },
  { id: "2", name: "David G", gifts: 8, badge: "Top Contributor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", rank: 2 },
  { id: "3", name: "Sarah Lee", gifts: 5, badge: "Rising Star", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", rank: 3 },
];

interface UpcomingPanelProps {
  onWishClick?: (name: string) => void;
  onGiftClick?: () => void;
  onNavigate?: (screen: string, id?: string) => void;
}

export default function UpcomingPanel({ 
  onWishClick, 
  onGiftClick,
  onNavigate 
}: UpcomingPanelProps) {
  const { theme, darkMode } = useTheme();

  const getDaysLeftColor = (days: number) => {
    if (days <= 3) return "#ef4444";
    if (days <= 7) return "#f59e0b";
    return "#10b981";
  };

  const getDaysLeftLabel = (days: number) => {
    if (days === 1) return "Tomorrow";
    if (days <= 3) return "Soon";
    if (days <= 7) return "This Week";
    return "Upcoming";
  };

  // FIXED: Sync Calendar handler - navigates to Calendar screen
  const handleSyncCalendar = () => {
    console.log("Sync Calendar pressed - navigating to calendar");
    if (onNavigate) {
      onNavigate('calendar');
    } else {
      // Fallback alert if onNavigate is not available
      Alert.alert(
        "Sync Calendar",
        "Connect your calendar to see celebrations from your contacts.",
        [
          { text: "Later", style: "cancel" },
          { text: "Go to Calendar", onPress: () => console.log("Navigate to calendar - onNavigate missing") }
        ]
      );
    }
  };

  // View All Upcoming handler
  const handleViewAllUpcoming = () => {
    console.log("View All pressed - navigating to birthday calendar");
    if (onNavigate) {
      onNavigate('birthday_calendar');
    }
  };

  // Leaderboard handler
  const handleLeaderboardPress = () => {
    Alert.alert("Leaderboard", "Top gift givers leaderboard coming soon!");
  };

  const renderUpcomingItem = ({ item }: { item: typeof UPCOMING[0] }) => {
    const daysLeftColor = getDaysLeftColor(item.daysLeft);
    const daysLabel = getDaysLeftLabel(item.daysLeft);
    
    return (
      <View style={[styles.upcomingItem, { backgroundColor: theme.itemBg, borderColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.upcomingItemContent}
          activeOpacity={0.7}
          onPress={() => onWishClick?.(item.name)}
        >
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: item.imageUrl }} style={[styles.avatar, { borderColor: theme.card }]} />
            <View style={[styles.dayBadge, { backgroundColor: darkMode ? theme.card : item.color }]}>
              <Text style={[styles.dayBadgeText, { color: darkMode ? theme.primary : item.textColor }]}>{item.day}</Text>
            </View>
          </View>
          
          <View style={styles.upcomingInfo}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            <View style={styles.daysLeftRow}>
              <Clock size={10} color={daysLeftColor} />
              <Text style={[styles.daysLeft, { color: daysLeftColor }]}>
                {item.daysLeft === 0 ? "Today!" : `In ${item.daysLeft} days`}
              </Text>
              <View style={[styles.daysLabel, { backgroundColor: daysLeftColor + '15' }]}>
                <Text style={[styles.daysLabelText, { color: daysLeftColor }]}>{daysLabel}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={styles.upcomingActions}>
          <TouchableOpacity 
            onPress={() => onWishClick?.(item.name)}
            style={[styles.actionBtn, styles.wishBtn, { backgroundColor: theme.primary }]}
          >
            <Heart size={14} color="#fff" />
            <Text style={styles.wishBtnText}>Wish</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onGiftClick}
            style={[styles.actionBtn, styles.giftBtn, { backgroundColor: theme.itemBg, borderColor: theme.border }]}
          >
            <Gift size={14} color={darkMode ? theme.secondary : "#ec4899"} />
            <Text style={[styles.giftBtnText, { color: theme.subText }]}>Gift</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderGiverItem = ({ item }: { item: typeof TOP_GIVERS[0] }) => {
    const getRankColor = () => {
      if (item.rank === 1) return "#fbbf24";
      if (item.rank === 2) return "#94a3b8";
      return "#d97706";
    };
    
    return (
      <View style={styles.giverItem}>
        <View style={styles.giverRank}>
          <View style={[styles.rankBadge, { backgroundColor: getRankColor() }]}>
            <Crown size={10} color="#fff" />
          </View>
          <Text style={[styles.rankNumber, { color: getRankColor() }]}>#{item.rank}</Text>
        </View>
        
        <Image source={{ uri: item.avatar }} style={styles.giverAvatar} />
        
        <View style={styles.giverInfo}>
          <Text style={[styles.giverName, { color: theme.text }]}>{item.name}</Text>
          <View style={styles.giverBadge}>
            <Sparkles size={10} color={theme.primary} />
            <Text style={[styles.giverBadgeText, { color: theme.primary }]}>{item.badge}</Text>
          </View>
        </View>
        
        <View style={styles.giverStats}>
          <Gift size={12} color={theme.primary} />
          <Text style={[styles.giverGiftCount, { color: theme.primary }]}>{item.gifts}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Calendar size={18} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Upcoming Birthdays</Text>
        </View>
        <TouchableOpacity style={styles.viewAllBtn} onPress={handleViewAllUpcoming}>
          <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
          <ChevronRight size={14} color={theme.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Upcoming List */}
      <FlatList
        data={UPCOMING}
        keyExtractor={(item) => item.id}
        renderItem={renderUpcomingItem}
        scrollEnabled={false}
        contentContainerStyle={styles.upcomingList}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
      
      {/* Sync Calendar Banner - NOW CONNECTED TO CALENDAR SCREEN */}
      <TouchableOpacity 
        style={[styles.syncBanner, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '20' }]}
        onPress={handleSyncCalendar}
        activeOpacity={0.8}
      >
        <View style={styles.syncContent}>
          <Calendar size={24} color={theme.primary} />
          <View style={styles.syncTextContainer}>
            <Text style={[styles.syncTitle, { color: theme.primary }]}>Sync Your Calendar</Text>
            <Text style={[styles.syncSubtitle, { color: theme.subText }]}>Connect to see celebrations from contacts</Text>
          </View>
        </View>
        <ChevronRight size={16} color={theme.primary} />
      </TouchableOpacity>
      
      {/* Top Gift Givers Section */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <View style={styles.footerHeader}>
          <Text style={[styles.footerTitle, { color: theme.subText }]}>🏆 Top Gift Givers</Text>
          <TouchableOpacity onPress={handleLeaderboardPress}>
            <Text style={[styles.leaderboardLink, { color: theme.primary }]}>Leaderboard</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={TOP_GIVERS}
          keyExtractor={(item) => item.id}
          renderItem={renderGiverItem}
          scrollEnabled={false}
          contentContainerStyle={styles.giversList}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    color: '#4f46e5',
    fontSize: 11,
    fontWeight: '700',
  },
  upcomingList: {
    gap: 12,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  upcomingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },
  dayBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  upcomingInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  daysLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daysLeft: {
    fontSize: 10,
    fontWeight: '700',
  },
  daysLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  daysLabelText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  upcomingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  wishBtn: {
    backgroundColor: '#4f46e5',
  },
  wishBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  giftBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
  },
  giftBtnText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  syncContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  syncTextContainer: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  syncSubtitle: {
    fontSize: 10,
    fontWeight: '500',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 16,
  },
  footerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  leaderboardLink: {
    fontSize: 10,
    fontWeight: '700',
  },
  giversList: {
    gap: 12,
  },
  giverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  giverRank: {
    width: 40,
    alignItems: 'center',
  },
  rankBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  rankNumber: {
    fontSize: 9,
    fontWeight: '800',
  },
  giverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  giverInfo: {
    flex: 1,
  },
  giverName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  giverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  giverBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  giverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  giverGiftCount: {
    fontSize: 12,
    fontWeight: '800',
  },
});
