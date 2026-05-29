import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Image, Platform, RefreshControl, useWindowDimensions, FlatList } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import Stories from "../components/Stories";
import CelebrantCard from "../components/CelebrantCard";
import UpcomingPanel from "../components/UpcomingPanel";
import { Celebrant, Post, Story } from "../types";
import FeedCard from "../components/FeedCard";
import { LayoutGrid, Sparkles, CalendarRange, PlusCircle, Image as ImageIcon, Cake, Plus, Search, TrendingUp, Heart, MessageCircle, Gift, Trophy, Star, Users, Flame, Award, Crown, Zap } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

interface HomeScreenProps {
  onNavigate: (screen: string, id?: string, mode?: 'post' | 'video', url?: string, title?: string) => void;
  posts: Post[];
  stories: Story[];
  seenStoryIds: Set<string>;
  onSeenStory: (id: string) => void;
  onAddStory: (imageUrl: string, contentUrl: string, isVideo?: boolean) => void;
  onEditPost: (id: string, content: string, image?: string, video?: string, location?: string, celebrationType?: any, celebrantName?: string, feeling?: string) => void;
  onLikePost: (id: string) => void;
  onEditComment: (postId: string, commentId: string, content: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onToggleFollow: (authorHandle: string) => void;
  onRepost: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onWish: (celebrantName: string) => void;
  userProfileImage: string;
  currentUserId?: string;
  videoProgress?: { [key: string]: number };
  onVideoProgress?: (postId: string, position: number) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

// Trending celebrants data
const TRENDING_CELEBRANTS: (Celebrant & { engagement: number; trendingLevel: 'hot' | 'viral' | 'trending' })[] = [
  { id: "1", name: "Sarah Johnson", age: 28, date: "Today", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop", color: "#ec4899", engagement: 15420, trendingLevel: "viral" },
  { id: "2", name: "Michael Chen", age: 32, date: "Today", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", color: "#8b5cf6", engagement: 8920, trendingLevel: "hot" },
  { id: "3", name: "Emma Williams", age: 25, date: "Today", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop", color: "#f59e0b", engagement: 5670, trendingLevel: "trending" },
  { id: "4", name: "David Kim", age: 30, date: "Today", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop", color: "#06b6d4", engagement: 3450, trendingLevel: "trending" },
  { id: "5", name: "Jessica Lee", age: 27, date: "Today", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop", color: "#10b981", engagement: 2100, trendingLevel: "trending" },
];

// Today's birthday celebrants
const TODAYS_CELEBRANTS: Celebrant[] = [
  { id: "1", name: "Sarah Johnson", age: 28, date: "Today", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop", color: "#ec4899" },
  { id: "2", name: "Michael Chen", age: 32, date: "Today", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", color: "#8b5cf6" },
  { id: "3", name: "Emma Williams", age: 25, date: "Today", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop", color: "#f59e0b" },
  { id: "4", name: "David Kim", age: 30, date: "Today", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop", color: "#06b6d4" },
  { id: "5", name: "Jessica Lee", age: 27, date: "Today", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop", color: "#10b981" },
];

// Trending hashtags
const TRENDING_HASHTAGS = [
  { name: "#BirthdayVibes", count: "12.4K", trending: true },
  { name: "#BirthdayGirl", count: "8.2K", trending: true },
  { name: "#Celebration", count: "4.8K", trending: false },
  { name: "#PartyTime", count: "3.5K", trending: true },
  { name: "#HappyBirthday", count: "15.2K", trending: true },
  { name: "#BirthdayBoy", count: "6.1K", trending: false },
];

export default function HomeScreen({ 
  onNavigate, 
  posts, 
  stories,
  seenStoryIds,
  onSeenStory,
  onAddStory,
  onEditPost, 
  onLikePost, 
  onEditComment,
  onAddComment,
  onDeletePost,
  onDeleteComment,
  onToggleFollow,
  onRepost,
  onToggleBookmark,
  onWish,
  userProfileImage,
  currentUserId,
  videoProgress = {},
  onVideoProgress,
  onRefresh,
  isRefreshing: externalRefreshing
}: HomeScreenProps) {
  const { theme, darkMode } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 1024;
  const isTablet = width > 768 && width <= 1024;
  
  const scrollRef = React.useRef<ScrollView>(null);
  const [activeTopTab, setActiveTopTab] = useState("feeds");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  
  const prevPostsCount = React.useRef(posts.length);

  React.useEffect(() => {
    if (posts.length > prevPostsCount.current) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
    prevPostsCount.current = posts.length;
  }, [posts.length]);

  const refreshing = externalRefreshing !== undefined ? externalRefreshing : isRefreshing;

  const onRefreshHandler = React.useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
      }, 2000);
    }
  }, [onRefresh]);

  const tabs = [
    { id: "feeds", label: "Feeds", icon: LayoutGrid },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "today", label: "Today", icon: Cake },
    { id: "upcoming", label: "Upcoming", icon: CalendarRange },
  ];

  const trendingItems: any[] = [];

  const handlePostSelect = (post: Post) => {
    if (post.video) {
      onNavigate('video', post.id);
    } else {
      onNavigate('post_detail', post.id);
    }
  };

  const handleSendGift = (celebrantName: string) => {
    onNavigate('gift_shop');
  };

  const handleSendWish = (celebrantName: string) => {
    onWish(celebrantName);
  };

  const formatEngagement = (num: number) => {
    if (num >= 10000) return `${(num / 1000).toFixed(1)}K`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const getTrendingIcon = (level: string) => {
    switch(level) {
      case 'viral': return <Crown size={14} color="#fbbf24" />;
      case 'hot': return <Flame size={14} color="#ef4444" />;
      default: return <Zap size={14} color="#f59e0b" />;
    }
  };

  const getTrendingColor = (level: string) => {
    switch(level) {
      case 'viral': return "#fbbf24";
      case 'hot': return "#ef4444";
      default: return "#f59e0b";
    }
  };

  const renderTodayCelebrant = ({ item }: { item: Celebrant }) => (
    <View style={styles.verticalCelebrantCardWrapper}>
      <CelebrantCard 
        celebrant={item} 
        onGiftClick={() => handleSendGift(item.name)} 
        onWishClick={() => handleSendWish(item.name)}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.mainWrapper}>
        <ScrollView 
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          style={styles.feedScroll}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefreshHandler} 
              colors={[theme.primary]} 
              tintColor={theme.primary}
              title="Pull to refresh"
              titleColor={theme.subText}
            />
          }
        >
          <View style={[styles.contentLayout, (isLargeScreen || isTablet) && styles.contentLayoutRow]}>
            <View style={[styles.centerColumn, (isLargeScreen || isTablet) && { flex: 1.5 }]}>
              <Stories 
                stories={stories} 
                seenStoryIds={seenStoryIds} 
                onSeenStory={onSeenStory} 
                onAddStory={onAddStory}
                userProfileImage={userProfileImage}
              />
              
              <View style={[styles.tabBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTopTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setActiveTopTab(tab.id)}
                      style={styles.tabItem}
                    >
                      <Icon size={20} color={isActive ? theme.primary : theme.subText} />
                      <Text style={[styles.tabLabel, { color: isActive ? theme.primary : theme.subText }]}>{tab.label}</Text>
                      {isActive && (
                        <MotiView 
                          style={[styles.tabUnderline, { backgroundColor: theme.primary }]}
                          from={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <AnimatePresence>
                {activeTopTab === "feeds" && (
                  <MotiView
                    key="feeds"
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -10 }}
                    style={styles.screenPadding}
                  >
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: theme.text }]}>Trending Celebs</Text>
                      <MotiView 
                        from={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        transition={{ loop: true, duration: 1500, type: 'timing' }}
                      >
                        <View style={[styles.trendingLiveBadge, { backgroundColor: theme.primary + '15' }]}>
                          <Flame size={10} color={theme.primary} />
                          <Text style={[styles.liveText, { color: theme.primary }]}>TRENDING NOW</Text>
                        </View>
                      </MotiView>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.celebrantsScroll}>
                      {TRENDING_CELEBRANTS.map((celebrant, index) => (
                        <View key={celebrant.id} style={styles.trendingCelebrantWrapper}>
                          <View style={[styles.trendingRankBadge, { backgroundColor: getTrendingColor(celebrant.trendingLevel) }]}>
                            <Text style={styles.trendingRankText}>#{index + 1}</Text>
                          </View>
                          <CelebrantCard 
                            celebrant={celebrant} 
                            onGiftClick={() => handleSendGift(celebrant.name)} 
                            onWishClick={() => handleSendWish(celebrant.name)}
                          />
                          <View style={[styles.trendingEngagementBadge, { backgroundColor: getTrendingColor(celebrant.trendingLevel) + '20' }]}>
                            {getTrendingIcon(celebrant.trendingLevel)}
                            <Text style={[styles.trendingEngagementText, { color: getTrendingColor(celebrant.trendingLevel) }]}>
                              {formatEngagement(celebrant.engagement)}
                            </Text>
                          </View>
                          {index < 2 && (
                            <View style={[styles.trendingBadgeCorner, { backgroundColor: index === 0 ? '#fbbf24' : '#94a3b8' }]}>
                              <Award size={12} color="#fff" />
                            </View>
                          )}
                        </View>
                      ))}
                    </ScrollView>

                    <View style={styles.trendingContainer}>
                      <View style={styles.trendingHeader}>
                        <Text style={[styles.trendingTitle, { color: theme.subText }]}>🔥 Trending Hashtags</Text>
                        <TouchableOpacity>
                          <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
                        </TouchableOpacity>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
                        {TRENDING_HASHTAGS.filter(t => t.trending).map((tag) => (
                          <TouchableOpacity key={tag.name} style={[styles.trendingTag, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '20' }]}>
                            <TrendingUp size={12} color={theme.primary} />
                            <Text style={[styles.tagText, { color: theme.primary }]}>{tag.name}</Text>
                            <Text style={[styles.tagCount, { color: theme.primary }]}>{tag.count}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={[styles.createPostContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <Image source={{ uri: userProfileImage }} style={[styles.myAvatar, { backgroundColor: theme.itemBg }]} />
                      <TouchableOpacity onPress={() => onNavigate('post')} style={[styles.postInputPlaceholder, { backgroundColor: theme.itemBg }]}>
                        <Text style={[styles.placeholderText, { color: theme.subText }]}>Share a celebration...</Text>
                      </TouchableOpacity>
                      <View style={styles.inputActions}>
                        <TouchableOpacity style={styles.inputAction} onPress={() => onNavigate('post')}>
                          <PlusCircle size={20} color={theme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.inputAction} onPress={() => onNavigate('post', undefined, 'post')}>
                          <ImageIcon size={20} color={theme.secondary} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.feedList}>
                      {posts.length === 0 ? (
                        <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                          <Search size={48} color={theme.subText} strokeWidth={1.5} />
                          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Posts Found</Text>
                          <Text style={[styles.emptySubtitle, { color: theme.subText }]}>Create your first post by tapping "Share a celebration"</Text>
                          <TouchableOpacity 
                            style={[styles.createFirstBtn, { backgroundColor: theme.primary }]}
                            onPress={() => onNavigate('post')}
                          >
                            <Plus size={16} color="#fff" />
                            <Text style={styles.createFirstBtnText}>Create First Post</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        posts.map((post) => (
                          <FeedCard 
                            key={post.id} 
                            post={post} 
                            userProfileImage={userProfileImage}
                            currentUserId={currentUserId}
                            onEdit={onEditPost} 
                            onLike={() => onLikePost(post.id)} 
                            onEditComment={onEditComment}
                            onAddComment={(content) => onAddComment(post.id, content)}
                            onDelete={() => onDeletePost(post.id)}
                            onDeleteComment={(commentId) => onDeleteComment(post.id, commentId)}
                            onToggleFollow={() => onToggleFollow(post.authorHandle)}
                            onSelect={() => handlePostSelect(post)}
                            onRepost={() => onRepost(post.id)}
                            onToggleBookmark={() => onToggleBookmark(post.id)}
                            videoProgress={videoProgress}
                            onVideoProgress={onVideoProgress}
                          />
                        ))
                      )}
                    </View>
                  </MotiView>
                )}

                {activeTopTab === "trending" && (
                  <MotiView
                    key="trending"
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -10 }}
                    style={styles.screenPadding}
                  >
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: theme.text }]}>What's Trending</Text>
                      <View style={[styles.liveBadge, { backgroundColor: theme.primary + '15' }]}>
                        <TrendingUp size={12} color={theme.primary} />
                        <Text style={[styles.liveText, { color: theme.primary, marginLeft: 4 }]}>HOT</Text>
                      </View>
                    </View>

                    <View style={styles.trendingContainer}>
                      <Text style={[styles.trendingTitle, { color: theme.subText }]}>Popular Hashtags</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
                        {TRENDING_HASHTAGS.map((tag) => (
                          <TouchableOpacity key={tag.name} style={[styles.tag, { backgroundColor: theme.itemBg, borderColor: theme.border }]}>
                            <Text style={[styles.tagText, { color: theme.text }]}>{tag.name}</Text>
                            <Text style={[styles.tagCount, { color: theme.subText }]}>{tag.count}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.trendingCelebrantsSection}>
                      <Text style={[styles.trendingCelebrantsTitle, { color: theme.text }]}>🏆 Most Celebrated Today</Text>
                      {TRENDING_CELEBRANTS.slice(0, 3).map((celebrant, idx) => (
                        <View key={celebrant.id} style={[styles.trendingCelebrantItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                          <View style={[styles.trendingRank, { backgroundColor: idx === 0 ? '#fbbf24' : (idx === 1 ? '#94a3b8' : '#d97706') }]}>
                            <Text style={styles.trendingRankText}>#{idx + 1}</Text>
                          </View>
                          <Image source={{ uri: celebrant.imageUrl }} style={styles.trendingCelebrantAvatar} />
                          <View style={styles.trendingCelebrantInfo}>
                            <Text style={[styles.trendingCelebrantName, { color: theme.text }]}>{celebrant.name}</Text>
                            <Text style={[styles.trendingCelebrantAge, { color: theme.subText }]}>Turning {celebrant.age}</Text>
                          </View>
                          <View style={styles.trendingCelebrantStats}>
                            <Heart size={14} color="#ec4899" />
                            <Text style={styles.trendingStatText}>{formatEngagement(celebrant.engagement)}</Text>
                            <Gift size={14} color={theme.primary} style={{ marginLeft: 8 }} />
                            <Text style={styles.trendingStatText}>{Math.floor(celebrant.engagement / 50)}</Text>
                          </View>
                          <View style={[styles.trendingLevelBadge, { backgroundColor: getTrendingColor(celebrant.trendingLevel) + '15' }]}>
                            {getTrendingIcon(celebrant.trendingLevel)}
                            <Text style={[styles.trendingLevelText, { color: getTrendingColor(celebrant.trendingLevel) }]}>
                              {celebrant.trendingLevel.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    <View style={styles.trendingGrid}>
                      {trendingItems.length === 0 && (
                        <Text style={[styles.emptyText, { color: theme.subText, textAlign: 'center', padding: 40 }]}>No trending items yet</Text>
                      )}
                    </View>
                  </MotiView>
                )}

                {activeTopTab === "today" && (
                  <MotiView
                    key="today"
                    from={{ opacity: 0, translateX: 20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: -20 }}
                    style={styles.screenPadding}
                  >
                    <View style={[styles.birthdayHero, { backgroundColor: theme.primary }]}>
                      <View style={styles.birthdayHeroContent}>
                        <Text style={styles.birthdayHeroTitle}>🎂 Happy Birthday!</Text>
                        <Text style={styles.birthdayHeroSubtitle}>{TODAYS_CELEBRANTS.length} people celebrating today</Text>
                        <TouchableOpacity 
                          style={styles.birthdayHeroBtn}
                          onPress={() => onNavigate('post')}
                        >
                          <Plus size={14} color="#fff" />
                          <Text style={styles.birthdayHeroBtnText}>Send Group Wish</Text>
                          <Users size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.birthdayHeroDecor}>
                        <Cake size={80} color="#fff" opacity={0.2} />
                      </View>
                    </View>

                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: theme.text }]}>🎈 Today's Birthday Stars</Text>
                      <Text style={[styles.todayCount, { color: theme.primary }]}>{TODAYS_CELEBRANTS.length} Celebrants</Text>
                    </View>

                    <FlatList
                      data={TODAYS_CELEBRANTS}
                      keyExtractor={(item) => item.id}
                      renderItem={renderTodayCelebrant}
                      scrollEnabled={false}
                      contentContainerStyle={styles.verticalCelebrantsList}
                      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    />

                    <View style={styles.wishTemplatesSection}>
                      <Text style={[styles.wishTemplatesTitle, { color: theme.text }]}>✨ Quick Birthday Wishes</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wishTemplatesScroll}>
                        {[
                          "Happy Birthday! 🎂",
                          "Best day ever! 🎉",
                          "Cheers to you! 🥂",
                          "Make a wish! ✨",
                          "Party time! 🎊",
                          "You're amazing! 💫",
                        ].map((wish, idx) => (
                          <TouchableOpacity 
                            key={idx} 
                            style={[styles.wishTemplateCard, { backgroundColor: theme.itemBg, borderColor: theme.border }]}
                            onPress={() => {
                              const randomCelebrant = TODAYS_CELEBRANTS[Math.floor(Math.random() * TODAYS_CELEBRANTS.length)];
                              onWish(randomCelebrant.name);
                            }}
                          >
                            <Heart size={14} color={theme.primary} />
                            <Text style={[styles.wishTemplateText, { color: theme.text }]}>{wish}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    {posts.filter(p => p.celebrationType === 'birthday').length > 0 && (
                      <View style={styles.feedList}>
                        <Text style={[styles.feedSectionTitle, { color: theme.text }]}>🎂 Birthday Posts</Text>
                        {posts.filter(p => p.celebrationType === 'birthday').slice(0, 3).map((post) => (
                          <FeedCard 
                            key={post.id} 
                            post={post} 
                            userProfileImage={userProfileImage}
                            currentUserId={currentUserId}
                            onEdit={onEditPost} 
                            onLike={() => onLikePost(post.id)} 
                            onEditComment={onEditComment}
                            onAddComment={(content) => onAddComment(post.id, content)}
                            onDelete={() => onDeletePost(post.id)}
                            onDeleteComment={(commentId) => onDeleteComment(post.id, commentId)}
                            onToggleFollow={() => onToggleFollow(post.authorHandle)}
                            onSelect={() => handlePostSelect(post)}
                            onRepost={() => onRepost(post.id)}
                            onToggleBookmark={() => onToggleBookmark(post.id)}
                            videoProgress={videoProgress}
                            onVideoProgress={onVideoProgress}
                          />
                        ))}
                      </View>
                    )}
                  </MotiView>
                )}

                {activeTopTab === "upcoming" && (
                  <MotiView
                    key="upcoming"
                    from={{ opacity: 0, translateX: 20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: -20 }}
                    style={styles.screenPadding}
                  >
                    <UpcomingPanel 
                      onWishClick={onWish}
                      onGiftClick={() => onNavigate('gift_shop')}
                      onNavigate={onNavigate}
                    />
                  </MotiView>
                )}
              </AnimatePresence>
            </View>
            {(isLargeScreen || isTablet) && (
              <View style={styles.rightColumn}>
                <UpcomingPanel 
                  onWishClick={onWish} 
                  onGiftClick={() => onNavigate('gift_shop')}
                  onNavigate={onNavigate}
                />
                <View style={[styles.webBanner, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.webBannerTitle, { color: theme.text }]}>Premium Events</Text>
                  <Text style={[styles.webBannerDesc, { color: theme.subText }]}>Upgrade to host unlimited virtual parties with HD streaming.</Text>
                  <TouchableOpacity style={[styles.webBannerBtn, { backgroundColor: theme.primary }]}>
                    <Text style={styles.webBannerBtnText}>UPGRADE NOW</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainWrapper: { flex: 1, flexDirection: 'row' },
  feedScroll: { flex: 1 },
  contentLayout: { flex: 1 },
  contentLayoutRow: { flexDirection: 'row', paddingHorizontal: 0 },
  centerColumn: { flex: 1, maxWidth: '100%' },
  rightColumn: { width: 320, padding: 24, gap: 24, borderLeftWidth: 1, borderLeftColor: '#f1f5f9', backgroundColor: 'transparent' },
  webBanner: { padding: 24, borderRadius: 20, borderWidth: 1, gap: 12 },
  webBannerTitle: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase' },
  webBannerDesc: { fontSize: 12, lineHeight: 18 },
  webBannerBtn: { paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  webBannerBtnText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 8 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabLabel: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  tabUnderline: { position: 'absolute', bottom: 0, height: 2, width: '60%', borderRadius: 2 },
  screenPadding: { paddingHorizontal: 0, gap: 0 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginTop: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  trendingLiveBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: '700' },
  celebrantsScroll: { gap: 12, paddingHorizontal: 12, paddingBottom: 8, paddingTop: 8 },
  trendingCelebrantWrapper: { position: 'relative' },
  trendingRankBadge: { position: 'absolute', top: -6, left: -6, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', zIndex: 10, borderWidth: 2, borderColor: '#fff' },
  trendingRankText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  trendingEngagementBadge: { position: 'absolute', bottom: 45, right: 6, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, zIndex: 10 },
  trendingEngagementText: { fontSize: 8, fontWeight: '800' },
  trendingBadgeCorner: { position: 'absolute', top: -2, right: -2, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', zIndex: 10, borderWidth: 2, borderColor: '#fff' },
  trendingContainer: { gap: 8, paddingHorizontal: 12, marginVertical: 8 },
  trendingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendingTitle: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  viewAllText: { fontSize: 10, fontWeight: '700' },
  tagsScroll: { gap: 8 },
  trendingTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  tag: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagText: { fontSize: 11, fontWeight: '700' },
  tagCount: { fontSize: 10, fontWeight: '600' },
  createPostContainer: { padding: 12, borderTopWidth: 1, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 },
  myAvatar: { width: 36, height: 36, borderRadius: 18 },
  postInputPlaceholder: { flex: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  placeholderText: { fontSize: 13, fontWeight: '500' },
  inputActions: { flexDirection: 'row', gap: 4 },
  inputAction: { padding: 6 },
  feedList: { paddingBottom: 20 },
  feedSectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 8, paddingHorizontal: 12 },
  centerSection: { padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: 400 },
  featuredCard: { width: '100%', padding: 24, borderRadius: 24, borderWidth: 1, alignItems: 'center', gap: 20 },
  featuredImage: { width: 96, height: 96, borderRadius: 48, borderWidth: 4 },
  featuredTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  featuredSubtitle: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 12 },
  trendingItemCard: { width: '47%', borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  trendingItemImage: { width: '100%', height: 100 },
  trendingItemInfo: { padding: 10, gap: 6 },
  trendingItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendingItemTitle: { fontSize: 12, fontWeight: '900', flex: 1 },
  rankBadge: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rankText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  trendingItemMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendingItemStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendingItemScore: { fontSize: 10, fontWeight: '700' },
  trendingTypeTag: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  trendingTypeText: { fontSize: 8, fontWeight: '900' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', margin: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: 12 },
  emptySubtitle: { fontSize: 12, textAlign: 'center', marginTop: 6, paddingHorizontal: 30, lineHeight: 18 },
  emptyText: { fontSize: 14, textAlign: 'center', padding: 20 },
  createFirstBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  createFirstBtnText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  trendingCelebrantsSection: { marginTop: 12, gap: 10, paddingHorizontal: 12 },
  trendingCelebrantsTitle: { fontSize: 14, fontWeight: '800', marginBottom: 6 },
  trendingCelebrantItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 14, borderWidth: 1 },
  trendingRank: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  trendingCelebrantAvatar: { width: 44, height: 44, borderRadius: 22 },
  trendingCelebrantInfo: { flex: 1 },
  trendingCelebrantName: { fontSize: 13, fontWeight: '700' },
  trendingCelebrantAge: { fontSize: 10, marginTop: 2 },
  trendingCelebrantStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendingStatText: { fontSize: 10, fontWeight: '600' },
  trendingLevelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10 },
  trendingLevelText: { fontSize: 8, fontWeight: '900' },
  birthdayHero: { borderRadius: 20, padding: 16, marginHorizontal: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' },
  birthdayHeroContent: { flex: 1 },
  birthdayHeroTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  birthdayHeroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 11, marginTop: 4 },
  birthdayHeroBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, marginTop: 10, alignSelf: 'flex-start' },
  birthdayHeroBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  birthdayHeroDecor: { opacity: 0.5 },
  todayCount: { fontSize: 12, fontWeight: '700' },
  verticalCelebrantsList: { paddingVertical: 8, paddingHorizontal: 12 },
  verticalCelebrantCardWrapper: { width: '100%', marginBottom: 8 },
  wishTemplatesSection: { marginTop: 12, paddingHorizontal: 12 },
  wishTemplatesTitle: { fontSize: 14, fontWeight: '800', marginBottom: 10 },
  wishTemplatesScroll: { gap: 10, paddingBottom: 4 },
  wishTemplateCard: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  wishTemplateText: { fontSize: 12, fontWeight: '600' },
});
