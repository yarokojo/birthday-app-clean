import "react-native-gesture-handler";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, SafeAreaView, Platform, Text, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

// Import screens
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import VideoScreen from "./src/screens/VideoScreen";
import PostScreen from "./src/screens/PostScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import GiftShopScreen from "./src/screens/GiftShopScreen";
import WalletScreen from "./src/screens/WalletScreen";
import NotificationScreen from "./src/screens/NotificationScreen";
import GroupGiftScreen from "./src/screens/GroupGiftScreen";
import PostDetailScreen from "./src/screens/PostDetailScreen";
import WebViewScreen from "./src/screens/WebViewScreen";
import PrivacyPolicyScreen from "./src/screens/PrivacyPolicyScreen";
import TermsAndConditionsScreen from "./src/screens/TermsAndConditionsScreen";
import FriendsScreen from "./src/screens/FriendsScreen";
import PrivacySettingsScreen from "./src/screens/PrivacySettingsScreen";
import BirthdayCalendarScreen from "./src/screens/BirthdayCalendarScreen";
import SearchUsersScreen from "./src/screens/SearchUsersScreen";

// Import components
import Header from "./src/components/Header";
import BottomNav from "./src/components/BottomNav";

// Import types
import { Post, Story, ReelItem, Transaction, GroupGift, ActivityItem, Celebrant, Friend, FriendRequest, PrivacySettings, DEFAULT_PRIVACY_SETTINGS, Comment } from "./src/types";

interface Notification {
  id: string;
  type: 'wish' | 'gift' | 'follow' | 'system';
  user: string;
  avatar: string;
  message: string;
  time: string;
  isRead: boolean;
}

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

