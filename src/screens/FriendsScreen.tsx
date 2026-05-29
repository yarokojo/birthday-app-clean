import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, TextInput, Modal, Alert, FlatList, SafeAreaView, Platform } from "react-native";
import { ArrowLeft, Search, UserPlus, UserCheck, X, MessageCircle, MoreHorizontal, Settings, Star, Gift, Cake, Check, Users, User, Bell } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { Friend, FriendRequest } from "../types";

interface FriendsScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string, id?: string) => void;
  friends?: Friend[];
  friendRequests?: FriendRequest[];
  onAcceptRequest?: (requestId: string) => void;
  onRejectRequest?: (requestId: string) => void;
  onRemoveFriend?: (friendId: string) => void;
  onSendFriendRequest?: (userId: string, userName: string) => void;
  onBlockUser?: (userId: string) => void;
  currentUserId?: string;
  unreadCount?: number;
}

// Mock Friends Data
const MOCK_FRIENDS: Friend[] = [
  { 
    id: "f1", 
    userId: "u1", 
    name: "Sarah Johnson", 
    username: "@sarahj", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop", 
    status: 'accepted', 
    since: "2024-01-15",
    mutualFriends: 12
  },
  { 
    id: "f2", 
    userId: "u2", 
    name: "Michael Chen", 
    username: "@mikechen", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop", 
    status: 'accepted', 
    since: "2024-02-20",
    mutualFriends: 8
  },
  { 
    id: "f3", 
    userId: "u3", 
    name: "Emma Williams", 
    username: "@emmaw", 
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop", 
    status: 'accepted', 
    since: "2024-03-10",
    mutualFriends: 15
  },
  { 
    id: "f4", 
    userId: "u4", 
    name: "David Kim", 
    username: "@davidk", 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop", 
    status: 'accepted', 
    since: "2024-04-05",
    mutualFriends: 5
  },
  { 
    id: "f5", 
    userId: "u5", 
    name: "Jessica Lee", 
    username: "@jesslee", 
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop", 
    status: 'accepted', 
    since: "2024-05-12",
    mutualFriends: 9
  },
];

// Mock Friend Requests
const MOCK_REQUESTS: FriendRequest[] = [
  {
    id: "r1",
    fromUserId: "u6",
    fromUserName: "Oliver Smith",
    fromUserAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    toUserId: "current_user",
    timestamp: "2024-06-10T10:30:00Z",
    status: 'pending'
  },
  {
    id: "r2",
    fromUserId: "u7",
    fromUserName: "Sophia Martinez",
    fromUserAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    toUserId: "current_user",
    timestamp: "2024-06-09T15:20:00Z",
    status: 'pending'
  },
  {
    id: "r3",
    fromUserId: "u8",
    fromUserName: "James Wilson",
    fromUserAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
    toUserId: "current_user",
    timestamp: "2024-06-08T09:45:00Z",
    status: 'pending'
  },
];

