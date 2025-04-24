import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { getCurrentUser } from "aws-amplify/auth";
import {
  fetchUserPosts,
  fetchUserHabits,
  deletePost,
  createComment,
  getComments,
  likePost,
  getPostLikes,
  checkUserLike,
} from "../utils/api";
import SwipeableNavigation from "../components/SwipeableNavigation";
import PostModal from "../components/PostModal";
import Comments from "../components/Comments";
import { PostComment } from "../components/Comments";

// Helper function to format timestamp
const formatTimestamp = (timestamp: string | number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
};

type Post = {
  id: string;
  post_id: string;
  user_id: string;
  username: string;
  profile_picture: any;
  avatarState: "happy" | "sad" | "idle";
  image: any;
  image_url: string;
  caption: string;
  timestamp: string;
  likes: number;
  streak: number;
  habitId: string;
  habitName: string;
  comments: PostComment[];
  liked: boolean;
  likesCount: number;
};

type UserData = {
  display_name: string;
  profile_picture?: string;
  timestamp: number; // Add timestamp for cache expiration
};

type CachedUserData = Record<string, UserData>;

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [habits, setHabits] = useState<{ [key: string]: any }>({});
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [userCache, setUserCache] = useState<CachedUserData>({});

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const isCacheExpired = (timestamp: number): boolean => {
    return Date.now() - timestamp > CACHE_DURATION;
  };

  // Move getUserData outside of fetchData
  const getUserData = async (userId: string): Promise<Omit<UserData, "timestamp">> => {
    // Check cache first
    const cachedData = userCache[userId];
    if (cachedData && !isCacheExpired(cachedData.timestamp)) {
      // Return cached data without the timestamp
      const { timestamp, ...userData } = cachedData;
      return userData;
    }

    try {
      const userResponse = await fetch(
        `https://y8lbtj64c9.execute-api.us-east-1.amazonaws.com/prod/get_user?user_id=${encodeURIComponent(userId)}`
      );
      const userData = await userResponse.json();

      if (userData && !userData.error) {
        // Cache the user data with timestamp
        const newUserData = {
          display_name: userData.display_name || "Unknown User",
          profile_picture: userData.profile_picture,
          timestamp: Date.now(),
        };

        setUserCache((prev) => ({
          ...prev,
          [userId]: newUserData,
        }));

        // Return data without the timestamp
        const { timestamp, ...returnData } = newUserData;
        return returnData;
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }

    return {
      display_name: "Unknown User",
      profile_picture: undefined,
    };
  };

  // Fetch user posts and habits
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Get current user
      const { userId } = await getCurrentUser();
      setCurrentUserId(userId);

      // Fetch habits first to get habit names
      const habitsResponse = await fetchUserHabits(userId);

      // Create a map of habit IDs to habit objects for easy lookup
      const habitsMap: { [key: string]: any } = {};
      if (habitsResponse && habitsResponse.habits) {
        habitsResponse.habits.forEach((habit: any) => {
          const habitId = habit.habit_id || habit.id;
          habitsMap[habitId] = habit;
        });
      }
      setHabits(habitsMap);

      // Fetch posts
      const postsResponse = await fetchUserPosts(userId);

      if (postsResponse && postsResponse.posts) {
        // Transform API response to match our Post type
        const transformedPosts = await Promise.all(
          postsResponse.posts.map(async (post: any) => {
            // Get likes information with error handling
            let likesCount = 0;
            let isLiked = false;

            try {
              const likesResponse = await getPostLikes(post.post_id);
              const userLikeResponse = await checkUserLike(post.post_id, userId);

              // Safely access likes array with fallback to empty array
              likesCount = (likesResponse?.likes || []).length;
              isLiked = userLikeResponse?.liked || false;
            } catch (error) {
              console.error(`Error fetching likes for post ${post.post_id}:`, error);
              // Continue with default values if likes fetch fails
            }

            // Get the correct habit ID from the post
            const habitId = post.habitId || post.habit_id || "";
            const habit = habitsMap[habitId] || {};

            // Get user data from cache or fetch it
            const postUserId = post.user_id || userId;
            const userData = await getUserData(postUserId);

            // Create image source from S3 key
            let imageSource;
            if (post.s3Key) {
              const s3KeyPath = post.s3Key.includes("hb-user-posts/")
                ? post.s3Key.split("hb-user-posts/")[1]
                : post.s3Key;

              const imageUrl = `https://hb-user-posts.s3.amazonaws.com/${s3KeyPath}`;
              imageSource = { uri: imageUrl };
            } else {
              imageSource = require("../assets/images/adi.png");
            }

            return {
              id: post.post_id,
              post_id: post.post_id,
              user_id: postUserId,
              username: userData.display_name,
              profile_picture: userData.profile_picture
                ? { uri: userData.profile_picture }
                : require("../assets/images/adi.png"),
              avatarState: post.avatarState || "idle",
              image: imageSource,
              image_url: post.s3Key || "",
              caption: post.caption || post.comments || "",
              timestamp: formatTimestamp(post.timestamp || post.created_at || Date.now()),
              likes: post.likes || 0,
              streak: post.streak || 0,
              habitId: habitId,
              habitName: habit.habit_name || "Unknown Habit",
              comments: [], // Initialize with empty array, will be populated after fetch
              liked: isLiked,
              likesCount: likesCount,
            };
          })
        );

        // Transform comments to include user information
        const postsWithComments = await Promise.all(
          transformedPosts.map(async (post: Post) => {
            try {
              const commentsData = await getComments(post.post_id);
              const commentsWithUserData = await Promise.all(
                (commentsData.comments || []).map(async (comment: any) => {
                  const commentUserData = await getUserData(comment.user_id);
                  return {
                    id: comment.id || String(Math.random()),
                    user_id: comment.user_id,
                    username: commentUserData.display_name,
                    profile_picture: commentUserData.profile_picture,
                    text: comment.text,
                    timestamp: comment.timestamp || Date.now(),
                    replies: await Promise.all(
                      (comment.replies || []).map(async (reply: any) => {
                        const replyUserData = await getUserData(reply.user_id);
                        return {
                          id: reply.id || String(Math.random()),
                          user_id: reply.user_id,
                          username: replyUserData.display_name,
                          profile_picture: replyUserData.profile_picture,
                          text: reply.text,
                          timestamp: reply.timestamp || Date.now(),
                        };
                      })
                    ),
                  };
                })
              );
              return {
                ...post,
                comments: commentsWithUserData,
              };
            } catch (error) {
              console.error("Error fetching comments for post:", post.post_id, error);
              return post;
            }
          })
        );

        setPosts(postsWithComments);
      } else {
        setPosts([]);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost(currentUserId, postId);
            // Remove the post from the local state
            setPosts(posts.filter((post) => post.id !== postId));
            Alert.alert("Success", "Post deleted successfully");
          } catch (error) {
            console.error("Error deleting post:", error);
            Alert.alert("Error", "Failed to delete post. Please try again.");
          }
        },
      },
    ]);
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => {};
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handlePostPress = (post: Post) => {
    console.log("Opening modal with post:", post);
    console.log("Post comments:", post.comments);
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const handleComment = async (postId: string, text: string, parentId?: string) => {
    try {
      await createComment(postId, currentUserId, text, parentId);

      // Fetch updated comments for this specific post
      const updatedCommentsData = await getComments(postId);

      // Transform the new comments with user data
      const updatedCommentsWithUserData = await Promise.all(
        (updatedCommentsData.comments || []).map(async (comment: any) => {
          const commentUserData = await getUserData(comment.user_id);
          return {
            id: comment.id || String(Math.random()),
            user_id: comment.user_id,
            username: commentUserData.display_name,
            profile_picture: commentUserData.profile_picture,
            text: comment.text,
            timestamp: comment.timestamp || Date.now(),
            replies: await Promise.all(
              (comment.replies || []).map(async (reply: any) => {
                const replyUserData = await getUserData(reply.user_id);
                return {
                  id: reply.id || String(Math.random()),
                  user_id: reply.user_id,
                  username: replyUserData.display_name,
                  profile_picture: replyUserData.profile_picture,
                  text: reply.text,
                  timestamp: reply.timestamp || Date.now(),
                };
              })
            ),
          };
        })
      );

      // Update both the posts state and the selectedPost state
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId ? { ...post, comments: updatedCommentsWithUserData } : post
        )
      );

      // Update the selectedPost state to reflect the new comments
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost((prevPost) =>
          prevPost ? { ...prevPost, comments: updatedCommentsWithUserData } : null
        );
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      Alert.alert("Error", "Failed to post comment");
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await likePost(postId, currentUserId);
      console.log("Liked post:", postId);

      // Update posts state to reflect the new like status
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                liked: !post.liked,
                likesCount: post.liked ? post.likesCount - 1 : post.likesCount + 1,
              }
            : post
        )
      );

      // Update selectedPost if it's the one being liked
      if (selectedPost?.id === postId) {
        setSelectedPost((prevPost) =>
          prevPost
            ? {
                ...prevPost,
                liked: !prevPost.liked,
                likesCount: prevPost.liked ? prevPost.likesCount - 1 : prevPost.likesCount + 1,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
      Alert.alert("Error", "Failed to like post");
    }
  };

  const renderPost = ({ item }: { item: Post }) => {
    const statusColor =
      item.avatarState === "happy" ? "#4CAF50" : item.avatarState === "sad" ? "#F44336" : "#FF9800";

    const habit = habits[item.habitId] || {};
    const habitColor = habit.color || "#4CAF50";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePostPress(item)}
        activeOpacity={0.9}
      >
        {/* Post Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image source={item.profile_picture} style={styles.avatar} />
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>

          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePost(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Habit Tag */}
        <View style={[styles.habitTagContainer, { backgroundColor: `${habitColor}CC` }]}>
          <Text style={styles.habitTag}>{item.habitName}</Text>
        </View>

        {/* Post Image */}
        <Image
          source={item.image}
          style={styles.postImage}
          resizeMode="cover"
          onError={(e) => {
            console.error("Image loading error:", e.nativeEvent.error);
            console.error("Failed URL:", item.image?.uri); // For debugging
          }}
          defaultSource={require("../assets/images/adi.png")}
        />

        {/* Post Footer */}
        <View style={styles.footer}>
          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleLikePost(item.id)}>
              <Ionicons
                name={item.liked ? "heart" : "heart-outline"}
                size={24}
                color={item.liked ? "#FF3B30" : "#666"}
              />
              <Text style={styles.actionText}>{item.likesCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => handlePostPress(item)}>
              <Ionicons name="chatbubble-outline" size={24} color="#666" />
              <Text style={styles.actionText}>{item.comments.length}</Text>
            </TouchableOpacity>
          </View>

          {item.caption && <Text style={styles.caption}>{item.caption}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setUserCache((prevCache) => {
        const now = Date.now();
        const newCache: CachedUserData = {};

        // Only keep non-expired entries
        Object.entries(prevCache).forEach(([userId, userData]) => {
          if (!isCacheExpired(userData.timestamp)) {
            newCache[userId] = userData;
          }
        });

        return newCache;
      });
    }, CACHE_DURATION); // Run cleanup at the same interval as cache duration

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <SwipeableNavigation>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/settings")}>
            <Ionicons name="cog-outline" size={32} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Habbit</Text>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/profile/1")}>
            <Ionicons name="person-circle-outline" size={32} color="#333" />
          </TouchableOpacity>
        </View>

        {isLoading && posts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No posts yet. Create your first post!</Text>
              </View>
            }
          />
        )}

        {/* Post Modal */}
        {selectedPost && (
          <PostModal
            visible={!!selectedPost}
            onClose={handleCloseModal}
            post={selectedPost}
            currentUserId={currentUserId}
            onComment={(text, parentId) => handleComment(selectedPost.id, text, parentId)}
          />
        )}

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push("/friends")}>
            <Ionicons name="people-outline" size={24} color="#333" />
            <Text style={styles.bottomNavText}>Friends</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cameraIcon} onPress={() => router.push("/camera")}>
            <Ionicons name="camera-outline" size={36} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push("/habbits")}>
            <Ionicons name="list-outline" size={24} color="#333" />
            <Text style={styles.bottomNavText}>Habbits</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SwipeableNavigation>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4CAF50",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  habitTagContainer: {
    position: "absolute",
    top: 50,
    left: 12,
    zIndex: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  habitTag: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    padding: 8,
  },
  topRightIcons: {
    flexDirection: "row",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerInfo: {
    marginLeft: 8,
    flex: 1,
  },
  username: {
    fontWeight: "600",
    color: "#111827",
  },
  timestamp: {
    fontSize: 12,
    color: "#6B7280",
  },
  postImage: {
    width: "100%",
    height: 320,
  },
  footer: {
    padding: 12,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  caption: {
    color: "#111827",
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  bottomNavItem: {
    alignItems: "center",
  },
  cameraIcon: {
    alignItems: "center",
    backgroundColor: "#4CAF50",
    width: 60,
    height: 60,
    borderRadius: 999,
    justifyContent: "center",
    shadowColor: "#000",
  },
  bottomNavText: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
  },
  deleteButton: {
    padding: 8,
    marginLeft: "auto",
  },
});