function MainApp() {
  const { darkMode, theme } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 1024;
  const isTablet = width > 768 && width <= 1024;
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [view, setView] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [webViewTitle, setWebViewTitle] = useState<string | null>(null);
  const [userProfileImage, setUserProfileImage] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop");
  const [postMode, setPostMode] = useState<'post' | 'video'>('post');
  const [seenStoryIds, setSeenStoryIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [currentUserId, setCurrentUserId] = useState("current_user_1");
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  
  const [groupGifts, setGroupGifts] = useState<GroupGift[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  
  // Video progress state
  const [videoProgress, setVideoProgress] = useState<{ [key: string]: number }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [userProfile, setUserProfile] = useState({
    name: "Guest User",
    username: "@guest_user",
    bio: "Birthday celebration enthusiast! 🎂",
    location: "Celebration City",
    website: "celebrate.com",
    birthday: "1990-01-01",
  });
  
  const [accountData, setAccountData] = useState({
    email: "guest@celebration.com",
    phone: "",
    twoFactor: false,
    securityScore: 50,
    loginAlerts: false
  });

  // Save all data to AsyncStorage
  const saveAllData = async () => {
    try {
      await AsyncStorage.setItem("posts", JSON.stringify(posts));
      await AsyncStorage.setItem("stories", JSON.stringify(stories));
      await AsyncStorage.setItem("reels", JSON.stringify(reels));
      await AsyncStorage.setItem("notifications", JSON.stringify(notifications));
      await AsyncStorage.setItem("activities", JSON.stringify(activities));
      await AsyncStorage.setItem("transactions", JSON.stringify(transactions));
      await AsyncStorage.setItem("friends", JSON.stringify(friends));
      await AsyncStorage.setItem("friendRequests", JSON.stringify(friendRequests));
      await AsyncStorage.setItem("birthdays", JSON.stringify(birthdays));
      await AsyncStorage.setItem("groupGifts", JSON.stringify(groupGifts));
      await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));
      await AsyncStorage.setItem("userProfileImage", userProfileImage);
      await AsyncStorage.setItem("currentBalance", JSON.stringify(currentBalance));
      await AsyncStorage.setItem("seenStoryIds", JSON.stringify(Array.from(seenStoryIds)));
      await AsyncStorage.setItem("videoProgress", JSON.stringify(videoProgress));
      await AsyncStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
      console.log("All data saved successfully - Posts count:", posts.length);
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  };

  // Load data from AsyncStorage on app start
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const storedPosts = await AsyncStorage.getItem("posts");
        const storedStories = await AsyncStorage.getItem("stories");
        const storedReels = await AsyncStorage.getItem("reels");
        const storedNotifications = await AsyncStorage.getItem("notifications");
        const storedActivities = await AsyncStorage.getItem("activities");
        const storedTransactions = await AsyncStorage.getItem("transactions");
        const storedFriends = await AsyncStorage.getItem("friends");
        const storedFriendRequests = await AsyncStorage.getItem("friendRequests");
        const storedBirthdays = await AsyncStorage.getItem("birthdays");
        const storedGroupGifts = await AsyncStorage.getItem("groupGifts");
        const storedUserProfile = await AsyncStorage.getItem("userProfile");
        const storedUserProfileImage = await AsyncStorage.getItem("userProfileImage");
        const storedBalance = await AsyncStorage.getItem("currentBalance");
        const storedSeenStories = await AsyncStorage.getItem("seenStoryIds");
        const storedVideoProgress = await AsyncStorage.getItem("videoProgress");
        const storedAuth = await AsyncStorage.getItem("isAuthenticated");

        if (storedPosts) {
          const parsedPosts = JSON.parse(storedPosts);
          setPosts(parsedPosts);
          console.log("Posts loaded:", parsedPosts.length);
        }
        if (storedStories) setStories(JSON.parse(storedStories));
        if (storedReels) setReels(JSON.parse(storedReels));
        if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
        if (storedActivities) setActivities(JSON.parse(storedActivities));
        if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
        if (storedFriends) setFriends(JSON.parse(storedFriends));
        if (storedFriendRequests) setFriendRequests(JSON.parse(storedFriendRequests));
        if (storedBirthdays) setBirthdays(JSON.parse(storedBirthdays));
        if (storedGroupGifts) setGroupGifts(JSON.parse(storedGroupGifts));
        if (storedUserProfile) setUserProfile(JSON.parse(storedUserProfile));
        if (storedUserProfileImage) setUserProfileImage(storedUserProfileImage);
        if (storedBalance) setCurrentBalance(JSON.parse(storedBalance));
        if (storedSeenStories) setSeenStoryIds(new Set(JSON.parse(storedSeenStories)));
        if (storedVideoProgress) setVideoProgress(JSON.parse(storedVideoProgress));
        if (storedAuth) setIsAuthenticated(JSON.parse(storedAuth));
        
        console.log("All data loaded successfully");
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadAllData();
  }, []);

  // Save data whenever state changes
  useEffect(() => {
    if (isLoaded) {
      saveAllData();
    }
  }, [posts, stories, reels, notifications, activities, transactions, friends, friendRequests, birthdays, groupGifts, userProfile, userProfileImage, currentBalance, seenStoryIds, videoProgress, isAuthenticated, isLoaded]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    console.log("Refreshing feed...");
    
    // Simulate network request or reload from storage
    try {
      const storedPosts = await AsyncStorage.getItem("posts");
      if (storedPosts) {
        const parsedPosts = JSON.parse(storedPosts);
        setPosts(parsedPosts);
        console.log("Feed refreshed - Posts count:", parsedPosts.length);
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    }
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  }, []);

  const handleVideoProgress = (videoId: string, position: number) => {
    setVideoProgress(prev => ({
      ...prev,
      [videoId]: position
    }));
  };

  const handleAcceptRequest = (requestId: string) => {
    Alert.alert("Request Accepted", "Friend request accepted!");
  };

  const handleRejectRequest = (requestId: string) => {
    Alert.alert("Request Rejected", "Friend request rejected");
  };

  const handleRemoveFriend = (friendId: string) => {
    Alert.alert("Friend Removed", "Friend has been removed");
  };

  const handleSendFriendRequest = (userId: string, userName: string) => {
    Alert.alert("Request Sent", `Friend request sent to ${userName}`);
  };

  const handleBlockUser = (userId: string) => {
    Alert.alert("User Blocked", "User has been blocked");
  };

  const handleToggleBirthdayReminder = (userId: string) => {
    setBirthdays(birthdays.map(b => 
      b.userId === userId ? { ...b, reminderSet: !b.reminderSet } : b
    ));
  };

  const handleSendWish = (userId: string, name: string) => {
    Alert.alert("Wish Sent", `Birthday wish sent to ${name}! 🎂`);
  };

  const handlePost = (content: string, image?: string, video?: string, location?: string, celebrationType?: any, celebrantName?: string, feeling?: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      authorId: currentUserId,
      authorName: userProfile.name,
      authorHandle: userProfile.username,
      authorImage: userProfileImage,
      content,
      timestamp: new Date().toLocaleString(),
      likes: 0,
      comments: 0,
      reposts: 0,
      views: 0,
      image,
      video,
      location,
      celebrationType,
      celebrantName,
      feeling,
      isBookmarked: false,
      isFollowed: false,
      isEdited: false,
      commentsList: []
    };
    setPosts([newPost, ...posts]);
    
    if (video) {
      const newReel: ReelItem = {
        id: newPost.id,
        user: userProfile.name,
        handle: userProfile.username,
        avatar: userProfileImage,
        description: content,
        music: "Birthday Celebration",
        likes: "0",
        comments: "0",
        videoUrl: video,
        poster: image || "https://images.unsplash.com/photo-1464347744102-11db6282f854?w=800",
        isBirthday: celebrationType === 'birthday'
      };
      setReels([newReel, ...reels]);
      setActiveTab("video");
    } else {
      setActiveTab("home");
    }
    
    Alert.alert("Success", "Your post has been shared!");
  };

  const handleEditPost = (postId: string, newContent: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: newContent, isEdited: true } : p));
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, likes: p.likes + 1 };
      }
      return p;
    }));
  };

  const handleAddComment = (postId: string, content: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newComment = {
          id: Date.now().toString(),
          authorId: currentUserId,
          authorName: userProfile.name,
          authorImage: userProfileImage,
          content,
          timestamp: "Just now",
          isOwn: true
        };
        return { 
          ...p, 
          comments: (p.comments || 0) + 1, 
          commentsList: [...(p.commentsList || []), newComment] 
        };
      }
      return p;
    }));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setReels(prev => prev.filter(r => r.id !== postId));
    Alert.alert("Deleted", "Post has been deleted");
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId && p.commentsList) {
        return { 
          ...p, 
          comments: Math.max(0, (p.comments || 0) - 1), 
          commentsList: p.commentsList.filter(c => c.id !== commentId) 
        };
      }
      return p;
    }));
  };

  const handleEditComment = (postId: string, commentId: string, newContent: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId && p.commentsList) {
        return { 
          ...p, 
          commentsList: p.commentsList.map(c => c.id === commentId ? { ...c, content: newContent } : c) 
        };
      }
      return p;
    }));
  };

  const handleToggleFollow = (authorHandle: string) => {
    setPosts(prev => prev.map(p => 
      p.authorHandle === authorHandle ? { ...p, isFollowed: !p.isFollowed } : p
    ));
  };

  const handleRepost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, reposts: p.reposts + 1 };
      }
      return p;
    }));
  };

  const handleToggleBookmark = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, isBookmarked: !p.isBookmarked };
      }
      return p;
    }));
  };

  const handleAddStory = (imageUrl: string, contentUrl: string, isVideo?: boolean) => {
    const newStory: Story = {
      id: Date.now().toString(),
      userName: userProfile.name,
      imageUrl: userProfileImage,
      contentUrl,
      isVideo,
      timestamp: "Just now",
      isUser: true
    };
    setStories([newStory, ...stories]);
  };

  const handleSeenStory = (storyId: string) => {
    setSeenStoryIds(prev => new Set(prev).add(storyId));
  };

  const handleLogin = (userData: { name: string; email: string; birthday: string }) => {
    setUserProfile(prev => ({ 
      ...prev, 
      name: userData.name, 
      username: `@${userData.name.toLowerCase().replace(/\s+/g, '_')}`, 
      birthday: userData.birthday 
    }));
    setAccountData(prev => ({ ...prev, email: userData.email }));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleWish = (celebrantName: string) => {
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      text: `Sent a birthday wish to ${celebrantName}`,
      time: "Just now",
      type: "social",
      iconName: "Heart",
      color: "#ec4899",
      bg: "#fdf2f8"
    };
    setActivities([newActivity, ...activities]);
    
    const newNotif: Notification = {
      id: Date.now().toString(),
      type: 'wish',
      user: celebrantName,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      message: `sent a birthday wish to ${celebrantName}! 🎂`,
      time: "Just now",
      isRead: false
    };
    setNotifications([newNotif, ...notifications]);
    
    Alert.alert("Wish Sent", `Your birthday wish to ${celebrantName} has been sent!`);
  };

  const handleGiftPurchase = (giftName: string, price: number, celebrantName: string) => {
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      text: `Sent ${giftName} to ${celebrantName}`,
      time: "Just now",
      type: "gift",
      iconName: "Package",
      color: "#f59e0b",
      bg: "#fef3c7"
    };
    setActivities([newActivity, ...activities]);
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: "gift_sent",
      amount: price,
      date: "Just now",
      senderName: celebrantName,
      status: "completed"
    };
    setTransactions([newTransaction, ...transactions]);

    const newNotif: Notification = {
      id: Date.now().toString(),
      type: 'gift',
      user: celebrantName,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      message: `received your ${giftName} and is so happy! 🎁`,
      time: "Just now",
      isRead: false
    };
    setNotifications([newNotif, ...notifications]);
    
    Alert.alert("Gift Sent", `Your ${giftName} has been sent to ${celebrantName}!`);
  };

  const navigateTo = (screen: string, id?: string, mode?: 'post' | 'video', url?: string, title?: string) => {
    const mainTabs = ["home", "calendar", "video", "gift_shop", "friends", "profile"];
    if (mainTabs.includes(screen)) {
      handleTabChange(screen);
      return;
    }
    if (screen === "post_detail" && id) setSelectedPostId(id);
    if (screen === "post") setPostMode(mode || 'post');
    if (screen === "webview" && url) { setWebViewUrl(url); setWebViewTitle(title || null); }
    setView(screen);
  };

  const handleTabChange = (tab: string) => {
    setView(null);
    setSelectedPostId(null);
    setSelectedVideoId(null);
    setWebViewUrl(null);
    setActiveTab(tab);
  };

  const renderScreen = () => {
    if (!isLoaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      );
    }

    if (!isAuthenticated) {
      return <AuthScreen onLogin={handleLogin} />;
    }

    if (view === "post") {
      return <PostScreen userProfileImage={userProfileImage} userName={userProfile.name} initialMode={postMode} onPost={handlePost} onBack={() => setView(null)} />;
    }
    if (view === "video") {
      return <VideoScreen reels={reels} userProfileImage={userProfileImage} onBack={() => setView(null)} onNavigate={navigateTo} onProgressUpdate={handleVideoProgress} />;
    }
    if (view === "notifications") {
      return <NotificationScreen notifications={notifications} setNotifications={setNotifications} onBack={() => setView(null)} />;
    }
    if (view === "gift_shop") {
      return <GiftShopScreen onBack={() => setView(null)} onNavigate={navigateTo} searchQuery={searchQuery} onBuyGift={handleGiftPurchase} />;
    }
    if (view === "wallet") {
      return <WalletScreen balance={currentBalance} transactions={transactions} setBalance={setCurrentBalance} setTransactions={setTransactions} onBack={() => setView(null)} />;
    }
    if (view === "privacy_policy") {
      return <PrivacyPolicyScreen onBack={() => setView(null)} />;
    }
    if (view === "terms") {
      return <TermsAndConditionsScreen onBack={() => setView(null)} />;
    }
    if (view === "privacy_settings") {
      return <PrivacySettingsScreen onBack={() => setView(null)} settings={privacySettings} onUpdateSettings={setPrivacySettings} />;
    }
    if (view === "birthday_calendar") {
      return <BirthdayCalendarScreen onBack={() => setView(null)} birthdays={birthdays} onToggleReminder={handleToggleBirthdayReminder} onWish={handleSendWish} />;
    }
    if (view === "search_users") {
      return <SearchUsersScreen onBack={() => setView(null)} onAddFriend={handleSendFriendRequest} existingFriends={friends.map(f => f.userId)} pendingRequests={friendRequests.map(r => r.fromUserId)} currentUserId={currentUserId} />;
    }
    if (view === "group_gifts") {
      return <GroupGiftScreen onBack={() => setView(null)} onNavigate={navigateTo} pools={groupGifts} setPools={setGroupGifts} />;
    }
    if (view === "video_player" && selectedVideoId) {
      let video = reels.find(r => r.id === selectedVideoId);
      if (!video) {
        const post = posts.find(p => p.id === selectedVideoId);
        if (post && post.video) {
          video = {
            id: post.id,
            user: post.authorName,
            handle: post.authorHandle,
            avatar: post.authorImage,
            description: post.content,
            music: "Birthday Celebration",
            likes: String(post.likes),
            comments: String(post.comments),
            videoUrl: post.video,
            poster: post.image || "https://images.unsplash.com/photo-1464347744102-11db6282f854?w=800",
            isBirthday: post.celebrationType === 'birthday'
          };
        }
      }
      if (video && video.videoUrl) {
        const savedProgress = videoProgress[selectedVideoId] || 0;
        return <VideoScreen reels={[{ ...video, initialPosition: savedProgress }]} userProfileImage={userProfileImage} onBack={() => { setView(null); setSelectedVideoId(null); }} onNavigate={navigateTo} onProgressUpdate={handleVideoProgress} />;
      } else {
        setView(null);
        setSelectedVideoId(null);
        Alert.alert("Error", "Video file not found or corrupted");
      }
    }
    if (view === "post_detail" && selectedPostId) {
      const post = posts.find(p => p.id === selectedPostId);
      if (post) {
        if (post.video) {
          setSelectedVideoId(post.id);
          setView("video_player");
          return null;
        }
        return <PostDetailScreen post={post} onBack={() => setView(null)} currentUserId={currentUserId} onEditPost={handleEditPost} onLikePost={handleLikePost} onEditComment={handleEditComment} onAddComment={handleAddComment} onDeletePost={handleDeletePost} onDeleteComment={handleDeleteComment} onToggleFollow={handleToggleFollow} onRepost={handleRepost} onToggleBookmark={handleToggleBookmark} userProfileImage={userProfileImage} />;
      }
    }

    const homeProps = {
      onNavigate: navigateTo,
      posts,
      stories,
      seenStoryIds,
      userProfileImage,
      onSeenStory: handleSeenStory,
      onAddStory: handleAddStory,
      onEditPost: handleEditPost,
      onLikePost: handleLikePost,
      onEditComment: handleEditComment,
      onAddComment: handleAddComment,
      onDeletePost: handleDeletePost,
      onDeleteComment: handleDeleteComment,
      onToggleFollow: handleToggleFollow,
      onRepost: handleRepost,
      onToggleBookmark: handleToggleBookmark,
      onWish: handleWish,
      currentUserId,
      videoProgress,
      onVideoProgress: handleVideoProgress,
      onRefresh: handleRefresh,
      isRefreshing,
    };

    const filteredPosts = posts.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()) || p.authorName.toLowerCase().includes(searchQuery.toLowerCase()));

    switch (activeTab) {
      case "home":
        return <HomeScreen {...homeProps} posts={filteredPosts} />;
      case "calendar":
        return <CalendarScreen 
          searchQuery={searchQuery} 
          onWishClick={handleWish} 
          onGiftClick={() => navigateTo('gift_shop')} 
          friendsBirthdays={birthdays} 
          onToggleReminder={handleToggleBirthdayReminder} 
          onNavigate={navigateTo}
          onBack={() => handleTabChange("home")}
        />;
      case "video":
        return <VideoScreen reels={reels} userProfileImage={userProfileImage} onBack={() => setActiveTab("home")} onNavigate={navigateTo} onProgressUpdate={handleVideoProgress} />;
      case "gift_shop":
        return <GiftShopScreen onBack={() => handleTabChange("home")} onNavigate={navigateTo} searchQuery={searchQuery} onBuyGift={handleGiftPurchase} />;
      case "friends":
        return <FriendsScreen 
          onBack={() => handleTabChange("home")} 
          onNavigate={navigateTo}
          friends={friends} 
          friendRequests={friendRequests}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          onRemoveFriend={handleRemoveFriend}
          onSendFriendRequest={handleSendFriendRequest}
          onBlockUser={handleBlockUser}
          currentUserId={currentUserId}
        />;
      case "profile":
        return <ProfileScreen 
          searchQuery={searchQuery} 
          userProfileImage={userProfileImage} 
          onUpdateProfileImage={setUserProfileImage} 
          onNavigate={navigateTo} 
          profile={userProfile} 
          setProfile={setUserProfile} 
          accountData={accountData} 
          setAccountData={setAccountData} 
          activities={activities} 
          setActivities={setActivities} 
          onLogout={handleLogout} 
        />;
      default:
        return <HomeScreen {...homeProps} posts={filteredPosts} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
        <StatusBar style={darkMode ? "light" : "dark"} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} style={{ flex: 1 }}>
          <View style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border, maxWidth: isLargeScreen ? 1200 : (isTablet ? 800 : '100%'), borderLeftWidth: (isLargeScreen || isTablet) ? 1 : 0, borderRightWidth: (isLargeScreen || isTablet) ? 1 : 0 }]}>
            {!view && activeTab !== "video" && activeTab !== "calendar" && activeTab !== "friends" && activeTab !== "profile" && activeTab !== "gift_shop" && (
              <Header onNavigate={navigateTo} searchQuery={searchQuery} onSearchChange={setSearchQuery} userProfileImage={userProfileImage} unreadCount={unreadCount} />
            )}
            <View style={styles.screenContent}>{renderScreen()}</View>
            <BottomNav activeTab={activeTab as any} setActiveTab={handleTabChange as any} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, alignSelf: 'center', width: '100%', overflow: 'hidden' },
  screenContent: { flex: 1 },
});

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
