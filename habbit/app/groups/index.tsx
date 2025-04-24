import React from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Group = {
  id: string;
  username: string;
  groupIcon: any;
  members: number;
  currentHabbit: string;
};

const mockGroups: Group[] = [
  {
    id: "1",
    username: "Venice Beach Run Club",
    groupIcon: require("../../assets/images/placeholder-avatar-dog.svg"),
    members: 29,
    currentHabbit: "Morning Run",
  },
  {
    id: "2",
    username: "Rutgers MCAT Study Group",
    groupIcon: require("../../assets/images/placeholder-avatar-dog.svg"),
    members: 8,
    currentHabbit: "Studying",
  },
];

export default function GroupsScreen() {
  const renderGroup = ({ item }: { item: Group }) => (
    <TouchableOpacity style={styles.groupCard}>
      <View style={styles.groupInfo}>
        <Image source={item.groupIcon} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.habbitText}>{item.currentHabbit}</Text>
        </View>
      </View>
      <View style={styles.memberBadge}>
        <Ionicons name="people-outline" size={16} color="#4CAF50" />
        <Text style={styles.memberCount}>{item.members}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close-outline" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockGroups}
        renderItem={renderGroup}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Join a new group!</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    alignItems: "center",
    margin: 16,
    borderRadius: 12,
  },
  listContainer: {
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  groupCard: {
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
  groupInfo: {
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
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  memberCount: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
    color: "#111827",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
