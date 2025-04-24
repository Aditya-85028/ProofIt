import React from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import SwipeableNavigation from "../../components/SwipeableNavigation";
import StreakBadge from "../../components/StreakBadge";
import { handleUrlParams } from "expo-router/build/fork/getStateFromPath-forks";
import CustomButton from "../../components/CustomButton";

type Friend = {
  id: string;
  username: string;
  avatar: any;
  streak: number;
  currentHabbit: string;
};

const mockFriends: Friend[] = [
  {
    id: "1",
    username: "Aditya8502",
    avatar: require("../../assets/images/placeholder-avatar-dog.svg"),
    streak: 7,
    currentHabbit: "Morning Run",
  },
  {
    id: "2",
    username: "imrali02",
    avatar: require("../../assets/images/placeholder-avatar-dog.svg"),
    streak: 12,
    currentHabbit: "Meditation",
  },
];

export default function FriendsScreen() {
  const renderFriend = ({ item }: { item: Friend }) => (
    <TouchableOpacity style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <Image source={item.avatar} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.habbitText}>{item.currentHabbit}</Text>
        </View>
      </View>
      <StreakBadge streak={item.streak}></StreakBadge>
    </TouchableOpacity>
  );

  return (
    <SwipeableNavigation>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Friends</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close-outline" size={24} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={mockFriends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />

        <CustomButton text="Find Your Friends on Habbit!" onPress={() => {}} />
      </SafeAreaView>
    </SwipeableNavigation>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  listContainer: {
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  friendCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  habbitText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
});
