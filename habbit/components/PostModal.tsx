import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { PostComment } from './Comments';
import { formatTimestamp } from '../utils/dateUtils';

type PostModalProps = {
  visible: boolean;
  onClose: () => void;
  post: {
    id: string;
    user_id: string;
    username: string;
    profile_picture: any;
    image: any;
    caption: string;
    timestamp: string;
    comments: PostComment[];
    habitName: string;
    habitColor?: string;
  };
  currentUserId: string;
  onComment: (text: string, parentId?: string) => Promise<void>;
};

// Helper function to get image source
const getImageSource = (profilePicture: string | undefined) => {
  if (profilePicture) {
    return { uri: profilePicture };
  }
  // Use require only once at the top level
  return require('../assets/images/adi.png');
};

export default function PostModal({ visible, onClose, post, currentUserId, onComment }: PostModalProps) {
  const [newComment, setNewComment] = useState('');
  
  console.log('Post data:', post);
  console.log('Comments:', post?.comments);

  const comments = Array.isArray(post?.comments) ? post.comments : [];

  const handleSubmitComment = async () => {
    if (newComment.trim()) {
      try {
        await onComment(newComment.trim());
        setNewComment('');
      } catch (error) {
        console.error('Error posting comment:', error);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{post.habitName}</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content}>
          {/* Post Image */}
          <Image 
            source={post.image} 
            style={styles.image}
            resizeMode="cover"
          />

          {/* Post Info */}
          <View style={styles.postInfo}>
            <View style={styles.userInfo}>
              <Image source={post.profile_picture} style={styles.avatar} />
              <View>
                <Text style={styles.username}>{post.username}</Text>
                <Text style={styles.timestamp}>{post.timestamp}</Text>
              </View>
            </View>
            
            {post.caption && (
              <Text style={styles.caption}>{post.caption}</Text>
            )}
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsHeader}>
              Comments {comments.length > 0 && `(${comments.length})`}
            </Text>
            {comments.length === 0 ? (
              <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id || Math.random().toString()} style={styles.commentContainer}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentUserInfo}>
                      <Image 
                        source={getImageSource(comment.profile_picture)}
                        style={styles.commentAvatar} 
                      />
                      <View style={styles.commentUserDetails}>
                        <Text style={styles.commentUsername}>{comment.username || 'Unknown User'}</Text>
                        <Text style={styles.commentTimestamp}>
                          {formatTimestamp(comment.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  
                  {/* Replies */}
                  {(comment.replies?.length || 0) > 0 && (
                    <View style={styles.repliesContainer}>
                      {comment.replies?.map((reply) => (
                        <View key={reply.id || Math.random().toString()} style={styles.replyContainer}>
                          <View style={styles.commentHeader}>
                            <View style={styles.commentUserInfo}>
                              <Image 
                                source={getImageSource(reply.profile_picture)}
                                style={styles.commentAvatar} 
                              />
                              <View style={styles.commentUserDetails}>
                                <Text style={styles.commentUsername}>{reply.username || 'Unknown User'}</Text>
                                <Text style={styles.commentTimestamp}>
                                  {formatTimestamp(reply.timestamp)}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <Text style={styles.commentText}>{reply.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.submitButton, !newComment.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            <Text style={styles.submitButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: Dimensions.get('window').width,
  },
  postInfo: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000',
  },
  commentsSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  commentsHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  noCommentsText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  commentContainer: {
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentUserDetails: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: '600',
    fontSize: 14,
    color: '#111827',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginLeft: 40,
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 40,
  },
  replyContainer: {
    marginTop: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e5e5',
    paddingTop: 8,
  },
  commentInputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
}); 