import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput, Share, Alert, Platform, Clipboard, Modal } from "react-native";
import { Heart, MessageCircle, Share2, MoreHorizontal, Edit2, Trash2, Send, UserPlus, UserCheck, Repeat, Bookmark, MapPin, Cake, PartyPopper, X, ThumbsUp, Smile, Globe, Users, Clock } from "lucide-react-native";
import { Post } from "../types";
import { MotiView, AnimatePresence } from "moti";
import { Video, ResizeMode } from "expo-av";
import { useTheme } from "../context/ThemeContext";

interface FeedCardProps {
  post: Post;
  userProfileImage: string;
  currentUserId?: string;
  onEdit: (id: string, content: string, image?: string, video?: string, location?: string, celebrationType?: any, celebrantName?: string, feeling?: string) => void;
  onLike: () => void;
  onEditComment: (postId: string, commentId: string, content: string) => void;
  onAddComment: (content: string) => void;
  onDelete: () => void;
  onDeleteComment: (commentId: string) => void;
  onToggleFollow: () => void;
  onSelect: () => void;
  onRepost: () => void;
  onToggleBookmark: () => void;
  videoProgress?: { [key: string]: number };
  onVideoProgress?: (postId: string, position: number) => void;
}

export default function FeedCard({
  post,
  userProfileImage,
  currentUserId,
  onEdit,
  onLike,
  onEditComment,
  onAddComment,
  onDelete,
  onDeleteComment,
  onToggleFollow,
  onSelect,
  onRepost,
  onToggleBookmark,
  videoProgress = {},
  onVideoProgress
}: FeedCardProps) {
  const { theme, darkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasReposted, setHasReposted] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [editedImage, setEditedImage] = useState(post.image);
  const [editedVideo, setEditedVideo] = useState(post.video);
  const [editedLocation, setEditedLocation] = useState(post.location);
  const [editedCelebrationType, setEditedCelebrationType] = useState(post.celebrationType || 'general');
  const [editedCelebrantName, setEditedCelebrantName] = useState(post.celebrantName || '');
  const [editedFeeling, setEditedFeeling] = useState(post.feeling || '');
  const [showOptions, setShowOptions] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const videoRef = useRef<Video>(null);

  const isOwnPost = currentUserId && post.authorId === currentUserId;
  const savedProgress = videoProgress[post.id] || 0;

  const handleLike = () => {
    if (!hasLiked) {
      onLike();
      setHasLiked(true);
    }
  };

  const handleShare = async () => {
    const shareMessage = `${post.content}\n\nShared from Celebration App`;
    try {
      const result = await Share.share({
        message: shareMessage,
      });
      if (result.action === Share.sharedAction) {
        // Success
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleRepost = () => {
    if (!hasReposted) {
      onRepost();
      setHasReposted(true);
    }
  };

  const handleSave = () => {
    if (
      (editedContent.trim() && editedContent !== post.content) ||
      editedImage !== post.image ||
      editedVideo !== post.video ||
      editedLocation !== post.location ||
      editedCelebrationType !== post.celebrationType ||
      editedCelebrantName !== post.celebrantName ||
      editedFeeling !== post.feeling
    ) {
      onEdit(post.id, editedContent, editedImage, editedVideo, editedLocation, editedCelebrationType, editedCelebrantName, editedFeeling);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(post.content);
    setEditedImage(post.image);
    setEditedVideo(post.video);
    setEditedLocation(post.location);
    setEditedCelebrationType(post.celebrationType || 'general');
    setEditedCelebrantName(post.celebrantName || '');
    setEditedFeeling(post.feeling || '');
    setIsEditing(false);
  };

  const handlePostComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  const handleEditCommentSubmit = () => {
    if (editingCommentId && editedCommentContent.trim()) {
      onEditComment(post.id, editingCommentId, editedCommentContent);
      setEditingCommentId(null);
      setEditedCommentContent("");
    }
  };

  const handleVideoPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && !status.isBuffering && onVideoProgress && status.positionMillis) {
      onVideoProgress(post.id, status.positionMillis / 1000);
    }
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return <Text key={index} style={[styles.hashtag, { color: theme.primary }]}>{part}</Text>;
      }
      if (part.startsWith('@')) {
        return <Text key={index} style={[styles.mention, { color: theme.secondary }]}>{part}</Text>;
      }
      return <Text key={index} style={[styles.contentText, { color: theme.text }]}>{part}</Text>;
    });
  };

  return (
    <View style={[styles.cardContainer, { backgroundColor: theme.bg }]}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerLeft} onPress={onSelect}>
            <Image source={{ uri: post.authorImage }} style={styles.avatar} />
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.authorName, { color: theme.text }]}>{post.authorName}</Text>
                {!isOwnPost && (
                  <TouchableOpacity onPress={onToggleFollow}>
                    <Text style={[styles.followText, { color: theme.primary }]}>
                      {post.isFollowed ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.metaRow}>
                <Text style={[styles.timestamp, { color: theme.subText }]}>{post.timestamp}</Text>
                {post.location && (
                  <>
                    <Text style={[styles.dot, { color: theme.subText }]}>•</Text>
                    <Text style={[styles.locationText, { color: theme.subText }]}>{post.location}</Text>
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowOptions(!showOptions)} style={styles.moreButton}>
            <MoreHorizontal size={20} color={theme.subText} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <TouchableOpacity onPress={onSelect} activeOpacity={0.9}>
          <Text style={[styles.content, { color: theme.text }]}>
            {renderContent(post.content)}
          </Text>
        </TouchableOpacity>

        {/* Video Player */}
        {post.video && (
          <TouchableOpacity onPress={onSelect} activeOpacity={0.9} style={styles.mediaContainer}>
            <Video
              ref={videoRef}
              source={{ uri: post.video }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              shouldPlay={false}
              isMuted={false}
              positionMillis={savedProgress * 1000}
              onPlaybackStatusUpdate={handleVideoPlaybackStatusUpdate}
              style={styles.postVideo}
            />
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Text style={styles.playText}>▶</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Image */}
        {post.image && !post.video && (
          <TouchableOpacity onPress={onSelect} activeOpacity={0.9} style={styles.mediaContainer}>
            <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
          </TouchableOpacity>
        )}

        {/* Celebration Tags */}
        {post.celebrationType && post.celebrationType !== 'general' && (
          <View style={styles.tagsRow}>
            <View style={[styles.celebrationTag, { backgroundColor: theme.primary + '10' }]}>
              <Cake size={12} color={theme.primary} />
              <Text style={[styles.tagText, { color: theme.primary }]}>
                {post.celebrationType.toUpperCase()}
                {post.celebrantName ? ` • ${post.celebrantName}` : ''}
              </Text>
            </View>
            {post.feeling && (
              <View style={[styles.feelingTag, { backgroundColor: theme.secondary + '10' }]}>
                <Smile size={12} color={theme.secondary} />
                <Text style={[styles.tagText, { color: theme.secondary }]}>{post.feeling}</Text>
              </View>
            )}
          </View>
        )}

        {/* Stats Row */}
        <View style={[styles.statsRow, { borderBottomColor: theme.border }]}>
          <View style={styles.statsLeft}>
            <ThumbsUp size={14} color={hasLiked ? "#1877f2" : theme.subText} />
            <Text style={[styles.statsText, { color: theme.subText }]}>{post.likes}</Text>
          </View>
          <Text style={[styles.statsText, { color: theme.subText }]}>{post.comments} comments</Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionRow, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <ThumbsUp size={20} color={hasLiked ? "#1877f2" : theme.subText} />
            <Text style={[styles.actionText, { color: hasLiked ? "#1877f2" : theme.subText }]}>Like</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowComments(!showComments)} style={styles.actionButton}>
            <MessageCircle size={20} color={showComments ? theme.primary : theme.subText} />
            <Text style={[styles.actionText, { color: showComments ? theme.primary : theme.subText }]}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRepost} style={styles.actionButton}>
            <Repeat size={20} color={hasReposted ? "#10b981" : theme.subText} />
            <Text style={[styles.actionText, { color: hasReposted ? "#10b981" : theme.subText }]}>Repost</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Share2 size={20} color={theme.subText} />
            <Text style={[styles.actionText, { color: theme.subText }]}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        {showComments && (
          <View style={styles.commentsSection}>
            {post.commentsList?.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image source={{ uri: comment.authorImage }} style={styles.commentAvatar} />
                <View style={styles.commentContent}>
                  <View style={[styles.commentBubble, { backgroundColor: theme.itemBg }]}>
                    <Text style={[styles.commentAuthor, { color: theme.text }]}>{comment.authorName}</Text>
                    <Text style={[styles.commentText, { color: theme.text }]}>{comment.content}</Text>
                  </View>
                  <View style={styles.commentActions}>
                    <TouchableOpacity>
                      <Text style={[styles.commentActionText, { color: theme.subText }]}>Like</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onLongPress={() => {
                      if (comment.authorId === currentUserId) {
                        setEditingCommentId(comment.id);
                        setEditedCommentContent(comment.content);
                      }
                    }}>
                      <Text style={[styles.commentActionText, { color: theme.subText }]}>Reply</Text>
                    </TouchableOpacity>
                    <Text style={[styles.commentTime, { color: theme.subText }]}>{comment.timestamp}</Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Comment Input */}
            <View style={styles.addComment}>
              <Image source={{ uri: userProfileImage }} style={styles.commentAvatar} />
              <View style={[styles.commentInputWrapper, { backgroundColor: theme.itemBg, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.commentInput, { color: theme.text }]}
                  placeholder="Write a comment..."
                  placeholderTextColor={theme.subText}
                  value={newComment}
                  onChangeText={setNewComment}
                  onSubmitEditing={handlePostComment}
                />
                {newComment.length > 0 && (
                  <TouchableOpacity onPress={handlePostComment}>
                    <Send size={16} color={theme.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Options Menu Modal */}
        {showOptions && (
          <View style={styles.optionsOverlay}>
            <TouchableOpacity style={styles.overlayClose} onPress={() => setShowOptions(false)} />
            <View style={[styles.optionsContent, { backgroundColor: theme.card }]}>
              {isOwnPost ? (
                <>
                  <TouchableOpacity onPress={() => { setIsEditing(true); setShowOptions(false); }} style={styles.optionItem}>
                    <Edit2 size={18} color={theme.text} />
                    <Text style={[styles.optionText, { color: theme.text }]}>Edit Post</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setShowOptions(false); onDelete(); }} style={styles.optionItem}>
                    <Trash2 size={18} color="#ef4444" />
                    <Text style={[styles.optionText, { color: '#ef4444' }]}>Delete Post</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={() => { onToggleFollow(); setShowOptions(false); }} style={styles.optionItem}>
                  {post.isFollowed ? <UserCheck size={18} color={theme.text} /> : <UserPlus size={18} color={theme.text} />}
                  <Text style={[styles.optionText, { color: theme.text }]}>{post.isFollowed ? 'Unfollow User' : 'Follow User'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Edit Post Modal */}
        <Modal visible={isEditing} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Post</Text>
                <TouchableOpacity onPress={handleCancel}>
                  <X size={24} color={theme.subText} />
                </TouchableOpacity>
              </View>
              <TextInput
                multiline
                value={editedContent}
                onChangeText={setEditedContent}
                style={[styles.editInput, { backgroundColor: theme.itemBg, color: theme.text }]}
                placeholder="What's on your mind?"
                placeholderTextColor={theme.subText}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={handleCancel} style={[styles.cancelButton, { backgroundColor: theme.itemBg }]}>
                  <Text style={[styles.cancelText, { color: theme.subText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: theme.primary }]}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Comment Modal */}
        <Modal visible={!!editingCommentId} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContentSmall, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Comment</Text>
              <TextInput
                value={editedCommentContent}
                onChangeText={setEditedCommentContent}
                style={[styles.modalInput, { backgroundColor: theme.itemBg, color: theme.text }]}
                multiline
                autoFocus
                placeholder="Edit your comment..."
                placeholderTextColor={theme.subText}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setEditingCommentId(null)} style={[styles.cancelButton, { backgroundColor: theme.itemBg }]}>
                  <Text style={[styles.cancelText, { color: theme.subText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEditCommentSubmit} style={[styles.saveButton, { backgroundColor: theme.primary }]}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  followText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
  },
  dot: {
    fontSize: 11,
  },
  locationText: {
    fontSize: 11,
  },
  moreButton: {
    padding: 8,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  hashtag: {
    fontWeight: '700',
  },
  mention: {
    fontWeight: '700',
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    marginVertical: 4,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postVideo: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  celebrationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  feelingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsText: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  commentsSection: {
    padding: 12,
    gap: 12,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  commentActionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  commentTime: {
    fontSize: 11,
  },
  addComment: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  commentInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  commentInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
  },
  optionsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  overlayClose: {
    ...StyleSheet.absoluteFillObject,
  },
  optionsContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  modalContentSmall: {
    width: '85%',
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  editInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