// Mock Search Results
const MOCK_SEARCH_RESULTS = [
  { id: "s1", userId: "search1", name: "Alice Cooper", username: "@alicec", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e9b?w=150&h=150&fit=crop", isFriend: false, requestSent: false },
  { id: "s2", userId: "search2", name: "Tom Holland", username: "@tomh", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop", isFriend: false, requestSent: false },
  { id: "s3", userId: "search3", name: "Zoe Miller", username: "@zoem", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop", isFriend: false, requestSent: false },
  { id: "s4", userId: "search4", name: "Chris Evans", username: "@chrise", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop", isFriend: true, requestSent: false },
];

export default function FriendsScreen({
  onBack,
  onNavigate,
  friends: externalFriends,
  friendRequests: externalRequests,
  onAcceptRequest: externalAccept,
  onRejectRequest: externalReject,
  onRemoveFriend: externalRemove,
  onSendFriendRequest: externalSend,
  onBlockUser: externalBlock,
  currentUserId = "current_user",
  unreadCount = 0
}: FriendsScreenProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [searchResults, setSearchResults] = useState(MOCK_SEARCH_RESULTS);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [localFriends, setLocalFriends] = useState<Friend[]>(externalFriends && externalFriends.length > 0 ? externalFriends : MOCK_FRIENDS);
  const [localRequests, setLocalRequests] = useState<FriendRequest[]>(externalRequests && externalRequests.length > 0 ? externalRequests : MOCK_REQUESTS);

  // Use external data or fallback to mock data
  const friends = localFriends;
  const friendRequests = localRequests;
  
  const onAcceptRequest = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      const newFriend: Friend = {
        id: request.fromUserId,
        userId: request.fromUserId,
        name: request.fromUserName,
        username: `@${request.fromUserName.toLowerCase().replace(/\s/g, '_')}`,
        avatar: request.fromUserAvatar,
        status: 'accepted',
        since: new Date().toISOString(),
        mutualFriends: 0
      };
      setLocalFriends([newFriend, ...localFriends]);
      setLocalRequests(localRequests.filter(r => r.id !== requestId));
      Alert.alert("Request Accepted", `${request.fromUserName} is now your friend! 🎉`);
    }
    if (externalAccept) externalAccept(requestId);
  };
  
  const onRejectRequest = (requestId: string) => {
    setLocalRequests(localRequests.filter(r => r.id !== requestId));
    Alert.alert("Request Rejected", "Friend request has been rejected");
    if (externalReject) externalReject(requestId);
  };
  
  const onRemoveFriend = (friendId: string) => {
    setLocalFriends(localFriends.filter(f => f.id !== friendId));
    Alert.alert("Friend Removed", "Friend has been removed");
    if (externalRemove) externalRemove(friendId);
  };
  
  const onSendFriendRequest = (userId: string, userName: string) => {
    setSentRequests([...sentRequests, userId]);
    setSearchResults(prev => prev.map(user => 
      user.userId === userId ? { ...user, requestSent: true } : user
    ));
    Alert.alert("Request Sent", `Friend request sent to ${userName}!`);
    if (externalSend) externalSend(userId, userName);
  };
  
  const onBlockUser = (userId: string) => {
    Alert.alert("User Blocked", "User has been blocked");
    if (externalBlock) externalBlock(userId);
  };

  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingRequests = friendRequests.filter(r => r.toUserId === currentUserId && r.status === 'pending');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      const filtered = MOCK_SEARCH_RESULTS.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
      );
      const enhancedResults = filtered.map(user => ({
        ...user,
        isFriend: localFriends.some(f => f.userId === user.userId || f.name === user.name),
        requestSent: sentRequests.includes(user.userId)
      }));
      setSearchResults(enhancedResults);
    } else {
      const enhancedResults = MOCK_SEARCH_RESULTS.map(user => ({
        ...user,
        isFriend: localFriends.some(f => f.userId === user.userId || f.name === user.name),
        requestSent: sentRequests.includes(user.userId)
      }));
      setSearchResults(enhancedResults);
    }
  };

  const handleNotifications = () => {
    if (onNavigate) {
      onNavigate('notifications');
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={[styles.friendCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
      <View style={styles.friendInfo}>
        <Text style={[styles.friendName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.friendUsername, { color: theme.subText }]}>{item.username}</Text>
        {item.mutualFriends && (
          <View style={styles.mutualContainer}>
            <Star size={10} color={theme.primary} />
            <Text style={[styles.mutualText, { color: theme.subText }]}>{item.mutualFriends} mutual friends</Text>
          </View>
        )}
      </View>
      <View style={styles.friendActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.itemBg }]} onPress={() => setSelectedFriend(item)}>
          <MoreHorizontal size={18} color={theme.subText} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.messageBtn, { backgroundColor: theme.primary }]}>
          <MessageCircle size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRequestItem = ({ item }: { item: FriendRequest }) => (
    <View style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Image source={{ uri: item.fromUserAvatar }} style={styles.requestAvatar} />
      <View style={styles.requestInfo}>
        <Text style={[styles.requestName, { color: theme.text }]}>{item.fromUserName}</Text>
        <Text style={[styles.requestTime, { color: theme.subText }]}>{new Date(item.timestamp).toLocaleDateString()}</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: theme.primary }]} onPress={() => onAcceptRequest(item.id)}>
          <UserCheck size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rejectBtn, { backgroundColor: theme.itemBg }]} onPress={() => onRejectRequest(item.id)}>
          <X size={16} color={theme.subText} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchItem = ({ item }: { item: typeof MOCK_SEARCH_RESULTS[0] & { isFriend?: boolean; requestSent?: boolean } }) => {
    const isFriend = item.isFriend || localFriends.some(f => f.userId === item.userId || f.name === item.name);
    const isRequestSent = item.requestSent || sentRequests.includes(item.userId);
    
    return (
      <View style={[styles.searchResultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Image source={{ uri: item.avatar }} style={styles.searchAvatar} />
        <View style={styles.searchInfo}>
          <Text style={[styles.searchName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.searchUsername, { color: theme.subText }]}>{item.username}</Text>
          {isFriend && (
            <View style={styles.friendBadge}>
              <UserCheck size={10} color={theme.primary} />
              <Text style={[styles.friendBadgeText, { color: theme.primary }]}>Friend</Text>
            </View>
          )}
          {isRequestSent && !isFriend && (
            <View style={[styles.friendBadge, { backgroundColor: theme.primary + '10' }]}>
              <Check size={10} color={theme.primary} />
              <Text style={[styles.friendBadgeText, { color: theme.primary }]}>Request Sent</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={[
            styles.addFriendBtn, 
            { backgroundColor: isFriend || isRequestSent ? theme.itemBg : theme.primary },
            (isFriend || isRequestSent) && { opacity: 0.7 }
          ]}
          onPress={() => {
            if (!isFriend && !isRequestSent) {
              onSendFriendRequest(item.userId, item.name);
            } else if (isFriend) {
              Alert.alert("Already Friends", `You are already friends with ${item.name}`);
            } else if (isRequestSent) {
              Alert.alert("Request Sent", `Friend request already sent to ${item.name}`);
            }
          }}
          disabled={isFriend || isRequestSent}
        >
          {isFriend ? (
            <UserCheck size={16} color={theme.subText} />
          ) : isRequestSent ? (
            <Check size={16} color={theme.subText} />
          ) : (
            <UserPlus size={16} color="#fff" />
          )}
          <Text style={[styles.addFriendText, { color: isFriend || isRequestSent ? theme.subText : '#fff' }]}>
            {isFriend ? 'Friends' : isRequestSent ? 'Requested' : 'Add Friend'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = (type: 'friends' | 'requests') => (
    <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {type === 'friends' ? (
        <>
          <UserCheck size={48} color={theme.subText} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Friends Yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.subText }]}>Search for friends to connect with</Text>
          <TouchableOpacity 
            style={[styles.findFriendsBtn, { backgroundColor: theme.primary }]}
            onPress={() => setActiveTab('search')}
          >
            <Search size={16} color="#fff" />
            <Text style={styles.findFriendsBtnText}>Find Friends</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <UserPlus size={48} color={theme.subText} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Friend Requests</Text>
          <Text style={[styles.emptySubtitle, { color: theme.subText }]}>When someone adds you, it will appear here</Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Custom Friends Header with Back Button and Notification Bell */}
      <View style={[styles.customHeader, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Friends</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('privacy_settings')} style={styles.headerBtn}>
            <Settings size={20} color={theme.text} />
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

      <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
        {[
          { id: 'friends', label: `Friends (${acceptedFriends.length})`, icon: UserCheck },
          { id: 'requests', label: `Requests (${pendingRequests.length})`, icon: UserPlus },
          { id: 'search', label: 'Search', icon: Search },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id as any)}
            style={[styles.tab, activeTab === tab.id && styles.tabActive, { borderBottomColor: activeTab === tab.id ? theme.primary : 'transparent' }]}
          >
            <tab.icon size={16} color={activeTab === tab.id ? theme.primary : theme.subText} />
            <Text style={[styles.tabLabel, { color: activeTab === tab.id ? theme.primary : theme.subText }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {activeTab === 'friends' && acceptedFriends.length === 0 && renderEmptyState('friends')}
        {activeTab === 'friends' && acceptedFriends.length > 0 && (
          <FlatList 
            data={acceptedFriends} 
            keyExtractor={(item) => item.id} 
            renderItem={renderFriendItem} 
            scrollEnabled={false} 
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />} 
          />
        )}

        {activeTab === 'requests' && pendingRequests.length === 0 && renderEmptyState('requests')}
        {activeTab === 'requests' && pendingRequests.length > 0 && (
          <FlatList 
            data={pendingRequests} 
            keyExtractor={(item) => item.id} 
            renderItem={renderRequestItem} 
            scrollEnabled={false} 
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />} 
          />
        )}

        {activeTab === 'search' && (
          <View>
            <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Search size={18} color={theme.subText} />
              <TextInput 
                placeholder="Search by name or username..." 
                placeholderTextColor={theme.subText} 
                style={[styles.searchInput, { color: theme.text }]} 
                value={searchQuery} 
                onChangeText={handleSearch}
                autoCapitalize="none"
              />
            </View>
            <FlatList 
              data={searchResults} 
              keyExtractor={(item) => item.id} 
              renderItem={renderSearchItem} 
              scrollEnabled={false} 
              contentContainerStyle={styles.searchResultsList}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />} 
              ListEmptyComponent={() => (
                <View style={[styles.noResultsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Search size={48} color={theme.subText} strokeWidth={1.5} />
                  <Text style={[styles.noResultsText, { color: theme.text }]}>No users found</Text>
                  <Text style={[styles.noResultsSubtext, { color: theme.subText }]}>Try a different search term</Text>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selectedFriend} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setSelectedFriend(null)} />
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Image source={{ uri: selectedFriend?.avatar }} style={styles.modalAvatar} />
            <Text style={[styles.modalName, { color: theme.text }]}>{selectedFriend?.name}</Text>
            <Text style={[styles.modalUsername, { color: theme.subText }]}>{selectedFriend?.username}</Text>
            {selectedFriend?.mutualFriends && (
              <View style={styles.modalMutual}>
                <Star size={12} color={theme.primary} />
                <Text style={[styles.modalMutualText, { color: theme.subText }]}>{selectedFriend.mutualFriends} mutual friends</Text>
              </View>
            )}
            <TouchableOpacity 
              style={[styles.modalOption, { borderBottomColor: theme.border }]} 
              onPress={() => { 
                setSelectedFriend(null); 
                Alert.alert("Wish Friend", `Send a birthday wish to ${selectedFriend?.name}?`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Send", onPress: () => Alert.alert("Wish Sent", `Birthday wish sent to ${selectedFriend?.name}! 🎂`) }
                ]);
              }}
            >
              <Cake size={18} color={theme.primary} />
              <Text style={[styles.modalOptionText, { color: theme.primary }]}>Send Birthday Wish</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalOption, { borderBottomColor: theme.border }]} 
              onPress={() => { 
                setSelectedFriend(null); 
                Alert.alert("Send Gift", `Send a gift to ${selectedFriend?.name}?`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Send", onPress: () => onNavigate && onNavigate('gift_shop') }
                ]);
              }}
            >
              <Gift size={18} color={theme.primary} />
              <Text style={[styles.modalOptionText, { color: theme.primary }]}>Send Gift</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalOption, { borderBottomColor: theme.border }]} 
              onPress={() => { 
                setSelectedFriend(null); 
                Alert.alert("Remove Friend", `Are you sure you want to remove ${selectedFriend?.name} from your friends?`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Remove", onPress: () => selectedFriend && onRemoveFriend(selectedFriend.id), style: "destructive" }
                ]);
              }}
            >
              <Text style={[styles.modalOptionText, { color: '#ef4444' }]}>Remove Friend</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalOption, styles.modalCancel]} onPress={() => setSelectedFriend(null)}>
              <Text style={[styles.modalOptionText, { color: theme.subText }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  customHeader: {
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
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 16 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderBottomWidth: 2 },
  tabActive: { borderBottomWidth: 2 },
  tabLabel: { fontSize: 12, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  friendCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, gap: 12 },
  friendAvatar: { width: 52, height: 52, borderRadius: 26 },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: '900' },
  friendUsername: { fontSize: 12, marginTop: 2 },
  mutualContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  mutualText: { fontSize: 10, fontWeight: '600' },
  friendActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  messageBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  requestCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, gap: 12 },
  requestAvatar: { width: 52, height: 52, borderRadius: 26 },
  requestInfo: { flex: 1 },
  requestName: { fontSize: 16, fontWeight: '900' },
  requestTime: { fontSize: 11, marginTop: 2 },
  requestActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, height: 48, borderRadius: 24, borderWidth: 1, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },
  searchResultsList: { paddingTop: 8 },
  searchResultCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, gap: 12 },
  searchAvatar: { width: 48, height: 48, borderRadius: 24 },
  searchInfo: { flex: 1 },
  searchName: { fontSize: 15, fontWeight: '800' },
  searchUsername: { fontSize: 11, marginTop: 2 },
  friendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: 'flex-start' },
  friendBadgeText: { fontSize: 9, fontWeight: '700' },
  addFriendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  addFriendText: { fontSize: 12, fontWeight: '700' },
  emptyContainer: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 24, borderWidth: 1, borderStyle: 'dashed' },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
  findFriendsBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  findFriendsBtnText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', borderRadius: 28, padding: 24, alignItems: 'center', gap: 12 },
  modalAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  modalName: { fontSize: 20, fontWeight: '900' },
  modalUsername: { fontSize: 13, fontWeight: '600' },
  modalMutual: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  modalMutualText: { fontSize: 11, fontWeight: '600' },
  modalOption: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  modalCancel: { borderBottomWidth: 0, marginTop: 8 },
  modalOptionText: { fontSize: 16, fontWeight: '600' },
  noResultsContainer: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', marginTop: 20 },
  noResultsText: { fontSize: 16, fontWeight: '700', marginTop: 16 },
  noResultsSubtext: { fontSize: 12, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
});
// Add this at the top of FriendsScreen component to handle mutualFriends safely
// When rendering, use: {item.mutualFriends && <Text>{item.mutualFriends} mutual friends</Text>}
