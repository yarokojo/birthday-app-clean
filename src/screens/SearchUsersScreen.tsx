import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Image, Alert } from 'react-native';
import { ArrowLeft, Search, UserPlus, UserCheck, X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isFriend: boolean;
  requestSent?: boolean;
}

interface SearchUsersScreenProps {
  onBack: () => void;
  onAddFriend: (userId: string, name: string) => void;
  existingFriends: string[];
  pendingRequests: string[];
  currentUserId: string;
}

export default function SearchUsersScreen({ 
  onBack, 
  onAddFriend, 
  existingFriends, 
  pendingRequests,
  currentUserId 
}: SearchUsersScreenProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock users for demonstration
  const mockUsers: User[] = [
    { id: 'user_2', name: 'Sarah Jenkins', username: '@sarahj', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', isFriend: false },
    { id: 'user_3', name: 'Marcus Thorne', username: '@marcus_t', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', isFriend: false },
    { id: 'user_4', name: 'Elena Rodriguez', username: '@elena_r', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', isFriend: false },
    { id: 'user_5', name: 'David Kim', username: '@davidk', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', isFriend: false },
    { id: 'user_6', name: 'Chloe Williams', username: '@chloew', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', isFriend: false },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      const filtered = mockUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
      );
      const results = filtered.map(user => ({
        ...user,
        isFriend: existingFriends.includes(user.id),
        requestSent: pendingRequests.includes(user.id),
      }));
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isFriend = existingFriends.includes(item.id);
    const requestSent = pendingRequests.includes(item.id);
    
    return (
      <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.userUsername, { color: theme.subText }]}>{item.username}</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.addBtn, 
            { backgroundColor: isFriend ? theme.itemBg : theme.primary },
            (isFriend || requestSent) && { opacity: 0.7 }
          ]}
          onPress={() => {
            if (!isFriend && !requestSent) {
              onAddFriend(item.id, item.name);
            } else if (isFriend) {
              Alert.alert('Already Friends', `You are already friends with ${item.name}`);
            } else if (requestSent) {
              Alert.alert('Request Sent', `Friend request already sent to ${item.name}`);
            }
          }}
          disabled={isFriend || requestSent}
        >
          {isFriend ? (
            <UserCheck size={18} color={theme.subText} />
          ) : requestSent ? (
            <X size={18} color={theme.subText} />
          ) : (
            <UserPlus size={18} color="#fff" />
          )}
          <Text style={[styles.addBtnText, { color: isFriend ? theme.subText : '#fff' }]}>
            {isFriend ? 'Friends' : requestSent ? 'Requested' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Find Friends</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Search size={20} color={theme.subText} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by name or username..."
          placeholderTextColor={theme.subText}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <X size={18} color={theme.subText} />
          </TouchableOpacity>
        )}
      </View>

      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.resultsList}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      ) : searchQuery.length > 1 ? (
        <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Search size={48} color={theme.subText} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No users found</Text>
          <Text style={[styles.emptySubtitle, { color: theme.subText }]}>Try a different search term</Text>
        </View>
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <UserPlus size={48} color={theme.subText} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Search for friends</Text>
          <Text style={[styles.emptySubtitle, { color: theme.subText }]}>Find people you know to celebrate with</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1 },
  backBtn: { padding: 8, borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 16, height: 48, borderRadius: 24, borderWidth: 1, gap: 12 },
  searchInput: { flex: 1, fontSize: 16 },
  resultsList: { padding: 16, paddingTop: 0 },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, gap: 12 },
  userAvatar: { width: 52, height: 52, borderRadius: 26 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '900' },
  userUsername: { fontSize: 12, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  addBtnText: { fontSize: 12, fontWeight: '900' },
  emptyContainer: { margin: 16, padding: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 24, borderWidth: 1, borderStyle: 'dashed' },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
});
