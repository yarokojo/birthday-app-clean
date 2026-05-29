import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Image, Platform, RefreshControl, useWindowDimensions } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import Stories from "../components/Stories";
import CelebrantCard from "../components/CelebrantCard";
import UpcomingPanel from "../components/UpcomingPanel";
import { Celebrant, Post, Story } from "../types";
import FeedCard from "../components/FeedCard";
import { LayoutGrid, Sparkles, CalendarRange, PlusCircle, Image as ImageIcon, Cake, Plus, Search, TrendingUp, Heart, MessageCircle, Gift, Trophy, Star } from "lucide-react-native";
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
}

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
  userProfileImage
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

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  }, []);

  const tabs = [
    { id: "feeds", label: "Feeds", icon: LayoutGrid },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "today", label: "Today", icon: Sparkles },
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

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.mainWrapper}>
        <ScrollView 
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          style={styles.feedScroll}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />
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
                      <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Celebrations</Text>
                      <MotiView 
                        from={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        transition={{ loop: true, duration: 1500, type: 'timing' }}
                      >
                        <Text style={[styles.liveText, { color: darkMode ? theme.accent : '#d97706' }]}>LIVE</Text>
                      </MotiView>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.celebrantsScroll}>
                      {celebrants.map((celebrant) => (
                        <CelebrantCard 
                          key={celebrant.id} 
                          celebrant={celebrant} 
                          onGiftClick={() => onNavigate('gift_shop')} 
                          onWishClick={() => onWish(celebrant.name)}
                        />
                      ))}
                      {celebrants.length === 0 && (
                        <Text style={[styles.emptyText, { color: theme.subText }]}>No celebrants yet</Text>
                      )}
                    </ScrollView>

                    <View style={styles.trendingContainer}>
                      <Text style={[styles.trendingTitle, { color: theme.subText }]}>Trending Celebs</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
                        <Text style={[styles.tagText, { color: theme.subText }]}>No trending tags yet</Text>
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
                        </View>
                      ) : (
                        posts.map((post) => (
                          <FeedCard 
                            key={post.id} 
                            post={post} 
                            userProfileImage={userProfileImage}
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
                      <Text style={[styles.trendingTitle, { color: theme.subText }]}>Popular Topics</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
                        <Text style={[styles.tagText, { color: theme.subText }]}>No hashtags yet</Text>
                      </ScrollView>
                    </View>

                    <View style={styles.trendingGrid}>
                      {trendingItems.map((item, index) => (
                        <TouchableOpacity 
                          key={item.id} 
                          style={[styles.trendingItemCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                          onPress={() => item.type === 'gift' ? onNavigate('gift_shop') : (item.type === 'reels' ? onNavigate('video') : onNavigate('post_detail', 'p1'))}
                        >
                          <Image source={{ uri: item.image }} style={styles.trendingItemImage} />
                          <View style={styles.trendingItemInfo}>
                            <View style={styles.trendingItemHeader}>
                              <Text style={[styles.trendingItemTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                              <View style={[styles.rankBadge, { backgroundColor: index === 0 ? '#fbbf24' : (index === 1 ? '#94a3b8' : '#d97706') }]}>
                                <Text style={styles.rankText}>{index + 1}</Text>
                              </View>
                            </View>
                            <View style={styles.trendingItemMeta}>
                              <View style={styles.trendingItemStat}>
                                <Text style={[styles.trendingItemScore, { color: theme.subText }]}>{item.score}</Text>
                              </View>
                              <View style={[styles.trendingTypeTag, { backgroundColor: theme.itemBg }]}>
                                <Text style={[styles.trendingTypeText, { color: theme.primary }]}>{item.type?.toUpperCase() || 'NEW'}</Text>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
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
                    style={styles.centerSection}
                  >
                    <View style={[styles.featuredCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <Text style={[styles.featuredTitle, { color: theme.text }]}>No celebrations today</Text>
                      <Text style={[styles.featuredSubtitle, { color: theme.subText }]}>Create a post to get started</Text>
                    </View>
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
                    />
                  </MotiView>
                )}
              </AnimatePresence>
            </View>
            {(isLargeScreen || isTablet) && (
              <View style={styles.rightColumn}>
                <UpcomingPanel onWishClick={onWish} onGiftClick={() => onNavigate('gift_shop')} />
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
  screenPadding: { padding: 16, gap: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  liveBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: '700' },
  celebrantsScroll: { gap: 16, paddingBottom: 4 },
  trendingContainer: { gap: 12 },
  trendingTitle: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  tagsScroll: { gap: 8 },
  tag: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  tagText: { fontSize: 12, fontWeight: '700' },
  createPostContainer: { padding: 16, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  myAvatar: { width: 40, height: 40, borderRadius: 20 },
  postInputPlaceholder: { flex: 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  placeholderText: { fontSize: 14, fontWeight: '500' },
  inputActions: { flexDirection: 'row', gap: 4 },
  inputAction: { padding: 8 },
  feedList: { paddingBottom: 40 },
  centerSection: { padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: 400 },
  featuredCard: { width: '100%', padding: 24, borderRadius: 24, borderWidth: 1, alignItems: 'center', gap: 20 },
  featuredImage: { width: 96, height: 96, borderRadius: 48, borderWidth: 4 },
  featuredTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  featuredSubtitle: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  trendingItemCard: { width: '47%', borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  trendingItemImage: { width: '100%', height: 120 },
  trendingItemInfo: { padding: 12, gap: 8 },
  trendingItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendingItemTitle: { fontSize: 13, fontWeight: '900', flex: 1 },
  rankBadge: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  rankText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  trendingItemMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendingItemStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendingItemScore: { fontSize: 10, fontWeight: '700' },
  trendingTypeTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  trendingTypeText: { fontSize: 8, fontWeight: '900' },
  emptyContainer: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 24, borderWidth: 1, borderStyle: 'dashed' },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 40, lineHeight: 20 },
  emptyText: { fontSize: 14, textAlign: 'center', padding: 20 },
});
