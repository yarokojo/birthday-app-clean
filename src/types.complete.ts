// Complete types file - replace your existing types.ts with this
export interface Celebrant {
  id: string;
  name: string;
  age: number;
  date: string;
  imageUrl?: string;
  color?: string;
}

export interface Story {
  id: string;
  userName: string;
  imageUrl?: string;
  contentUrl?: string;
  isVideo?: boolean;
  isUser?: boolean;
  color?: string;
  timestamp?: string;
}

export interface Gift {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorImage: string;
  content: string;
  timestamp: string;
  isOwn?: boolean;
}

export interface ReelItem {
  id: string;
  user: string;
  handle: string;
  avatar: string;
  description: string;
  music: string;
  likes: string;
  comments: string;
  videoUrl: string;
  poster: string;
  isBirthday?: boolean;
  initialPosition?: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorImage: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  image?: string;
  video?: string;
  location?: string;
  celebrationType?: 'birthday' | 'anniversary' | 'party' | 'general';
  celebrantName?: string;
  feeling?: string;
  tags?: string[];
  commentsList?: Comment[];
  isEdited?: boolean;
  isFollowed?: boolean;
  isBookmarked?: boolean;
}

export interface GroupGift {
  id: string;
  celebrantName: string;
  giftName: string;
  targetAmount: number;
  currentAmount: number;
  contributorsCount: number;
  deadline: string;
  imageUrl: string;
}

export interface Transaction {
  id: string;
  type: 'gift_received' | 'withdrawal' | 'gift_sent';
  amount: number;
  date: string;
  senderName?: string;
  status: 'completed' | 'pending';
  network?: string;
  phoneNumber?: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type: 'gift' | 'wallet' | 'social' | 'system';
  iconName: string;
  color: string;
  bg: string;
}

export interface Friend {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  status: 'pending' | 'accepted' | 'blocked';
  since: string;
  mutualFriends?: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  message?: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface PrivacySettings {
  birthdayVisibility: 'friends' | 'public' | 'only_me';
  postVisibility: 'friends' | 'public' | 'only_me';
  storyVisibility: 'friends' | 'close_friends' | 'only_me';
  allowWishesFrom: 'friends' | 'everyone' | 'no_one';
  allowTagging: 'friends' | 'everyone' | 'no_one';
  showBirthdayReminders: boolean;
  showOnlineStatus: boolean;
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  birthdayVisibility: 'friends',
  postVisibility: 'public',
  storyVisibility: 'friends',
  allowWishesFrom: 'friends',
  allowTagging: 'friends',
  showBirthdayReminders: true,
  showOnlineStatus: true,
};
