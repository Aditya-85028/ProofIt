import React from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Post = {
  id: string;
  username: string;
  profile_picture: any;
  avatarState: "happy" | "sad" | "idle";
  image: any;
  caption?: string;
  timestamp: string;
  streak: number;
};

const mockPosts: Post[] = [
  {
    id: "1",
    username: "Aditya8502",
    profile_picture: require("../assets/images/placeholder-avatar-dog.svg"),
    avatarState: "happy",
    image: require("../assets/images/adi.png"),
    caption: "Morning run completed! 🏃‍♀️",
    timestamp: "2 hours ago",
    streak: 7,
  },
  {
    id: "2",
    username: "imrali02",
    profile_picture: require("../assets/images/placeholder-avatar-dog.svg"),
    avatarState: "happy",
    image: require("../assets/images/imme.jpg"),
    caption: "Daily meditation session ✨",
    timestamp: "4 hours ago",
    streak: 12,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderPost = ({ item }: { item: Post }) => {
    const statusColor =
      item.avatarState === "happy" ? "#4CAF50" : item.avatarState === "sad" ? "#F44336" : "#FF9800";

    return (
      <View style={styles.card}>
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

          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={14} color="#FF9800" />
            <Text style={styles.streakText}>{item.streak}</Text>
          </View>
        </View>

        {/* Post Image */}
        <Image source={item.image} style={styles.postImage} resizeMode="cover" />

        {/* Post Footer */}
        <View style={styles.footer}>
          {item.caption && <Text style={styles.caption}>{item.caption}</Text>}

          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={20} color="#333" />
              <Text style={styles.actionText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#333" />
              <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={20} color="#333" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
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

      <FlatList
        data={mockPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />
        }
      />

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
  );
}

const styles = StyleSheet.create({
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
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  postImage: {
    width: "100%",
    height: 320,
  },
  footer: {
    padding: 12,
  },
  caption: {
    color: "#111827",
    marginBottom: 8,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
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
});
