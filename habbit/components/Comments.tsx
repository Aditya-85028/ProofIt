import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { formatTimestamp } from '../utils/dateUtils';

// Define our custom Comment type with a different name to avoid conflicts
export type PostComment = {
  id: string;
  user_id: string;
  username: string;
  profile_picture?: string;
  text: string;
  timestamp: string;
  replies?: PostComment[];
};

type CommentsProps = {
  postId: string;
  userId: string;
  comments: PostComment[];
  onComment: (text: string, parentId?: string) => void;
};

export default function Comments({ postId, userId, comments, onComment }: CommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const renderReply = ({ item }: { item: PostComment }) => (
    <View style={[styles.commentContainer, styles.replyContainer]}>
      <Text style={styles.username}>{item.user_id}</Text>
      <Text style={styles.commentText}>{item.text}</Text>
      <View style={styles.commentFooter}>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        <TouchableOpacity style={styles.likeButton}>
          <Ionicons name="heart-outline" size={14} color="#666" />
          <Text style={styles.likeCount}>{item.likes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComment = ({ item }: { item: PostComment }) => (
    <View style={styles.commentThread}>
      <View style={styles.commentContainer}>
        <Text style={styles.username}>{item.user_id}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentFooter}>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          <TouchableOpacity 
            style={styles.replyButton}
            onPress={() => setReplyingTo(item.id)}
          >
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.likeButton}>
            <Ionicons name="heart-outline" size={14} color="#666" />
            <Text style={styles.likeCount}>{item.likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {item.replies && item.replies.length > 0 && (
        <FlatList
          data={item.replies}
          renderItem={renderReply}
          keyExtractor={(reply) => reply.id}
          style={styles.repliesList}
        />
      )}
    </View>
  );

  const handleSubmit = () => {
    if (newComment.trim()) {
      onComment(newComment.trim(), replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        style={styles.commentsList}
      />
      <View style={styles.inputContainer}>
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <Text style={styles.replyingToText}>
              Replying to comment
            </Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity 
          style={[styles.submitButton, !newComment.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!newComment.trim()}
        >
          <Text style={styles.submitButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commentsList: {
    flex: 1,
  },
  commentThread: {
    marginBottom: 16,
  },
  commentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyContainer: {
    marginLeft: 32,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e5e5',
  },
  username: {
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginRight: 16,
  },
  replyButton: {
    marginRight: 16,
  },
  replyButtonText: {
    fontSize: 12,
    color: '#666',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  repliesList: {
    marginTop: 8,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    padding: 16,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  replyingToText: {
    fontSize: 12,
    color: '#666',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  submitButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
}); 