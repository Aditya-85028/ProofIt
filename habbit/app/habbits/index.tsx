import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Habbit = {
  id: string;
  name: string;
  streak: number;
  goal: string;
  progress: number;
};

const mockHabbits: Habbit[] = [
  {
    id: "1",
    name: "Morning Run",
    streak: 7,
    goal: "Run 5km daily",
    progress: 0.7,
  },
  {
    id: "2",
    name: "Meditation",
    streak: 12,
    goal: "Meditate 15 mins daily",
    progress: 0.9,
  },
  {
    id: "3",
    name: "Reading",
    streak: 3,
    goal: "Read 30 pages daily",
    progress: 0.4,
  },
];

const HabbitCard = ({ habbit }: { habbit: Habbit }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.habbitName}>{habbit.name}</Text>
      <View style={styles.streakBadge}>
        <Ionicons name="flame" size={16} color="#FF9800" />
        <Text style={styles.streakText}>{habbit.streak}</Text>
      </View>
    </View>

    <Text style={styles.goalText}>{habbit.goal}</Text>

    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${habbit.progress * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.round(habbit.progress * 100)}%</Text>
    </View>
  </View>
);

const Habbits = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Habbits</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {mockHabbits.map((habbit) => (
          <HabbitCard key={habbit.id} habbit={habbit} />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add New Habbit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

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
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  habbitName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
    color: "#111827",
  },
  goalText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    width: 40,
    textAlign: "right",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    alignItems: "center",
    margin: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Habbits;
